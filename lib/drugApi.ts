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

export async function fetchFdaLabel(name: string): Promise<FdaLabel | null> {
  const cached = readCache<FdaLabel | null>(name, "fda_label");
  if (cached !== null) return cached;
  try {
    const res = await fetchWithTimeout(
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(name)}"&limit=1`
    );
    if (!res) {
      writeCache(name, "fda_label", null);
      return null;
    }
    const json = await res.json();
    const r = json?.results?.[0];
    if (!r) {
      writeCache(name, "fda_label", null);
      return null;
    }
    const label: FdaLabel = {
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
    writeCache(name, "fda_label", label);
    return label;
  } catch {
    return null;
  }
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
