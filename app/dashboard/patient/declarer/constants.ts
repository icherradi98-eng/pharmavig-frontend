// Types et constantes du formulaire patient — déplacés depuis page.tsx (pure extraction, aucune logique modifiée)

export type FormData = {
  age: string; sexe: string; region: string; regionAuto: boolean;
  medicamentNom: string; medicamentLot: string; medicamentPeremption: string;
  medicamentLabo: string; medicamentDateDebut: string;
  indication: string; duree: string; prescripteur: string;
  symptomes: string[]; aucunSymptome: boolean;
  description: string; delaiApparition: string;
  gravite: string; arretMedicament: string; ameliorationApresArret: string; problemePersiste: string;
  autresMedicaments: string; autresMedicamentsDetail: string;
  maladiesChroniquesOuiNon: string; maladiesChroniques: string[];
  grossesse: string; reactionPassee: string; reactionPasseeDetail: string;
  contact: string; contactEmail: string; contactTel: string;
  signaleAuMedecin: string; documents: boolean; consentement: boolean;
};

export const DRAFT_KEY = "pharmavig_patient_draft";

export const INITIAL: FormData = {
  age: "", sexe: "", region: "", regionAuto: false,
  medicamentNom: "", medicamentLot: "", medicamentPeremption: "",
  medicamentLabo: "", medicamentDateDebut: "",
  indication: "", duree: "", prescripteur: "",
  symptomes: [], aucunSymptome: false,
  description: "", delaiApparition: "",
  gravite: "", arretMedicament: "", ameliorationApresArret: "", problemePersiste: "",
  autresMedicaments: "", autresMedicamentsDetail: "",
  maladiesChroniquesOuiNon: "", maladiesChroniques: [],
  grossesse: "", reactionPassee: "", reactionPasseeDetail: "",
  contact: "", contactEmail: "", contactTel: "",
  signaleAuMedecin: "", documents: false, consentement: false,
};

export const SECTIONS = [
  { id: 1, label: "Vous",               labelDarija: "أنت" },
  { id: 2, label: "Médicament",         labelDarija: "الدوا" },
  { id: 3, label: "Ce qui s'est passé", labelDarija: "أشمن مشكل" },
  { id: 4, label: "Gravité",            labelDarija: "الخطورة" },
  { id: 5, label: "Contexte médical",   labelDarija: "الحال الطبي" },
  { id: 6, label: "Finalisation",       labelDarija: "آخر خطوة" },
];

export const REGIONS = [
  "Casablanca-Settat", "Rabat-Salé-Kénitra", "Marrakech-Safi", "Fès-Meknès",
  "Tanger-Tétouan-Al Hoceïma", "Souss-Massa", "Oriental", "Béni Mellal-Khénifra",
  "Drâa-Tafilalet", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab",
];

export const CITY_TO_REGION: Record<string, string> = {
  casablanca: "Casablanca-Settat", mohammedia: "Casablanca-Settat", settat: "Casablanca-Settat",
  rabat: "Rabat-Salé-Kénitra", "salé": "Rabat-Salé-Kénitra", kenitra: "Rabat-Salé-Kénitra",
  marrakech: "Marrakech-Safi", safi: "Marrakech-Safi", essaouira: "Marrakech-Safi",
  fez: "Fès-Meknès", meknes: "Fès-Meknès",
  tanger: "Tanger-Tétouan-Al Hoceïma", tetouan: "Tanger-Tétouan-Al Hoceïma",
  agadir: "Souss-Massa", tiznit: "Souss-Massa",
  oujda: "Oriental", nador: "Oriental",
  errachidia: "Drâa-Tafilalet", ouarzazate: "Drâa-Tafilalet",
  guelmim: "Guelmim-Oued Noun",
  laayoune: "Laâyoune-Sakia El Hamra",
  dakhla: "Dakhla-Oued Ed-Dahab",
};

export const AGE_RANGES = [
  { val: "<18",   fr: "< 18 ans",    dar: "دون 18 عام" },
  { val: "18-29", fr: "18 – 29 ans", dar: "18 – 29 عام" },
  { val: "30-39", fr: "30 – 39 ans", dar: "30 – 39 عام" },
  { val: "40-49", fr: "40 – 49 ans", dar: "40 – 49 عام" },
  { val: "50-59", fr: "50 – 59 ans", dar: "50 – 59 عام" },
  { val: "60-69", fr: "60 – 69 ans", dar: "60 – 69 عام" },
  { val: "70-79", fr: "70 – 79 ans", dar: "70 – 79 عام" },
  { val: ">79",   fr: "> 79 ans",    dar: "فوق 79 عام" },
  { val: "nr",    fr: "Non précisé", dar: "ما بغيتش نجاوب" },
];

export const SYMPTOMES_CATEGORIES: { cat: string; items: { key: string; label: string }[] }[] = [
  { cat: "🩺 Peau / جلد", items: [
    { key: "boutons",         label: "Boutons / حبوب" },
    { key: "rougeurs",        label: "Rougeurs / حمرة" },
    { key: "demangeaisons",   label: "Démangeaisons / شكيوة" },
    { key: "gonflement_peau", label: "Gonflement / توورم" },
    { key: "desquamation",    label: "Peau qui pèle / تسلاخ" },
  ]},
  { cat: "🤢 Digestion / كرش", items: [
    { key: "nausees",         label: "Nausées / تقيان" },
    { key: "vomissements",    label: "Vomissements / توقية" },
    { key: "diarrhee",        label: "Diarrhée / خروج" },
    { key: "douleur_ventre",  label: "Douleurs ventre / وجع فكرش" },
    { key: "perte_appetit",   label: "Perte appétit / ما عندوش شهية" },
  ]},
  { cat: "🧠 Tête / راس", items: [
    { key: "cephalees",       label: "Mal de tête / وجع راس" },
    { key: "vertiges",        label: "Vertiges / دواخة" },
    { key: "vision_trouble",  label: "Vision trouble / ضلعة فعينين" },
    { key: "confusion",       label: "Confusion / خلطيطة" },
    { key: "somnolence",      label: "Somnolence / نعاس بزاف" },
  ]},
  { cat: "🫀 Cœur / قلب", items: [
    { key: "palpitations",    label: "Palpitations / تخبيطة" },
    { key: "dyspnee",         label: "Essoufflement / ما كينفسش" },
    { key: "douleur_thorax",  label: "Douleur poitrine / وجع صدر" },
    { key: "oedeme_membres",  label: "Jambes gonflées / رجلين توورمت" },
    { key: "asthenie",        label: "Fatigue intense / عيا بزاف" },
  ]},
  { cat: "💊 Général / عام", items: [
    { key: "fievre",          label: "Fièvre / سخانة" },
    { key: "frissons",        label: "Frissons / برودة" },
    { key: "sueurs",          label: "Sueurs / عرق" },
    { key: "perte_poids",     label: "Perte de poids / نقص فالوزن" },
    { key: "myalgies",        label: "Douleurs musculaires / وجع فالعظام" },
    { key: "reaction_allergique", label: "Réaction allergique / حساسية" },
  ]},
];

export const SYMPTOME_LABEL: Record<string, string> = Object.fromEntries(
  SYMPTOMES_CATEGORIES.flatMap((c) => c.items.map((i) => [i.key, i.label]))
);

export const INDICATION_SUGGESTIONS = [
  "Hypertension / ضغط الدم", "Diabète / السكر", "Douleur / وجع",
  "Infection / عدوى", "Cancer / السرطان", "Maladie cardiaque / القلب",
  "Asthme / الربو", "Problème digestif / الكرش", "Allergie / حساسية",
  "Dépression / الاكتئاب", "Anxiété / القلق", "Douleur articulaire / وجع المفاصل",
  "Fièvre / سخانة", "Toux / الكحة", "Maladie rénale / الكلوة",
  "Thyroïde / الغدة", "Épilepsie / الصرع", "Anémie / فقر الدم",
  "Grossesse / حمل", "Contraception / تحديد النسل", "Cholestérol / الكوليسترول",
  "Ostéoporose / هشاشة العظام", "Migraine / الصداع", "Insomnie / الأرق",
  "Ménopause / سن اليأس", "Prostate / البروستات", "Glaucome / المياه الزرقاء",
];

export const GRAVITE_KEYWORDS = [
  "hospit", "urgence", "urgences", "réanimation", "reanimation",
  "icu", "coma", "inconscient", "mort", "décès", "deces",
  "ambulance", "samu", "mourir", "failli mourir", "failli",
  "sbitar", "سبيطار", "أورجونس", "الموت",
];
