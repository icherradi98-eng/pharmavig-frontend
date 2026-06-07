// Helpers pour le module "Ordonnancier" — tout est stocké en localStorage
// (aucune donnée patient n'est envoyée à un serveur PharmaVig).

export const KEYS = {
  profile: "pharmavig_ordo_profil",
  recentPatients: "pharmavig_ordo_patients_recents",
  history: "pharmavig_ordo_historique",
  counterPrefix: "pharmavig_ordo_compteur_",
};

// ── Profil médecin (en-tête) ──────────────────────────────────────────────────

export type DoctorProfile = {
  nom: string;
  prenom: string;
  specialite: string;
  numOrdre: string;
  etablissement: string;
  ville: string;
  telephone: string;
  signatureDataUrl?: string;
  cachetDataUrl?: string;
};

export const EMPTY_PROFILE: DoctorProfile = {
  nom: "", prenom: "", specialite: "", numOrdre: "", etablissement: "", ville: "", telephone: "",
};

export function readProfile(): DoctorProfile {
  if (typeof window === "undefined") return EMPTY_PROFILE;
  try {
    const saved = localStorage.getItem(KEYS.profile);
    if (!saved) return EMPTY_PROFILE;
    return { ...EMPTY_PROFILE, ...JSON.parse(saved) };
  } catch {
    return EMPTY_PROFILE;
  }
}

export function saveProfile(p: DoctorProfile) {
  try { localStorage.setItem(KEYS.profile, JSON.stringify(p)); } catch {}
}

// ── Patients récents ──────────────────────────────────────────────────────────

export type RecentPatient = {
  nom: string;
  age?: string;
  dateNaissance?: string;
  sexe?: string;
  poids?: string;
  lastUsed: string;
};

export function readRecentPatients(): RecentPatient[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(KEYS.recentPatients);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function pushRecentPatient(p: RecentPatient) {
  try {
    const cur = readRecentPatients().filter((x) => x.nom.toLowerCase() !== p.nom.toLowerCase());
    const next = [{ ...p, lastUsed: new Date().toISOString() }, ...cur].slice(0, 5);
    localStorage.setItem(KEYS.recentPatients, JSON.stringify(next));
  } catch {}
}

// ── Numérotation séquentielle ORD-YYYY-NNN ───────────────────────────────────

export function nextOrdonnanceNumber(): string {
  if (typeof window === "undefined") return "ORD-0000-001";
  const year = new Date().getFullYear();
  const key = `${KEYS.counterPrefix}${year}`;
  try {
    const cur = parseInt(localStorage.getItem(key) || "0", 10) || 0;
    const next = cur + 1;
    localStorage.setItem(key, String(next));
    return `ORD-${year}-${String(next).padStart(3, "0")}`;
  } catch {
    return `ORD-${year}-001`;
  }
}

// ── Médicaments prescrits ─────────────────────────────────────────────────────

export type Frequence = "jour" | "semaine" | "mois";
export type DureeUnite = "jours" | "semaines" | "mois";
export type Voie = "orale" | "IV" | "SC" | "IM" | "topique" | "inhalée" | "autre";
export type Forme = "Comprimé" | "Gélule" | "Sirop" | "Solution injectable" | "Patch" | "Pommade / Crème" | "Inhalateur" | "Autre";

export type MedicamentRx = {
  id: number;
  nom: string;
  dci?: string;
  forme: Forme | "";
  dosage: string;
  dosagesDisponibles?: string[];
  voie: Voie | "";
  quantite: string; // ex. "1 comprimé"
  frequenceNombre: string; // ex. "2"
  frequenceUnite: Frequence;
  dureeValeur: string;
  dureeUnite: DureeUnite;
  dureeChronique: boolean;
  instructions: string;
  nonSubstituable: boolean;
  renouvelable: boolean;
  renouvellements: string;
};

export function emptyMedRx(id: number): MedicamentRx {
  return {
    id, nom: "", dci: "", forme: "", dosage: "", dosagesDisponibles: [], voie: "",
    quantite: "1 comprimé", frequenceNombre: "1", frequenceUnite: "jour",
    dureeValeur: "7", dureeUnite: "jours", dureeChronique: false,
    instructions: "", nonSubstituable: false, renouvelable: false, renouvellements: "1",
  };
}

export function posologieLabel(m: MedicamentRx): string {
  return `${m.quantite} — ${m.frequenceNombre} fois par ${m.frequenceUnite}`;
}

export function dureeLabel(m: MedicamentRx): string {
  if (m.dureeChronique) return "Traitement chronique (sans limite de durée)";
  return `${m.dureeValeur} ${m.dureeUnite}`;
}

// ── Historique des ordonnances ────────────────────────────────────────────────

export type OrdonnanceType = "simple" | "securisee" | "exception";

export type SavedOrdonnance = {
  id: string;
  numero: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  type: OrdonnanceType;
  validite: string;
  patient: {
    nom: string;
    age?: string;
    dateNaissance?: string;
    sexe?: string;
    poids?: string;
    motif?: string;
  };
  meds: MedicamentRx[];
  suiviActif: boolean;
};

export function readHistory(): SavedOrdonnance[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(KEYS.history);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveToHistory(o: SavedOrdonnance) {
  try {
    const cur = readHistory();
    localStorage.setItem(KEYS.history, JSON.stringify([o, ...cur].slice(0, 500)));
  } catch {}
}

export function deleteFromHistory(id: string) {
  try {
    const cur = readHistory().filter((o) => o.id !== id);
    localStorage.setItem(KEYS.history, JSON.stringify(cur));
  } catch {}
}

// ── Âge depuis date de naissance ──────────────────────────────────────────────

export function ageFromDateNaissance(iso: string): string {
  if (!iso) return "";
  const dob = new Date(iso);
  if (isNaN(dob.getTime())) return "";
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
  if (years < 0) return "";
  if (years < 2) {
    let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (now.getDate() < dob.getDate()) months--;
    return `${Math.max(months, 0)} mois`;
  }
  return `${years} ans`;
}

// ── Recherche médicaments — API medicaments-api.giygas.dev ───────────────────

export type MedicamentSuggestion = {
  nom: string;
  dci?: string;
  forme?: string;
  dosages?: string[];
};

const ACCENTS: Record<string, string> = {
  á: "a", à: "a", â: "a", ä: "a", ã: "a",
  é: "e", è: "e", ê: "e", ë: "e",
  í: "i", ì: "i", î: "i", ï: "i",
  ó: "o", ò: "o", ô: "o", ö: "o", õ: "o",
  ú: "u", ù: "u", û: "u", ü: "u",
  ç: "c", ñ: "n",
};

export function stripAccents(s: string): string {
  return s
    .toLowerCase()
    .split("")
    .map((c) => ACCENTS[c] ?? c)
    .join("");
}

export async function searchMedicaments(query: string): Promise<MedicamentSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const res = await fetch(`https://medicaments-api.giygas.dev/v1/medicaments?search=${encodeURIComponent(q)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list: unknown[] = Array.isArray(data) ? data : (data?.results || data?.data || []);
    const qNorm = stripAccents(q);
    const out: MedicamentSuggestion[] = list
      .map((item): MedicamentSuggestion | null => {
        if (!item || typeof item !== "object") return null;
        const o = item as Record<string, unknown>;
        const nom = (o.nom || o.name || o.denomination || o.libelle) as string | undefined;
        if (!nom) return null;
        const dci = (o.dci || o.substance || o.principe_actif || o.genericName) as string | undefined;
        const forme = (o.forme || o.form || o.formePharmaceutique) as string | undefined;
        let dosages: string[] | undefined;
        if (Array.isArray(o.dosages)) dosages = o.dosages.map(String);
        else if (typeof o.dosage === "string") dosages = [o.dosage];
        return { nom, dci, forme, dosages };
      })
      .filter((x): x is MedicamentSuggestion => x !== null)
      .filter((x) => stripAccents(x.nom).includes(qNorm) || (x.dci && stripAccents(x.dci).includes(qNorm)))
      .slice(0, 10);
    return out;
  } catch {
    return [];
  }
}

// ── Vérification d'interactions — OpenFDA (aide indicative uniquement) ───────

export type InteractionResult = "interaction" | "aucune" | "indisponible";

export async function checkInteraction(drugA: string, drugB: string): Promise<InteractionResult> {
  if (!drugA.trim() || !drugB.trim()) return "indisponible";
  try {
    const a = encodeURIComponent(drugA.trim().toLowerCase());
    const b = encodeURIComponent(drugB.trim().toLowerCase());
    const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${a}+AND+drug_interactions:${b}&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.status === 404) return "aucune";
    if (!res.ok) return "indisponible";
    const data = await res.json();
    if (data?.results?.length > 0) return "interaction";
    return "aucune";
  } catch {
    return "indisponible";
  }
}

// ── WhatsApp / presse-papiers ─────────────────────────────────────────────────

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildSummaryText(o: {
  numero: string; date: string; patient: { nom: string; age?: string; motif?: string };
  meds: MedicamentRx[];
}): string {
  const lines = [
    `Ordonnance ${o.numero} — ${new Date(o.date).toLocaleDateString("fr-FR")}`,
    `Patient : ${o.patient.nom}${o.patient.age ? ` (${o.patient.age})` : ""}`,
  ];
  if (o.patient.motif) lines.push(`Motif : ${o.patient.motif}`);
  lines.push("", "Rp/");
  o.meds.forEach((m, i) => {
    lines.push(`${i + 1}. ${m.nom}${m.dosage ? ` ${m.dosage}` : ""} — ${posologieLabel(m)}, ${dureeLabel(m)}`);
    if (m.instructions) lines.push(`   ${m.instructions}`);
  });
  lines.push("", "Généré via PharmaVig.ma");
  return lines.join("\n");
}
