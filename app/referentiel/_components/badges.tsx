"use client";

import type { EditorialStatus } from "@/lib/referentiel/types";
import { editorialStatusMeta } from "@/lib/referentiel/clinical";

const TONE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  neutral: { bg: "rgba(107,114,128,0.1)", color: "#4b5563", border: "rgba(107,114,128,0.25)" },
  info:    { bg: "rgba(15,91,87,0.08)",   color: "#0a3f3c", border: "rgba(15,91,87,0.25)" },
  warning: { bg: "rgba(212,175,55,0.12)", color: "#7a5c00", border: "rgba(212,175,55,0.35)" },
  success: { bg: "rgba(47,168,143,0.12)", color: "#1f8a73", border: "rgba(47,168,143,0.3)" },
};

/** Badge de statut éditorial d'une monographie (draft → published). */
export function EditorialBadge({ status }: { status: EditorialStatus }) {
  const meta = editorialStatusMeta(status);
  const s = TONE_STYLES[meta.tone] ?? TONE_STYLES.neutral;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
      title={meta.isValidated ? "Contenu validé et publié" : "Contenu non validé médicalement"}
    >
      {meta.isValidated ? "✓" : "•"} {meta.label}
    </span>
  );
}

/** Bandeau d'avertissement pour les données de démonstration / non validées. */
export function ClinicalDisclaimer({ isDemo, isValidated }: { isDemo: boolean; isValidated: boolean }) {
  if (isValidated && !isDemo) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 flex items-start gap-3 text-xs leading-relaxed"
      style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)" }}
    >
      <span className="shrink-0 text-sm">⚠️</span>
      <span style={{ color: "#7a5c00" }}>
        {isDemo
          ? "Données de démonstration — non validées médicalement. Ne pas utiliser pour la décision clinique. "
          : "Contenu en cours de relecture — non encore validé. "}
        Ces informations sont fournies à titre indicatif et seront vérifiées par un médecin et un pharmacien avant publication.
      </span>
    </div>
  );
}
