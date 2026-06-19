// ─────────────────────────────────────────────────────────────────────────────
// Couche service — Référentiel clinique MAI DAWA (monographies par DCI).
//
// Sépare la donnée marché (CNOPS, dans index.ts) de la donnée clinique
// (monographies + interactions, ici). Toute la logique de recherche / résolution
// DCI / alternatives / interactions / statut éditorial vit ici, jamais dans les
// composants — pour migrer vers une API Postgres sans réécrire l'UI.
// ─────────────────────────────────────────────────────────────────────────────

import clinicalRaw from "./monographs.ma.json";
import pilotRaw from "./pilot-priority-substances.json";
import type {
  ClinicalDataset, ClinicalMonograph, DrugInteraction, EditorialStatus,
  MedicinalProduct, PilotPriorityDataset, PilotPrioritySubstance,
} from "./types";
import { referentielData } from "./index";

const clinical = clinicalRaw as unknown as ClinicalDataset;
const pilot = pilotRaw as unknown as PilotPriorityDataset;

const norm = (s: string) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

// ── Index en mémoire ─────────────────────────────────────────────────────────

const monoBySubstanceId = new Map(clinical.monographs.map((m) => [m.substance_id, m]));
const monoByNormalizedDci = new Map(clinical.monographs.map((m) => [norm(m.dci), m]));

// substance_id → liste de product_id (depuis la couche marché)
const productsBySubstanceId = new Map<string, string[]>();
for (const link of referentielData.product_substances) {
  if (!productsBySubstanceId.has(link.substance_id)) productsBySubstanceId.set(link.substance_id, []);
  productsBySubstanceId.get(link.substance_id)!.push(link.product_id);
}
const productById = new Map(referentielData.medicinal_products.map((p) => [p.id, p]));
const substanceById = new Map(referentielData.substances.map((s) => [s.id, s]));
const substanceByNormalizedDci = new Map(
  referentielData.substances.map((s) => [norm(s.dci_fr), s])
);

// ── Statut éditorial : métadonnées d'affichage ───────────────────────────────

export type EditorialStatusMeta = {
  label: string;
  /** true si la fiche peut être présentée comme référence validée. */
  isValidated: boolean;
  tone: "neutral" | "info" | "warning" | "success";
};

const STATUS_META: Record<EditorialStatus, EditorialStatusMeta> = {
  draft:               { label: "Brouillon",            isValidated: false, tone: "neutral" },
  AI_generated:        { label: "Généré par IA",        isValidated: false, tone: "warning" },
  physician_reviewed:  { label: "Revu par un médecin",  isValidated: false, tone: "info" },
  pharmacist_reviewed: { label: "Revu par un pharmacien", isValidated: false, tone: "info" },
  published:           { label: "Validé · publié",      isValidated: true,  tone: "success" },
};

export function editorialStatusMeta(status: EditorialStatus): EditorialStatusMeta {
  return STATUS_META[status] ?? STATUS_META.draft;
}

// ── Résolution monographie ───────────────────────────────────────────────────

export function getMonographBySubstanceId(substanceId: string): ClinicalMonograph | null {
  return monoBySubstanceId.get(substanceId) ?? null;
}

/** Résout une monographie depuis un nom de DCI (accent-insensible). */
export function getMonographByDci(dci: string): ClinicalMonograph | null {
  const direct = monoByNormalizedDci.get(norm(dci));
  if (direct) return direct;
  // Fallback : retrouver la substance puis sa monographie
  const sub = substanceByNormalizedDci.get(norm(dci));
  return sub ? getMonographBySubstanceId(sub.id) : null;
}

// ── Alternatives au Maroc (spécialités partageant la même DCI) ────────────────

export type AlternativeProduct = {
  product: MedicinalProduct;
  dci: string;
};

/**
 * Liste les autres spécialités marocaines ayant la même substance active,
 * en excluant le produit courant. Triées princeps d'abord, puis alphabétique.
 */
export function listAlternativesByProductId(productId: string): AlternativeProduct[] {
  const links = referentielData.product_substances.filter((l) => l.product_id === productId);
  const substanceIds = links.map((l) => l.substance_id);
  if (substanceIds.length === 0) return [];

  const seen = new Set<string>();
  const out: AlternativeProduct[] = [];
  for (const subId of substanceIds) {
    const dci = substanceById.get(subId)?.dci_fr ?? "—";
    for (const pid of productsBySubstanceId.get(subId) ?? []) {
      if (pid === productId || seen.has(pid)) continue;
      const product = productById.get(pid);
      if (!product) continue;
      seen.add(pid);
      out.push({ product, dci });
    }
  }
  const typeRank: Record<string, number> = { princeps: 0, generic: 1, biosimilar: 2, hybrid: 3, unknown: 4 };
  return out.sort((a, b) => {
    const r = (typeRank[a.product.product_type] ?? 9) - (typeRank[b.product.product_type] ?? 9);
    return r !== 0 ? r : a.product.brand_name.localeCompare(b.product.brand_name);
  });
}

// ── Interactions ─────────────────────────────────────────────────────────────

export function getInteractionsForSubstanceId(substanceId: string): DrugInteraction[] {
  return clinical.interactions.filter(
    (i) => i.substance_a_id === substanceId || i.substance_b_id === substanceId
  );
}

// ── Recherche / navigation du module Référentiel ─────────────────────────────

export type ReferentielEntry = {
  product_id: string;
  brand_name: string;
  dci: string;
  substance_id: string | null;
  therapeutic_class: string | null;
  product_type: MedicinalProduct["product_type"];
  availability_status: MedicinalProduct["availability_status"];
  has_monograph: boolean;
  monograph_status: EditorialStatus | null;
};

function buildEntry(p: MedicinalProduct): ReferentielEntry {
  const links = referentielData.product_substances.filter((l) => l.product_id === p.id);
  const firstSub = links[0] ? substanceById.get(links[0].substance_id) : undefined;
  const dci = links.map((l) => substanceById.get(l.substance_id)?.dci_fr).filter(Boolean).join(" / ") || "—";
  const mono = firstSub ? getMonographBySubstanceId(firstSub.id) : null;
  return {
    product_id: p.id,
    brand_name: p.brand_name,
    dci,
    substance_id: firstSub?.id ?? null,
    therapeutic_class: mono?.therapeutic_class ?? firstSub?.therapeutic_class ?? null,
    product_type: p.product_type,
    availability_status: p.availability_status,
    has_monograph: !!mono,
    monograph_status: mono?.status ?? null,
  };
}

export type ReferentielSearchOptions = {
  query?: string;
  therapeuticClass?: string | null;
  onlyWithMonograph?: boolean;
  limit?: number;
};

/** Recherche unifiée marque OU DCI + filtres (classe, présence de monographie). */
export function searchReferentiel(opts: ReferentielSearchOptions = {}): ReferentielEntry[] {
  const { query = "", therapeuticClass = null, onlyWithMonograph = false, limit = 60 } = opts;
  const q = norm(query);
  const out: ReferentielEntry[] = [];

  for (const p of referentielData.medicinal_products) {
    const entry = buildEntry(p);
    if (q.length >= 2) {
      const hay = norm(entry.brand_name + " " + entry.dci);
      if (!hay.includes(q)) continue;
    }
    if (therapeuticClass && entry.therapeutic_class !== therapeuticClass) continue;
    if (onlyWithMonograph && !entry.has_monograph) continue;
    out.push(entry);
    if (out.length >= limit) break;
  }
  return out;
}

/** Classes thérapeutiques connues (depuis les monographies — non vide uniquement). */
export function listTherapeuticClasses(): string[] {
  const set = new Set<string>();
  for (const m of clinical.monographs) {
    if (m.therapeutic_class) set.add(m.therapeutic_class);
  }
  for (const s of referentielData.substances) {
    if (s.therapeutic_class) set.add(s.therapeutic_class);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

// ── Priorisation pilote ──────────────────────────────────────────────────────

const pilotBySubstanceId = new Map(pilot.substances.map((p) => [p.substance_id, p]));

/** Toutes les DCI prioritaires du pilote (triées high → medium → low). */
export function getPilotPrioritySubstances(): PilotPrioritySubstance[] {
  const rank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return [...pilot.substances].sort(
    (a, b) => (rank[a.priority_level] ?? 9) - (rank[b.priority_level] ?? 9)
  );
}

/** DCI marquées à haut risque. */
export function getHighRiskSubstances(): PilotPrioritySubstance[] {
  return pilot.substances.filter((p) => p.is_high_risk_drug);
}

/** Regroupe les DCI prioritaires par aire thérapeutique. */
export function getSubstancesByTherapeuticArea(): Record<string, PilotPrioritySubstance[]> {
  const out: Record<string, PilotPrioritySubstance[]> = {};
  for (const p of pilot.substances) {
    (out[p.therapeutic_area] ??= []).push(p);
  }
  return out;
}

/** Priorisation d'une substance donnée (ou null). */
export function getPilotPriority(substanceId: string): PilotPrioritySubstance | null {
  return pilotBySubstanceId.get(substanceId) ?? null;
}

/** DCI prioritaires n'ayant pas encore de monographie (à enrichir). */
export function getSubstancesToEnrich(): PilotPrioritySubstance[] {
  return getPilotPrioritySubstances().filter((p) => !monoBySubstanceId.has(p.substance_id));
}

// ── Tableau de bord d'avancement ─────────────────────────────────────────────

const CLINICAL_FIELDS: (keyof ClinicalMonograph)[] = [
  "indications", "posology_adult", "renal_adjustment", "hepatic_adjustment",
  "contraindications", "precautions", "adverse_effects_common", "adverse_effects_serious",
  "key_interactions", "pregnancy_lactation", "monitoring", "patient_advice",
];

function isMonographComplete(m: ClinicalMonograph): boolean {
  return CLINICAL_FIELDS.every((f) => {
    const v = m[f];
    return typeof v === "string" && v.trim().length > 0;
  });
}

export type ReferentielProgress = {
  monographs: { total: number; complete: number };
  byStatus: { status: EditorialStatus; label: string; count: number }[];
  pilot: { total: number; covered: number };
  byPriority: { level: "high" | "medium" | "low"; total: number; covered: number }[];
  byArea: { area: string; total: number; covered: number }[];
};

/** Agrège l'état d'avancement du référentiel clinique (pour le tableau de bord). */
export function getReferentielProgress(): ReferentielProgress {
  const monoSubIds = new Set(clinical.monographs.map((m) => m.substance_id));

  const ALL_STATUSES: EditorialStatus[] = [
    "draft", "AI_generated", "physician_reviewed", "pharmacist_reviewed", "published",
  ];
  const byStatus = ALL_STATUSES.map((status) => ({
    status,
    label: editorialStatusMeta(status).label,
    count: clinical.monographs.filter((m) => m.status === status).length,
  }));

  const levels: ("high" | "medium" | "low")[] = ["high", "medium", "low"];
  const byPriority = levels.map((level) => {
    const entries = pilot.substances.filter((p) => p.priority_level === level);
    return {
      level,
      total: entries.length,
      covered: entries.filter((p) => monoSubIds.has(p.substance_id)).length,
    };
  });

  const areaMap = new Map<string, { total: number; covered: number }>();
  for (const p of pilot.substances) {
    const a = areaMap.get(p.therapeutic_area) ?? { total: 0, covered: 0 };
    a.total += 1;
    if (monoSubIds.has(p.substance_id)) a.covered += 1;
    areaMap.set(p.therapeutic_area, a);
  }
  const byArea = [...areaMap.entries()]
    .map(([area, v]) => ({ area, ...v }))
    .sort((a, b) => a.area.localeCompare(b.area));

  return {
    monographs: {
      total: clinical.monographs.length,
      complete: clinical.monographs.filter(isMonographComplete).length,
    },
    byStatus,
    pilot: {
      total: pilot.substances.length,
      covered: pilot.substances.filter((p) => monoSubIds.has(p.substance_id)).length,
    },
    byPriority,
    byArea,
  };
}

// ── Stats module ─────────────────────────────────────────────────────────────

export const clinicalStats = {
  monographs: clinical.monographs.length,
  published: clinical.monographs.filter((m) => m.status === "published").length,
  interactions: clinical.interactions.length,
  pilotPriority: pilot.substances.length,
  highRisk: pilot.substances.filter((p) => p.is_high_risk_drug).length,
  version: clinical.version,
};

export { clinical as clinicalData, pilot as pilotPriorityData };
