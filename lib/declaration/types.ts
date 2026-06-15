export type MedicamentConcomitant = {
  id: number;
  nom: string;
  posologieDose: string;
  posologieUnite: string;
  posologieFrequence: string;
  indication: string;
  arretAvantEI: boolean;
  suspectSecondaire: boolean;
};

export type FormData = {
  // Section 1 — Déclarant
  typeDeclaration: string;
  declarantNom: string;
  declarantPrenom: string;
  declarantSpecialite: string;
  declarantSpecialiteAutre: string;
  declarantNumOrdre: string;
  declarantEtablissement: string;
  declarantVille: string;
  declarantEmail: string;
  declarantTel: string;

  // Section 2 — Patient
  patientAge: string;
  patientSexe: string;
  patientPoids: string;
  patientTaille: string;
  patientGrossesse: string;
  patientGrossesseSemaines: string;
  patientAllaitement: string;
  patientInsuffisanceRenaleStade: string;
  patientInsuffisanceHepatiqueStade: string;
  patientAntecedents: string;
  patientAllergies: string;

  // Section 3 — Médicament suspect
  medicamentDCI: string;
  medicamentNomCommercial: string;
  medicamentForme: string;
  medicamentVoie: string;
  medicamentPosologie: string;
  medicamentFrequence: string;
  medicamentIndication: string;
  medicamentDateDebut: string;
  medicamentDateFin: string;
  medicamentEnCours: boolean;
  medicamentLot: string;
  medicamentPeremption: string;
  medicamentLaboratoire: string;
  medicamentAMM: string;
  medicamentPrescripteur: string;

  // Section 4 — Concomitants
  aucunConcomitant: boolean;
  medicamentsConcomitants: MedicamentConcomitant[];

  // Section 5 — Effet indésirable
  eiMeddraTerm: string;
  eiMeddraCode: string;
  eiMeddraSoc: string;
  eiDescription: string;
  eiDateDebut: string;
  eiDateFin: string;
  eiEnCours: boolean;
  eiEvolution: string;
  // Gravité ICH E2B
  graviteDeces: boolean;
  graviteVieDanger: boolean;
  graviteHospitalisation: boolean;
  graviteIncapacite: boolean;
  graviteAnomalieCongenitale: boolean;
  graviteMedicalementSignificatif: boolean;
  graviteNonSerieux: boolean;
  // Examens complémentaires
  examensComplementaires: string;

  // Section 6 — Imputabilité
  imputChronologie: string;
  imputDelaiApparition: string;
  imputEvolutionArret: string;
  imputReadministration: string;
  imputReadministrationResultat: string;
  imputSemiologie: string;
  imputBilanEtiologique: string;
  imputConclusion: string;

  // Section 7 — Finalisation
  documents: boolean;
  commentaires: string;
  consentement: boolean;
  notifAccuseReception: boolean;
  notifSuiviStatut: boolean;
  notifEmail: string;
};
