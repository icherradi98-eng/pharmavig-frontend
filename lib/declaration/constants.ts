import type { FormData } from "./types";

export const DRAFT_KEY = "pharmavig_medecin_draft";
export const PREFILL_KEY = "pharmavig_prefill_declaration";

export const STADES_RENALE = [
  "Légère (DFG 60–89)",
  "Modérée (DFG 30–59)",
  "Sévère (DFG 15–29)",
  "Terminale / Dialyse (DFG < 15)",
];

export const STADES_HEPATIQUE = [
  "Légère (Child-Pugh A)",
  "Modérée (Child-Pugh B)",
  "Sévère (Child-Pugh C)",
];

export const INITIAL: FormData = {
  typeDeclaration: "spontanee",
  declarantNom: "", declarantPrenom: "", declarantSpecialite: "", declarantSpecialiteAutre: "",
  declarantNumOrdre: "", declarantEtablissement: "", declarantVille: "", declarantEmail: "", declarantTel: "",
  patientAge: "", patientSexe: "", patientPoids: "", patientTaille: "", patientGrossesse: "",
  patientGrossesseSemaines: "", patientAllaitement: "", patientInsuffisanceRenaleStade: "",
  patientInsuffisanceHepatiqueStade: "", patientAntecedents: "", patientAllergies: "",
  medicamentDCI: "", medicamentNomCommercial: "", medicamentForme: "", medicamentVoie: "",
  medicamentPosologie: "", medicamentFrequence: "", medicamentIndication: "", medicamentDateDebut: "",
  medicamentDateFin: "", medicamentEnCours: false, medicamentLot: "", medicamentPeremption: "",
  medicamentLaboratoire: "", medicamentAMM: "", medicamentPrescripteur: "",
  aucunConcomitant: false,
  medicamentsConcomitants: [],
  eiMeddraTerm: "", eiMeddraCode: "", eiMeddraSoc: "",
  eiDescription: "", eiDateDebut: "", eiDateFin: "", eiEnCours: false, eiEvolution: "",
  graviteDeces: false, graviteVieDanger: false, graviteHospitalisation: false,
  graviteIncapacite: false, graviteAnomalieCongenitale: false,
  graviteMedicalementSignificatif: false, graviteNonSerieux: false,
  examensComplementaires: "",
  imputChronologie: "", imputDelaiApparition: "", imputEvolutionArret: "",
  imputReadministration: "", imputReadministrationResultat: "", imputSemiologie: "",
  imputBilanEtiologique: "", imputConclusion: "",
  documents: false, commentaires: "", consentement: false,
  notifAccuseReception: true, notifSuiviStatut: true, notifEmail: "",
};

export const SECTIONS = [
  { id: 1, label: "Patient", icon: "🧑" },
  { id: 2, label: "Médicament suspect", icon: "💊" },
  { id: 3, label: "Concomitants", icon: "📋" },
  { id: 4, label: "Effet indésirable", icon: "⚠️" },
  { id: 5, label: "Imputabilité", icon: "🔬" },
  { id: 6, label: "Finalisation", icon: "📤" },
];

export const FORMES = [
  "Comprimé", "Gélule", "Solution injectable", "Sirop", "Pommade / Crème", "Patch",
  "Suppositoire", "Inhalateur", "Gouttes", "Sachet", "Autre",
];

export const VOIES = [
  "Orale (per os)", "Intraveineuse (IV)", "Intramusculaire (IM)", "Sous-cutanée (SC)",
  "Transdermique", "Inhalée", "Rectale", "Ophtalmique", "Autre",
];
