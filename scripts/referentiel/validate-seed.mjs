// ─────────────────────────────────────────────────────────────────────────────
// Validation qualité du seed référentiel médicament (Morocco-first).
//
// Source unique de vérité, utilisée à la fois :
//   - en CLI :   npm run validate:referentiel   (rapport terminal + exit code)
//   - en test :  __tests__/referentiel-seed.test.ts (vitest / CI)
//
// Ne modifie JAMAIS les données. Les erreurs bloquantes (❌) font échouer la
// commande ; les warnings (⚠️) sont signalés sans bloquer.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ── Normalisation (alignée sur lib/referentiel) ──────────────────────────────
function norm(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Valide un dataset référentiel.
 * @returns {{ errors: string[], warnings: string[], passed: string[], stats: { products: number, substances: number, presentations: number, links: number, combos: number, probable_duplicates: number } }}
 */
export function validateSeed(data) {
  const errors = [];
  const warnings = [];
  const passed = [];

  const products = data.medicinal_products ?? [];
  const substances = data.substances ?? [];
  const presentations = data.presentations ?? [];
  const links = data.product_substances ?? [];

  const substanceIds = new Set(substances.map((s) => s.id));
  const presByProduct = new Map();
  for (const p of presentations) {
    if (!presByProduct.has(p.medicinal_product_id)) presByProduct.set(p.medicinal_product_id, []);
    presByProduct.get(p.medicinal_product_id).push(p);
  }
  const activeByProduct = new Map();
  for (const l of links) {
    if (l.role !== "active_substance") continue;
    if (!activeByProduct.has(l.product_id)) activeByProduct.set(l.product_id, []);
    activeByProduct.get(l.product_id).push(l);
  }

  // Helper : check bloquant
  const check = (label, badItems, fmt) => {
    if (badItems.length === 0) {
      passed.push(label);
    } else {
      const sample = badItems.slice(0, 8).map(fmt).join(", ");
      errors.push(`${label} — ${badItems.length} cas : ${sample}${badItems.length > 8 ? ", …" : ""}`);
    }
  };

  // ── Checks BLOQUANTS (❌) ──
  check(
    "Liens product_substance → substance inexistante",
    links.filter((l) => !substanceIds.has(l.substance_id)),
    (l) => `${l.product_id}→${l.substance_id}`
  );
  check(
    "Produits sans présentation",
    products.filter((p) => !presByProduct.has(p.id)),
    (p) => p.id
  );
  check(
    "Produits sans substance active",
    products.filter((p) => !(activeByProduct.get(p.id)?.length)),
    (p) => p.brand_name || p.id
  );
  check("ID dupliqués (medicinal_products)", findDuplicateIds(products), (id) => id);
  check("ID dupliqués (substances)", findDuplicateIds(substances), (id) => id);
  check("ID dupliqués (presentations)", findDuplicateIds(presentations), (id) => id);
  check(
    "Substances sans DCI (dci_fr vide)",
    substances.filter((s) => !s.dci_fr || !s.dci_fr.trim()),
    (s) => s.id
  );
  check(
    "Substances sans normalized_name",
    substances.filter((s) => !s.normalized_name || !s.normalized_name.trim()),
    (s) => s.id
  );
  check(
    "Produits sans brand_name",
    products.filter((p) => !p.brand_name || !p.brand_name.trim()),
    (p) => p.id
  );
  check(
    "Présentations sans forme galénique",
    presentations.filter((p) => !p.pharmaceutical_form || !p.pharmaceutical_form.trim()),
    (p) => p.id
  );

  // ── Checks NON BLOQUANTS (⚠️) ──
  const noRoute = presentations.filter((p) => !p.route || !p.route.trim());
  if (noRoute.length) warnings.push(`Présentations sans voie d'administration : ${noRoute.length} (${noRoute.slice(0, 5).map((p) => p.id).join(", ")}${noRoute.length > 5 ? ", …" : ""})`);

  const noClass = substances.filter((s) => !s.therapeutic_class);
  if (noClass.length) warnings.push(`Substances sans therapeutic_class : ${noClass.length}/${substances.length} (enrichissement progressif)`);

  const noAtc = substances.filter((s) => !s.atc_code);
  if (noAtc.length) warnings.push(`Substances sans atc_code : ${noAtc.length}/${substances.length} (licence OMS à valider)`);

  // Doublons probables : même marque + dosage + unité + forme + packaging
  const dupGroups = findProbableDuplicates(products, presByProduct);
  if (dupGroups.length) {
    warnings.push(
      `Doublons produits probables (manual_review_needed) : ${dupGroups.length} groupes → ` +
      dupGroups.map((g) => `${g.brand} [${g.ids.join(" / ")}]`).join("  ·  ")
    );
  }

  // Produits combinés : à contrôler (info)
  const combos = products.filter((p) => (activeByProduct.get(p.id)?.length ?? 0) > 1);
  if (combos.length) warnings.push(`Produits combinés (> 1 DCI) à contrôler : ${combos.length}`);

  const stats = {
    products: products.length,
    substances: substances.length,
    presentations: presentations.length,
    links: links.length,
    combos: combos.length,
    probable_duplicates: dupGroups.length,
  };

  return { errors, warnings, passed, stats };
}

/**
 * Valide le fichier de priorisation pilote contre le seed.
 * @returns {{ errors: string[], warnings: string[], passed: string[], stats: { pilot_entries: number, high_priority: number, high_risk: number } }}
 */
export function validatePilotPriority(pilotData, seedData) {
  const errors = [];
  const warnings = [];
  const passed = [];
  const entries = pilotData?.substances ?? [];
  const seedIds = new Set((seedData?.substances ?? []).map((s) => s.id));
  const VALID_PRIORITY = new Set(["high", "medium", "low"]);

  const check = (label, bad, fmt) => {
    if (bad.length === 0) passed.push(label);
    else errors.push(`${label} — ${bad.length} cas : ${bad.slice(0, 8).map(fmt).join(", ")}${bad.length > 8 ? ", …" : ""}`);
  };

  check("DCI prioritaire inexistante dans substances[]", entries.filter((e) => !seedIds.has(e.substance_id)), (e) => e.substance_id);
  check("Entrée sans priority_level valide", entries.filter((e) => !VALID_PRIORITY.has(e.priority_level)), (e) => e.substance_id);
  check("Entrée sans therapeutic_area", entries.filter((e) => !e.therapeutic_area || !e.therapeutic_area.trim()), (e) => e.substance_id);
  check("Entrée sans therapeutic_class", entries.filter((e) => !e.therapeutic_class || !e.therapeutic_class.trim()), (e) => e.substance_id);
  check("Entrée sans dci_fr", entries.filter((e) => !e.dci_fr || !e.dci_fr.trim()), (e) => e.substance_id);
  check("substance_id dupliqué dans le pilote", findDuplicateKeys(entries.map((e) => e.substance_id)), (id) => id);

  const stats = {
    pilot_entries: entries.length,
    high_priority: entries.filter((e) => e.priority_level === "high").length,
    high_risk: entries.filter((e) => e.is_high_risk_drug).length,
  };
  return { errors, warnings, passed, stats };
}

function findDuplicateKeys(keys) {
  const seen = new Set();
  const dups = new Set();
  for (const k of keys) {
    if (seen.has(k)) dups.add(k);
    seen.add(k);
  }
  return [...dups];
}

const MONOGRAPH_CLINICAL_FIELDS = [
  "indications", "posology_adult", "renal_adjustment", "hepatic_adjustment",
  "contraindications", "precautions", "adverse_effects_common", "adverse_effects_serious",
  "key_interactions", "pregnancy_lactation", "monitoring", "patient_advice",
];
const VALID_EDITORIAL_STATUS = new Set([
  "draft", "AI_generated", "physician_reviewed", "pharmacist_reviewed", "published",
]);

/**
 * Valide les monographies cliniques contre le seed et le pilote.
 * Règle de sécurité clé : une monographie "published" doit être complète,
 * relue (reviewed_by) et non marquée démo.
 * @returns {{ errors: string[], warnings: string[], passed: string[], stats: { monographs: number, published: number, complete: number, demo: number, pilot_coverage: number } }}
 */
export function validateMonographs(monoData, pilotData, seedData) {
  const errors = [];
  const warnings = [];
  const passed = [];
  const monographs = monoData?.monographs ?? [];
  const seedIds = new Set((seedData?.substances ?? []).map((s) => s.id));
  const pilotEntries = pilotData?.substances ?? [];

  const check = (label, bad, fmt) => {
    if (bad.length === 0) passed.push(label);
    else errors.push(`${label} — ${bad.length} cas : ${bad.slice(0, 8).map(fmt).join(", ")}${bad.length > 8 ? ", …" : ""}`);
  };

  const isComplete = (m) => MONOGRAPH_CLINICAL_FIELDS.every((f) => m[f] && String(m[f]).trim());

  // ── Checks BLOQUANTS ──
  check("Monographie liée à une substance inexistante", monographs.filter((m) => !seedIds.has(m.substance_id)), (m) => m.id);
  check("id de monographie dupliqué", findDuplicateKeys(monographs.map((m) => m.id)), (id) => id);
  check("substance_id couvert par plusieurs monographies", findDuplicateKeys(monographs.map((m) => m.substance_id)), (id) => id);
  check("Monographie sans dci", monographs.filter((m) => !m.dci || !m.dci.trim()), (m) => m.id);
  check("Statut éditorial invalide", monographs.filter((m) => !VALID_EDITORIAL_STATUS.has(m.status)), (m) => `${m.id}(${m.status})`);
  // Règles de publication (sécurité)
  check("Monographie publiée mais incomplète", monographs.filter((m) => m.status === "published" && !isComplete(m)), (m) => m.id);
  check("Monographie publiée mais non relue (reviewed_by vide)", monographs.filter((m) => m.status === "published" && !m.reviewed_by), (m) => m.id);
  check("Monographie publiée encore marquée démo (is_demo)", monographs.filter((m) => m.status === "published" && m.is_demo === true), (m) => m.id);

  // ── Warnings (non bloquants) ──
  const incomplete = monographs.filter((m) => !isComplete(m));
  if (incomplete.length) warnings.push(`Monographies avec champ(s) clinique(s) vide(s) : ${incomplete.length} (${incomplete.slice(0, 6).map((m) => m.id).join(", ")}${incomplete.length > 6 ? ", …" : ""})`);

  const demo = monographs.filter((m) => m.is_demo === true);
  if (demo.length) warnings.push(`Monographies encore marquées is_demo : ${demo.length} (à finaliser : ${demo.map((m) => m.id).join(", ")})`);

  const monoSubIds = new Set(monographs.map((m) => m.substance_id));
  const highMissing = pilotEntries.filter((p) => p.priority_level === "high" && !monoSubIds.has(p.substance_id));
  if (highMissing.length) warnings.push(`DCI pilote HAUTE priorité sans monographie : ${highMissing.length} (${highMissing.map((p) => p.dci_fr).join(", ")})`);

  const pilotCovered = pilotEntries.filter((p) => monoSubIds.has(p.substance_id)).length;

  const stats = {
    monographs: monographs.length,
    published: monographs.filter((m) => m.status === "published").length,
    complete: monographs.filter(isComplete).length,
    demo: demo.length,
    pilot_coverage: pilotCovered,
  };
  return { errors, warnings, passed, stats };
}

function findDuplicateIds(items) {
  const seen = new Set();
  const dups = new Set();
  for (const it of items) {
    if (seen.has(it.id)) dups.add(it.id);
    seen.add(it.id);
  }
  return [...dups];
}

function findProbableDuplicates(products, presByProduct) {
  const groups = new Map();
  for (const p of products) {
    const pr = (presByProduct.get(p.id) ?? [])[0] ?? {};
    const sig = [norm(p.brand_name), pr.strength, pr.unit, norm(pr.pharmaceutical_form), norm(pr.packaging)].join("|");
    if (!groups.has(sig)) groups.set(sig, []);
    groups.get(sig).push(p.id);
  }
  return [...groups.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([sig, ids]) => ({ brand: sig.split("|")[0], ids }));
}

// ── Rapport terminal ─────────────────────────────────────────────────────────
export function formatReport({ errors, warnings, passed, stats }) {
  const L = [];
  L.push("");
  L.push("═══ Validation du référentiel médicament ═══");
  L.push(`Produits: ${stats.products} · Substances: ${stats.substances} · Présentations: ${stats.presentations} · Liens: ${stats.links}`);
  L.push("");
  L.push(`✅ Checks bloquants passés (${passed.length})`);
  for (const p of passed) L.push(`   ✓ ${p}`);
  L.push("");
  if (warnings.length) {
    L.push(`⚠️  Warnings à revoir (${warnings.length})`);
    for (const w of warnings) L.push(`   ⚠️  ${w}`);
  } else {
    L.push("⚠️  Aucun warning");
  }
  L.push("");
  if (errors.length) {
    L.push(`❌ Erreurs bloquantes (${errors.length})`);
    for (const e of errors) L.push(`   ❌ ${e}`);
  } else {
    L.push("❌ Aucune erreur bloquante");
  }
  L.push("");
  L.push(errors.length ? "RÉSULTAT : ÉCHEC ❌" : "RÉSULTAT : OK ✅");
  return L.join("\n");
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const seedPath = new URL("../../lib/referentiel/seed.ma.json", import.meta.url);
  const pilotPath = new URL("../../lib/referentiel/pilot-priority-substances.json", import.meta.url);
  const monoPath = new URL("../../lib/referentiel/monographs.ma.json", import.meta.url);
  const seed = JSON.parse(readFileSync(seedPath, "utf8"));
  const pilot = JSON.parse(readFileSync(pilotPath, "utf8"));
  const mono = JSON.parse(readFileSync(monoPath, "utf8"));

  const seedResult = validateSeed(seed);
  console.log(formatReport(seedResult));

  const printBlock = (title, subtitle, res) => {
    console.log("");
    console.log(`═══ ${title} ═══`);
    if (subtitle) console.log(subtitle);
    console.log(`✅ Checks passés (${res.passed.length})`);
    for (const p of res.passed) console.log(`   ✓ ${p}`);
    if (res.warnings.length) {
      console.log(`⚠️  Warnings (${res.warnings.length})`);
      for (const w of res.warnings) console.log(`   ⚠️  ${w}`);
    }
    if (res.errors.length) {
      console.log(`❌ Erreurs bloquantes (${res.errors.length})`);
      for (const e of res.errors) console.log(`   ❌ ${e}`);
    } else {
      console.log("❌ Aucune erreur bloquante");
    }
  };

  const pilotResult = validatePilotPriority(pilot, seed);
  printBlock(
    "Validation de la priorisation pilote",
    `Entrées: ${pilotResult.stats.pilot_entries} · Haute priorité: ${pilotResult.stats.high_priority} · Haut risque: ${pilotResult.stats.high_risk}`,
    pilotResult
  );

  const monoResult = validateMonographs(mono, pilot, seed);
  printBlock(
    "Validation des monographies cliniques",
    `Monographies: ${monoResult.stats.monographs} · Complètes: ${monoResult.stats.complete} · Publiées: ${monoResult.stats.published} · Couverture pilote: ${monoResult.stats.pilot_coverage}/${pilotResult.stats.pilot_entries}`,
    monoResult
  );

  const totalErrors = seedResult.errors.length + pilotResult.errors.length + monoResult.errors.length;
  console.log("");
  console.log(totalErrors ? "RÉSULTAT GLOBAL : ÉCHEC ❌" : "RÉSULTAT GLOBAL : OK ✅");
  process.exit(totalErrors ? 1 : 0);
}
