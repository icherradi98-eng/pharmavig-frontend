"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  autocomplete, getRecentSearches, pushRecentSearch, slugify,
  QUICK_ACCESS_MOLECULES, type Suggestion,
} from "@/lib/drugApi";

export default function MedicamentsSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [recents, setRecents] = useState<string[]>(() => getRecentSearches());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setOpen(true);
    debounceRef.current = setTimeout(async () => {
      const results = await autocomplete(value);
      setSuggestions(results);
      setLoading(false);
    }, 300);
  }

  function goTo(name: string) {
    pushRecentSearch(name);
    setRecents(getRecentSearches());
    setOpen(false);
    router.push(`/medicaments/${slugify(name)}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length >= 2) goTo(query.trim());
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-emerald-700">PharmaVig Maroc</Link>
        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-emerald-700">Espace professionnel</Link>
      </header>

      <main className="flex-1 px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Référentiel médicaments</h1>
          <p className="text-gray-500 mb-10">
            Recherchez un médicament pour consulter ses effets indésirables, indications, interactions et les données de pharmacovigilance terrain au Maroc.
          </p>

          <form onSubmit={handleSubmit} className="relative">
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Rechercher un médicament — DCI ou nom commercial (ex. pembrolizumab, Keytruda...)"
              className="w-full border border-gray-300 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            <button type="submit" className="absolute right-2.5 top-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              Rechercher
            </button>

            {open && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden text-left">
                {loading && <div className="px-4 py-3 text-sm text-gray-400">Recherche en cours…</div>}
                {!loading && suggestions.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-400">Aucun résultat — appuyez sur Entrée pour rechercher &quot;{query}&quot;</div>
                )}
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.dci}-${i}`}
                    onMouseDown={() => goTo(s.dci)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <span className="font-medium text-gray-800">{s.dci}</span>
                    {s.brand && <span className="text-gray-400 text-xs">{s.brand}</span>}
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="mt-8">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Molécules courantes</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_ACCESS_MOLECULES.map((m) => (
                <button
                  key={m}
                  onClick={() => goTo(m)}
                  className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {recents.length > 0 && (
            <div className="mt-10 text-left">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Recherches récentes</p>
              <div className="flex flex-wrap gap-2">
                {recents.map((r) => (
                  <button
                    key={r}
                    onClick={() => goTo(r)}
                    className="text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    🕓 {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
