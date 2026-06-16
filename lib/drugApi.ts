// Utilitaires pour la page /medicaments — extraction structurée via LLM,
// enrichissement BDPM (source France — enrichissement clinique uniquement,
// jamais utilisé pour affirmer une disponibilité au Maroc).

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ── Types — données structurées extraites ─────────────────────────────────────

export type ExtractedIndication = string;

export type ExtractedDosage = {
  population: string;
  regimen: string;
  voie: string | null;
  notes: string | null;
};

export type ExtractedContraindication = {
  ci: string;
  type: "absolue" | "relative";
};

export type ExtractedInteraction = {
  medicament: string;
  classe: string | null;
  severite: "contre-indiquée" | "majeure" | "modérée" | "mineure";
  mecanisme: string | null;
  consequence: string;
  conduite: string;
};

export type ExtractedAdverseEffect = {
  nom: string;
  soc: string;
  frequence: "très fréquent" | "fréquent" | "peu fréquent" | "rare" | "très rare" | "inconnu";
  grave: boolean;
  pct: number | null;
};

export type SectionName = "indications" | "posologie" | "contraindications" | "interactions" | "effets_indesirables";

export type ExtractResponse<T> = {
  section: SectionName;
  items: T[];
  source: "llm" | "fallback" | "empty" | "cache";
};

// ── Extraction structurée via backend ────────────────────────────────────────

/**
 * Envoie le texte brut d'une section RCP au backend MAIA DAWA.
 * Le backend appelle Gemini et retourne des données structurées en JSON.
 * Résultat mis en cache localStorage 24h pour éviter les appels redondants.
 */
export async function extractDrugSection<T>(
  drugName: string,
  section: SectionName,
  rawText: string | undefined,
): Promise<ExtractResponse<T>> {
  const empty: ExtractResponse<T> = { section, items: [], source: "empty" };
  if (!rawText?.trim()) return empty;

  // Cache
  const cKey = `pharmavig_extract_${slugify(drugName)}_${section}`;
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cKey);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL_MS) {
          return { ...(data as ExtractResponse<T>), source: "cache" };
        }
      }
    } catch {}
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    const res = await fetch(`${API_BASE}/drugs/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: rawText, section, drug_name: drugName }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return empty;

    const data: ExtractResponse<T> = await res.json();

    if (typeof window !== "undefined" && data.items.length > 0) {
      try {
        localStorage.setItem(cKey, JSON.stringify({ data, ts: Date.now() }));
      } catch {}
    }
    return data;
  } catch {
    return empty;
  }
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function unslugify(slug: string): string {
  return slug.replace(/-/g, " ");
}

function cacheKey(drugName: string, source: string): string {
  return `pharmavig_drug_${slugify(drugName)}_${source}`;
}

export function readCache<T>(drugName: string, source: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(drugName, source));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data as T;
  } catch {
    return null;
  }
}

export function writeCache<T>(drugName: string, source: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(cacheKey(drugName, source), JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

async function fetchWithTimeout(url: string, ms = 5000): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return res;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

// ---- Recherches récentes ----
const RECENT_KEY = "pharmavig_medicaments_recents";

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function pushRecentSearch(name: string): void {
  if (typeof window === "undefined") return;
  try {
    const prev = getRecentSearches().filter((s) => s.toLowerCase() !== name.toLowerCase());
    const next = [name, ...prev].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

// ---- Autocomplete — referentiel local (CNOPS seed) -------------------------
// Pas d'appel externe : on cherche dans le seed Morocco-first.
export type Suggestion = { dci: string; brand?: string };

export async function autocomplete(query: string): Promise<Suggestion[]> {
  if (query.trim().length < 2) return [];
  try {
    const { searchProducts } = await import("@/lib/referentiel/index");
    const results = searchProducts(query, 8);
    return results.map((r) => ({
      dci: r.dci && r.dci !== "—" ? r.dci : r.brand_name,
      brand: r.dci && r.dci !== "—" ? r.brand_name : undefined,
    }));
  } catch {
    return [];
  }
}

// ---- BDPM française (enrichissement clinique uniquement) -------------------
// Source : base BDPM officielle (ANSM). Ne contient pas les effets indésirables
// ni les interactions — ces données doivent venir du RCP officiel marocain.
// ATTENTION : cette source n'atteste JAMAIS de la disponibilité au Maroc.
export type BdpmPresentation = { libelle?: string; prix?: number; tauxRemboursement?: string; cip13?: number };

export type BdpmDrug = {
  cis?: number;
  denomination?: string;
  forme?: string;
  voies?: string[];
  statut?: string;
  substances?: string[];
  generiques?: string[];
  presentation?: BdpmPresentation;
  conditions?: string[];
  match: import("@/lib/referentiel/bdpmMatcher").BdpmMatchResult;
};

function deaccentSearch(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

type RawBdpmComposant = { denominationSubstance?: string; dosage?: string; natureComposant?: string };
type RawBdpmGenerique = { libelle?: string };
type RawBdpmPresentation = { libelle?: string; prix?: number; tauxRemboursement?: string; cip13?: number };
type RawBdpmResult = {
  cis?: number;
  elementPharmaceutique?: string;
  formePharmaceutique?: string;
  voiesAdministration?: string[];
  statusAutorisation?: string;
  etatComercialisation?: string;
  composition?: RawBdpmComposant[];
  generiques?: RawBdpmGenerique[];
  presentation?: RawBdpmPresentation[];
  conditions?: string[] | null;
};

function extractSubstances(r: RawBdpmResult): string[] {
  return (r.composition || [])
    .filter((c) => c.natureComposant === "SA")
    .map((c) => (c.dosage ? `${c.denominationSubstance} (${c.dosage})` : c.denominationSubstance))
    .filter((s): s is string => Boolean(s));
}

function buildBdpmDrug(
  r: RawBdpmResult,
  match: import("@/lib/referentiel/bdpmMatcher").BdpmMatchResult
): BdpmDrug {
  const presentation = r.presentation?.[0];
  return {
    cis: r.cis,
    denomination: r.elementPharmaceutique,
    forme: r.formePharmaceutique,
    voies: r.voiesAdministration,
    statut: r.statusAutorisation,
    substances: extractSubstances(r),
    generiques: (r.generiques || []).map((g) => g.libelle).filter((s): s is string => Boolean(s)).slice(0, 5),
    presentation: presentation
      ? { libelle: presentation.libelle, prix: presentation.prix, tauxRemboursement: presentation.tauxRemboursement, cip13: presentation.cip13 }
      : undefined,
    conditions: r.conditions || undefined,
    match,
  };
}

// Cache les candidats bruts BDPM (indépendamment du matching)
async function fetchBdpmCandidates(name: string): Promise<RawBdpmResult[]> {
  const cached = readCache<RawBdpmResult[]>(name, "bdpm_raw");
  if (cached !== null) return cached;

  const query = deaccentSearch(name.trim()).slice(0, 50);
  if (query.length < 3) {
    writeCache(name, "bdpm_raw", []);
    return [];
  }
  const res = await fetchWithTimeout(
    `https://medicaments-api.giygas.dev/v1/medicaments?search=${encodeURIComponent(query)}`
  );
  if (!res) {
    writeCache(name, "bdpm_raw", []);
    return [];
  }
  try {
    const json: RawBdpmResult[] = await res.json();
    const list = Array.isArray(json) ? json : [];
    writeCache(name, "bdpm_raw", list);
    return list;
  } catch {
    writeCache(name, "bdpm_raw", []);
    return [];
  }
}

export type { LocalProductContext } from "@/lib/referentiel/bdpmMatcher";

export async function fetchAnsm(
  name: string,
  localContext?: import("@/lib/referentiel/bdpmMatcher").LocalProductContext
): Promise<BdpmDrug | null> {
  try {
    const candidates = await fetchBdpmCandidates(name);
    if (candidates.length === 0) return null;

    if (localContext) {
      const { selectBestCandidate } = await import("@/lib/referentiel/bdpmMatcher");

      // Prépare les candidats avec substances extraites pour le matcher
      const enriched = candidates.map((r) => ({
        ...r,
        denomination: r.elementPharmaceutique,
        forme: r.formePharmaceutique,
        voies: r.voiesAdministration,
        substances: extractSubstances(r),
      }));

      const best = selectBestCandidate(localContext, enriched);
      if (!best) {
        // Aucun candidat accepté — retourne le meilleur "needs_review" s'il y en a un, sinon null
        return null;
      }
      return buildBdpmDrug(best.candidate, best.match);
    }

    // Sans contexte local : retourne le premier candidat actif/commercialisé avec status needs_review
    const r =
      candidates.find(
        (d) =>
          (d.statusAutorisation || "").toLowerCase().includes("active") &&
          (d.etatComercialisation || "").toLowerCase().includes("commercialis")
      ) ?? candidates[0];
    if (!r) return null;
    const needsReview: import("@/lib/referentiel/bdpmMatcher").BdpmMatchResult = {
      status: "needs_review",
      confidence: "low",
      reason: "Aucun contexte local fourni — matching non effectué",
      scope: "substance_level",
      score: 0,
      matched_on_brand: false,
      matched_on_all_substances: false,
      matched_on_form: false,
      matched_on_route: false,
    };
    return buildBdpmDrug(r, needsReview);
  } catch {
    return null;
  }
}

// ---- Décomposition d'un nom composé ----------------------------------------
export function splitDrugComponents(name: string): string[] {
  return name
    .split(/\s*(?:\bet\b|\band\b|\/|\+|,)\s*/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

// ---- Dictionnaire MedDRA FR -------------------------------------------------
// Traductions de termes MedDRA anglais vers le français médical. Utile pour
// afficher des termes issus de notices publiques (ANSM, EMA, RCP).
export const MEDDRA_FR_DICT: Record<string, string> = {
  "nausea": "Nausées", "nauseas": "Nausées", "vomiting": "Vomissements",
  "diarrhea": "Diarrhée", "diarrhoea": "Diarrhée", "constipation": "Constipation",
  "abdominal pain": "Douleurs abdominales", "stomach pain": "Douleurs d'estomac",
  "headache": "Céphalées", "headaches": "Céphalées", "dizziness": "Sensations vertigineuses",
  "fatigue": "Fatigue", "asthenia": "Asthénie", "somnolence": "Somnolence",
  "insomnia": "Insomnie", "anxiety": "Anxiété", "depression": "Dépression",
  "rash": "Éruption cutanée", "pruritus": "Prurit", "itching": "Démangeaisons",
  "urticaria": "Urticaire", "hives": "Urticaire",
  "fever": "Fièvre", "pyrexia": "Pyrexie", "chills": "Frissons",
  "cough": "Toux", "dyspnea": "Dyspnée", "shortness of breath": "Essoufflement",
  "decreased appetite": "Diminution de l'appétit", "anorexia": "Anorexie",
  "weight loss": "Perte de poids", "weight gain": "Prise de poids",
  "hypoglycemia": "Hypoglycémie", "hyperglycemia": "Hyperglycémie",
  "lactic acidosis": "Acidose lactique", "vitamin b12 deficiency": "Carence en vitamine B12",
  "flatulence": "Flatulences", "dyspepsia": "Dyspepsie",
  "myalgia": "Myalgies", "arthralgia": "Arthralgies", "back pain": "Douleurs dorsales",
  "muscle spasms": "Spasmes musculaires", "muscle pain": "Douleurs musculaires",
  "peripheral edema": "Œdèmes périphériques", "edema": "Œdèmes",
  "hypertension": "Hypertension artérielle", "hypotension": "Hypotension",
  "tachycardia": "Tachycardie", "bradycardia": "Bradycardie",
  "palpitations": "Palpitations", "chest pain": "Douleurs thoraciques",
  "anemia": "Anémie", "anaemia": "Anémie", "neutropenia": "Neutropénie",
  "thrombocytopenia": "Thrombopénie", "leukopenia": "Leucopénie",
  "agranulocytosis": "Agranulocytose",
  "elevated liver enzymes": "Élévation des enzymes hépatiques",
  "hepatotoxicity": "Hépatotoxicité", "jaundice": "Ictère",
  "renal impairment": "Insuffisance rénale", "kidney injury": "Atteinte rénale",
  "dry mouth": "Sécheresse buccale", "mouth ulcers": "Aphtes buccaux",
  "stomatitis": "Stomatite", "mucositis": "Mucite",
  "alopecia": "Alopécie", "hair loss": "Perte de cheveux",
  "dry skin": "Peau sèche", "photosensitivity": "Photosensibilité",
  "blurred vision": "Vision trouble", "dry eyes": "Sécheresse oculaire",
  "tinnitus": "Acouphènes", "hearing loss": "Perte d'audition",
  "numbness": "Engourdissement", "tingling": "Picotements", "paresthesia": "Paresthésies",
  "tremor": "Tremblements", "confusion": "Confusion",
  "anaphylaxis": "Anaphylaxie", "anaphylactic reaction": "Réaction anaphylactique",
  "angioedema": "Angio-œdème", "stevens-johnson syndrome": "Syndrome de Stevens-Johnson",
  "toxic epidermal necrolysis": "Nécrolyse épidermique toxique",
  "myocarditis": "Myocardite", "pneumonitis": "Pneumopathie inflammatoire",
  "colitis": "Colite", "hepatitis": "Hépatite", "pancreatitis": "Pancréatite",
  "hypothyroidism": "Hypothyroïdie", "hyperthyroidism": "Hyperthyroïdie",
  "adrenal insufficiency": "Insuffisance surrénalienne",
  "infusion reaction": "Réaction liée à la perfusion", "infusion-related reaction": "Réaction liée à la perfusion",
  "injection site reaction": "Réaction au site d'injection",
  "upper respiratory tract infection": "Infection des voies respiratoires supérieures",
  "urinary tract infection": "Infection urinaire", "nasopharyngitis": "Rhinopharyngite",
  "decreased hemoglobin": "Diminution de l'hémoglobine",
  "increased creatinine": "Augmentation de la créatinine",
  "hyponatremia": "Hyponatrémie", "hyperkalemia": "Hyperkaliémie", "hypokalemia": "Hypokaliémie",
  "death": "Décès", "fatal": "Issue fatale",
  "bullous pemphigoid": "Pemphigoïde bulleuse", "weight decreased": "Perte de poids",
  "abdominal pain upper": "Douleurs abdominales hautes", "nasal congestion": "Congestion nasale",
  "muscle weakness": "Faiblesse musculaire", "joint pain": "Douleurs articulaires",
  "increased appetite": "Augmentation de l'appétit", "abnormal dreams": "Rêves anormaux",
};

export function lookupMeddraFr(term: string): string | null {
  const key = term.trim().toLowerCase().replace(/[.,;:]+$/g, "");
  if (MEDDRA_FR_DICT[key]) return MEDDRA_FR_DICT[key];
  for (const [en, fr] of Object.entries(MEDDRA_FR_DICT)) {
    if (key === en || key.includes(en)) return fr;
  }
  return null;
}

export type EffectName = { original: string; fr: string | null };

export type ParsedEffect = { text: string; severe: boolean; frequency?: "tres_frequent" | "frequent" | "peu_frequent" | "rare" };

const SEVERE_TERMS = [
  "death", "fatal", "severe", "life-threatening", "hospitaliz", "stevens-johnson",
  "anaphyl", "agranulocyt", "myocardit", "décès", "mortel", "grave", "potentiellement mortel",
];

export function isSevere(text: string): boolean {
  const lower = text.toLowerCase();
  return SEVERE_TERMS.some((t) => lower.includes(t));
}

export function splitIntoItems(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\n+|;\s*|(?:^|\s)\d+\.\s+/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 3 && s.length < 600);
}

export type PregnancyRisk = "safe" | "caution" | "contraindicated" | "unknown";

export function pregnancyRisk(text?: string): PregnancyRisk {
  if (!text) return "unknown";
  const lower = text.toLowerCase();
  if (lower.includes("contraindicated") || lower.includes("contre-indiqué") || lower.includes("do not use"))
    return "contraindicated";
  if (lower.includes("caution") || lower.includes("précaution"))
    return "caution";
  if (lower.includes("no evidence") || lower.includes("safe"))
    return "safe";
  return "unknown";
}

export const PREGNANCY_STYLES: Record<PregnancyRisk, { label: string; color: string; dot: string }> = {
  safe: { label: "Pas de risque connu identifié", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  caution: { label: "Précaution recommandée", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  contraindicated: { label: "Contre-indiqué", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  unknown: { label: "Donnée non disponible — consultez le RCP marocain", color: "bg-gray-50 text-gray-500 border-gray-200", dot: "bg-gray-400" },
};

export const QUICK_ACCESS_MOLECULES = [
  "Pembrolizumab", "Nivolumab", "Metformine", "Amoxicilline",
  "Ibuprofène", "Amlodipine", "Atorvastatine", "Méthotrexate",
];
