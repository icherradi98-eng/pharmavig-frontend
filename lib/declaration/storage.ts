import type { FormData, MedicamentConcomitant } from "./types";
import { DRAFT_KEY, PREFILL_KEY } from "./constants";

export function readDraft(): { form: FormData; step: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return null;
    const { form: savedForm, step: savedStep } = JSON.parse(saved);
    return { form: savedForm, step: savedStep || 1 };
  } catch {
    return null;
  }
}

export function saveDraft(form: FormData, step: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step }));
  } catch {}
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

export function readPrefill(): Partial<FormData> | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(PREFILL_KEY);
    if (!saved) return null;
    sessionStorage.removeItem(PREFILL_KEY);
    const raw = JSON.parse(saved) as Partial<FormData> & { medicamentConcomitantNom?: string };
    // Transformer medicamentConcomitantNom → première entrée medicamentsConcomitants
    if (raw.medicamentConcomitantNom) {
      const concomitant: MedicamentConcomitant = {
        id: Date.now(),
        nom: raw.medicamentConcomitantNom,
        posologieDose: "",
        posologieUnite: "mg",
        posologieFrequence: "1×/jour",
        indication: "",
        arretAvantEI: false,
        suspectSecondaire: true,
      };
      raw.medicamentsConcomitants = [concomitant];
      delete raw.medicamentConcomitantNom;
    }
    return raw;
  } catch {
    return null;
  }
}
