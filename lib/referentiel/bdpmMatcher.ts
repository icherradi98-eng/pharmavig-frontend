// Moteur de matching BDPM (ANSM France) <-> Référentiel Maroc
// Règles de sécurité strictes : rejet si composition / voie / forme incompatibles.
// Aucune donnée BDPM ne doit être affichée comme enrichissement si le match n'est pas fiable.

export type BdpmMatchStatus = "accepted" | "rejected" | "needs_review" | "no_match";
export type BdpmMatchConfidence = "high" | "medium" | "low" | "none";
export type BdpmMatchScope = "product_level" | "substance_level" | "rejected";

export type BdpmMatchResult = {
  status: BdpmMatchStatus;
  confidence: BdpmMatchConfidence;
  reason: string;
  scope: BdpmMatchScope;
  score: number;
  rejection_code?: "composition_mismatch" | "route_mismatch" | "form_mismatch";
  matched_on_brand: boolean;
  matched_on_all_substances: boolean;
  matched_on_form: boolean;
  matched_on_route: boolean;
};

// "complete"  : toutes les substances actives sont connues (validation humaine ou source multi-DCI)
// "incomplete": contexte partiel — CNOPS n'a qu'une colonne DCI1, association possible non détectée
// "unknown"   : aucune information sur l'exhaustivité
export type SubstanceCompletenessStatus = "complete" | "incomplete" | "unknown";

export type LocalProductContext = {
  brandName: string;
  substances: string[]; // DCI normalisées (lowercase, sans accents)
  form?: string | null;  // forme pharmaceutique locale (texte brut CNOPS)
  route?: string | null; // voie d'administration locale (texte brut CNOPS)
  // CNOPS n'a qu'une colonne DCI1 → toujours "incomplete" pour les produits importés
  substance_completeness_status: SubstanceCompletenessStatus;
};

// ── Catégories canoniques ───────────────────────────────────────────────────

type RouteCategory =
  | "ophtalmique"
  | "auriculaire"
  | "nasal"
  | "oral"
  | "injectable"
  | "cutane"
  | "inhale"
  | "vaginal"
  | "rectal"
  | "sublingual"
  | "transdermal"
  | "autre";

type FormCategory =
  | "solid_oral"       // comprimé, gélule, capsule, sachet, granulé
  | "liquid_oral"      // solution/suspension orale, sirop, gouttes orales
  | "injectable"       // solution injectable, poudre pour injection, perfusion
  | "ophtalmique"      // collyre, pommade ophtalmique, gel ophtalmique
  | "auriculaire"      // gouttes auriculaires
  | "nasale"           // spray nasal, solution nasale
  | "cutane"           // pommade cutanée, crème, gel, lotion, patch
  | "inhale"           // aérosol, poudre à inhaler, nébuliseur
  | "vaginal"          // ovule, crème vaginale
  | "rectal"           // suppositoire, lavement
  | "autre";

// ── Normalisation ──────────────────────────────────────────────────────────

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ROUTE_MAP: [RegExp, RouteCategory][] = [
  [/ophtalmique|oculaire|ocul/,         "ophtalmique"],
  [/auriculaire|otique|oreille/,         "auriculaire"],
  [/nasal|intranasale|rhinologique/,     "nasal"],
  [/sublinguale|sublingal|buccale/,      "sublingual"],
  [/intraveneus|intraveineuse|perfusion|iv |i\.v\.|injectable.*iv/, "injectable"],
  [/intramusculaire|im |i\.m\./,         "injectable"],
  [/sous.cutane|s\.c\.|sc |hypodermique/, "injectable"],
  [/injectable|parenter|injection/,      "injectable"],
  [/orale|per os|buccale|stomale|gastrique|digestive/, "oral"],
  [/topique|cutane|dermique|transcutane/, "cutane"],
  [/transdermique|patch|dispositif patch/, "transdermal"],
  [/inhal|respiratoire|pulmonaire|bronchique/, "inhale"],
  [/vaginal|intravaginal/,               "vaginal"],
  [/rectal|intrareetal|suppositoire/,    "rectal"],
];

function normalizeRoute(text: string): RouteCategory {
  const t = norm(text);
  for (const [re, cat] of ROUTE_MAP) {
    if (re.test(t)) return cat;
  }
  return "autre";
}

const FORM_MAP: [RegExp, FormCategory][] = [
  // Ophtalmique (avant cutané pour éviter faux positifs "pommade")
  [/collyre|ophtalmique|oculaire|oeil|gouttes ophtalmiques/, "ophtalmique"],
  // Auriculaire
  [/auriculaire|gouttes auriculaires/,   "auriculaire"],
  // Nasale
  [/nasale|spray nasal|solution nasale/, "nasale"],
  // Injectable
  [/injectable|perfusion|intraveineuse|intramusculaire|sous.cutane|lyophilisat|poudre pour solution|poudre pour suspension/, "injectable"],
  // Inhalée
  [/inhaler|inhalation|aerosol|aerosol|nebuliseur|pulverisat|poudre.*inhal/, "inhale"],
  // Solid oral
  [/comprime|gelule|capsule|comprimes|sachet|granule|lyophilisat oral|orodispersible|sublingual/, "solid_oral"],
  // Liquid oral
  [/sirop|solution orale|suspension orale|solution buvable|suspension buvable|gouttes orales|solution pour prise orale/, "liquid_oral"],
  // Vaginal
  [/vaginal|ovule/,                      "vaginal"],
  // Rectal
  [/suppositoire|lavement|rectal/,       "rectal"],
  // Cutané (après ophtalmique)
  [/pommade|creme|gel|lotion|emulsion|patch|emplatre|emplat|baume|mousse cutanee|solution cutanee|spray cutane/, "cutane"],
  // Transdermique
  [/transdermique|dispositif transdermique|patch/,  "cutane"],
];

function normalizeForm(text: string): FormCategory {
  const t = norm(text);
  for (const [re, cat] of FORM_MAP) {
    if (re.test(t)) return cat;
  }
  return "autre";
}

// ── Tables d'incompatibilité (paires = rejet strict) ───────────────────────
// Si les deux routes/formes sont connues et dans une paire incompatible → rejet.

const INCOMPATIBLE_ROUTE_PAIRS: [RouteCategory, RouteCategory][] = [
  ["ophtalmique", "oral"],
  ["ophtalmique", "injectable"],
  ["ophtalmique", "cutane"],
  ["ophtalmique", "transdermal"],
  ["ophtalmique", "inhale"],
  ["ophtalmique", "vaginal"],
  ["ophtalmique", "rectal"],
  ["auriculaire", "oral"],
  ["auriculaire", "injectable"],
  ["auriculaire", "ophtalmique"],
  ["auriculaire", "inhale"],
  ["auriculaire", "vaginal"],
  ["auriculaire", "rectal"],
  ["nasal", "oral"],
  ["nasal", "injectable"],
  ["nasal", "vaginal"],
  ["nasal", "rectal"],
  ["oral", "injectable"],
  ["oral", "cutane"],
  ["oral", "inhale"],
  ["oral", "vaginal"],
  ["oral", "rectal"],
  ["injectable", "cutane"],
  ["injectable", "inhale"],
  ["injectable", "vaginal"],
  ["injectable", "rectal"],
  ["injectable", "transdermal"],
  ["cutane", "inhale"],
  ["cutane", "vaginal"],
  ["cutane", "rectal"],
  ["inhale", "vaginal"],
  ["inhale", "rectal"],
  ["vaginal", "rectal"],
];

const INCOMPATIBLE_FORM_PAIRS: [FormCategory, FormCategory][] = [
  ["solid_oral", "injectable"],
  ["solid_oral", "ophtalmique"],
  ["solid_oral", "auriculaire"],
  ["solid_oral", "nasale"],
  ["solid_oral", "inhale"],
  ["solid_oral", "vaginal"],
  ["solid_oral", "rectal"],
  ["liquid_oral", "injectable"],
  ["liquid_oral", "ophtalmique"],
  ["liquid_oral", "vaginal"],
  ["liquid_oral", "rectal"],
  ["injectable", "ophtalmique"],
  ["injectable", "auriculaire"],
  ["injectable", "nasale"],
  ["injectable", "cutane"],
  ["injectable", "inhale"],
  ["injectable", "vaginal"],
  ["injectable", "rectal"],
  ["ophtalmique", "auriculaire"],
  ["ophtalmique", "nasale"],
  ["ophtalmique", "cutane"],
  ["ophtalmique", "inhale"],
  ["ophtalmique", "vaginal"],
  ["ophtalmique", "rectal"],
  ["inhale", "vaginal"],
  ["inhale", "rectal"],
  ["vaginal", "rectal"],
];

function routesIncompatible(a: RouteCategory, b: RouteCategory): boolean {
  if (a === "autre" || b === "autre") return false;
  return INCOMPATIBLE_ROUTE_PAIRS.some(
    ([x, y]) => (a === x && b === y) || (a === y && b === x)
  );
}

function formsIncompatible(a: FormCategory, b: FormCategory): boolean {
  if (a === "autre" || b === "autre") return false;
  return INCOMPATIBLE_FORM_PAIRS.some(
    ([x, y]) => (a === x && b === y) || (a === y && b === x)
  );
}

// ── Normalisation substance ────────────────────────────────────────────────

export function normalizeSubstanceName(name: string): string {
  return norm(name)
    .replace(/\(.*?\)/g, "") // retire les parenthèses (dosages inclus dans le nom)
    .replace(/\s+/g, " ")
    .trim();
}

function substancesOverlap(localSubs: string[], bdpmSubs: string[]): {
  allFound: boolean;
  anyFound: boolean;
  foundCount: number;
} {
  const bdpmNorm = bdpmSubs.map(normalizeSubstanceName);
  let found = 0;
  for (const s of localSubs) {
    const sn = normalizeSubstanceName(s);
    if (bdpmNorm.some((b) => b.includes(sn) || sn.includes(b))) {
      found++;
    }
  }
  return {
    allFound: localSubs.length > 0 && found === localSubs.length,
    anyFound: found > 0,
    foundCount: found,
  };
}

// ── Candidat BDPM (interface minimale attendue) ────────────────────────────

export type BdpmCandidate = {
  denomination?: string;
  forme?: string;
  voies?: string[];
  substances?: string[]; // déjà extraits (SA uniquement)
};

// ── Moteur principal ───────────────────────────────────────────────────────

export function matchBdpmCandidate(
  local: LocalProductContext,
  candidate: BdpmCandidate
): BdpmMatchResult {
  let score = 0;

  // Brand name match
  const localBrand = norm(local.brandName);
  const bdpmDenom = norm(candidate.denomination ?? "");
  const matchedOnBrand =
    localBrand.length > 2 && bdpmDenom.length > 2 &&
    (bdpmDenom.includes(localBrand) || localBrand.includes(bdpmDenom));
  if (matchedOnBrand) score += 30;

  // Substance check
  const bdpmSubstances = candidate.substances ?? [];
  const { allFound, anyFound, foundCount } = substancesOverlap(local.substances, bdpmSubstances);
  const matchedOnAllSubstances = allFound;
  if (allFound) {
    score += 25 * local.substances.length;
  } else if (anyFound) {
    score += 10 * foundCount;
  }

  // ── Hard rejection 1: composition mismatch ──────────────────────────────
  // Cas : substance locale absente dans BDPM ET pas de match sur marque
  if (local.substances.length > 0 && !anyFound && !matchedOnBrand) {
    return {
      status: "rejected",
      confidence: "none",
      reason: `Composition incompatible : aucune des substances locales (${local.substances.join(", ")}) trouvée dans le candidat BDPM (${bdpmSubstances.join(", ") || "aucune substance"})`,
      scope: "rejected",
      score: 0,
      rejection_code: "composition_mismatch",
      matched_on_brand: false,
      matched_on_all_substances: false,
      matched_on_form: false,
      matched_on_route: false,
    };
  }

  // ── Hard rejection 2: association locale vs monothérapie BDPM ──────────
  // Cas : produit local avec plusieurs substances et BDPM n'en a qu'une,
  // sans match de marque.
  if (
    local.substances.length > 1 &&
    bdpmSubstances.length === 1 &&
    !matchedOnBrand &&
    !allFound
  ) {
    return {
      status: "rejected",
      confidence: "none",
      reason: `Composition incompatible : produit local est une association (${local.substances.join(" + ")}) mais le candidat BDPM est une monothérapie (${bdpmSubstances[0] ?? "?"})`,
      scope: "rejected",
      score: 0,
      rejection_code: "composition_mismatch",
      matched_on_brand: false,
      matched_on_all_substances: false,
      matched_on_form: false,
      matched_on_route: false,
    };
  }

  // Route check
  const localRouteCat = local.route ? normalizeRoute(local.route) : "autre";
  const bdpmRoutes = (candidate.voies ?? []).map(normalizeRoute);
  const bestBdpmRoute = bdpmRoutes.length > 0 ? bdpmRoutes[0] : "autre";
  const matchedOnRoute = localRouteCat !== "autre" && bdpmRoutes.includes(localRouteCat);

  // ── Hard rejection 3: route mismatch ────────────────────────────────────
  if (
    localRouteCat !== "autre" &&
    bestBdpmRoute !== "autre" &&
    routesIncompatible(localRouteCat, bestBdpmRoute)
  ) {
    return {
      status: "rejected",
      confidence: "none",
      reason: `Voie d'administration incompatible : locale "${local.route}" (${localRouteCat}) vs BDPM "${candidate.voies?.[0]}" (${bestBdpmRoute})`,
      scope: "rejected",
      score: 0,
      rejection_code: "route_mismatch",
      matched_on_brand: matchedOnBrand,
      matched_on_all_substances: matchedOnAllSubstances,
      matched_on_form: false,
      matched_on_route: false,
    };
  }

  if (matchedOnRoute) score += 20;

  // Form check
  const localFormCat = local.form ? normalizeForm(local.form) : "autre";
  const bdpmFormCat = candidate.forme ? normalizeForm(candidate.forme) : "autre";
  const matchedOnForm = localFormCat !== "autre" && localFormCat === bdpmFormCat;

  // ── Hard rejection 4: form mismatch ─────────────────────────────────────
  if (
    localFormCat !== "autre" &&
    bdpmFormCat !== "autre" &&
    formsIncompatible(localFormCat, bdpmFormCat)
  ) {
    return {
      status: "rejected",
      confidence: "none",
      reason: `Forme pharmaceutique incompatible : locale "${local.form}" (${localFormCat}) vs BDPM "${candidate.forme}" (${bdpmFormCat})`,
      scope: "rejected",
      score: 0,
      rejection_code: "form_mismatch",
      matched_on_brand: matchedOnBrand,
      matched_on_all_substances: matchedOnAllSubstances,
      matched_on_form: false,
      matched_on_route: false,
    };
  }

  if (matchedOnForm) score += 20;

  // Bonus: brand name in substances
  if (!matchedOnBrand && local.substances.length > 0 && bdpmDenom.length > 0) {
    const firstSub = normalizeSubstanceName(local.substances[0]);
    if (firstSub.length > 3 && bdpmDenom.includes(firstSub)) score += 10;
  }

  // ── Calcul confiance ─────────────────────────────────────────────────────
  let confidence: BdpmMatchConfidence;
  if (score >= 75) confidence = "high";
  else if (score >= 45) confidence = "medium";
  else if (score >= 20) confidence = "low";
  else confidence = "none";

  // Pas de match du tout
  if (!matchedOnBrand && !anyFound) {
    return {
      status: "no_match",
      confidence: "none",
      reason: "Aucune correspondance sur la marque ni les substances",
      scope: "rejected",
      score,
      matched_on_brand: false,
      matched_on_all_substances: false,
      matched_on_form: matchedOnForm,
      matched_on_route: matchedOnRoute,
    };
  }

  const scope: BdpmMatchScope =
    matchedOnBrand ? "product_level" :
    allFound ? "substance_level" :
    "substance_level";

  // ── Sécurité DCI1 CNOPS ─────────────────────────────────────────────────
  // Si le contexte local est incomplet (CNOPS DCI1 uniquement) ET que le
  // candidat BDPM contient plus de substances actives que ce que le référentiel
  // local connaît → le produit BDPM a des SA supplémentaires non vérifiées.
  // Ex. TOBRADEX : local = ["tobramycine"] (DCI1) mais BDPM = [tobramycine + dexaméthasone]
  //     → on ne peut pas confirmer que le médicament marocain contient bien
  //       la dexaméthasone ; match interdit à "accepted".
  // Ex. ELOXATINE : local = ["oxaliplatine"], BDPM = ["oxaliplatine"] → même comptage →
  //     règle ne s'applique pas, accepted OK.
  if (
    local.substance_completeness_status !== "complete" &&
    bdpmSubstances.length > local.substances.length
  ) {
    return {
      status: "needs_review",
      confidence: "low",
      reason: `local_substance_context_incomplete — CNOPS DCI1 uniquement : ${local.substances.length} SA connue(s) localement mais ${bdpmSubstances.length} SA dans le candidat BDPM. Composition complète non vérifiée.`,
      scope,
      score,
      matched_on_brand: matchedOnBrand,
      matched_on_all_substances: matchedOnAllSubstances,
      matched_on_form: matchedOnForm,
      matched_on_route: matchedOnRoute,
    };
  }

  const status: BdpmMatchStatus =
    confidence === "high" ? "accepted" :
    confidence === "medium" ? "needs_review" :
    "needs_review";

  const reasonParts: string[] = [];
  if (matchedOnBrand) reasonParts.push("marque");
  if (matchedOnAllSubstances) reasonParts.push(`toutes substances (${local.substances.join(", ")})`);
  else if (anyFound) reasonParts.push(`${foundCount}/${local.substances.length} substance(s)`);
  if (matchedOnRoute) reasonParts.push(`voie (${localRouteCat})`);
  if (matchedOnForm) reasonParts.push(`forme (${localFormCat})`);

  return {
    status,
    confidence,
    reason: reasonParts.length > 0 ? `Match sur : ${reasonParts.join(", ")} — score ${score}` : `Score ${score}`,
    scope,
    score,
    matched_on_brand: matchedOnBrand,
    matched_on_all_substances: matchedOnAllSubstances,
    matched_on_form: matchedOnForm,
    matched_on_route: matchedOnRoute,
  };
}

// Sélectionne le meilleur candidat parmi une liste, retourne null si aucun acceptable.
export function selectBestCandidate<T extends BdpmCandidate>(
  local: LocalProductContext,
  candidates: T[]
): { candidate: T; match: BdpmMatchResult } | null {
  if (candidates.length === 0) return null;

  let best: { candidate: T; match: BdpmMatchResult } | null = null;

  for (const c of candidates) {
    const match = matchBdpmCandidate(local, c);
    if (match.status === "rejected") continue;
    if (!best || match.score > best.match.score) {
      best = { candidate: c, match };
    }
  }

  return best;
}

// Résultat "no match" à retourner quand aucun candidat ne passe.
export function noMatchResult(): BdpmMatchResult {
  return {
    status: "no_match",
    confidence: "none",
    reason: "Aucun candidat BDPM ne correspond aux critères de matching",
    scope: "rejected",
    score: 0,
    matched_on_brand: false,
    matched_on_all_substances: false,
    matched_on_form: false,
    matched_on_route: false,
  };
}
