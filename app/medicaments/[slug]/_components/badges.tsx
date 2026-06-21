import type { Source } from "@/lib/referentiel/types";
import { AVAIL_LABELS, VALID_LABELS, type SectionTone } from "../_constants";

// ── Badges standardisés (header : 3 max ; le reste va dans la traçabilité) ────

/** Disponibilité : Disponible / À confirmer / Indisponible / Inconnu. */
export function StatusBadge({ status }: { status: string }) {
  const cfg = AVAIL_LABELS[status] ?? AVAIL_LABELS["needs_review"];
  return <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>;
}

/** Source principale : Maroc / ancienne / externe. */
export function SourceBadge({ source }: { source: Source | undefined }) {
  if (!source) {
    return <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-200">Source non renseignée</span>;
  }
  if (source.country === "MA") {
    const stale = source.source_freshness === "stale";
    return (
      <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${stale ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
        {stale ? `Source Maroc — ancienne${source.source_year ? ` (${source.source_year})` : ""}` : "Source Maroc"}
      </span>
    );
  }
  return <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200">Source externe</span>;
}

/** Validation : Validé / À vérifier. */
export function ValidationBadge({ status }: { status: string }) {
  const cfg = VALID_LABELS[status] ?? VALID_LABELS["needs_review"];
  return <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>;
}

/** Badge discret « Donnée à vérifier » (incohérences détectées). */
export function VerifyBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      ⚠ Donnée à vérifier
    </span>
  );
}

/** Badge « Association » pour les médicaments combinés (> 1 substance active). */
export function CombinationBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-petrol/10 text-petrol border border-petrol/20">
      Association
    </span>
  );
}

// ── Couleurs de risque par section clinique ──────────────────────────────────

export const TONE_STYLES: Record<SectionTone, { accent: string; titleColor: string; chip: string }> = {
  neutral: { accent: "#e5e7eb", titleColor: "#1F2D3D", chip: "bg-gray-50 text-gray-500 border-gray-200" },
  info:    { accent: "rgba(15,91,87,0.3)", titleColor: "#0F5B57", chip: "bg-petrol/5 text-petrol border-petrol/20" },
  orange:  { accent: "#f5c98a", titleColor: "#92700a", chip: "bg-amber-50 text-amber-700 border-amber-200" },
  red:     { accent: "#f3c6c2", titleColor: "#C0392B", chip: "bg-red-50 text-red-700 border-red-200" },
};

/** Petit badge de niveau de risque (réservé aux sections critiques/précaution). */
export function RiskBadge({ tone, label }: { tone: SectionTone; label: string }) {
  const s = TONE_STYLES[tone];
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.chip}`}>{label}</span>;
}
