// ─────────────────────────────────────────────────────────────────────────────
// Stockage local de la relecture des monographies (médecin).
//
// Les monographies sont dans un JSON versionné : l'interface de relecture ne peut
// pas écrire le fichier. On mémorise donc la relecture en localStorage, puis on
// l'EXPORTE pour application dans les données (changement de statut éditorial).
// 100% client-side, sans backend. Migration-ready : structure proche d'une future
// table `monograph_reviews`.
// ─────────────────────────────────────────────────────────────────────────────

const STORE_KEY = "pharmavig_monograph_review_v1";

export type ReviewDecision = "pending" | "validated" | "needs_changes";

export type FieldReview = {
  ok: boolean;
  correction: string;
};

export type MonographReview = {
  monograph_id: string;
  dci: string;
  reviewer: string;
  decision: ReviewDecision;
  fields: Record<string, FieldReview>;
  general_note: string;
  updated_at: string;
};

type ReviewMap = Record<string, MonographReview>;

function readAll(): ReviewMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") as ReviewMap;
  } catch {
    return {};
  }
}

function writeAll(map: ReviewMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(map));
  } catch {
    /* quota / mode privé : on ignore silencieusement */
  }
}

export function getReview(monographId: string): MonographReview | null {
  return readAll()[monographId] ?? null;
}

export function getAllReviews(): MonographReview[] {
  return Object.values(readAll());
}

export function saveReview(review: MonographReview): void {
  const map = readAll();
  map[review.monograph_id] = { ...review, updated_at: new Date().toISOString() };
  writeAll(map);
}

export function deleteReview(monographId: string): void {
  const map = readAll();
  delete map[monographId];
  writeAll(map);
}

/** Crée un objet de relecture vide pour une monographie. */
export function emptyReview(monographId: string, dci: string, reviewer = ""): MonographReview {
  return {
    monograph_id: monographId,
    dci,
    reviewer,
    decision: "pending",
    fields: {},
    general_note: "",
    updated_at: new Date().toISOString(),
  };
}

/** Progression d'une relecture : champs marqués OK / total champs relus. */
export function reviewProgress(review: MonographReview | null, totalFields: number): { ok: number; total: number } {
  if (!review) return { ok: 0, total: totalFields };
  const ok = Object.values(review.fields).filter((f) => f.ok).length;
  return { ok, total: totalFields };
}

/**
 * Export structuré de toutes les relectures (pour transmission à l'équipe).
 * Ne renvoie que les fiches effectivement relues (decision ≠ pending ou au moins
 * un champ annoté).
 */
export function exportReviews(): {
  exported_at: string;
  reviews: MonographReview[];
} {
  const reviews = getAllReviews().filter(
    (r) =>
      r.decision !== "pending" ||
      r.general_note.trim() ||
      Object.values(r.fields).some((f) => f.ok || f.correction.trim())
  );
  return { exported_at: new Date().toISOString(), reviews };
}

/** Résumé lisible (markdown) d'une relecture exportée — à coller/transmettre. */
export function reviewsToMarkdown(data: ReturnType<typeof exportReviews>, fieldLabels: Record<string, string>): string {
  const L: string[] = [];
  L.push(`# Relecture monographies — MAI DAWA`);
  L.push(`Exporté le ${new Date(data.exported_at).toLocaleString("fr-FR")}`);
  L.push(`${data.reviews.length} fiche(s) relue(s)`);
  L.push("");
  for (const r of data.reviews) {
    const decision =
      r.decision === "validated" ? "✅ Validée médecin"
      : r.decision === "needs_changes" ? "✏️ Corrections demandées"
      : "⏳ En cours";
    L.push(`## ${r.dci} — ${decision}`);
    if (r.reviewer) L.push(`Relecteur : ${r.reviewer}`);
    const corrections = Object.entries(r.fields).filter(([, f]) => f.correction.trim());
    if (corrections.length) {
      L.push(`Corrections :`);
      for (const [field, f] of corrections) {
        L.push(`- **${fieldLabels[field] ?? field}** : ${f.correction.trim()}`);
      }
    }
    const okFields = Object.entries(r.fields).filter(([, f]) => f.ok).map(([k]) => fieldLabels[k] ?? k);
    if (okFields.length) L.push(`Champs validés : ${okFields.join(", ")}`);
    if (r.general_note.trim()) L.push(`Note générale : ${r.general_note.trim()}`);
    L.push("");
  }
  return L.join("\n");
}
