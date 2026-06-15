#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Pipeline d'import CNOPS / data.gov.ma — étape "normalized_import"
//
// Entrée : frontend/data/raw/ref-des-medicaments-cnops-2014.xlsx (source MA, ODbL)
// Sortie : frontend/data/normalized/*.json (substances, produits, présentations,
//          liaisons, sources) + un rapport des lignes ambiguës (needs_review).
//
// Règles : aucune donnée inventée. Source MA → availability "unconfirmed" + validation
// "auto_imported". Pas de disponibilité déduite. Parseur XLSX sans dépendance (unzip + XML).
//
// Usage :  node scripts/referentiel/normalize-cnops.mjs --inspect   (aperçu)
//          node scripts/referentiel/normalize-cnops.mjs             (génère /data/normalized)
// ─────────────────────────────────────────────────────────────────────────────

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RAW = join(ROOT, "data", "raw", "ref-des-medicaments-cnops-2014.xlsx");
const OUT = join(ROOT, "data", "normalized");
const INSPECT = process.argv.includes("--inspect");

const SOURCE = {
  id: "src-cnops-datagovma-2014",
  source_name: "CNOPS — Référentiel des médicaments (data.gov.ma)",
  source_type: "official_open_data",
  country: "MA",
  license: "Open Data Commons Open Database License (ODbL)",
  url_or_file_reference: "https://www.data.gov.ma/data/fr/dataset/referentiel-des-medicaments",
  update_date: "2021-12-13",
  source_year: 2014,
  source_freshness: "stale",  // données de 2014 — à rafraîchir dès publication d'une version plus récente sur data.gov.ma
  imported_at: new Date().toISOString(),
  notes: "Données CNOPS 2014 (mis en ligne data.gov.ma : 2021-12-13). Référencement marocain uniquement — ne vaut pas confirmation de disponibilité actuelle.",
};

// ── Parseur XLSX dépendance-zéro ─────────────────────────────────────────────
function colToIndex(col) { let n = 0; for (const c of col) n = n * 26 + (c.charCodeAt(0) - 64); return n - 1; }
function decode(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
          .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
          .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}
function parseXlsx(file) {
  if (!existsSync(file)) { console.error("✗ Fichier introuvable :", file); process.exit(1); }
  const dir = mkdtempSync(join(tmpdir(), "cnops-"));
  execSync(`unzip -o -q "${file}" -d "${dir}"`);
  // shared strings
  const ssXml = existsSync(join(dir, "xl/sharedStrings.xml")) ? readFileSync(join(dir, "xl/sharedStrings.xml"), "utf8") : "";
  const shared = [];
  for (const si of ssXml.match(/<si>[\s\S]*?<\/si>/g) || []) {
    const txt = (si.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || []).map((t) => decode(t.replace(/<[^>]+>/g, ""))).join("");
    shared.push(txt);
  }
  // sheet 1
  const sheet = readFileSync(join(dir, "xl/worksheets/sheet1.xml"), "utf8");
  const rows = [];
  for (const rowXml of sheet.match(/<row[^>]*>[\s\S]*?<\/row>/g) || []) {
    const row = [];
    for (const cell of rowXml.match(/<c [^>]*?(?:\/>|>[\s\S]*?<\/c>)/g) || []) {
      const ref = (cell.match(/r="([A-Z]+)\d+"/) || [])[1];
      if (!ref) continue;
      const idx = colToIndex(ref);
      const isStr = /t="s"/.test(cell);
      const isInline = /t="(inlineStr|str)"/.test(cell);
      const v = (cell.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
      const inlineT = (cell.match(/<t[^>]*>([\s\S]*?)<\/t>/) || [])[1];
      let val = "";
      if (isStr && v !== undefined) val = shared[parseInt(v, 10)] ?? "";
      else if (isInline && inlineT !== undefined) val = decode(inlineT);
      else if (v !== undefined) val = decode(v);
      row[idx] = (val ?? "").trim();
    }
    rows.push(row);
  }
  return rows;
}

// ── Helpers normalisation ────────────────────────────────────────────────────
const strip = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const slug = (s) => strip(s).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
function parsePrice(s) {
  if (!s) return null;
  const n = parseFloat(String(s).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
function splitCombo(s) { return String(s || "").split("/").map((x) => x.trim()).filter(Boolean); }

// ── Main ─────────────────────────────────────────────────────────────────────
const rows = parseXlsx(RAW);
const header = rows[0].map((h) => (h || "").trim());
const col = {};
header.forEach((h, i) => { if (h) col[h] = i; });
const need = ["CODE", "NOM", "DCI1", "DOSAGE1", "UNITE_DOSAGE1", "FORME", "PRESENTATION", "PPV", "PRIX_BR", "PRINCEPS_GENERIQUE", "TAUX_REMBOURSEMENT"];

if (INSPECT) {
  console.log("En-têtes détectées :", header.filter(Boolean).join(" | "));
  console.log("Colonnes mappées :", need.map((n) => `${n}=${col[n] ?? "?"}`).join(" "));
  console.log("Lignes totales (hors en-tête) :", rows.length - 1);
  console.log("\n— 4 lignes d'exemple —");
  for (let i = 1; i <= 4 && i < rows.length; i++) {
    const r = rows[i];
    console.log(`  ${r[col.NOM]} | DCI=${r[col.DCI1]} | ${r[col.DOSAGE1]} ${r[col.UNITE_DOSAGE1]} | ${r[col.FORME]} | PPV=${r[col.PPV]} BR=${r[col.PRIX_BR]} | ${r[col.PRINCEPS_GENERIQUE]} | ${r[col.TAUX_REMBOURSEMENT]}`);
  }
  process.exit(0);
}

// Génération
const substances = new Map();   // normalized DCI -> substance
const products = [];
const presentations = [];
const productSubstances = [];
const report = { generated_at: new Date().toISOString(), total_rows: rows.length - 1, imported: 0, needs_review: [], skipped: [] };
const now = new Date().toISOString();

const typeMap = (v) => { const t = (v || "").trim().toUpperCase(); return t === "P" ? "princeps" : t === "G" ? "generic" : "unknown"; };

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const nom = (r[col.NOM] || "").trim();
  const dci = (r[col.DCI1] || "").trim();
  const flags = [];
  if (!nom) { report.skipped.push({ row: i + 1, reason: "NOM vide" }); continue; }
  if (!dci) flags.push("DCI manquante");

  const pid = `ma-${slug(nom)}-${slug(r[col.DOSAGE1] || "")}-${i}`;
  const ppv = parsePrice(r[col.PPV]);
  const br = parsePrice(r[col.PRIX_BR]);
  if (r[col.PPV] && ppv === null) flags.push(`PPV non numérique: "${r[col.PPV]}"`);

  products.push({
    id: pid,
    brand_name: nom,
    normalized_brand_name: strip(nom),
    country: "MA",
    lab_name: null,
    product_type: typeMap(r[col.PRINCEPS_GENERIQUE]),
    reference_product_id: null,
    generic_group_id: null,
    equivalence_confidence: "unknown",
    equivalence_source_id: null,
    substitution_status: "needs_review",
    regulatory_status: "referenced",
    morocco_reference_status: "referenced_morocco_source",
    availability_status: "availability_unconfirmed",
    source_primary_id: SOURCE.id,
    source_primary_name: SOURCE.source_name,
    source_primary_date: SOURCE.update_date,
    last_verified_at: null,
    validation_status: flags.length ? "needs_review" : "auto_imported",
    cnops_code: (r[col.CODE] || "").trim() || null,
    created_at: now, updated_at: now,
  });

  // substances + liaisons (gère les combos "A / B")
  const dcis = splitCombo(dci);
  const doses = splitCombo(r[col.DOSAGE1]);
  const units = splitCombo(r[col.UNITE_DOSAGE1]);
  if (dcis.length > 1 && doses.length && doses.length !== dcis.length) flags.push("nb DCI ≠ nb dosages");
  dcis.forEach((d, k) => {
    const key = strip(d);
    if (!key) return;
    if (!substances.has(key)) {
      substances.set(key, {
        id: `sub-${slug(d)}`, dci_fr: d, dci_en: null, normalized_name: key, synonyms: [],
        atc_code: null, therapeutic_class: null, source_id: SOURCE.id,
        validation_status: "needs_review", created_at: now, updated_at: now,
      });
    }
    productSubstances.push({
      product_id: pid, substance_id: `sub-${slug(d)}`,
      dosage: doses[k] || doses[0] || null, unit: units[k] || units[0] || null,
      role: "active_substance", source_id: SOURCE.id,
      validation_status: doses.length === dcis.length ? "auto_imported" : "needs_review",
    });
  });

  presentations.push({
    id: `pres-${pid}`, medicinal_product_id: pid,
    strength: (r[col.DOSAGE1] || "").trim() || null, unit: (r[col.UNITE_DOSAGE1] || "").trim() || null,
    pharmaceutical_form: (r[col.FORME] || "").trim() || null, route: null,
    packaging: (r[col.PRESENTATION] || "").trim() || null,
    ppv, hospital_price: parsePrice(r[col.PH]), reimbursement_base: br,
    reimbursement_status: (r[col.TAUX_REMBOURSEMENT] || "").trim() ? "reimbursed" : "unknown",
    prescription_conditions: (r[col.TAUX_REMBOURSEMENT] || "").trim() ? `Taux remboursement : ${r[col.TAUX_REMBOURSEMENT].trim()}` : null,
    availability_status: "availability_unconfirmed", last_checked_at: null,
    source_id: SOURCE.id, validation_status: flags.length ? "needs_review" : "auto_imported",
    created_at: now, updated_at: now,
  });

  report.imported++;
  if (flags.length) report.needs_review.push({ row: i + 1, nom, flags });
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const write = (name, data) => writeFileSync(join(OUT, name), JSON.stringify(data, null, 2));
write("sources.json", [SOURCE]);
write("substances.json", [...substances.values()]);
write("medicinal_products.json", products);
write("presentations.json", presentations);
write("product_substances.json", productSubstances);
write("import-report.json", report);

console.log("✓ Import normalisé terminé");
console.log(`  Lignes source      : ${report.total_rows}`);
console.log(`  Produits importés   : ${products.length}`);
console.log(`  Substances (DCI)    : ${substances.size}`);
console.log(`  Présentations       : ${presentations.length}`);
console.log(`  Liaisons produit↔DCI: ${productSubstances.length}`);
console.log(`  À revoir (needs_review): ${report.needs_review.length}`);
console.log(`  Ignorées (NOM vide) : ${report.skipped.length}`);
console.log(`  → ${OUT}`);
