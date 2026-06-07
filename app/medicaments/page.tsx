"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  autocomplete, getRecentSearches, pushRecentSearch, slugify,
  QUICK_ACCESS_MOLECULES, type Suggestion,
} from "@/lib/drugApi";
import { ALERT_SOURCE_STYLES, ALERT_SEVERITY_STYLES, type MockAlertSource, type MockAlertSeverity } from "@/lib/mockMedecinData";

const STAT_BADGES = ["15 247 médicaments indexés", "Mise à jour quotidienne", "Sources : ANSM · BDPM · PharmaVig"];

type RecentAlert = {
  source: MockAlertSource;
  severity: MockAlertSeverity;
  date: string;
  molecule: string;
  summary: string;
};

const RECENT_ALERTS: RecentAlert[] = [
  {
    source: "EMA", severity: "urgent", date: "15/05/2026", molecule: "Pembrolizumab",
    summary: "Nouveau signal de myocardite immune sévère en association avec chimiothérapie à base de platine.",
  },
  {
    source: "ANSM", severity: "important", date: "02/05/2026", molecule: "Méthotrexate",
    summary: "Rappel des règles de prescription hebdomadaire. 12 cas de surdosage accidentel rapportés en France.",
  },
  {
    source: "CAPM", severity: "info", date: "28/04/2026", molecule: "Tramadol",
    summary: "Mise à jour du RCP marocain. Nouvelles contre-indications chez l'enfant de moins de 12 ans.",
  },
];

type TopDrug = { dci: string; classe: string; declarations: number; alerteActive?: boolean };

const TOP_DRUGS: TopDrug[] = [
  { dci: "Pembrolizumab", classe: "Immunothérapie anti-PD-1", declarations: 12, alerteActive: true },
  { dci: "Metformine", classe: "Antidiabétique biguanide", declarations: 8 },
  { dci: "Amoxicilline", classe: "Antibiotique pénicilline", declarations: 15 },
  { dci: "Méthotrexate", classe: "Immunosuppresseur / Chimiothérapie", declarations: 6, alerteActive: true },
  { dci: "Amlodipine", classe: "Inhibiteur calcique", declarations: 4 },
  { dci: "Ibuprofène", classe: "Anti-inflammatoire AINS", declarations: 11 },
];

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

      <main className="flex-1">
        {/* ---- Hero / recherche (inchangé) ---- */}
        <div className="px-6 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Référentiel médicaments</h1>
            <p className="text-gray-500 mb-3">
              15 000+ molécules · Données ANSM en français · Signaux terrain marocains
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {STAT_BADGES.map((b) => (
                <span key={b} className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {b}
                </span>
              ))}
            </div>

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
        </div>

        {/* ---- Alertes de sécurité récentes ---- */}
        <div className="border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-12 md:py-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Alertes de sécurité récentes</h2>
              <Link href="/dashboard/medecin/alertes" className="text-sm font-semibold text-emerald-700 hover:underline shrink-0">
                Voir toutes les alertes →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {RECENT_ALERTS.map((a, i) => {
                const sev = ALERT_SEVERITY_STYLES[a.severity];
                return (
                  <div key={i} className={`bg-white border border-gray-200 border-l-4 ${sev.border} rounded-xl p-4 flex flex-col`}>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ALERT_SOURCE_STYLES[a.source]}`}>{a.source}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sev.chip}`}>{sev.label}</span>
                      <span className="text-xs text-gray-400 ml-auto">{a.date}</span>
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">{a.molecule}</p>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3 flex-1">{a.summary}</p>
                    <Link href={`/medicaments/${slugify(a.molecule)}`} className="text-sm font-medium text-emerald-700 hover:underline">
                      Voir la fiche →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---- Médicaments les plus consultés ---- */}
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 py-12 md:py-14">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Médicaments les plus consultés</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {TOP_DRUGS.map((d) => (
                <Link
                  key={d.dci}
                  href={`/medicaments/${slugify(d.dci)}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col"
                >
                  <p className="font-bold text-gray-900 mb-0.5">{d.dci}</p>
                  <p className="text-xs text-gray-400 mb-3 flex-1">{d.classe}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {d.declarations} déclarations PharmaVig
                    </span>
                    {d.alerteActive && (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        ⚠️ Alerte active
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ---- CTA professionnel ---- */}
        <div className="border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-12 md:py-14">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-6 md:py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900 text-lg">Vous avez observé un effet indésirable ?</p>
                <p className="text-sm text-gray-500 mt-1">Contribuez à la pharmacovigilance nationale en moins de 5 minutes.</p>
              </div>
              <Link
                href="/declarer"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shrink-0"
              >
                Déclarer un cas →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
