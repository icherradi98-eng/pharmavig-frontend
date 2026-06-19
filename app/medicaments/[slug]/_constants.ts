export const TABS = [
  { id: "referentiel", label: "Référentiel Maroc" },
  { id: "clinique", label: "Enrichissement clinique" },
  { id: "terrain", label: "Données terrain MAI DAWA" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

// ── Badge de statut disponibilité ──────────────────────────────────────────────

export const AVAIL_LABELS: Record<string, { label: string; color: string }> = {
  availability_unconfirmed:               { label: "Disponibilité à confirmer", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  availability_confirmed_by_pharmacist:   { label: "Confirmé (pharmacien)", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  availability_confirmed_by_lab:          { label: "Confirmé (laboratoire)", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  availability_confirmed_by_grossist:     { label: "Confirmé (grossiste)", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  withdrawn_or_suspected_unavailable:     { label: "Retiré ou indisponible suspecté", color: "bg-red-50 text-red-700 border border-red-200" },
  needs_review:                           { label: "À vérifier", color: "bg-gray-50 text-gray-500 border border-gray-200" },
};

export const VALID_LABELS: Record<string, { label: string; color: string }> = {
  needs_review:    { label: "Non vérifié", color: "bg-gray-50 text-gray-400 border border-gray-200" },
  auto_imported:   { label: "Importé — non revu", color: "bg-amber-50 text-amber-600 border border-amber-100" },
  validated:       { label: "Validé manuellement", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
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
