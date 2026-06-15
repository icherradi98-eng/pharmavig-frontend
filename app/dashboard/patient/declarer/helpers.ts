// Fonctions pures — extraites depuis page.tsx (aucune logique modifiée)

import { type FormData, GRAVITE_KEYWORDS } from "./constants";

export function detectGraviteKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return GRAVITE_KEYWORDS.some((kw) => lower.includes(kw));
}

export function dureeToDays(d: string): number | undefined {
  if (d === "<1sem")   return 3;
  if (d === "1-4sem")  return 14;
  if (d === "1-6mois") return 90;
  if (d === ">6mois")  return 180;
  return undefined;
}

export function sectionErrors(step: number, f: FormData): string[] {
  const errs: string[] = [];
  if (step === 1) {
    if (!f.age)  errs.push("Votre tranche d'âge");
    if (!f.sexe) errs.push("Votre sexe");
  }
  if (step === 2) {
    if (!f.medicamentNom) errs.push("Nom du médicament");
    if (!f.indication)    errs.push("Raison de la prise");
    if (!f.duree)         errs.push("Durée de traitement");
    if (!f.prescripteur)  errs.push("Qui a prescrit le médicament");
  }
  if (step === 3) {
    if (!f.description)     errs.push("Description de ce qui s'est passé");
    if (!f.delaiApparition) errs.push("Délai d'apparition");
  }
  if (step === 4) {
    if (!f.gravite)          errs.push("Gravité de l'effet");
    if (!f.arretMedicament)  errs.push("Avez-vous arrêté le médicament ?");
    if (!f.problemePersiste) errs.push("Le problème persiste-t-il ?");
  }
  return errs;
}
