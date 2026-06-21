import type { ClinicalMonograph } from "@/lib/referentiel/types";

export const TABS = [
  { id: "referentiel", label: "Référentiel Maroc" },
  { id: "clinique", label: "Synthèse clinique" },
  { id: "terrain", label: "Données terrain MAI DAWA" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

// ── Badge de statut disponibilité (standardisé) ──────────────────────────────

export const AVAIL_LABELS: Record<string, { label: string; color: string }> = {
  availability_unconfirmed:               { label: "Disponibilité à confirmer", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  availability_confirmed_by_pharmacist:   { label: "Disponible (pharmacien)", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  availability_confirmed_by_lab:          { label: "Disponible (laboratoire)", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  availability_confirmed_by_grossist:     { label: "Disponible (grossiste)", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  withdrawn_or_suspected_unavailable:     { label: "Indisponible (suspecté)", color: "bg-red-50 text-red-700 border border-red-200" },
  needs_review:                           { label: "Disponibilité inconnue", color: "bg-gray-50 text-gray-500 border border-gray-200" },
};

export const VALID_LABELS: Record<string, { label: string; color: string }> = {
  needs_review:    { label: "À vérifier", color: "bg-gray-50 text-gray-500 border border-gray-200" },
  auto_imported:   { label: "À vérifier", color: "bg-gray-50 text-gray-500 border border-gray-200" },
  validated:       { label: "Validé", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  princeps: "Princeps", generic: "Générique", biosimilar: "Biosimilaire",
  hybrid: "Hybride", unknown: "Type inconnu",
};

export const REJECTION_LABELS: Record<string, string> = {
  composition_mismatch: "Composition incompatible",
  route_mismatch: "Voie d'administration incompatible",
  form_mismatch: "Forme pharmaceutique incompatible",
};

// ── Sections de la synthèse clinique (structure fixe et didactique) ──────────
// tone : neutre (info pratique) · orange (précaution) · red (critique) · info (gris/bleu)

export type SectionTone = "neutral" | "orange" | "red" | "info";

export type ClinicalSectionDef = {
  /** champ source de la monographie (absent = section structurelle sans donnée encore). */
  field?: keyof ClinicalMonograph;
  title: string;
  tone: SectionTone;
};

export const CLINICAL_SECTIONS: ClinicalSectionDef[] = [
  { title: "À retenir en pratique", tone: "info" },                                   // pas encore de champ source
  { field: "indications", title: "Indications", tone: "neutral" },
  { field: "posology_adult", title: "Posologie adulte", tone: "neutral" },
  { title: "Posologie enfant", tone: "neutral" },                                     // champ non disponible pour l'instant
  { field: "renal_adjustment", title: "Adaptation rénale", tone: "info" },
  { field: "hepatic_adjustment", title: "Adaptation hépatique", tone: "info" },
  { field: "contraindications", title: "Contre-indications", tone: "red" },
  { field: "precautions", title: "Précautions d'emploi", tone: "orange" },
  { field: "adverse_effects_common", title: "Effets indésirables fréquents", tone: "neutral" },
  { field: "adverse_effects_serious", title: "Effets indésirables graves", tone: "red" },
  { field: "key_interactions", title: "Interactions importantes", tone: "orange" },
  { field: "pregnancy_lactation", title: "Grossesse / allaitement", tone: "orange" },
  { field: "monitoring", title: "Surveillance recommandée", tone: "orange" },
  { field: "patient_advice", title: "Conseils patients", tone: "neutral" },
];
