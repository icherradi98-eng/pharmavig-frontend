"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MedecinLayout, { PageHeader, useUnreadAlertsCount } from "@/components/medecin/MedecinLayout";
import {
  MOCK_ALERTS, MOCK_DECLARATIONS, ALERT_SOURCE_STYLES, ALERT_SEVERITY_STYLES,
  type MockAlertSource, type MockAlertSeverity,
} from "@/lib/mockMedecinData";

const READ_ALERTS_KEY = "pharmavig_medecin_alerts_read";
const SOURCES: MockAlertSource[] = ["CAPM", "EMA", "ANSM", "FDA"];
const SEVERITIES: MockAlertSeverity[] = ["urgent", "important", "info"];

export default function AlertesSecurite() {
  const router = useRouter();
  const unread = useUnreadAlertsCount(MOCK_ALERTS.length);

  const [onlyMine, setOnlyMine] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<MockAlertSource | "">("");
  const [severityFilter, setSeverityFilter] = useState<MockAlertSeverity | "">("");
  const [search, setSearch] = useState("");
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(READ_ALERTS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  function markAsRead(id: string) {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(READ_ALERTS_KEY, JSON.stringify(next));
      return next;
    });
  }

  // Molécules déclarées par le médecin (pour la personnalisation)
  const myMolecules = useMemo(() => {
    const set = new Set<string>();
    MOCK_DECLARATIONS.forEach((d) => set.add(d.drugDci.toLowerCase()));
    return set;
  }, []);

  function concernsMe(molecules: string[]) {
    return molecules.some((m) => myMolecules.has(m.toLowerCase()));
  }

  const filtered = useMemo(() => {
    return MOCK_ALERTS.filter((a) => {
      if (onlyMine && !concernsMe(a.molecules)) return false;
      if (sourceFilter && a.source !== sourceFilter) return false;
      if (severityFilter && a.severity !== severityFilter) return false;
      if (search && !a.molecules.some((m) => m.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyMine, sourceFilter, severityFilter, search]);

  const now = new Date("2026-06-07T09:30:00");
  const nowLabel = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  function declareSimilar(molecule: string, soc: string) {
    try {
      localStorage.setItem("pharmavig_medecin_prefill", JSON.stringify({ drugDci: molecule, meddraSoc: soc }));
    } catch {}
    router.push("/dashboard/medecin/nouvelle-declaration");
  }

  return (
    <MedecinLayout unreadAlerts={unread}>
      <PageHeader title="Alertes sécurité" subtitle="Veille réglementaire personnalisée — CAPM, EMA, ANSM, FDA" />

      <div className="px-5 md:px-8 py-6 space-y-5">
        {/* Filtres */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setOnlyMine(true)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${onlyMine ? "bg-emerald-600 text-white" : "text-gray-600"}`}
              >
                Mes molécules seulement
              </button>
              <button
                onClick={() => setOnlyMine(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!onlyMine ? "bg-emerald-600 text-white" : "text-gray-600"}`}
              >
                Toutes les alertes
              </button>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une molécule..."
              className="flex-1 min-w-40 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 self-center mr-1">Source :</span>
            {SOURCES.map((s) => (
              <button key={s} onClick={() => setSourceFilter(sourceFilter === s ? "" : s)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${sourceFilter === s ? ALERT_SOURCE_STYLES[s] : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                {s}
              </button>
            ))}
            <span className="text-xs text-gray-400 self-center ml-3 mr-1">Gravité :</span>
            {SEVERITIES.map((s) => (
              <button key={s} onClick={() => setSeverityFilter(severityFilter === s ? "" : s)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${severityFilter === s ? ALERT_SEVERITY_STYLES[s].chip : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
                {ALERT_SEVERITY_STYLES[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste / empty state */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <span className="text-3xl">✅</span>
            <p className="text-gray-700 font-medium mt-3">Aucune alerte en cours pour vos molécules habituelles.</p>
            <p className="text-gray-400 text-sm mt-1">Dernière vérification : aujourd&apos;hui à {nowLabel}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((a) => {
              const isRead = readIds.includes(a.id);
              const sevStyle = ALERT_SEVERITY_STYLES[a.severity];
              const concerned = concernsMe(a.molecules);
              const date = new Date(a.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
              return (
                <div
                  key={a.id}
                  onMouseEnter={() => markAsRead(a.id)}
                  className={`bg-white border border-gray-200 border-l-4 ${sevStyle.border} rounded-xl p-5 ${isRead ? "" : "ring-1 ring-emerald-100"}`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ALERT_SOURCE_STYLES[a.source]}`}>{a.source}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sevStyle.chip}`}>{sevStyle.label}</span>
                    {concerned && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Votre molécule
                      </span>
                    )}
                    {!isRead && <span className="w-2 h-2 rounded-full bg-red-500 ml-auto" title="Non lue" />}
                    <span className="text-xs text-gray-400 ml-auto">{date}</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-base mb-1.5">{a.molecules.join(" / ")}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{a.summary}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <a href={a.officialUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-emerald-700 hover:underline">
                      Voir le document officiel →
                    </a>
                    <button
                      onClick={() => declareSimilar(a.molecules[0], a.meddraSoc)}
                      className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Déclarer un cas similaire →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MedecinLayout>
  );
}
