/**
 * Stockage de brouillons en localStorage avec expiration automatique (TTL).
 *
 * ⚠️ DEMO_ONLY — Les brouillons de déclaration/ordonnance peuvent contenir des
 * données de santé temporaires. Tant que le stockage backend chiffré n'est pas
 * en place, ces données restent UNIQUEMENT sur l'appareil, ne sont jamais
 * transmises, et sont purgées : (1) à expiration du TTL, (2) à la déconnexion.
 * Ne pas considérer ce mécanisme comme une mesure de conformité.
 */

// Durées de vie par type de brouillon.
export const DRAFT_TTL = {
  /** Déclaration médecin : 7 jours (rédaction parfois étalée). */
  medecin: 7 * 24 * 60 * 60 * 1000,
  /** Déclaration patient : 24 h (usage ponctuel). */
  patient: 24 * 60 * 60 * 1000,
} as const;

type Wrapped<T> = { data: T; created_at: number };

function isWrapped<T>(v: unknown): v is Wrapped<T> {
  return typeof v === "object" && v !== null && "data" in v && "created_at" in v;
}

/** Écrit un brouillon horodaté. */
export function saveDraftTTL<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const wrapped: Wrapped<T> = { data, created_at: Date.now() };
    localStorage.setItem(key, JSON.stringify(wrapped));
  } catch {}
}

/**
 * Lit un brouillon. Retourne null (et purge la clé) s'il a expiré.
 * Rétrocompatible : les brouillons écrits avant l'ajout du TTL (format brut,
 * sans created_at) sont retournés tels quels, sans expiration.
 */
export function readDraftTTL<T>(key: string, ttlMs: number): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isWrapped<T>(parsed)) {
      if (Date.now() - parsed.created_at > ttlMs) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data;
    }
    // Format hérité (pré-TTL) : on le retourne sans expiration.
    return parsed as T;
  } catch {
    return null;
  }
}

// Clés localStorage contenant des données sensibles (santé / patient) à purger
// au logout et via le bouton « Vider les brouillons ».
export const SENSITIVE_KEYS = [
  "pharmavig_medecin_draft",
  "pharmavig_patient_draft",
  "pharmavig_medecin_prefill",
  "pharmavig_ordo_historique",
  "pharmavig_ordo_patients_recents",
] as const;

/** Supprime tous les brouillons et données patient locales. */
export function clearAllDrafts(): void {
  if (typeof window === "undefined") return;
  for (const k of SENSITIVE_KEYS) {
    try { localStorage.removeItem(k); } catch {}
  }
}
