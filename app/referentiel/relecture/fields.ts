// Champs cliniques relus + libellés (partagés hub + cockpit de relecture).
import type { ClinicalMonograph } from "@/lib/referentiel/types";

export const REVIEW_FIELDS: { key: keyof ClinicalMonograph; label: string }[] = [
  { key: "indications", label: "Indications" },
  { key: "posology_adult", label: "Posologie adulte" },
  { key: "renal_adjustment", label: "Adaptation rénale" },
  { key: "hepatic_adjustment", label: "Adaptation hépatique" },
  { key: "contraindications", label: "Contre-indications" },
  { key: "precautions", label: "Précautions d'emploi" },
  { key: "adverse_effects_common", label: "Effets indésirables fréquents" },
  { key: "adverse_effects_serious", label: "Effets indésirables graves" },
  { key: "key_interactions", label: "Interactions importantes" },
  { key: "pregnancy_lactation", label: "Grossesse / allaitement" },
  { key: "monitoring", label: "Surveillance" },
  { key: "patient_advice", label: "Conseils patients" },
];

export const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  REVIEW_FIELDS.map((f) => [f.key as string, f.label])
);
