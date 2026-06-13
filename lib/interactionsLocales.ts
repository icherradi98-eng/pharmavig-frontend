/**
 * Table locale des interactions médicamenteuses critiques.
 * 50 paires cliniquement significatives — utilisée comme fallback si OpenFDA est indisponible.
 * Niveaux : "CI" (contre-indiqué), "majeur", "modéré", "mineur"
 */

export type NiveauInteraction = "CI" | "majeur" | "modéré" | "mineur";

export type InteractionLocale = {
  dci1: string;
  dci2: string;
  niveau: NiveauInteraction;
  mecanisme: string;
  consequence: string;
  conduite: string;
};

// Normalisation : minuscules, sans accents
function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

export const INTERACTIONS_TABLE: InteractionLocale[] = [
  // ── Contre-indications absolues ──────────────────────────────────
  { dci1: "warfarine",       dci2: "fluconazole",     niveau: "CI",
    mecanisme: "Inhibition CYP2C9 (fluconazole) → ↑ exposition warfarine",
    consequence: "Risque hémorragique sévère (INR très élevé)",
    conduite: "Association contre-indiquée. Si indispensable : anticoagulant alternatif." },

  { dci1: "simvastatine",    dci2: "itraconazole",    niveau: "CI",
    mecanisme: "Inhibition CYP3A4 → accumulation simvastatine",
    consequence: "Rhabdomyolyse potentiellement fatale",
    conduite: "Contre-indiqué. Utiliser pravastatine ou rosuvastatine." },

  { dci1: "pimozide",        dci2: "clarithromycine", niveau: "CI",
    mecanisme: "Inhibition CYP3A4 + allongement QT additif",
    consequence: "Torsade de pointes, arrêt cardiaque",
    conduite: "Association contre-indiquée." },

  { dci1: "methotrexate",    dci2: "triméthoprime",   niveau: "CI",
    mecanisme: "Double inhibition de la dihydrofolate réductase",
    consequence: "Aplasie médullaire sévère",
    conduite: "Association contre-indiquée. Éviter cotrimoxazole." },

  { dci1: "ivabradine",      dci2: "ketoconazole",    niveau: "CI",
    mecanisme: "Inhibition CYP3A4 → ↑↑ ivabradine",
    consequence: "Bradycardie sévère, bloc AV",
    conduite: "Contre-indiqué. Surveiller ECG si association inévitable." },

  { dci1: "cisapride",       dci2: "erythromycine",   niveau: "CI",
    mecanisme: "Inhibition CYP3A4 + allongement QT additif",
    consequence: "Torsade de pointes",
    conduite: "Association contre-indiquée." },

  { dci1: "linezolide",      dci2: "serotonine",      niveau: "CI",
    mecanisme: "IMAO non sélectif + sérotoninergique",
    consequence: "Syndrome sérotoninergique potentiellement fatal",
    conduite: "Contre-indiqué avec ISRS, IRSN, triptans." },

  { dci1: "ritonavir",       dci2: "amiodarone",      niveau: "CI",
    mecanisme: "Inhibition CYP3A4 → accumulation amiodarone",
    consequence: "Toxicité cardiaque et pulmonaire sévère",
    conduite: "Association contre-indiquée." },

  // ── Interactions majeures ────────────────────────────────────────
  { dci1: "warfarine",       dci2: "aspirine",        niveau: "majeur",
    mecanisme: "Synergie anticoagulante + antiplaquettaire",
    consequence: "Risque hémorragique majoré (saignement GI, intracrânien)",
    conduite: "Éviter sauf en cardiologie sur avis spécialisé. Surveiller INR étroitement." },

  { dci1: "metformine",      dci2: "iode radioactif", niveau: "majeur",
    mecanisme: "Compétition sur l'excrétion rénale",
    consequence: "Acidose lactique",
    conduite: "Arrêter la metformine 48h avant injection de produit de contraste iodé." },

  { dci1: "lithium",         dci2: "ibuprofene",      niveau: "majeur",
    mecanisme: "Réduction de l'excrétion rénale de lithium par les AINS",
    consequence: "Intoxication au lithium (tremblements, confusion, arythmie)",
    conduite: "Surveiller lithiémie si association inévitable. Préférer paracétamol." },

  { dci1: "clopidogrel",     dci2: "omeprazole",      niveau: "majeur",
    mecanisme: "Inhibition CYP2C19 → ↓ activation du clopidogrel (prodrogue)",
    consequence: "Réduction de l'effet antiplaquettaire → risque thrombotique",
    conduite: "Préférer pantoprazole. Si oméprazole indispensable, réévaluer l'anticoagulation." },

  { dci1: "methotrexate",    dci2: "ibuprofene",      niveau: "majeur",
    mecanisme: "Réduction de l'excrétion rénale du MTX",
    consequence: "Toxicité méthotrexate : aplasie, mucite, néphrotoxicité",
    conduite: "Éviter les AINS sous MTX. Utiliser le paracétamol." },

  { dci1: "digoxine",        dci2: "amiodarone",      niveau: "majeur",
    mecanisme: "Inhibition glycoprotéine P → ↑ exposition digoxine",
    consequence: "Intoxication digitalique (BAV, arythmies ventriculaires)",
    conduite: "Réduire la dose de digoxine de 50%. Surveiller digoxinémie." },

  { dci1: "atorvastatine",   dci2: "clarithromycine", niveau: "majeur",
    mecanisme: "Inhibition CYP3A4 → ↑ statine",
    consequence: "Myopathie, rhabdomyolyse",
    conduite: "Suspendre la statine pendant le traitement par clarithromycine." },

  { dci1: "sotalol",         dci2: "ciprofloxacine",  niveau: "majeur",
    mecanisme: "Allongement QTc additif",
    consequence: "Torsade de pointes",
    conduite: "Éviter l'association. ECG de contrôle si indispensable." },

  { dci1: "phenytoine",      dci2: "fluconazole",     niveau: "majeur",
    mecanisme: "Inhibition CYP2C9 → ↑ phénytoïne",
    consequence: "Intoxication à la phénytoïne (nystagmus, ataxie, confusion)",
    conduite: "Surveiller phénytoinémie étroitement. Réduire la dose si nécessaire." },

  { dci1: "ciclosporine",    dci2: "rifampicine",     niveau: "majeur",
    mecanisme: "Induction CYP3A4 + P-gp → ↓↓ exposition ciclosporine",
    consequence: "Rejet de greffe",
    conduite: "Éviter. Si indispensable, multiplier les doses et surveiller les taux." },

  { dci1: "tacrolimus",      dci2: "fluconazole",     niveau: "majeur",
    mecanisme: "Inhibition CYP3A4 → ↑ tacrolimus",
    consequence: "Néphrotoxicité, neurotoxicité",
    conduite: "Réduire la dose de tacrolimus, surveiller les taux." },

  { dci1: "levodopa",        dci2: "metoclopramide",  niveau: "majeur",
    mecanisme: "Antagonisme dopaminergique central",
    consequence: "Aggravation du syndrome parkinsonien",
    conduite: "Contre-indiqué dans le Parkinson. Utiliser dompéridone si nécessaire." },

  { dci1: "ssri",            dci2: "tramadol",        niveau: "majeur",
    mecanisme: "Synergie sérotoninergique",
    consequence: "Syndrome sérotoninergique",
    conduite: "Surveiller signes de syndrome sérotoninergique. Éviter si possible." },

  { dci1: "heparine",        dci2: "aspirine",        niveau: "majeur",
    mecanisme: "Synergie anticoagulante + antiplaquettaire",
    consequence: "Risque hémorragique majeur",
    conduite: "Réserver aux indications validées (syndrome coronarien aigu)." },

  { dci1: "insuline",        dci2: "betabloquant",    niveau: "majeur",
    mecanisme: "Masquage des signes adrénergiques de l'hypoglycémie",
    consequence: "Hypoglycémie prolongée non détectée, cardiotoxicité",
    conduite: "Préférer les bêtabloquants cardiosélectifs. Surveillance glycémique renforcée." },

  { dci1: "allopurinol",     dci2: "azathioprine",    niveau: "majeur",
    mecanisme: "Inhibition de la xanthine oxydase → accumulation 6-mercaptopurine",
    consequence: "Aplasie médullaire sévère",
    conduite: "Réduire la dose d'azathioprine à 25–33%. Surveillance NFS hebdomadaire." },

  // ── Interactions modérées ────────────────────────────────────────
  { dci1: "metformine",      dci2: "alcool",          niveau: "modéré",
    mecanisme: "Potentialisation du risque d'acidose lactique",
    consequence: "Acidose lactique (risque majoré en cas de consommation excessive)",
    conduite: "Déconseiller la consommation régulière d'alcool." },

  { dci1: "warfarine",       dci2: "paracetamol",     niveau: "modéré",
    mecanisme: "À fortes doses, le paracétamol inhibe faiblement le CYP2C9",
    consequence: "Augmentation modérée de l'INR",
    conduite: "Acceptable à doses thérapeutiques standard (< 2 g/j). Surveiller INR." },

  { dci1: "amoxicilline",    dci2: "contraceptif oral", niveau: "modéré",
    mecanisme: "Modification de la flore intestinale → ↓ recirculation entéro-hépatique des estrogènes",
    consequence: "Réduction possible de l'efficacité contraceptive",
    conduite: "Informer la patiente, envisager une contraception mécanique pendant le traitement." },

  { dci1: "ciprofloxacine",  dci2: "antiacide",       niveau: "modéré",
    mecanisme: "Chélation par les ions Al³⁺/Mg²⁺/Ca²⁺ → ↓ absorption de la ciprofloxacine",
    consequence: "Réduction de l'efficacité antibiotique",
    conduite: "Espacer les prises de 2h (fluoroquinolone d'abord)." },

  { dci1: "levothyroxine",   dci2: "calcium",         niveau: "modéré",
    mecanisme: "Chélation → ↓ absorption de la lévothyroxine",
    consequence: "Hypothyroïdie mal contrôlée",
    conduite: "Espacer les prises d'au moins 4h." },

  { dci1: "amlodipine",      dci2: "simvastatine",    niveau: "modéré",
    mecanisme: "Inhibition CYP3A4 par l'amlodipine → ↑ simvastatine",
    consequence: "Myopathie (risque augmenté si simvastatine > 20 mg)",
    conduite: "Limiter simvastatine à 20 mg/j. Envisager autre statine." },

  { dci1: "tramadol",        dci2: "benzodiazepine",  niveau: "modéré",
    mecanisme: "Synergie dépressive du SNC",
    consequence: "Sédation excessive, dépression respiratoire",
    conduite: "Réduire les doses. Surveiller la conscience et la respiration." },

  { dci1: "furosemide",      dci2: "aminoside",       niveau: "modéré",
    mecanisme: "Synergie ototoxique et néphrotoxique",
    consequence: "Surdité irréversible, insuffisance rénale aiguë",
    conduite: "Éviter si possible. Surveiller la fonction rénale et l'audition." },

  { dci1: "metronidazole",   dci2: "alcool",          niveau: "modéré",
    mecanisme: "Inhibition de l'aldéhyde déshydrogénase (effet antabuse)",
    consequence: "Flush, nausées, vomissements, hypotension",
    conduite: "Abstention d'alcool pendant et 48h après le traitement." },

  { dci1: "tetracycline",    dci2: "lait",            niveau: "modéré",
    mecanisme: "Chélation par le calcium → ↓ absorption",
    consequence: "Réduction de l'efficacité antibiotique",
    conduite: "Prendre à jeun ou 2h après un repas riche en calcium." },

  { dci1: "fluoxetine",      dci2: "tamoxifene",      niveau: "modéré",
    mecanisme: "Inhibition CYP2D6 → ↓ formation d'endoxifène (métabolite actif)",
    consequence: "Réduction de l'efficacité anti-tumorale du tamoxifène",
    conduite: "Préférer la venlafaxine ou la mirtazapine." },

  { dci1: "rifampicine",     dci2: "contraceptif oral", niveau: "modéré",
    mecanisme: "Induction CYP3A4 → métabolisme accéléré des estrogènes",
    consequence: "Grossesse non désirée",
    conduite: "Contraception mécanique obligatoire pendant et 1 mois après le traitement." },

  { dci1: "carbamazepine",   dci2: "oral contraceptive", niveau: "modéré",
    mecanisme: "Induction CYP3A4 → ↓ exposition aux œstrogènes",
    consequence: "Échec contraceptif",
    conduite: "Contraception non hormonale ou pilule à haute dose + méthode barrière." },

  { dci1: "inhibiteur eca",  dci2: "ains",            niveau: "modéré",
    mecanisme: "Antagonisme sur la pression artérielle + risque rénal additif",
    consequence: "Insuffisance rénale aiguë, hyperkaliémie",
    conduite: "Surveiller la kaliémie et la créatinine. Hydratation correcte." },

  { dci1: "theophylline",    dci2: "ciprofloxacine",  niveau: "modéré",
    mecanisme: "Inhibition CYP1A2 → ↑ théophylline",
    consequence: "Intoxication à la théophylline (nausées, arythmies, convulsions)",
    conduite: "Surveiller théophyllinémie. Réduire la dose si nécessaire." },

  { dci1: "spironolactone",  dci2: "potassium",       niveau: "modéré",
    mecanisme: "Synergie hyperkaliémiante",
    consequence: "Hyperkaliémie (arythmies ventriculaires)",
    conduite: "Éviter les suppléments potassiques. Surveiller kaliémie." },

  { dci1: "sildenafil",      dci2: "nitrate",         niveau: "CI",
    mecanisme: "Potentialisation de la vasodilatation (double voie NO/cGMP)",
    consequence: "Hypotension sévère potentiellement fatale",
    conduite: "Association absolument contre-indiquée." },

  { dci1: "quetiapine",      dci2: "ketoconazole",    niveau: "majeur",
    mecanisme: "Inhibition CYP3A4 → ↑ quétiapine",
    consequence: "Allongement QTc, torsade de pointes",
    conduite: "Éviter l'association. ECG si indispensable." },

  // ── Interactions mineures ────────────────────────────────────────
  { dci1: "metformine",      dci2: "alcool",          niveau: "mineur",
    mecanisme: "Potentialisation hypoglycémique",
    consequence: "Hypoglycémie légère",
    conduite: "Conseiller la modération d'alcool." },

  { dci1: "antiacide",       dci2: "fer",             niveau: "mineur",
    mecanisme: "Chélation → ↓ absorption du fer",
    consequence: "Efficacité du traitement martial réduite",
    conduite: "Espacer les prises de 2h." },

  { dci1: "aspirine",        dci2: "ibuprofene",      niveau: "mineur",
    mecanisme: "Compétition pour la liaison à la COX-1 → ↓ effet antiplaquettaire de l'aspirine",
    consequence: "Réduction de la cardioprotection de l'aspirine faible dose",
    conduite: "Si AINS indispensable, prendre l'aspirine 30 min avant l'ibuprofène." },

  { dci1: "paracetamol",     dci2: "alcool",          niveau: "modéré",
    mecanisme: "Induction CYP2E1 par l'alcool → ↑ production de NAPQI (métabolite hépatotoxique)",
    consequence: "Hépatotoxicité (risque majoré chez l'alcoolique chronique)",
    conduite: "Réduire à 2 g/j maximum chez les consommateurs réguliers d'alcool." },

  { dci1: "inhibiteur pompe protons", dci2: "magnesium", niveau: "mineur",
    mecanisme: "Réduction de l'absorption intestinale du magnésium",
    consequence: "Hypomagnésémie (crampes, arythmies, ostéoporose)",
    conduite: "Supplémenter en magnésium si traitement prolongé. Contrôle de la magnésémie." },

  { dci1: "fluoroquinolone",  dci2: "fer",            niveau: "modéré",
    mecanisme: "Chélation Fe²⁺ → ↓ absorption de la fluoroquinolone",
    consequence: "Réduction de l'efficacité antibiotique",
    conduite: "Espacer les prises d'au moins 2h." },

  { dci1: "corticoide",       dci2: "ibuprofene",     niveau: "modéré",
    mecanisme: "Double irritation gastrique + réduction des prostaglandines protectrices",
    consequence: "Ulcère gastroduodénal, hémorragie digestive",
    conduite: "Associer un inhibiteur de pompe à protons. Éviter si possible." },

  { dci1: "antidepresseur tricyclique", dci2: "alcool", niveau: "modéré",
    mecanisme: "Synergie dépressive SNC",
    consequence: "Sédation excessive, risque chute, altération cognitive",
    conduite: "Éviter la consommation d'alcool." },
];

/**
 * Recherche une interaction entre deux médicaments dans la table locale.
 * Accepte les noms partiels (inclus dans dci1 ou dci2).
 */
export function searchLocalInteraction(
  drug1: string,
  drug2: string
): InteractionLocale | null {
  const d1 = norm(drug1);
  const d2 = norm(drug2);

  return (
    INTERACTIONS_TABLE.find(
      (i) =>
        (norm(i.dci1).includes(d1) || d1.includes(norm(i.dci1))) &&
        (norm(i.dci2).includes(d2) || d2.includes(norm(i.dci2)))
    ) ||
    INTERACTIONS_TABLE.find(
      (i) =>
        (norm(i.dci2).includes(d1) || d1.includes(norm(i.dci2))) &&
        (norm(i.dci1).includes(d2) || d2.includes(norm(i.dci1)))
    ) ||
    null
  );
}
