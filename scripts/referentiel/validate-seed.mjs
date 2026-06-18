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
  const data = JSON.parse(readFileSync(seedPath, "utf8"));
  const result = validateSeed(data);
  console.log(formatReport(result));
  process.exit(result.errors.length ? 1 : 0);
}
