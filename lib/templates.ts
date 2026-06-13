// Système de modèles d'ordonnance — modèles persos (localStorage) + modèles
// curés par spécialité (bundlés). Un modèle ne contient JAMAIS de donnée patient,
// uniquement le plan thérapeutique réutilisable.

import { type MedicamentRx, emptyMedRx } from "./ordonnancier";

export type RxTemplate = {
  id: string;
  scope: "perso" | "specialite";
  specialite?: string;
  nom: string;
  diagnostic?: string;       // relie aux chips de diagnostic rapide
  meds: MedicamentRx[];
  suiviDefault: boolean;
  favorite: boolean;
  usageCount: number;
};

// Helper : construit un MedicamentRx à partir des champs utiles
function med(over: Partial<MedicamentRx>, id = 1): MedicamentRx {
  return { ...emptyMedRx(id), ...over, id };
}

// ── Modèles curés par spécialité (read-only, duplicables en perso) ────────────
export const SPECIALTY_TEMPLATES: RxTemplate[] = [
  {
    id: "spec-dt2", scope: "specialite", specialite: "Médecine générale", nom: "Diabète de type 2", diagnostic: "Diabète type 2",
    suiviDefault: true, favorite: false, usageCount: 0,
    meds: [med({ nom: "Metformine", dci: "Metformine", forme: "Comprimé", dosage: "1000 mg", voie: "orale", quantite: "1 comprimé", frequenceNombre: "2", frequenceUnite: "jour", dureeChronique: true, instructions: "Pendant les repas" })],
  },
  {
    id: "spec-hta", scope: "specialite", specialite: "Médecine générale", nom: "Hypertension artérielle", diagnostic: "HTA",
    suiviDefault: true, favorite: false, usageCount: 0,
    meds: [med({ nom: "Amlodipine", dci: "Amlodipine", forme: "Comprimé", dosage: "5 mg", voie: "orale", quantite: "1 comprimé", frequenceNombre: "1", frequenceUnite: "jour", dureeChronique: true })],
  },
  {
    id: "spec-iu", scope: "specialite", specialite: "Médecine générale", nom: "Infection urinaire simple", diagnostic: "Infection urinaire",
    suiviDefault: false, favorite: false, usageCount: 0,
    meds: [med({ nom: "Fosfomycine", dci: "Fosfomycine trométamol", forme: "Autre", dosage: "3 g", voie: "orale", quantite: "1 sachet", frequenceNombre: "1", frequenceUnite: "jour", dureeValeur: "1", dureeUnite: "jours", instructions: "Prise unique, le soir au coucher, vessie vide" })],
  },
  {
    id: "spec-rgo", scope: "specialite", specialite: "Médecine générale", nom: "RGO / pyrosis", diagnostic: "RGO",
    suiviDefault: false, favorite: false, usageCount: 0,
    meds: [med({ nom: "Oméprazole", dci: "Oméprazole", forme: "Gélule", dosage: "20 mg", voie: "orale", quantite: "1 gélule", frequenceNombre: "1", frequenceUnite: "jour", dureeValeur: "4", dureeUnite: "semaines", instructions: "Le matin à jeun" })],
  },
  {
    id: "spec-asthme", scope: "specialite", specialite: "Pneumologie", nom: "Asthme — traitement de fond", diagnostic: "Asthme",
    suiviDefault: true, favorite: false, usageCount: 0,
    meds: [med({ nom: "Budésonide / Formotérol", dci: "Budésonide + Formotérol", forme: "Inhalateur", dosage: "160/4,5 µg", voie: "inhalée", quantite: "1 bouffée", frequenceNombre: "2", frequenceUnite: "jour", dureeChronique: true, instructions: "Rincer la bouche après inhalation" })],
  },
  {
    id: "spec-fer", scope: "specialite", specialite: "Médecine générale", nom: "Carence martiale", diagnostic: "Anémie ferriprive",
    suiviDefault: false, favorite: false, usageCount: 0,
    meds: [med({ nom: "Sulfate ferreux", dci: "Sulfate ferreux", forme: "Comprimé", dosage: "80 mg", voie: "orale", quantite: "1 comprimé", frequenceNombre: "1", frequenceUnite: "jour", dureeValeur: "3", dureeUnite: "mois", instructions: "À distance du thé/café" })],
  },
];

// Chips de diagnostic rapide (mappées aux diagnostics des modèles)
export const QUICK_DIAGNOSES = ["HTA", "Diabète type 2", "Infection urinaire", "Asthme", "RGO", "Anémie ferriprive"];

// ── Modèles personnels (localStorage) ─────────────────────────────────────────
const KEY = "pharmavig_rx_templates";

export function readTemplates(): RxTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as RxTemplate[];
  } catch {
    return [];
  }
}

function writeTemplates(list: RxTemplate[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}

export function saveTemplate(t: Omit<RxTemplate, "id" | "scope" | "usageCount" | "favorite"> & { favorite?: boolean }): RxTemplate {
  const created: RxTemplate = {
    ...t, id: `tpl-${Date.now()}`, scope: "perso", usageCount: 0, favorite: t.favorite ?? false,
  };
  writeTemplates([created, ...readTemplates()]);
  return created;
}

export function deleteTemplate(id: string) {
  writeTemplates(readTemplates().filter((t) => t.id !== id));
}

export function toggleFavorite(id: string) {
  // perso : persiste ; spécialité : favori stocké à part
  const persos = readTemplates();
  if (persos.some((t) => t.id === id)) {
    writeTemplates(persos.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t)));
    return;
  }
  const favKey = "pharmavig_rx_fav_spec";
  try {
    const favs: string[] = JSON.parse(localStorage.getItem(favKey) || "[]");
    const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
    localStorage.setItem(favKey, JSON.stringify(next));
  } catch {}
}

function favSpecIds(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("pharmavig_rx_fav_spec") || "[]"); } catch { return []; }
}

export function bumpUsage(id: string) {
  writeTemplates(readTemplates().map((t) => (t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t)));
}

// Tous les modèles (perso + spécialité), avec favoris résolus
export function allTemplates(): RxTemplate[] {
  const favs = favSpecIds();
  const spec = SPECIALTY_TEMPLATES.map((t) => ({ ...t, favorite: favs.includes(t.id) }));
  return [...readTemplates(), ...spec];
}

export function favoriteTemplates(): RxTemplate[] {
  return allTemplates().filter((t) => t.favorite);
}

export function findByDiagnostic(diag: string): RxTemplate | null {
  return allTemplates().find((t) => (t.diagnostic || "").toLowerCase() === diag.toLowerCase()) ?? null;
}
