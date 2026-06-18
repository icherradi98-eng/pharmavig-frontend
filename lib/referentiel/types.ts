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

/** Fraîcheur de la source : "fresh" < 2 ans, "stale" ≥ 2 ans, "unknown" si date absente. */
export type SourceFreshness = "fresh" | "stale" | "unknown";

export interface Source {
  id: string;
  source_name: string;
  source_type: SourceType;
  country: string;                 // "MA", "FR", "EU", "INT"…
  license: string;                 // licence / conditions d'usage
  url_or_file_reference: string;
  update_date: string | null;      // date de la donnée source
  source_year?: number | null;     // année des données (peut différer de update_date si fichier ancien)
  source_freshness?: SourceFreshness; // calculé à l'import
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
  // IMPORTANT : atc_code = null par défaut. Ne pas importer de dataset ATC complet
  // avant vérification de la licence commerciale de l'OMS (usage commercial non libre).
  // Saisie manuelle unitaire autorisée. Enrichissement en Phase 2 après validation juridique.
  atc_code: string | null;
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

// ═════════════════════════════════════════════════════════════════════════════
// COUCHE CLINIQUE — Monographies par DCI (future table `clinical_monographs`)
//
// Séparée des données marché (CNOPS) : une monographie = contenu d'aide au bon
// usage rattaché à UNE substance active (DCI). Plusieurs spécialités marocaines
// pointant vers la même DCI partagent la même monographie.
//
// Migration-ready : chaque champ correspond 1:1 à une future colonne Postgres.
// Aucun contenu n'est affiché comme « validé » tant que status !== "published".
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Circuit éditorial d'une monographie clinique.
 * draft → AI_generated → physician_reviewed → pharmacist_reviewed → published
 * Seul "published" peut être présenté comme référence validée.
 */
export type EditorialStatus =
  | "draft"
  | "AI_generated"
  | "physician_reviewed"
  | "pharmacist_reviewed"
  | "published";

/** Une entrée du journal de versions d'une monographie. */
export interface MonographChange {
  version: string;
  date: string;                    // ISO
  author: string | null;
  summary: string;
}

/**
 * Monographie clinique d'une DCI (future table `clinical_monographs`).
 * Tous les champs cliniques sont nullable : remplissage progressif.
 */
export interface ClinicalMonograph {
  id: string;
  substance_id: string;            // FK → substances.id (1 monographie par DCI)
  dci: string;                     // dénormalisé pour affichage/recherche
  therapeutic_class: string | null;
  atc_code: string | null;

  // ── Contenu clinique (nullable, construit progressivement) ──
  indications: string | null;
  posology_adult: string | null;
  renal_adjustment: string | null;
  hepatic_adjustment: string | null;
  contraindications: string | null;
  precautions: string | null;
  adverse_effects_common: string | null;
  adverse_effects_serious: string | null;
  key_interactions: string | null;
  pregnancy_lactation: string | null;
  monitoring: string | null;
  patient_advice: string | null;

  // ── Qualité / circuit éditorial ──
  status: EditorialStatus;
  /** true = donnée de démonstration, JAMAIS validée médicalement. */
  is_demo: boolean;
  version: string;
  source_name: string | null;
  source_url: string | null;
  source_date: string | null;      // ISO
  reviewed_by: string | null;
  reviewed_at: string | null;      // ISO
  last_verified_at: string | null; // ISO
  change_log: MonographChange[];

  created_at: string;
  updated_at: string;
}

/**
 * Règle d'interaction entre deux DCI (future table `drug_interactions`).
 * Distincte de `InteractionRule` (héritage enrichissement étranger) :
 * celle-ci porte le circuit éditorial interne MAIA DAWA.
 */
export interface DrugInteraction {
  id: string;
  substance_a_id: string;          // FK → substances.id
  substance_b_id: string;          // FK → substances.id
  substance_a_label: string;       // dénormalisé
  substance_b_label: string;       // dénormalisé
  severity: "contraindicated" | "major" | "moderate" | "minor" | "unknown";
  mechanism: string | null;
  recommendation: string | null;
  status: EditorialStatus;
  is_demo: boolean;
  source_name: string | null;
  source_url: string | null;
  version: string;
  created_at: string;
  updated_at: string;
}

/** Forme du fichier JSON clinique versionné (futures tables cliniques). */
export interface ClinicalDataset {
  version: string;
  generated_at: string;
  monographs: ClinicalMonograph[];
  interactions: DrugInteraction[];
}

// ── Priorisation pilote (classification SANS contenu clinique détaillé) ───────

export type PriorityLevel = "high" | "medium" | "low";

/**
 * Entrée de priorisation d'une DCI pour le pilote médecin.
 * Couche légère : classification + priorité, PAS de monographie complète.
 * Migration-ready : future table `pilot_priority_substances` (ou colonnes
 * priority_* sur substances).
 */
export interface PilotPrioritySubstance {
  substance_id: string;          // FK → substances.id
  dci_fr: string;
  priority_level: PriorityLevel;
  therapeutic_area: string;
  therapeutic_class: string;
  is_high_risk_drug: boolean;
  why_priority: string;
  suggested_monograph_status: EditorialStatus;  // "draft" à ce stade
  needs_pharmacist_review: boolean;
  needs_physician_review: boolean;
}

export interface PilotPriorityDataset {
  version: string;
  generated_at: string;
  note?: string;
  substances: PilotPrioritySubstance[];
}
