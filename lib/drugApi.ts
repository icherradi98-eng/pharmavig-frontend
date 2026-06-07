// Utilitaires pour la page /medicaments — fetch, cache localStorage 24h, et parsing de texte RCP/FDA

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

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

// ---- Autocomplete ----
export type Suggestion = { dci: string; brand?: string };

export async function autocomplete(query: string): Promise<Suggestion[]> {
  if (query.trim().length < 2) return [];
  const out: Suggestion[] = [];
  const seen = new Set<string>();

  try {
    const res = await fetchWithTimeout(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`);
    if (res) {
      const json = await res.json();
      const groups = json?.drugGroup?.conceptGroup || [];
      for (const g of groups) {
        for (const c of g.conceptProperties || []) {
          const dci = (c.synonym || c.name || "").split(" ")[0];
          const key = dci.toLowerCase();
          if (dci && !seen.has(key)) {
            seen.add(key);
            out.push({ dci, brand: c.name !== dci ? c.name : undefined });
          }
          if (out.length >= 8) break;
        }
        if (out.length >= 8) break;
      }
    }
  } catch {}

  if (out.length < 5) {
    try {
      const res = await fetchWithTimeout(
        `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${encodeURIComponent(query)}*&limit=5`
      );
      if (res) {
        const json = await res.json();
        for (const r of json?.results || []) {
          const dci = r.openfda?.generic_name?.[0];
          const brand = r.openfda?.brand_name?.[0];
          const key = (dci || brand || "").toLowerCase();
          if (key && !seen.has(key)) {
            seen.add(key);
            out.push({ dci: dci || brand, brand: dci ? brand : undefined });
          }
        }
      }
    } catch {}
  }

  return out.slice(0, 8);
}

// ---- OpenFDA label ----
export type FdaLabel = {
  generic_name?: string;
  brand_name?: string[];
  manufacturer_name?: string[];
  route?: string[];
  pharm_class_epc?: string[];
  warnings_and_cautions?: string;
  adverse_reactions?: string;
  drug_interactions?: string;
  indications_and_usage?: string;
  dosage_and_administration?: string;
  contraindications?: string;
  pregnancy?: string;
};

// L'API OpenFDA référence les médicaments sous leur nom anglais/USAN
// (ex. "ibuprofen", "amoxicillin", "metformin") alors que la DCI française
// utilise souvent une orthographe différente ("ibuprofène", "amoxicilline",
// "metformine"). On génère donc plusieurs variantes du nom à essayer.
function deaccent(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function candidateNames(name: string): string[] {
  const base = deaccent(name.trim().toLowerCase());
  const variants = new Set<string>([name.trim(), base]);
  // "-ine" -> "-in" (amoxicilline -> amoxicillin, metformine -> metformin, atorvastatine -> atorvastatin)
  if (base.endsWith("ine")) variants.add(base.slice(0, -1));
  // "-ene"/"-ène" -> "-en" (ibuprofène -> ibuprofen)
  if (base.endsWith("ene")) variants.add(base.slice(0, -1));
  // generic trailing "e" drop (only if not already covered, e.g. some adjectives)
  if (base.endsWith("e") && !base.endsWith("ate") && !base.endsWith("ide")) variants.add(base.slice(0, -1));
  return [...variants].filter(Boolean);
}

type RawFdaResult = {
  openfda?: {
    generic_name?: string[];
    brand_name?: string[];
    manufacturer_name?: string[];
    route?: string[];
    pharm_class_epc?: string[];
  };
  warnings_and_cautions?: unknown;
  adverse_reactions?: unknown;
  drug_interactions?: unknown;
  indications_and_usage?: unknown;
  dosage_and_administration?: unknown;
  contraindications?: unknown;
  pregnancy?: unknown;
};

async function fetchFdaJson(url: string): Promise<{ results?: RawFdaResult[] } | null> {
  const res = await fetchWithTimeout(url);
  if (!res) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Découpe un nom de médicament composé en ses molécules individuelles
// ("Sitagliptine et Metformine" -> ["Sitagliptine", "Metformine"])
export function splitDrugComponents(name: string): string[] {
  return name
    .split(/\s*(?:\bet\b|\band\b|\/|\+|,)\s*/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

async function fetchSingleFdaLabel(name: string): Promise<FdaLabel | null> {
  try {
    let r: RawFdaResult | undefined;
    for (const candidate of candidateNames(name)) {
      const json = await fetchFdaJson(
        `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(candidate)}"&limit=1`
      );
      r = json?.results?.[0];
      if (r) break;
    }
    if (!r) return null;
    return {
      generic_name: r.openfda?.generic_name?.[0],
      brand_name: r.openfda?.brand_name,
      manufacturer_name: r.openfda?.manufacturer_name,
      route: r.openfda?.route,
      pharm_class_epc: r.openfda?.pharm_class_epc,
      warnings_and_cautions: arrJoin(r.warnings_and_cautions),
      adverse_reactions: arrJoin(r.adverse_reactions),
      drug_interactions: arrJoin(r.drug_interactions),
      indications_and_usage: arrJoin(r.indications_and_usage),
      dosage_and_administration: arrJoin(r.dosage_and_administration),
      contraindications: arrJoin(r.contraindications),
      pregnancy: arrJoin(r.pregnancy),
    };
  } catch {
    return null;
  }
}

function mergeText(a?: string, b?: string): string | undefined {
  if (a && b) return a === b ? a : `${a}\n\n${b}`;
  return a || b;
}

export async function fetchFdaLabel(name: string): Promise<FdaLabel | null> {
  const cached = readCache<FdaLabel | null>(name, "fda_label");
  if (cached !== null) return cached;

  const label = await fetchSingleFdaLabel(name);

  // Les associations fixes (ex. "Sitagliptine et Metformine") n'ont pas toujours
  // de notice FDA dédiée avec un champ "drug_interactions" rempli — on complète
  // alors avec les données de chaque molécule individuelle.
  const components = splitDrugComponents(name);
  let merged = label;
  if (components.length > 1 && (!label?.drug_interactions || !label?.contraindications)) {
    for (const comp of components) {
      if (comp.toLowerCase() === name.trim().toLowerCase()) continue;
      const compLabel = await fetchSingleFdaLabel(comp);
      if (!compLabel) continue;
      merged = merged
        ? {
            ...merged,
            drug_interactions: merged.drug_interactions || mergeText(merged.drug_interactions, compLabel.drug_interactions),
            contraindications: merged.contraindications || mergeText(merged.contraindications, compLabel.contraindications),
            adverse_reactions: merged.adverse_reactions || compLabel.adverse_reactions,
            indications_and_usage: merged.indications_and_usage || compLabel.indications_and_usage,
            dosage_and_administration: merged.dosage_and_administration || compLabel.dosage_and_administration,
            pregnancy: merged.pregnancy || compLabel.pregnancy,
          }
        : compLabel;
    }
  }

  writeCache(name, "fda_label", merged ?? null);
  return merged ?? null;
}

function arrJoin(v: unknown): string | undefined {
  if (Array.isArray(v)) return v.join("\n\n");
  if (typeof v === "string") return v;
  return undefined;
}

// ---- OpenFDA adverse events ----
export type AdverseEvent = { reaction: string; count: number };

export async function fetchAdverseEvents(name: string): Promise<AdverseEvent[]> {
  const cached = readCache<AdverseEvent[]>(name, "fda_events");
  if (cached !== null) return cached;
  try {
    const res = await fetchWithTimeout(
      `https://api.fda.gov/drug/event.json?search=patient.drug.openfda.generic_name:"${encodeURIComponent(name)}"&count=patient.reaction.reactionmeddrapt.exact&limit=10`
    );
    if (!res) {
      writeCache(name, "fda_events", []);
      return [];
    }
    const json = await res.json();
    const events: AdverseEvent[] = (json?.results || []).map((r: { term: string; count: number }) => ({
      reaction: titleCase(r.term),
      count: r.count,
    }));
    writeCache(name, "fda_events", events);
    return events;
  } catch {
    return [];
  }
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

// ---- Traduction automatique EN → FR (MyMemory, gratuite, sans clé) ----
// Les textes RCP d'OpenFDA sont en anglais. On les traduit côté client avec
// un fallback propre si l'API de traduction est indisponible ou limite atteinte.

const TRANSLATE_MAX = 480; // limite raisonnable par requête côté API gratuite
const TRANSLATE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

export async function translateToFrench(text: string): Promise<string | null> {
  if (!text?.trim()) return null;
  const snippet = text.slice(0, TRANSLATE_MAX);
  const key = `pharmavig_translate_${simpleHash(snippet)}`;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts < TRANSLATE_TTL_MS) return data as string;
      }
    } catch {}
  }
  try {
    const res = await fetchWithTimeout(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(snippet)}&langpair=en|fr`,
      6000
    );
    if (!res) return null;
    const json = await res.json();
    const translated = json?.responseData?.translatedText;
    if (translated && json?.responseStatus === 200 && !/MYMEMORY WARNING/i.test(translated)) {
      if (typeof window !== "undefined") {
        try { localStorage.setItem(key, JSON.stringify({ data: translated, ts: Date.now() })); } catch {}
      }
      return translated as string;
    }
    return null;
  } catch {
    return null;
  }
}

// ---- ANSM / open.medicaments.fr (RCP français) ----
export type AnsmDrug = {
  denomination?: string;
  forme?: string;
  titulaires?: string[];
  substances?: string[];
};

export async function fetchAnsm(name: string): Promise<AnsmDrug | null> {
  const cached = readCache<AnsmDrug | null>(name, "ansm");
  if (cached !== null) return cached;
  try {
    const res = await fetchWithTimeout(`https://open.medicaments.fr/api/v1/medicaments?query=${encodeURIComponent(name)}&limit=5`);
    if (!res) {
      writeCache(name, "ansm", null);
      return null;
    }
    const json = await res.json();
    const r = Array.isArray(json) ? json[0] : json?.results?.[0];
    if (!r) {
      writeCache(name, "ansm", null);
      return null;
    }
    const drug: AnsmDrug = {
      denomination: r.denomination,
      forme: r.forme_pharmaceutique,
      titulaires: r.titulaires,
      substances: r.substances_actives?.map((s: { denomination?: string }) => s.denomination).filter(Boolean),
    };
    writeCache(name, "ansm", drug);
    return drug;
  } catch {
    return null;
  }
}

// ---- RxNorm ----
export async function fetchRxnormRelated(name: string): Promise<string[]> {
  const cached = readCache<string[]>(name, "rxnorm");
  if (cached !== null) return cached;
  try {
    const res1 = await fetchWithTimeout(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name)}`);
    if (!res1) return [];
    const j1 = await res1.json();
    const rxcui = j1?.idGroup?.rxnormId?.[0];
    if (!rxcui) {
      writeCache(name, "rxnorm", []);
      return [];
    }
    const res2 = await fetchWithTimeout(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/allrelated.json`);
    if (!res2) return [];
    const j2 = await res2.json();
    const groups = j2?.allRelatedGroup?.conceptGroup || [];
    const names = new Set<string>();
    for (const g of groups) {
      if (g.tty === "BN" || g.tty === "SBD") {
        for (const c of g.conceptProperties || []) names.add(c.name);
      }
    }
    const out = [...names].slice(0, 10);
    writeCache(name, "rxnorm", out);
    return out;
  } catch {
    return [];
  }
}

// ---- Parsing texte RCP / FDA ----

export type ParsedEffect = { text: string; severe: boolean; frequency?: "tres_frequent" | "frequent" | "peu_frequent" | "rare" };

const SEVERE_TERMS = [
  "death", "fatal", "severe", "life-threatening", "hospitaliz", "stevens-johnson",
  "anaphyl", "agranulocyt", "myocardit", "décès", "mortel", "grave", "potentiellement mortel",
];

const MAJOR_INTERACTION_TERMS = [
  "avoid", "contraindicated", "do not use", "fatal", "severe", "life-threatening",
  "éviter", "contre-indiqué", "ne pas utiliser", "mortel",
];

export function isSevere(text: string): boolean {
  const lower = text.toLowerCase();
  return SEVERE_TERMS.some((t) => lower.includes(t));
}

export function isMajorInteraction(text: string): boolean {
  const lower = text.toLowerCase();
  return MAJOR_INTERACTION_TERMS.some((t) => lower.includes(t));
}

export function splitIntoItems(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\n+|;\s*|(?:^|\s)\d+\.\s+/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 3 && s.length < 600);
}

export function detectFrequency(text: string): ParsedEffect["frequency"] {
  const lower = text.toLowerCase();
  if (lower.includes(">10%") || lower.includes("very common") || lower.includes("très fréquent")) return "tres_frequent";
  if (lower.includes("1-10%") || lower.includes("common") || lower.includes("fréquent")) return "frequent";
  if (lower.includes("uncommon") || lower.includes("peu fréquent") || lower.includes("0.1")) return "peu_frequent";
  if (lower.includes("rare")) return "rare";
  return undefined;
}

export function parseEffects(text?: string): ParsedEffect[] {
  if (!text) return [];
  return splitIntoItems(text).map((t) => ({ text: t, severe: isSevere(t), frequency: detectFrequency(t) }));
}

// ---- Mini-dictionnaire MedDRA FR (termes d'effets indésirables courants) ----
// Couvre les termes les plus fréquemment rencontrés dans les RCP FDA pour les
// classes de molécules les plus déclarées sur PharmaVig (oncologie, diabète,
// antibiotiques, AINS, cardiovasculaire...). Liste non exhaustive — les termes
// absents sont affichés avec leur libellé original.
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

// Extrait des noms d'effets individuels (et non des paragraphes entiers) à partir
// du texte libre `adverse_reactions`. Heuristique : on découpe d'abord en phrases/
// segments, puis on explose les énumérations (3+ termes séparés par des virgules)
// en termes individuels — c'est la forme la plus fréquente dans les RCP FDA.
export function extractEffectNames(text?: string): EffectName[] {
  if (!text) return [];
  const segments = splitIntoItems(text);
  const names: string[] = [];
  for (const seg of segments) {
    const commaParts = seg.split(/,|\bet\b|\band\b/i).map((s) => s.trim()).filter(Boolean);
    if (commaParts.length >= 3 && commaParts.every((p) => p.length < 60)) {
      names.push(...commaParts);
    } else if (seg.length < 80) {
      names.push(seg);
    }
  }
  const seen = new Set<string>();
  const out: EffectName[] = [];
  for (const raw of names) {
    const cleaned = raw.replace(/^[-•\d.\s]+/, "").replace(/[.;:]+$/g, "").trim();
    if (cleaned.length < 3 || cleaned.length > 70) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ original: cleaned, fr: lookupMeddraFr(cleaned) });
    if (out.length >= 30) break;
  }
  return out;
}

export function truncate(text: string | undefined, max = 1000): { short: string; isLong: boolean; full: string } {
  if (!text) return { short: "", isLong: false, full: "" };
  if (text.length <= max) return { short: text, isLong: false, full: text };
  return { short: text.slice(0, max) + "…", isLong: true, full: text };
}

export type PregnancyRisk = "safe" | "caution" | "contraindicated" | "unknown";

export function pregnancyRisk(text?: string): PregnancyRisk {
  if (!text) return "unknown";
  const lower = text.toLowerCase();
  if (lower.includes("contraindicated") || lower.includes("contre-indiqué") || lower.includes("category x") || lower.includes("do not use"))
    return "contraindicated";
  if (lower.includes("caution") || lower.includes("risk cannot be ruled out") || lower.includes("category c") || lower.includes("category d") || lower.includes("précaution"))
    return "caution";
  if (lower.includes("no evidence") || lower.includes("category a") || lower.includes("category b") || lower.includes("safe"))
    return "safe";
  return "unknown";
}

export const PREGNANCY_STYLES: Record<PregnancyRisk, { label: string; color: string; dot: string }> = {
  safe: { label: "Pas de risque connu identifié", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  caution: { label: "Précaution recommandée", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  contraindicated: { label: "Contre-indiqué", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  unknown: { label: "Donnée non disponible", color: "bg-gray-50 text-gray-500 border-gray-200", dot: "bg-gray-400" },
};

export const QUICK_ACCESS_MOLECULES = [
  "Pembrolizumab", "Nivolumab", "Metformine", "Amoxicilline",
  "Ibuprofène", "Amlodipine", "Atorvastatine", "Méthotrexate",
];
