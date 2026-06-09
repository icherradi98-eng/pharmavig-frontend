"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MedecinLayout, { PageHeader, SectionCard, useUnreadAlertsCount } from "@/components/medecin/MedecinLayout";
import { COMMON_MOLECULES } from "@/lib/mockMedecinData";
import { api } from "@/lib/api";

const WATCHLIST_KEY = "pharmavig_medecin_watchlist";
const DEFAULT_WATCHLIST: string[] = [];

export default function MesMolecules() {
  const unread = useUnreadAlertsCount(0);
  const [declaredMolecules, setDeclaredMolecules] = useState<string[]>([]);

  useEffect(() => {
    api.getMyStats()
      .then((s) => setDeclaredMolecules(s.molecules))
      .catch(() => {});
  }, []);

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return DEFAULT_WATCHLIST;
    try {
      const saved = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "null");
      return saved ?? DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  });
  const [query, setQuery] = useState("");
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  function persist(next: string[]) {
    setWatchlist(next);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  }

  function addMolecule(name: string) {
    if (watchlist.includes(name)) return;
    persist([...watchlist, name]);
    setQuery("");
  }

  function removeMolecule(name: string) {
    persist(watchlist.filter((m) => m !== name));
  }

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return COMMON_MOLECULES.filter(
      (m) => m.toLowerCase().includes(query.toLowerCase()) && !watchlist.includes(m)
    ).slice(0, 6);
  }, [query, watchlist]);

  // Molécules détectées automatiquement depuis les déclarations réelles
  const detected = useMemo(
    () => declaredMolecules.filter((m) => !watchlist.includes(m)),
    [declaredMolecules, watchlist]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function moleculeStats(_name: string) {
    // Sera alimenté par l'API alertes_securite (Railway/Supabase) — pas de mock
    return { lastAlert: null };
  }

  return (
    <MedecinLayout unreadAlerts={unread}>
      <PageHeader title="Mes molécules" subtitle="Configurez votre liste de surveillance — elle alimente vos alertes personnalisées et vos comparatifs" />

      <div className="px-5 md:px-8 py-6 space-y-6">
        <SectionCard title="Ajouter une molécule à surveiller">
          <div className="relative max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une DCI (ex. pembrolizumab, méthotrexate...)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
                {suggestions.map((m) => (
                  <button
                    key={m}
                    onClick={() => addMolecule(m)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {watchlist.length === 0 && <p className="text-sm text-gray-400">Aucune molécule surveillée pour le moment.</p>}
            {watchlist.map((m) => {
              const { lastAlert } = moleculeStats(m);
              const open = openPopover === m;
              return (
                <div key={m} className="relative">
                  <button
                    onClick={() => setOpenPopover(open ? null : m)}
                    className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium pl-3 pr-2 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                  >
                    {m}
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); removeMolecule(m); }}
                      className="text-emerald-400 hover:text-red-500 font-bold px-1"
                    >
                      ✕
                    </span>
                  </button>
                  {open && (
                    <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm">
                      <p className="text-gray-500 text-xs mb-1">Dernière alerte</p>
                      <p className="font-semibold text-gray-900 mb-3">
                        {"Aucune"}
                      </p>
                      <Link href="/dashboard/medecin/alertes" className="text-emerald-700 font-medium hover:underline text-xs">
                        Voir les alertes →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {detected.length > 0 && (
          <SectionCard title="Molécules détectées depuis vos déclarations">
            <p className="text-xs text-gray-400 mb-3">Ces molécules apparaissent dans vos déclarations soumises mais ne sont pas encore dans votre liste de surveillance.</p>
            <div className="flex flex-wrap gap-2">
              {detected.map((m) => (
                <div key={m} className="flex items-center gap-2 bg-gray-100 text-gray-600 text-sm pl-3 pr-1 py-1.5 rounded-full">
                  {m}
                  <button
                    onClick={() => addMolecule(m)}
                    className="text-xs font-semibold bg-white border border-gray-300 text-emerald-700 px-2 py-0.5 rounded-full hover:bg-emerald-50 transition-colors"
                  >
                    + Ajouter
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </MedecinLayout>
  );
}
