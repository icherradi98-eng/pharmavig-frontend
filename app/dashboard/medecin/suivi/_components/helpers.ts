import { type PrescriptionOut, type CheckInOut } from "@/lib/api";
import { MEDDRA_TERMS } from "@/lib/meddraTerms";
import { PREFILL_KEY } from "@/lib/declaration/constants";

// ─── S5.1 : symptôme → SOC MedDRA via la base des 250 termes ────────────────
// Remplace le mappage figé de 20 entrées par une recherche dans meddraTerms.ts

export function symptomToSoc(symptom: string): string {
  if (!symptom) return "";
  const q = symptom.toLowerCase().trim();
  // 1. Correspondance exacte sur le Preferred Term
  const exact = MEDDRA_TERMS.find((t) => t.pt.toLowerCase() === q);
  if (exact) return exact.soc;
  // 2. Le terme MedDRA est contenu dans le symptôme patient (ex. "Maux de tête" → "Céphalées")
  const contained = MEDDRA_TERMS.find((t) => q.includes(t.pt.toLowerCase()));
  if (contained) return contained.soc;
  // 3. Le symptôme patient est contenu dans le terme MedDRA
  const partial = MEDDRA_TERMS.find((t) => t.pt.toLowerCase().includes(q));
  if (partial) return partial.soc;
  return "";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function daysSince(dateStr: string): number {
  return Math.round((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export function daysUntil(dateStr: string): number {
  return Math.round((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

// ─── Calcul du statut patient depuis ses check-ins ───────────────────────────

export type PatientStatus = "alerte" | "en_attente" | "repondu" | "termine";

export function getPatientStatus(
  rx: PrescriptionOut,
  checkins: CheckInOut[]
): PatientStatus {
  if (!rx.monitoring_active || rx.monitoring_ended) return "termine";
  const hasAlert = checkins.some(
    (c) => c.status === "repondu" && (c.severity === "urgent" || c.has_symptoms)
  );
  if (hasAlert) return "alerte";
  const hasPending = checkins.some((c) => c.status === "pending" || c.status === "rappel_envoye");
  if (hasPending) return "en_attente";
  const hasReplied = checkins.some((c) => c.status === "repondu");
  if (hasReplied) return "repondu";
  return "en_attente";
}

// ─── Config visuelle par statut ───────────────────────────────────────────────

export const STATUS_CONFIG: Record<PatientStatus, {
  label: string;
  badge: string;
  row: string;
  icon: string;
  sort: number;
}> = {
  alerte:     { label: "Alerte",      badge: "bg-red-100 text-red-700 border border-red-300",     row: "border-l-4 border-l-red-400",    icon: "🔴", sort: 0 },
  en_attente: { label: "En attente",  badge: "bg-amber-100 text-amber-700 border border-amber-300", row: "border-l-4 border-l-amber-400",  icon: "🟡", sort: 1 },
  repondu:    { label: "Répondu",     badge: "bg-petrol/10 text-petrol border border-petrol/30", row: "border-l-4 border-l-petrol/40", icon: "🟢", sort: 2 },
  termine:    { label: "Terminé",     badge: "bg-gray-100 text-gray-500 border border-gray-200",   row: "border-l-4 border-l-gray-200",   icon: "⚪", sort: 3 },
};

export type SortKey = "urgence" | "date" | "nom";
export type FilterKey = "tous" | "alerte" | "en_attente" | "repondu" | "termine";

// ─── Pré-remplissage d'une déclaration à partir d'un signal patient ──────────
// Partagé entre le tableau de suivi et la fiche prescription.

export function buildSignalPrefill(rx: PrescriptionOut, signal: CheckInOut): Record<string, string> {
  const symptoms = signal.symptoms ?? [];
  let eiMeddraSoc = "";
  for (const s of symptoms) { const soc = symptomToSoc(s); if (soc) { eiMeddraSoc = soc; break; } }
  const symptomsList = symptoms.length ? symptoms.join(", ") : (signal.symptoms_other || "symptômes signalés");
  return {
    medicamentDCI: rx.drug_dci ?? "",
    medicamentPosologie: rx.drug_dose ?? "",
    medicamentFrequence: rx.drug_frequence ?? "",
    medicamentIndication: rx.indication ?? "",
    medicamentDateDebut: rx.date_debut ?? "",
    patientAge: rx.patient_age ?? "",
    patientSexe: rx.patient_sexe ?? "",
    eiDescription: `Le patient ${rx.patient_initiales} signale : ${symptomsList}, à J${signal.day_offset ?? "?"} du traitement par ${rx.drug_dci}.${signal.stopped_treatment ? " Traitement arrêté par le patient." : ""}`,
    eiMeddraSoc,
    eiDateDebut: signal.responded_at ? signal.responded_at.slice(0, 10) : "",
  };
}

/** Écrit le pré-remplissage en sessionStorage (lu par le formulaire de déclaration). */
export function writeSignalPrefill(rx: PrescriptionOut, signal: CheckInOut): void {
  try { sessionStorage.setItem(PREFILL_KEY, JSON.stringify(buildSignalPrefill(rx, signal))); } catch {}
}
