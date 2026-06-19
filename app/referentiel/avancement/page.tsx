"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getReferentielProgress, clinicalStats } from "@/lib/referentiel/clinical";
import { referentielStats } from "@/lib/referentiel/index";

const STATUS_TONE: Record<string, string> = {
  draft: "#6b7280",
  AI_generated: "#7a5c00",
  physician_reviewed: "#0F5B57",
  pharmacist_reviewed: "#0F5B57",
  published: "#1f8a73",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "Haute priorité", medium: "Priorité moyenne", low: "Priorité basse",
};

function Bar({ value, total, color = "#0F5B57" }: { value: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold text-gray-500 w-16 text-right shrink-0">{value}/{total}</span>
    </div>
  );
}

export default function AvancementPage() {
  const p = useMemo(() => getReferentielProgress(), []);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/referentiel" className="font-bold text-lg text-petrol">MAIA DAWA — Référentiel</Link>
        <Link href="/referentiel" className="text-sm font-medium text-gray-600 hover:text-petrol">← Retour au référentiel</Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-night">Avancement du référentiel clinique</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Suivi interne de l&apos;enrichissement des monographies. Aucune fiche n&apos;est publiée tant qu&apos;elle n&apos;est pas relue (médecin puis pharmacien).
        </p>

        {/* Cartes clés */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
          <Kpi label="Spécialités" value={referentielStats.products} />
          <Kpi label="Substances" value={referentielStats.substances} />
          <Kpi label="Monographies" value={`${p.monographs.complete}/${p.monographs.total}`} sub="complètes" />
          <Kpi label="Publiées" value={p.byStatus.find((s) => s.status === "published")?.count ?? 0} sub="validées" accent />
        </div>

        {/* Couverture pilote */}
        <Section title="Couverture des DCI prioritaires (pilote)">
          <div className="mb-4">
            <p className="text-sm font-medium text-night mb-1.5">Total pilote</p>
            <Bar value={p.pilot.covered} total={p.pilot.total} />
          </div>
          {p.byPriority.filter((b) => b.total > 0).map((b) => (
            <div key={b.level} className="mb-3">
              <p className="text-xs text-gray-500 mb-1">{PRIORITY_LABEL[b.level]}</p>
              <Bar value={b.covered} total={b.total} color={b.level === "high" ? "#C0392B" : b.level === "medium" ? "#D4AF37" : "#9ca3af"} />
            </div>
          ))}
        </Section>

        {/* Par statut éditorial */}
        <Section title="Par statut éditorial">
          <div className="space-y-2.5">
            {p.byStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: STATUS_TONE[s.status] }} />
                  {s.label}
                </span>
                <span className="text-sm font-semibold text-night">{s.count}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            Circuit : Brouillon → Généré par IA → Revu médecin → Revu pharmacien → Publié.
            Les {clinicalStats.monographs} fiches actuelles sont en attente de relecture médecin.
          </p>
        </Section>

        {/* Par aire thérapeutique */}
        <Section title="Par aire thérapeutique">
          <div className="space-y-3">
            {p.byArea.map((a) => (
              <div key={a.area}>
                <p className="text-xs text-gray-500 mb-1">{a.area}</p>
                <Bar value={a.covered} total={a.total} />
              </div>
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: accent ? "#1f8a73" : "#1F2D3D" }}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-gold mb-4">{title}</h2>
      {children}
    </div>
  );
}
