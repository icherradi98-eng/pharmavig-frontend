"use client";

import { useState, useRef, useCallback } from "react";
import { autocomplete, fetchAnsm, type Suggestion } from "@/lib/drugApi";
import { mapVoie, mapForme } from "@/lib/declaration/mappers";

export type DrugEnrichment = {
  dci: string;
  nomCommercial: string;
  forme: string;
  voie: string;
  laboratoire: string;
};

export function MedicamentSearch({ onSelect }: { onSelect: (e: DrugEnrichment) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enriched, setEnriched] = useState<DrugEnrichment | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await autocomplete(q);
      setSuggestions(res);
      setOpen(res.length > 0);
    }, 300);
  }, []);

  async function select(s: Suggestion) {
    setOpen(false);
    setQuery(s.brand ? `${s.dci} (${s.brand})` : s.dci);
    setSuggestions([]);
    setEnriching(true);
    setEnriched(null);

    const enrichment: DrugEnrichment = {
      dci: s.dci,
      nomCommercial: s.brand ?? "",
      forme: "",
      voie: "",
      laboratoire: "",
    };

    // 1. BDPM — source française prioritaire
    try {
      const bdpm = await fetchAnsm(s.dci);
      if (bdpm) {
        if (bdpm.forme) enrichment.forme = mapForme(bdpm.forme);
        if (bdpm.voies?.[0]) enrichment.voie = mapVoie(bdpm.voies[0]);
        if (bdpm.denomination && !enrichment.nomCommercial) enrichment.nomCommercial = bdpm.denomination;
      }
    } catch {}

    // 2. Enrichissement complémentaire via référentiel local si BDPM insuffisant
    if (!enrichment.voie || !enrichment.forme || !enrichment.nomCommercial) {
      try {
        const { searchProducts, getProductView } = await import("@/lib/referentiel/index");
        const results = searchProducts(s.dci, 1);
        if (results.length > 0) {
          const view = getProductView(results[0].id);
          if (view) {
            if (!enrichment.forme && view.presentation?.pharmaceutical_form)
              enrichment.forme = mapForme(view.presentation.pharmaceutical_form);
            if (!enrichment.voie && view.presentation?.route)
              enrichment.voie = mapVoie(view.presentation.route);
            if (!enrichment.laboratoire && view.product.lab_name)
              enrichment.laboratoire = view.product.lab_name;
            if (!enrichment.nomCommercial && view.product.brand_name)
              enrichment.nomCommercial = view.product.brand_name;
          }
        }
      } catch {}
    }

    setEnriched(enrichment);
    setEnriching(false);
    onSelect(enrichment);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); search(e.target.value); setEnriched(null); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Tapez une DCI ou un nom commercial (ex. Opdivo, nivolumab, metformine...)"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {enriching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {open && suggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => select(s)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50 text-left transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">{s.dci}</span>
                {s.brand && <span className="text-xs text-gray-400 ml-2 truncate max-w-[180px]">{s.brand}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {enriched && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-800">
          <span>💊 <strong>DCI :</strong> {enriched.dci}</span>
          {enriched.nomCommercial && <span><strong>Marque :</strong> {enriched.nomCommercial}</span>}
          {enriched.voie && <span><strong>Voie :</strong> {enriched.voie}</span>}
          {enriched.forme && <span><strong>Forme :</strong> {enriched.forme}</span>}
          {enriched.laboratoire && <span><strong>Labo :</strong> {enriched.laboratoire}</span>}
          <span className="text-emerald-600 ml-auto">✓ Champs pré-remplis depuis le référentiel</span>
        </div>
      )}
    </div>
  );
}
