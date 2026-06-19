"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { slugify } from "@/lib/drugApi";
import { clinicalData } from "@/lib/referentiel/clinical";
import type { ClinicalMonograph } from "@/lib/referentiel/types";
import {
  getReview, getAllReviews, exportReviews, reviewsToMarkdown,
  type MonographReview,
} from "@/lib/referentiel/reviewStore";
import { REVIEW_FIELDS, FIELD_LABELS } from "./fields";

const DECISION_META: Record<string, { label: string; bg: string; color: string }> = {
  validated:     { label: "Validée médecin",      bg: "rgba(47,168,143,0.12)", color: "#1f8a73" },
  needs_changes: { label: "Corrections demandées", bg: "rgba(212,175,55,0.15)", color: "#7a5c00" },
  pending:       { label: "À relire",              bg: "rgba(107,114,128,0.1)", color: "#6b7280" },
};

export default function RelectureHub() {
  const monographs = clinicalData.monographs as ClinicalMonograph[];
  const [reviews, setReviews] = useState<Record<string, MonographReview | null>>({});
  const [copied, setCopied] = useState(false);

  // Charge l'état de relecture depuis localStorage (système externe, après montage).
  useEffect(() => {
    const map: Record<string, MonographReview | null> = {};
    for (const m of monographs) map[m.id] = getReview(m.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture localStorage post-montage (synchro système externe)
    setReviews(map);
  }, [monographs]);

  const all = getAllReviewsSafe();
  const validated = all.filter((r) => r.decision === "validated").length;
  const needsChanges = all.filter((r) => r.decision === "needs_changes").length;

  function handleExportJson() {
    const data = exportReviews();
    download(`relecture-monographies-${Date.now()}.json`, JSON.stringify(data, null, 2), "application/json");
  }
  function handleCopyMarkdown() {
    const md = reviewsToMarkdown(exportReviews(), FIELD_LABELS);
    navigator.clipboard?.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/referentiel" className="font-bold text-lg text-petrol">MAI DAWA — Relecture</Link>
        <Link href="/referentiel" className="text-sm font-medium text-gray-600 hover:text-petrol">← Référentiel</Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-night">Relecture des monographies</h1>
        <p className="text-sm text-gray-500 mt-1 mb-5 leading-relaxed">
          Relisez chaque fiche champ par champ. Vos validations et corrections sont
          enregistrées <strong>localement sur cet appareil</strong>. Quand vous avez terminé,
          exportez votre relecture et transmettez-la pour application (passage en statut « relu »).
        </p>

        {/* Progression + export */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <Stat label="Total" value={monographs.length} />
            <Stat label="Validées" value={validated} color="#1f8a73" />
            <Stat label="Corrections" value={needsChanges} color="#7a5c00" />
            <Stat label="À relire" value={monographs.length - validated - needsChanges} color="#6b7280" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleCopyMarkdown}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: "#0F5B57" }}>
              {copied ? "✓ Copié" : "Copier ma relecture (texte)"}
            </button>
            <button onClick={handleExportJson}
              className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Télécharger (JSON)
            </button>
          </div>
        </div>

        {/* Liste des fiches */}
        <div className="space-y-2">
          {monographs.map((m) => {
            const r = reviews[m.id];
            const okCount = r ? REVIEW_FIELDS.filter((f) => r.fields[f.key as string]?.ok).length : 0;
            const decision = r?.decision ?? "pending";
            const dm = DECISION_META[decision];
            return (
              <Link key={m.id} href={`/referentiel/relecture/${slugify(m.dci)}`}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-petrol/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-night">{m.dci}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{m.therapeutic_class}</p>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0">{okCount}/{REVIEW_FIELDS.length} champs</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: dm.bg, color: dm.color }}>{dm.label}</span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function getAllReviewsSafe(): MonographReview[] {
  try { return getAllReviews(); } catch { return []; }
}

function Stat({ label, value, color = "#1F2D3D" }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <span className="text-xl font-bold" style={{ color }}>{value}</span>
      <span className="text-xs text-gray-400 ml-1.5">{label}</span>
    </div>
  );
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
