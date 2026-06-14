// Données de démonstration pour le dashboard médecin (prototype)
// Remplacées progressivement par les vraies données API à mesure que le médecin déclare.

export type MockDeclaration = {
  id: string;
  pv: string;
  date: string; // ISO
  drugDci: string;
  meddraSoc: string;
  meddraPt: string;
  grave: boolean;
  begaud: 0 | 1 | 2 | 3 | 4;
  statut: "soumis" | "transmis_capm" | "traite";
};

export const MOCK_DECLARATIONS: MockDeclaration[] = [
  { id: "d1", pv: "PV-MA-2026-00142", date: "2026-05-28", drugDci: "Pembrolizumab", meddraSoc: "Cardiaque", meddraPt: "Myocardite", grave: true, begaud: 3, statut: "transmis_capm" },
  { id: "d2", pv: "PV-MA-2026-00139", date: "2026-05-20", drugDci: "Méthotrexate", meddraSoc: "Hépato-biliaire", meddraPt: "Cytolyse hépatique", grave: true, begaud: 2, statut: "soumis" },
  { id: "d3", pv: "PV-MA-2026-00131", date: "2026-05-09", drugDci: "Amoxicilline-acide clavulanique", meddraSoc: "Hépato-biliaire", meddraPt: "Cholestase", grave: false, begaud: 2, statut: "traite" },
  { id: "d4", pv: "PV-MA-2026-00124", date: "2026-04-30", drugDci: "Tramadol", meddraSoc: "Système nerveux", meddraPt: "Somnolence", grave: false, begaud: 1, statut: "traite" },
  { id: "d5", pv: "PV-MA-2026-00118", date: "2026-04-22", drugDci: "Nivolumab", meddraSoc: "Gastro-intestinal", meddraPt: "Colite immuno-induite", grave: true, begaud: 3, statut: "transmis_capm" },
  { id: "d6", pv: "PV-MA-2026-00109", date: "2026-04-11", drugDci: "Paracétamol", meddraSoc: "Peau", meddraPt: "Éruption cutanée", grave: false, begaud: 1, statut: "traite" },
  { id: "d7", pv: "PV-MA-2026-00098", date: "2026-03-30", drugDci: "Atorvastatine", meddraSoc: "Musculo-squelettique", meddraPt: "Myalgies", grave: false, begaud: 2, statut: "soumis" },
  { id: "d8", pv: "PV-MA-2026-00087", date: "2026-03-15", drugDci: "Pembrolizumab", meddraSoc: "Endocrinien", meddraPt: "Hypothyroïdie", grave: false, begaud: 4, statut: "traite" },
  { id: "d9", pv: "PV-MA-2026-00079", date: "2026-02-26", drugDci: "Metformine", meddraSoc: "Gastro-intestinal", meddraPt: "Nausées", grave: false, begaud: 2, statut: "traite" },
  { id: "d10", pv: "PV-MA-2026-00064", date: "2026-02-08", drugDci: "Ibuprofène", meddraSoc: "Rénal et urinaire", meddraPt: "Insuffisance rénale aiguë", grave: true, begaud: 1, statut: "traite" },
  { id: "d11", pv: "PV-MA-2026-00051", date: "2026-01-19", drugDci: "Oméprazole", meddraSoc: "Gastro-intestinal", meddraPt: "Diarrhées", grave: false, begaud: 1, statut: "traite" },
  { id: "d12", pv: "PV-MA-2025-00488", date: "2025-12-22", drugDci: "Amlodipine", meddraSoc: "Vasculaire", meddraPt: "Œdèmes des membres inférieurs", grave: false, begaud: 3, statut: "traite" },
];

export type MockAlertSource = "CAPM" | "EMA" | "ANSM" | "FDA";
export type MockAlertSeverity = "urgent" | "important" | "info";

export type MockAlert = {
  id: string;
  source: MockAlertSource;
  severity: MockAlertSeverity;
  date: string; // ISO
  molecules: string[];
  meddraSoc: string;
  summary: string;
  officialUrl: string;
};

export const MOCK_ALERTS: MockAlert[] = [
  {
    id: "a1",
    source: "EMA",
    severity: "urgent",
    date: "2026-05-15",
    molecules: ["Pembrolizumab", "Keytruda"],
    meddraSoc: "Cardiaque",
    summary: "Nouveau signal de myocardite immune sévère (Grade 3-4) en association avec chimiothérapie à base de platine. 47 cas rapportés en Europe en Q1 2026. Monitoring cardiaque recommandé : ECG + troponine baseline avant chaque cycle.",
    officialUrl: "https://www.ema.europa.eu/",
  },
  {
    id: "a2",
    source: "ANSM",
    severity: "important",
    date: "2026-05-02",
    molecules: ["Méthotrexate"],
    meddraSoc: "Hépato-biliaire",
    summary: "Rappel des règles de prescription hebdomadaire. 12 cas de surdosage accidentel rapportés en France depuis janvier 2026, dont 3 décès. Vérification systématique de la fréquence de prise recommandée.",
    officialUrl: "https://ansm.sante.fr/",
  },
  {
    id: "a3",
    source: "ANSM",
    severity: "info",
    date: "2026-04-28",
    molecules: ["Tramadol"],
    meddraSoc: "Système nerveux",
    summary: "Mise à jour du RCP marocain. Nouvelles contre-indications chez l'enfant de moins de 12 ans et restrictions d'usage en post-opératoire pédiatrique.",
    officialUrl: "https://capm.sante.gov.ma/",
  },
  {
    id: "a4",
    source: "FDA",
    severity: "urgent",
    date: "2026-05-10",
    molecules: ["Nivolumab", "Opdivo"],
    meddraSoc: "Gastro-intestinal",
    summary: "Mise à jour de l'avertissement encadré : risque accru de colite immuno-induite avec les protocoles associant ipilimumab. Nouveau protocole de surveillance recommandé tous les 2 cycles.",
    officialUrl: "https://www.fda.gov/medwatch",
  },
  {
    id: "a5",
    source: "EMA",
    severity: "important",
    date: "2026-04-20",
    molecules: ["Amoxicilline-acide clavulanique"],
    meddraSoc: "Hépato-biliaire",
    summary: "Signal renforcé de cholestase hépatique. Durée de traitement à limiter au strict nécessaire. Bilan hépatique recommandé si traitement supérieur à 14 jours.",
    officialUrl: "https://www.ema.europa.eu/",
  },
];

export const ALERT_SOURCE_STYLES: Record<MockAlertSource, string> = {
  CAPM: "bg-blue-100 text-blue-700 border-blue-200",
  EMA: "bg-violet-100 text-violet-700 border-violet-200",
  ANSM: "bg-orange-100 text-orange-700 border-orange-200",
  FDA: "bg-red-100 text-red-700 border-red-200",
};

export const ALERT_SEVERITY_STYLES: Record<MockAlertSeverity, { border: string; label: string; chip: string }> = {
  urgent: { border: "border-l-red-500", label: "Urgent", chip: "bg-red-100 text-red-700" },
  important: { border: "border-l-amber-500", label: "Important", chip: "bg-amber-100 text-amber-700" },
  info: { border: "border-l-blue-500", label: "Info", chip: "bg-blue-100 text-blue-700" },
};

// Liste de molécules courantes pour l'autocomplete "Mes molécules"
export const COMMON_MOLECULES = [
  "Pembrolizumab", "Nivolumab", "Atezolizumab", "Ipilimumab", "Trastuzumab",
  "Méthotrexate", "Amoxicilline", "Amoxicilline-acide clavulanique", "Ibuprofène",
  "Paracétamol", "Metformine", "Amlodipine", "Atorvastatine", "Oméprazole",
  "Tramadol", "Insuline glargine", "Lévothyroxine", "Losartan", "Salbutamol",
  "Cisplatine", "Carboplatine", "Paclitaxel", "Docétaxel", "5-Fluorouracile",
  "Azithromycine", "Ciprofloxacine", "Furosémide", "Spironolactone",
  "Prednisone", "Dexaméthasone", "Clopidogrel", "Warfarine", "Rivaroxaban",
  "Metoprolol", "Simvastatine", "Pantoprazole", "Sertraline", "Escitalopram",
  "Gabapentine", "Tramadol/Paracétamol",
];

export const MOCK_PROFILE = {
  prenom: "Amine",
  nom: "Bennani",
  specialite: "Oncologie médicale",
  cnom: "CNOM-12458",
  etablissement: "CHU Mohammed VI",
  ville: "Rabat",
  email: "a.bennani@example.com",
  telephone: "+212 6 00 00 00 00",
};

// Comparatif national agrégé anonymisé (mock pour le prototype)
export const NATIONAL_BENCHMARK = {
  tauxGravesPct: 27,
  begaudMoyen: 2.1,
  delaiMoyenJours: 9,
};
