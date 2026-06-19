"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { unslugify, slugify } from "@/lib/drugApi";
import { getMonographByDci } from "@/lib/referentiel/clinical";
import {
  getReview, saveReview, emptyReview,
  type MonographReview, type ReviewDecision,
} from "@/lib/referentiel/reviewStore";
import { EditorialBadge } from "../../_components/badges";
import { REVIEW_FIELDS } from "../fields";

const DECISIONS: { value: ReviewDecision; label: string }[] = [
  { value: "pending", label: "⏳ En cours" },
  { value: "validated", label: "✅ Validée médecin" },
  { value: "needs_changes", label: "✏️ Corrections demandées" },
];

export default function RelectureFiche() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const dciName = unslugify(slug);
  const mono = useMemo(() => getMonographByDci(dciName), [dciName]);

  const [review, setReview] = useState<MonographReview | null>(null);
  const [savedTick, setSavedTick] = useState(false);

  // Charge / initialise la relecture depuis localStorage (système externe, après
  // montage pour éviter tout mismatch d'hydratation SSR).
  useEffect(() => {
    if (!mono) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture localStorage post-montage (synchro système externe)
    setReview(getReview(mono.id) ?? emptyReview(mono.id, mono.dci));
  }, [mono]);

  function persist(next: MonographReview) {
    setReview(next);
    saveReview(next);
    setSavedTick(true);
    setTimeout(() => setSavedTick(false), 1200);
  }

  function setField(key: string, patch: Partial<{ ok: boolean; correction: string }>) {
    if (!review) return;
    const cur = review.fields[key] ?? { ok: false, correction: "" };
    persist({ ...review, fields: { ...review.fields, [key]: { ...cur, ...patch } } });
  }

  if (!mono) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-night font-semibold">Monographie introuvable</p>
          <Link href="/referentiel/relecture" className="text-petrol text-sm font-medium mt-2 inline-block">← Retour à la relecture</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/referentiel/relecture" className="font-bold text-lg text-petrol">MAI DAWA — Relecture</Link>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium transition-opacity ${savedTick ? "opacity-100 text-[#1f8a73]" : "opacity-0"}`}>✓ Enregistré</span>
          <Link href={`/referentiel/dci/${slugify(mono.dci)}`} className="text-sm font-medium text-gray-600 hover:text-petrol">Voir la fiche →</Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 md:px-8 py-8">
        {/* En-tête */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-petrol">{mono.dci}</h1>
              <p className="text-sm text-gray-500 mt-1">{mono.therapeutic_class}</p>
            </div>
            <EditorialBadge status={mono.status} />
          </div>

          {review && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                value={review.reviewer}
                onChange={(e) => persist({ ...review, reviewer: e.target.value })}
                placeholder="Votre nom (relecteur)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol"
              />
              <select
                value={review.decision}
                onChange={(e) => persist({ ...review, decision: e.target.value as ReviewDecision })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-petrol"
              >
                {DECISIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Champs à relire */}
        <div className="space-y-3">
          {review && REVIEW_FIELDS.map(({ key, label }) => {
            const content = (mono[key] as string) || "";
            const fr = review.fields[key as string] ?? { ok: false, correction: "" };
            return (
              <div key={key as string} className="bg-white border rounded-xl p-4" style={{ borderColor: fr.ok ? "rgba(47,168,143,0.4)" : "#e5e7eb" }}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-night">{label}</p>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 cursor-pointer select-none shrink-0">
                    <input type="checkbox" checked={fr.ok} onChange={(e) => setField(key as string, { ok: e.target.checked })} className="accent-[#1f8a73] w-4 h-4" />
                    OK médecin
                  </label>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-2">{content || <span className="text-gray-300 italic">— champ vide —</span>}</p>
                <textarea
                  value={fr.correction}
                  onChange={(e) => setField(key as string, { correction: e.target.value })}
                  placeholder="Correction / remarque (optionnel)…"
                  rows={fr.correction ? 3 : 1}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol resize-y"
                />
              </div>
            );
          })}
        </div>

        {/* Note générale */}
        {review && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mt-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-night mb-1.5">Note générale</p>
            <textarea
              value={review.general_note}
              onChange={(e) => persist({ ...review, general_note: e.target.value })}
              placeholder="Remarque globale sur la fiche…"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol resize-y"
            />
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <Link href="/referentiel/relecture" className="text-sm font-medium text-petrol">← Toutes les fiches</Link>
          <p className="text-xs text-gray-400">Enregistrement automatique (local)</p>
        </div>
      </main>
    </div>
  );
}
