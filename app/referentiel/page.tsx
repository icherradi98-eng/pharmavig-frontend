"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { slugify } from "@/lib/drugApi";
import {
  searchReferentiel, listTherapeuticClasses, clinicalStats,
  type ReferentielEntry,
} from "@/lib/referentiel/clinical";
import { referentielStats } from "@/lib/referentiel/index";
import { EditorialBadge } from "./_components/badges";

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  princeps: "Princeps", generic: "Générique", biosimilar: "Biosimilaire",
  hybrid: "Hybride", unknown: "—",
};

export default function ReferentielBrowse() {
  const [query, setQuery] = useState("");
  const [therapeuticClass, setTherapeuticClass] = useState<string | null>(null);
  const [onlyWithMonograph, setOnlyWithMonograph] = useState(false);

  const classes = useMemo(() => listTherapeuticClasses(), []);
  const results = useMemo(
    () => searchReferentiel({ query, therapeuticClass, onlyWithMonograph, limit: 80 }),
    [query, therapeuticClass, onlyWithMonograph]
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/medicaments" className="font-bold text-lg text-petrol">MAIA DAWA — Référentiel</Link>
        <Link href="/medicaments" className="text-sm font-medium text-gray-600 hover:text-petrol">Recherche classique →</Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-night">Référentiel médicament marocain</h1>
          <p className="text-sm text-gray-500 mt-1">
            {referentielStats.products} spécialités · {referentielStats.substances} substances actives · {clinicalStats.monographs} monographie{clinicalStats.monographs > 1 ? "s" : ""} clinique{clinicalStats.monographs > 1 ? "s" : ""} (en construction)
          </p>
        </div>

        {/* Barre de recherche + filtres */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 space-y-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom commercial ou DCI…"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-petrol"
          />
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
        </div>

        <p className="text-xs text-gray-400 mb-3">{results.length} résultat{results.length > 1 ? "s" : ""}{results.length >= 80 ? "+ (affinez la recherche)" : ""}</p>

        {/* Résultats */}
        <div className="space-y-2">
          {results.map((r) => <ResultRow key={r.product_id} entry={r} />)}
          {results.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-night font-semibold">Aucun médicament trouvé</p>
              <p className="text-sm text-gray-400 mt-1">Essayez un autre terme ou élargissez les filtres.</p>
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
