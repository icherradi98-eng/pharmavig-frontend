"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { slugify } from "@/lib/drugApi";
import {
  searchReferentiel, listTherapeuticClasses, clinicalStats,
  getPilotPrioritySubstances, getHighRiskSubstances, getSubstancesToEnrich,
  getMonographBySubstanceId,
  type ReferentielEntry,
} from "@/lib/referentiel/clinical";
import type { PilotPrioritySubstance } from "@/lib/referentiel/types";
import { referentielStats } from "@/lib/referentiel/index";
import { EditorialBadge } from "./_components/badges";

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  princeps: "Princeps", generic: "Générique", biosimilar: "Biosimilaire",
  hybrid: "Hybride", unknown: "—",
};

const PRIORITY_META: Record<string, { label: string; bg: string; color: string }> = {
  high:   { label: "Priorité haute",   bg: "rgba(192,57,43,0.1)",  color: "#C0392B" },
  medium: { label: "Priorité moyenne", bg: "rgba(212,175,55,0.15)", color: "#7a5c00" },
  low:    { label: "Priorité basse",   bg: "rgba(107,114,128,0.1)", color: "#6b7280" },
};

type Scope = "all" | "pilot" | "highrisk" | "to_enrich";

const SCOPES: { id: Scope; label: string }[] = [
  { id: "all", label: "Spécialités" },
  { id: "pilot", label: "Prioritaires pilote" },
  { id: "highrisk", label: "Haut risque" },
  { id: "to_enrich", label: "À enrichir" },
];

const norm = (s: string) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export default function ReferentielBrowse() {
  const [scope, setScope] = useState<Scope>("all");
  const [query, setQuery] = useState("");
  const [therapeuticClass, setTherapeuticClass] = useState<string | null>(null);
  const [onlyWithMonograph, setOnlyWithMonograph] = useState(false);

  const classes = useMemo(() => listTherapeuticClasses(), []);

  const productResults = useMemo(
    () => searchReferentiel({ query, therapeuticClass, onlyWithMonograph, limit: 80 }),
    [query, therapeuticClass, onlyWithMonograph]
  );

  const pilotResults = useMemo(() => {
    let list: PilotPrioritySubstance[];
    if (scope === "highrisk") list = getHighRiskSubstances();
    else if (scope === "to_enrich") list = getSubstancesToEnrich();
    else list = getPilotPrioritySubstances();
    if (query.trim().length >= 2) {
      const q = norm(query);
      list = list.filter((p) => norm(p.dci_fr + " " + p.therapeutic_class + " " + p.therapeutic_area).includes(q));
    }
    return list;
  }, [scope, query]);

  const isPilot = scope !== "all";
  const count = isPilot ? pilotResults.length : productResults.length;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/medicaments" className="font-bold text-lg text-petrol">MAIA DAWA — Référentiel</Link>
        <div className="flex items-center gap-4">
          <Link href="/referentiel/relecture" className="text-sm font-medium text-gray-600 hover:text-petrol">Relecture</Link>
          <Link href="/referentiel/avancement" className="text-sm font-medium text-gray-600 hover:text-petrol">Avancement</Link>
          <Link href="/medicaments" className="text-sm font-medium text-gray-600 hover:text-petrol">Recherche classique →</Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 md:px-8 py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-night">Référentiel médicament marocain</h1>
          <p className="text-sm text-gray-500 mt-1">
            {referentielStats.products} spécialités · {referentielStats.substances} substances · {clinicalStats.pilotPriority} DCI prioritaires pilote · {clinicalStats.highRisk} à haut risque · {clinicalStats.monographs} monographie{clinicalStats.monographs > 1 ? "s" : ""} (en construction)
          </p>
        </div>

        {/* Sélecteur de portée */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              onClick={() => setScope(s.id)}
              className="text-sm font-semibold px-3.5 py-1.5 rounded-full border transition-colors"
              style={scope === s.id
                ? { background: "#0F5B57", color: "#fff", borderColor: "#0F5B57" }
                : { background: "#fff", color: "#4b5563", borderColor: "#e5e7eb" }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Barre de recherche + filtres */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 space-y-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isPilot ? "Filtrer par DCI, classe ou aire thérapeutique…" : "Rechercher par nom commercial ou DCI…"}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-petrol"
          />
          {!isPilot && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={therapeuticClass ?? ""}
                onChange={(e) => setTherapeuticClass(e.target.value || null)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-petrol"
              >
                <option value="">Toutes les classes thérapeutiques</option>
                {classes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyWithMonograph}
                  onChange={(e) => setOnlyWithMonograph(e.target.checked)}
                  className="accent-petrol w-4 h-4"
                />
                Avec monographie clinique
              </label>
              {(query || therapeuticClass || onlyWithMonograph) && (
                <button
                  onClick={() => { setQuery(""); setTherapeuticClass(null); setOnlyWithMonograph(false); }}
                  className="ml-auto text-xs text-gray-400 hover:text-gray-600"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          )}
          {scope === "to_enrich" && (
            <p className="text-xs text-gray-500">
              DCI prioritaires sans monographie clinique — cible de l&apos;enrichissement à venir.
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400 mb-3">{count} résultat{count > 1 ? "s" : ""}{!isPilot && count >= 80 ? "+ (affinez la recherche)" : ""}</p>

        {/* Résultats */}
        <div className="space-y-2">
          {isPilot
            ? pilotResults.map((p) => <PilotRow key={p.substance_id} entry={p} />)
            : productResults.map((r) => <ResultRow key={r.product_id} entry={r} />)}
          {count === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-night font-semibold">Aucun résultat</p>
              <p className="text-sm text-gray-400 mt-1">Essayez un autre terme ou changez de portée.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ResultRow({ entry }: { entry: ReferentielEntry }) {
  return (
    <Link
      href={`/medicaments/${slugify(entry.dci.split(" / ")[0] || entry.brand_name)}`}
      className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-petrol/40 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-night truncate">{entry.brand_name}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-petrol/10 text-petrol">
            {PRODUCT_TYPE_LABELS[entry.product_type] ?? entry.product_type}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {entry.dci}{entry.therapeutic_class ? ` · ${entry.therapeutic_class}` : ""}
        </p>
      </div>
      <div className="shrink-0">
        {entry.has_monograph && entry.monograph_status
          ? <EditorialBadge status={entry.monograph_status} />
          : <span className="text-[10.5px] text-gray-400">Pas de fiche clinique</span>}
      </div>
    </Link>
  );
}

function PilotRow({ entry }: { entry: PilotPrioritySubstance }) {
  const mono = getMonographBySubstanceId(entry.substance_id);
  const pr = PRIORITY_META[entry.priority_level] ?? PRIORITY_META.low;
  return (
    <Link
      href={`/referentiel/dci/${slugify(entry.dci_fr)}`}
      className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-petrol/40 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-night truncate">{entry.dci_fr}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: pr.bg, color: pr.color }}>{pr.label}</span>
          {entry.is_high_risk_drug && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#fde8e8", color: "#C0392B" }}>⚠️ Haut risque</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {entry.therapeutic_class} · {entry.therapeutic_area}
        </p>
      </div>
      <div className="shrink-0">
        {mono
          ? <EditorialBadge status={mono.status} />
          : <span className="text-[10.5px] text-gold font-medium">À enrichir</span>}
      </div>
    </Link>
  );
}
