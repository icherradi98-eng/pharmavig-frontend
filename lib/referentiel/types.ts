// ─────────────────────────────────────────────────────────────────────────────
// Référentiel médicament MAIA DAWA — modèle de données Morocco-first
//
// Principe : source Maroc d'abord (référencement/prix/remboursement) ; enrichissement
// clinique secondaire via sources publiques étrangères (BDPM/ANSM/EMA), JAMAIS utilisées
// pour affirmer une disponibilité au Maroc. Chaque donnée sensible porte source + date +
// statut de validation. Aucune donnée inventée : champ absent → validation "needs_review".
//
// Ce modèle TypeScript mappe 1:1 vers les futures tables Postgres (mêmes noms de champs).
// ─────────────────────────────────────────────────────────────────────────────

// ── Énumérations de statut ───────────────────────────────────────────────────

/** Statut de validation d'une donnée. */
export type ValidationStatus =
  | "needs_review"            // par défaut : non vérifié humainement
  | "auto_imported"           // importé d'une source, non revu
  | "validated";              // validé manuellement (pharmacien/médecin/équipe)

/** Référencement dans une source marocaine (≠ disponibilité). */
export type MoroccoReferenceStatus =
  | "referenced_morocco_source"  // présent dans une source MA (CNOPS/data.gov.ma…)
  | "not_referenced"
  | "needs_review";

/** Disponibilité réelle au Maroc — jamais déduite d'une source étrangère. */
export type AvailabilityStatus =
  | "availability_unconfirmed"               // par défaut
  | "availability_confirmed_by_pharmacist"
  | "availability_confirmed_by_lab"
  | "availability_confirmed_by_grossist"
  | "withdrawn_or_suspected_unavailable"
  | "needs_review";

export type RegulatoryStatus = "referenced" | "unknown" | "withdrawn" | "needs_review";

export type ProductType = "princeps" | "generic" | "biosimilar" | "hybrid" | "unknown";

export type EquivalenceConfidence = "high" | "medium" | "low" | "unknown";

export type SubstitutionStatus = "allowed" | "not_allowed" | "unknown" | "needs_review";

export type SourceType =
  | "official_open_data"      // CNOPS, data.gov.ma…
  | "public_foreign_reference" // BDPM, ANSM, EMA, HAS…
  | "manual_validation"
  | "partner"
  | "internal";

export type ReimbursementStatus = "reimbursed" | "not_reimbursed" | "unknown" | "needs_review";

// ── Registre des sources ─────────────────────────────────────────────────────

export interface Source {
  id: string;
  source_name: string;
  source_type: SourceType;
  country: string;                 // "MA", "FR", "EU", "INT"…
  license: string;                 // licence / conditions d'usage
  url_or_file_reference: string;
  update_date: string | null;      // date de la donnée source
  imported_at: string | null;
  notes?: string;
}

// ── 1. Substances (DCI) ──────────────────────────────────────────────────────

export interface Substance {
  id: string;
  dci_fr: string;
  dci_en: string | null;
  normalized_name: string;         // sans accents, minuscule (clé de recherche)
  synonyms: string[];
  atc_code: string | null;         // OMS ATC (public) — null si incertain
  therapeutic_class: string | null;
  source_id: string;
  validation_status: ValidationStatus;
  created_at: string;
  updated_at: string;
}

// ── 2. Produits (spécialités) ────────────────────────────────────────────────

export interface MedicinalProduct {
  id: string;
  brand_name: string;
  normalized_brand_name: string;
  country: string;                 // "MA"
  lab_name: string | null;
  product_type: ProductType;
  reference_product_id: string | null;   // lien vers le princeps si identifié
  generic_group_id: string | null;
  equivalence_confidence: EquivalenceConfidence;
  equivalence_source_id: string | null;
  substitution_status: SubstitutionStatus;
  regulatory_status: RegulatoryStatus;
  morocco_reference_status: MoroccoReferenceStatus;
  availability_status: AvailabilityStatus;
  source_primary_id: string;
  source_primary_name: string;
  source_primary_date: string | null;
  last_verified_at: string | null;
  validation_status: ValidationStatus;
  created_at: string;
  updated_at: string;
}

// ── 3. Présentations (conditionnement/dosage/prix) ───────────────────────────

export interface Presentation {
  id: string;
  medicinal_product_id: string;
  strength: string | null;         // ex. "500"
  unit: string | null;             // ex. "mg"
  pharmaceutical_form: string | null;
  route: string | null;
  packaging: string | null;        // ex. "boîte de 16"
  ppv: number | null;              // prix public de vente (MAD)
  hospital_price: number | null;
  reimbursement_base: number | null;
  reimbursement_status: ReimbursementStatus;
  prescription_conditions: string | null;
  availability_status: AvailabilityStatus;
  last_checked_at: string | null;
  source_id: string;
  validation_status: ValidationStatus;
  created_at: string;
  updated_at: string;
}

// ── 4. Liaison produit ↔ substances ──────────────────────────────────────────

export interface ProductSubstance {
  product_id: string;
  substance_id: string;
  dosage: string | null;
  unit: string | null;
  role: "active_substance" | "excipient" | "unknown";
  source_id: string;
  validation_status: ValidationStatus;
}

// ── Enrichissement clinique (source étrangère séparée de la dispo Maroc) ──────

export interface ClinicalEnrichment {
  id: string;
  substance_id: string | null;
  product_id: string | null;
  indication_summary: string | null;
  contraindications: string | null;
  warnings: string | null;
  adverse_effects: string | null;
  pregnancy_lactation: string | null;
  renal_adjustment: string | null;
  hepatic_adjustment: string | null;
  monitoring: string | null;
  source_id: string;
  source_country: string;          // "FR", "EU"…
  /** TOUJOURS false si source étrangère : n'atteste jamais la dispo au Maroc. */
  availability_relevance_for_morocco: boolean;
  validation_status: ValidationStatus;
  validated_by: string | null;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InteractionRule {
  id: string;
  substance_a_id: string;
  substance_b_id: string;
  severity: "contraindicated" | "major" | "moderate" | "minor" | "unknown";
  mechanism: string | null;
  recommendation: string | null;
  source_id: string;
  validation_status: ValidationStatus;
  created_at: string;
  updated_at: string;
}

export interface AdverseEventMapping {
  id: string;
  substance_id: string | null;
  product_id: string | null;
  adverse_event_label: string;
  meddra_code: string | null;
  frequency: string | null;
  seriousness_flag: boolean;
  source_id: string;
  validation_status: ValidationStatus;
  created_at: string;
  updated_at: string;
}

export interface GenericGroup {
  id: string;
  group_name: string;
  substance_id: string | null;
  composition_signature: string | null; // dci|dosage|forme|voie (clé de regroupement)
  strength: string | null;
  pharmaceutical_form: string | null;
  route: string | null;
  reference_product_id: string | null;
  source_id: string;
  validation_status: ValidationStatus;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: "create" | "update" | "delete" | "import" | "validate";
  previous_value: string | null;
  new_value: string | null;
  source_id: string | null;
  user_id: string | null;
  created_at: string;
}

// ── Forme du fichier seed/JSON versionné ─────────────────────────────────────

export interface ReferentielDataset {
  version: string;
  generated_at: string;
  sources: Source[];
  substances: Substance[];
  medicinal_products: MedicinalProduct[];
  presentations: Presentation[];
  product_substances: ProductSubstance[];
}
