#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Construit le seed PRIORITAIRE de l'app à partir des données normalisées CNOPS.
// Filtrage honnête (aucune invention) : on ne garde que les produits dont la DCI
// appartient aux classes prioritaires pharmacovigilance/prescription.
// Sortie : frontend/lib/referentiel/seed.ma.json (petit, versionnable, chargeable).
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const NORM = join(ROOT, "data", "normalized");
const OUT = join(ROOT, "lib", "referentiel", "seed.ma.json");

if (!existsSync(join(NORM, "medicinal_products.json"))) {
  console.error("✗ Lance d'abord : node scripts/referentiel/normalize-cnops.mjs");
  process.exit(1);
}
const load = (n) => JSON.parse(readFileSync(join(NORM, n), "utf8"));
const substances = load("substances.json");
const products = load("medicinal_products.json");
const presentations = load("presentations.json");
const links = load("product_substances.json");
const sources = load("sources.json");

// DCI prioritaires (normalisées, sans accents). Classes demandées.
const PRIORITY = [
  // antibiotiques
  "amoxicilline","acide clavulanique","ampicilline","cloxacilline","penicilline","ceftriaxone","cefotaxime",
  "cefixime","cefuroxime","ciprofloxacine","ofloxacine","levofloxacine","azithromycine","clarithromycine",
  "erythromycine","metronidazole","gentamicine","doxycycline","sulfamethoxazole","trimethoprime","vancomycine","fosfomycine",
  // antalgiques / AINS
  "paracetamol","ibuprofene","aspirine","acide acetylsalicylique","tramadol","morphine","codeine","nefopam",
  "diclofenac","ketoprofene","naproxene","acide mefenamique",
  // anticoagulants / antiagrégants
  "warfarine","acenocoumarol","heparine","enoxaparine","tinzaparine","rivaroxaban","apixaban","dabigatran","clopidogrel",
  // antidiabétiques
  "metformine","gliclazide","glibenclamide","glimepiride","insuline","sitagliptine","vildagliptine","empagliflozine","dapagliflozine",
  // antihypertenseurs / cardio
  "amlodipine","nifedipine","nicardipine","perindopril","ramipril","enalapril","lisinopril","captopril",
  "losartan","valsartan","candesartan","irbesartan","telmisartan","bisoprolol","atenolol","metoprolol","carvedilol",
  "hydrochlorothiazide","indapamide","furosemide","spironolactone","atorvastatine","simvastatine","rosuvastatine",
  // corticoïdes
  "prednisone","prednisolone","methylprednisolone","dexamethasone","hydrocortisone","betamethasone","budesonide",
  // psychotropes / neuro
  "diazepam","alprazolam","bromazepam","lorazepam","clonazepam","fluoxetine","sertraline","paroxetine","escitalopram",
  "amitriptyline","venlafaxine","risperidone","olanzapine","haloperidol","quetiapine","valproate","acide valproique",
  "carbamazepine","levetiracetam","lamotrigine","gabapentine","pregabaline","levodopa",
  // oncologie courante
  "methotrexate","cisplatine","carboplatine","oxaliplatine","paclitaxel","docetaxel","fluorouracile","capecitabine",
  "cyclophosphamide","doxorubicine","gemcitabine","tamoxifene","imatinib","rituximab","trastuzumab","pembrolizumab","nivolumab",
  // thyroïde / divers à risque
  "levothyroxine","amiodarone","digoxine","omeprazole","esomeprazole","salbutamol","allopurinol","colchicine",
];

function isPriority(normName) {
  return PRIORITY.some((kw) => normName === kw || normName.includes(kw) || kw.includes(normName));
}

const keepSub = new Set(substances.filter((s) => isPriority(s.normalized_name)).map((s) => s.id));

// Plafonne à CAP produits par substance (princeps d'abord) pour une base "petite & propre".
const CAP = 3;
const productById = new Map(products.map((p) => [p.id, p]));
const bySub = new Map();
for (const l of links) {
  if (!keepSub.has(l.substance_id)) continue;
  if (!bySub.has(l.substance_id)) bySub.set(l.substance_id, []);
  bySub.get(l.substance_id).push(l.product_id);
}
const keepProductIds = new Set();
for (const pids of bySub.values()) {
  const uniq = [...new Set(pids)].map((id) => productById.get(id)).filter(Boolean);
  uniq.sort((a, b) => (a.product_type === "princeps" ? -1 : 1) - (b.product_type === "princeps" ? -1 : 1));
  uniq.slice(0, CAP).forEach((p) => keepProductIds.add(p.id));
}

const subOut = substances.filter((s) => keepSub.has(s.id));
const prodOut = products.filter((p) => keepProductIds.has(p.id));
const presOut = presentations.filter((p) => keepProductIds.has(p.medicinal_product_id));
const linkOut = links.filter((l) => keepProductIds.has(l.product_id));

const dataset = {
  version: "1.0.0-cnops2014-priority",
  generated_at: new Date().toISOString(),
  sources,
  substances: subOut,
  medicinal_products: prodOut,
  presentations: presOut,
  product_substances: linkOut,
};
writeFileSync(OUT, JSON.stringify(dataset));

console.log("✓ Seed prioritaire généré");
console.log(`  Substances prioritaires : ${subOut.length}`);
console.log(`  Produits                : ${prodOut.length}`);
console.log(`  Présentations           : ${presOut.length}`);
console.log(`  Taille fichier          : ${(JSON.stringify(dataset).length / 1024).toFixed(0)} Ko`);
console.log(`  → ${OUT}`);
