#!/usr/bin/env node
// Validation BDPM sur les produits du seed Morocco-first.
// Features : cache local JSON, retry avec backoff exponentiel, reprise après échec.
// Sortie : data/reports/bdpm-validation-report.json
//
// Usage :
//   node scripts/referentiel/validate-bdpm-matches.mjs           # 357 produits complets
//   node scripts/referentiel/validate-bdpm-matches.mjs --limit=20 # test rapide
//   node scripts/referentiel/validate-bdpm-matches.mjs --reset    # vide le cache API

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT   = join(__dir, "../..");
const CACHE_DIR = join(ROOT, "data/reports/.bdpm-cache");
const REPORT_PATH = join(ROOT, "data/reports/bdpm-validation-report.json");

mkdirSync(CACHE_DIR, { recursive: true });
mkdirSync(join(ROOT, "data/reports"), { recursive: true });

// ── Seed ──────────────────────────────────────────────────────────────────

const seed = JSON.parse(readFileSync(join(ROOT, "lib/referentiel/seed.ma.json"), "utf8"));
const { medicinal_products: products, presentations, substances: substanceRaw, product_substances } = seed;

const substanceById = {};
for (const s of Object.values(substanceRaw)) substanceById[s.id] = s;

const presentationByProductId = {};
for (const p of Object.values(presentations)) {
  if (!presentationByProductId[p.product_id]) presentationByProductId[p.product_id] = p;
}

const linksByProductId = {};
for (const l of Object.values(product_substances)) {
  if (!linksByProductId[l.product_id]) linksByProductId[l.product_id] = [];
  linksByProductId[l.product_id].push(l);
}

// ── Normalisation (copie de bdpmMatcher.ts) ───────────────────────────────

function norm(s) {
  return String(s)
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ").trim();
}

const ROUTE_MAP = [
  [/ophtalmique|oculaire|ocul/, "ophtalmique"],
  [/auriculaire|otique|oreille/, "auriculaire"],
  [/nasal|intranasale|rhinologique/, "nasal"],
  [/sublinguale|sublingal|buccale/, "sublingual"],
  [/intraveneus|intraveineuse|perfusion|iv |i\.v\.|injectable.*iv/, "injectable"],
  [/intramusculaire|im |i\.m\./, "injectable"],
  [/sous.cutane|s\.c\.|sc |hypodermique/, "injectable"],
  [/injectable|parenter|injection/, "injectable"],
  [/orale|per os|buccale|gastrique|digestive/, "oral"],
  [/topique|cutane|dermique|transcutane/, "cutane"],
  [/transdermique|patch/, "transdermal"],
  [/inhal|respiratoire|pulmonaire|bronchique/, "inhale"],
  [/vaginal|intravaginal/, "vaginal"],
  [/rectal|suppositoire/, "rectal"],
];

const FORM_MAP = [
  [/collyre|ophtalmique|oculaire|oeil|gouttes ophtalmiques/, "ophtalmique"],
  [/auriculaire|gouttes auriculaires/, "auriculaire"],
  [/nasale|spray nasal|solution nasale/, "nasale"],
  [/injectable|perfusion|intraveineuse|intramusculaire|sous.cutane|lyophilisat|poudre pour solution|poudre pour suspension/, "injectable"],
  [/inhaler|inhalation|aerosol|nebuliseur|poudre.*inhal/, "inhale"],
  [/comprime|gelule|capsule|comprimes|sachet|granule|orodispersible/, "solid_oral"],
  [/sirop|solution orale|suspension orale|solution buvable|suspension buvable|gouttes orales/, "liquid_oral"],
  [/vaginal|ovule/, "vaginal"],
  [/suppositoire|lavement|rectal/, "rectal"],
  [/pommade|creme|gel|lotion|emulsion|patch|baume|mousse cutanee|solution cutanee/, "cutane"],
];

const INCOMPAT_ROUTES = [
  ["ophtalmique","oral"],["ophtalmique","injectable"],["ophtalmique","cutane"],
  ["ophtalmique","transdermal"],["ophtalmique","inhale"],["ophtalmique","vaginal"],["ophtalmique","rectal"],
  ["auriculaire","oral"],["auriculaire","injectable"],["auriculaire","ophtalmique"],
  ["auriculaire","inhale"],["auriculaire","vaginal"],["auriculaire","rectal"],
  ["nasal","oral"],["nasal","injectable"],["nasal","vaginal"],["nasal","rectal"],
  ["oral","injectable"],["oral","cutane"],["oral","inhale"],["oral","vaginal"],["oral","rectal"],
  ["injectable","cutane"],["injectable","inhale"],["injectable","vaginal"],["injectable","rectal"],["injectable","transdermal"],
  ["cutane","inhale"],["cutane","vaginal"],["cutane","rectal"],
  ["inhale","vaginal"],["inhale","rectal"],["vaginal","rectal"],
];

const INCOMPAT_FORMS = [
  ["solid_oral","injectable"],["solid_oral","ophtalmique"],["solid_oral","auriculaire"],
  ["solid_oral","nasale"],["solid_oral","inhale"],["solid_oral","vaginal"],["solid_oral","rectal"],
  ["liquid_oral","injectable"],["liquid_oral","ophtalmique"],["liquid_oral","vaginal"],["liquid_oral","rectal"],
  ["injectable","ophtalmique"],["injectable","auriculaire"],["injectable","nasale"],
  ["injectable","cutane"],["injectable","inhale"],["injectable","vaginal"],["injectable","rectal"],
  ["ophtalmique","auriculaire"],["ophtalmique","nasale"],["ophtalmique","cutane"],
  ["ophtalmique","inhale"],["ophtalmique","vaginal"],["ophtalmique","rectal"],
  ["inhale","vaginal"],["inhale","rectal"],["vaginal","rectal"],
];

function normalizeRoute(t) {
  const s = norm(t);
  for (const [re, cat] of ROUTE_MAP) if (re.test(s)) return cat;
  return "autre";
}
function normalizeForm(t) {
  const s = norm(t);
  for (const [re, cat] of FORM_MAP) if (re.test(s)) return cat;
  return "autre";
}
function routesIncompat(a, b) {
  if (a === "autre" || b === "autre") return false;
  return INCOMPAT_ROUTES.some(([x, y]) => (a===x&&b===y)||(a===y&&b===x));
}
function formsIncompat(a, b) {
  if (a === "autre" || b === "autre") return false;
  return INCOMPAT_FORMS.some(([x, y]) => (a===x&&b===y)||(a===y&&b===x));
}
function normSub(name) { return norm(name).replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim(); }

function substancesOverlap(localSubs, bdpmSubs) {
  const bn = bdpmSubs.map(normSub);
  let found = 0;
  for (const s of localSubs) {
    const sn = normSub(s);
    if (bn.some(b => b.includes(sn) || sn.includes(b))) found++;
  }
  return { allFound: localSubs.length > 0 && found === localSubs.length, anyFound: found > 0, foundCount: found };
}

function matchCandidate(local, candidate) {
  let score = 0;
  const lb = norm(local.brandName);
  const bd = norm(candidate.denomination ?? "");
  const matchedOnBrand = lb.length > 2 && bd.length > 2 && (bd.includes(lb) || lb.includes(bd));
  if (matchedOnBrand) score += 30;

  const bdpmSubs = candidate.substances ?? [];
  const { allFound, anyFound, foundCount } = substancesOverlap(local.substances, bdpmSubs);
  if (allFound) score += 25 * local.substances.length;
  else if (anyFound) score += 10 * foundCount;

  if (local.substances.length > 0 && !anyFound && !matchedOnBrand)
    return { status:"rejected", confidence:"none", reason:"Composition incompatible", score:0, rejection_code:"composition_mismatch" };
  if (local.substances.length > 1 && bdpmSubs.length === 1 && !matchedOnBrand && !allFound)
    return { status:"rejected", confidence:"none", reason:"Association vs monothérapie", score:0, rejection_code:"composition_mismatch" };

  const lrc = local.route ? normalizeRoute(local.route) : "autre";
  const brs = (candidate.voies ?? []).map(normalizeRoute);
  const brc = brs[0] ?? "autre";
  const matchedOnRoute = lrc !== "autre" && brs.includes(lrc);
  if (lrc !== "autre" && brc !== "autre" && routesIncompat(lrc, brc))
    return { status:"rejected", confidence:"none", reason:`Voie incompatible: ${lrc} vs ${brc}`, score:0, rejection_code:"route_mismatch" };
  if (matchedOnRoute) score += 20;

  const lfc = local.form ? normalizeForm(local.form) : "autre";
  const bfc = candidate.forme ? normalizeForm(candidate.forme) : "autre";
  const matchedOnForm = lfc !== "autre" && lfc === bfc;
  if (lfc !== "autre" && bfc !== "autre" && formsIncompat(lfc, bfc))
    return { status:"rejected", confidence:"none", reason:`Forme incompatible: ${lfc} vs ${bfc}`, score:0, rejection_code:"form_mismatch" };
  if (matchedOnForm) score += 20;

  if (!matchedOnBrand && !anyFound)
    return { status:"no_match", confidence:"none", reason:"Aucun match", score };

  const scope = matchedOnBrand ? "product_level" : "substance_level";

  // Sécurité DCI1 CNOPS
  if (local.substance_completeness_status !== "complete" && bdpmSubs.length > local.substances.length) {
    return { status:"needs_review", confidence:"low", reason:`local_substance_context_incomplete — ${local.substances.length} SA locale(s), ${bdpmSubs.length} SA BDPM`, score, rejection_code: undefined };
  }

  const confidence = score >= 75 ? "high" : score >= 45 ? "medium" : score >= 20 ? "low" : "none";
  const status = confidence === "high" ? "accepted" : "needs_review";
  return { status, confidence, score, reason:`score ${score}`, rejection_code: undefined };
}

function selectBest(local, candidates) {
  let best = null;
  for (const c of candidates) {
    const subs = (c.composition ?? [])
      .filter(x => x.natureComposant === "SA")
      .map(x => (x.dosage ? `${x.denominationSubstance} (${x.dosage})` : x.denominationSubstance))
      .filter(Boolean);
    const candidate = {
      denomination: c.elementPharmaceutique, forme: c.formePharmaceutique,
      voies: c.voiesAdministration ?? [], substances: subs,
    };
    const match = matchCandidate(local, candidate);
    if (match.status === "rejected") continue;
    if (!best || match.score > best.match.score) best = { candidate, match };
  }
  return best;
}

function getLocalContext(product) {
  const pres = presentationByProductId[product.id];
  const links = linksByProductId[product.id] ?? [];
  const subs = links
    .map(l => normSub(substanceById[l.substance_id]?.dci_fr ?? ""))
    .filter(s => s.length > 1);
  return {
    brandName: product.brand_name,
    substances: subs,
    form: pres?.pharmaceutical_form ?? null,
    route: pres?.route ?? null,
    substance_completeness_status: product.validation_status === "validated" ? "complete" : "incomplete",
  };
}

// ── Cache API local ────────────────────────────────────────────────────────

function cacheKeyFile(name) {
  return join(CACHE_DIR, norm(name).replace(/[^a-z0-9]/g, "_").slice(0, 60) + ".json");
}

function readApiCache(name) {
  const p = cacheKeyFile(name);
  if (!existsSync(p)) return null;
  try {
    const { data, ts } = JSON.parse(readFileSync(p, "utf8"));
    // Cache valide 7 jours
    if (Date.now() - ts > 7 * 24 * 60 * 60 * 1000) return null;
    return data;
  } catch { return null; }
}

function writeApiCache(name, data) {
  try {
    writeFileSync(cacheKeyFile(name), JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

// ── Fetch avec retry backoff exponentiel ──────────────────────────────────

async function fetchWithRetry(url, maxRetries = 4, baseDelay = 800) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (res.status === 429 || res.status >= 500) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 300;
          process.stdout.write(` [retry ${attempt + 1}/${maxRetries} après ${Math.round(delay)}ms]`);
          await sleep(delay);
          continue;
        }
        return null;
      }
      if (!res.ok) return null;
      return res;
    } catch (e) {
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        process.stdout.write(` [erreur réseau, retry ${attempt + 1}]`);
        await sleep(delay);
      } else {
        return null;
      }
    }
  }
  return null;
}

async function fetchCandidates(name) {
  const cached = readApiCache(name);
  if (cached !== null) return cached;

  const query = norm(name).slice(0, 50);
  if (query.length < 3) { writeApiCache(name, []); return []; }

  const res = await fetchWithRetry(
    `https://medicaments-api.giygas.dev/v1/medicaments?search=${encodeURIComponent(query)}`
  );
  if (!res) { writeApiCache(name, []); return []; }
  try {
    const json = await res.json();
    const list = Array.isArray(json) ? json : [];
    writeApiCache(name, list);
    return list;
  } catch { writeApiCache(name, []); return []; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith("--limit=") || a === "--limit");
const reset = args.includes("--reset");
let limit = Infinity;
if (limitArg) {
  const next = args[args.indexOf(limitArg) + 1];
  limit = parseInt(limitArg.includes("=") ? limitArg.split("=")[1] : next, 10) || 20;
}

if (reset) {
  const { readdirSync, unlinkSync } = await import("fs");
  try {
    for (const f of readdirSync(CACHE_DIR)) unlinkSync(join(CACHE_DIR, f));
    console.log("Cache API vidé.");
  } catch {}
}

const productList = Object.values(products).slice(0, limit);
console.log(`\nValidation BDPM — ${productList.length} produits (seed Morocco-first)`);
console.log(`Cache API : ${CACHE_DIR}`);
console.log(`Rapport   : ${REPORT_PATH}\n`);

const results = [];
let countAccepted = 0, countNeedsReview = 0, countRejected = 0, countNoMatch = 0, countNoData = 0;

for (let i = 0; i < productList.length; i++) {
  const product = productList[i];
  const local = getLocalContext(product);
  const pct = String(Math.round(((i + 1) / productList.length) * 100)).padStart(3) + "%";
  process.stdout.write(`[${pct}] ${product.brand_name.slice(0, 28).padEnd(28)} `);

  const candidates = await fetchCandidates(product.brand_name);

  let matchResult;
  if (candidates.length === 0) {
    matchResult = { status: "no_data", confidence: "none", reason: "Aucun candidat BDPM", score: 0 };
    countNoData++;
  } else {
    const best = selectBest(local, candidates);
    if (!best) {
      // Tous rejetés — retourne le premier rejet pour avoir le code
      const firstSubs = (candidates[0]?.composition ?? [])
        .filter(x => x.natureComposant === "SA")
        .map(x => x.denominationSubstance).filter(Boolean);
      matchResult = matchCandidate(local, {
        denomination: candidates[0]?.elementPharmaceutique,
        forme: candidates[0]?.formePharmaceutique,
        voies: candidates[0]?.voiesAdministration ?? [],
        substances: firstSubs,
      });
      countRejected++;
    } else {
      matchResult = best.match;
      if (matchResult.status === "accepted") countAccepted++;
      else if (matchResult.status === "needs_review") countNeedsReview++;
      else countNoMatch++;
    }
  }

  const statusStr = matchResult.status.toUpperCase();
  const conf = (matchResult.confidence ?? "none").padEnd(7);
  const sc = String(matchResult.score ?? 0).padEnd(4);
  console.log(`${statusStr.padEnd(12)} conf=${conf} sc=${sc} ${(matchResult.reason ?? "").slice(0, 55)}`);

  results.push({
    brand_name: product.brand_name,
    substances: local.substances,
    form: local.form,
    route: local.route,
    substance_completeness_status: local.substance_completeness_status,
    ...matchResult,
  });

  // Délai inter-requêtes : 0 si déjà en cache, 600ms sinon
  const fromCache = existsSync(cacheKeyFile(product.brand_name));
  if (i < productList.length - 1 && fromCache) {
    // cache hit, pas de délai
  } else if (i < productList.length - 1) {
    await sleep(600);
  }
}

// ── Rapport ────────────────────────────────────────────────────────────────

function top20(list, field) {
  return list
    .filter(r => r.status === field)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 20)
    .map(({ brand_name, substances, form, route, score, reason, rejection_code, confidence }) =>
      ({ brand_name, substances, form, route, score, reason, rejection_code, confidence }));
}

const report = {
  generated_at: new Date().toISOString(),
  total: results.length,
  summary: {
    accepted:     countAccepted,
    needs_review: countNeedsReview,
    rejected:     countRejected,
    no_match:     countNoMatch,
    no_data:      countNoData,
  },
  top20_accepted:     top20(results, "accepted"),
  top20_needs_review: top20(results, "needs_review"),
  top20_rejected:     results.filter(r => r.status === "rejected").slice(0, 20)
    .map(({ brand_name, substances, form, route, reason, rejection_code }) =>
      ({ brand_name, substances, form, route, reason, rejection_code })),
  all_results: results,
};

writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(`\n${"─".repeat(65)}`);
console.log(` Total analysés  : ${results.length}`);
console.log(` ✓ Accepted       : ${countAccepted}`);
console.log(` ⚠ Needs review   : ${countNeedsReview}`);
console.log(` ✗ Rejected       : ${countRejected}`);
console.log(` ∅ No match       : ${countNoMatch}`);
console.log(` — No BDPM data   : ${countNoData}`);
console.log(`\nRapport → ${REPORT_PATH}`);

if (countNoData > results.length * 0.7) {
  console.log(`\n⚠  AVERTISSEMENT : ${countNoData}/${results.length} produits sans données BDPM.`);
  console.log(`   Cause probable : rate-limiting ou noms de marques marocains absents de BDPM.`);
  console.log(`   Relancer avec --reset pour vider le cache et réessayer avec un délai plus long.`);
}
