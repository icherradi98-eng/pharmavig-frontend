import type { FormData } from "./types";

/** Retourne la liste des champs manquants pour l'étape donnée */
export function sectionErrors(step: number, f: FormData): string[] {
  const errs: string[] = [];
  if (step === 1) {
    if (!f.patientAge) errs.push("Âge du patient");
    if (!f.patientSexe) errs.push("Sexe du patient");
  }
  if (step === 2) {
    if (!f.medicamentDCI) errs.push("DCI du médicament");
    if (!f.medicamentForme) errs.push("Forme pharmaceutique");
    if (!f.medicamentVoie) errs.push("Voie d'administration");
    if (!f.medicamentPosologie) errs.push("Posologie");
    if (!f.medicamentFrequence) errs.push("Fréquence");
    if (!f.medicamentIndication) errs.push("Indication");
    if (!f.medicamentDateDebut) errs.push("Date de début du traitement");
  }
  if (step === 4) {
    if (!f.eiMeddraTerm) errs.push("Effet observé");
    if (!f.eiDescription) errs.push("Description de l'effet indésirable");
    if (!f.eiDateDebut) errs.push("Date de début de l'effet");
    const hasGravite =
      f.graviteHospitalisation ||
      f.graviteVieDanger ||
      f.graviteIncapacite ||
      f.graviteDeces ||
      f.graviteAnomalieCongenitale ||
      f.graviteMedicalementSignificatif ||
      f.graviteNonSerieux; // "non sérieux" est un critère de gravité valide
    if (!hasGravite) errs.push("Gravité de l'effet (au moins une case — y compris « Non sérieux »)");
  }
  return errs;
}
