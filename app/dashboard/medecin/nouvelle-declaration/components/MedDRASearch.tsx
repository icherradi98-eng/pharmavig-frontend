"use client";

import { useState } from "react";
import { MEDDRA_TERMS, type MedDRATerm } from "@/lib/meddraTerms";

export function MedDRASearch({ value, code, soc, onChange }: {
  value: string;
  code: string;
  soc: string;
  onChange: (term: string, code: string, soc: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  const filtered = query.length >= 2
    ? MEDDRA_TERMS.filter((t) => t.pt.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  function select(t: MedDRATerm) {
    setQuery(t.pt);
    onChange(t.pt, t.code, t.soc);
    setOpen(false);
  }

  function handleBlur() {
    setTimeout(() => setOpen(false), 150);
    if (!code) onChange(query, "", "");
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value, "", ""); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder="Ex : Nausées, Urticaire, Insuffisance rénale aiguë..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {filtered.map((t) => (
            <button
              key={t.code}
              type="button"
              onMouseDown={() => select(t)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50 text-left transition-colors"
            >
              <div>
                <span className="text-sm font-medium text-gray-900">{t.pt}</span>
                <span className="ml-2 text-xs text-gray-400">{t.soc}</span>
              </div>
              <span className="text-xs font-mono text-gray-300">{t.code}</span>
            </button>
          ))}
        </div>
      )}
      {code && (
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">PT MedDRA</span>
          <span className="text-xs text-gray-500">{soc}</span>
          <span className="text-xs font-mono text-gray-400">#{code}</span>
        </div>
      )}
      {query && !code && query.length > 2 && (
        <p className="text-xs text-amber-600 mt-1">⚠️ Terme non codé — sera codé à réception.</p>
      )}
    </div>
  );
}
