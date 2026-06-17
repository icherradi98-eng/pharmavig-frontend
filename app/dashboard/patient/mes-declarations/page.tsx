"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ReportOut } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  brouillon:     { label: "Brouillon",  bg: "rgba(107,114,128,0.1)",  color: "#6b7280" },
  soumis:        { label: "Soumis",     bg: "rgba(212,175,55,0.15)",  color: "#92700a" },
  transmis_capm: { label: "Transmis",   bg: "rgba(15,91,87,0.1)",     color: "#0F5B57" },
  traite:        { label: "Traité",     bg: "rgba(47,168,143,0.12)",  color: "#1f8a73" },
};

export default function MesDeclarationsPatient() {
  const { logout } = useAuth();
  const [reports, setReports] = useState<ReportOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listReports().then(setReports).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-cream-dark px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/patient" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
          <span className="font-semibold text-night">Mes déclarations</span>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">Déconnexion</button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-night">Mes signalements</h1>
          <Link href="/dashboard/patient/declarer"
            className="bg-petrol hover:bg-petrol-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            + Nouvelle déclaration
          </Link>
        </div>

        {loading && (
          <div className="animate-pulse flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-cream-dark rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-3.5 bg-gray-200 rounded w-40" />
                  <div className="h-4 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="h-2.5 bg-gray-100 rounded w-28" />
              </div>
            ))}
          </div>
        )}

        {!loading && reports.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-cream-dark">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-night font-semibold">Aucun signalement pour l&apos;instant</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">Vous avez ressenti un effet après un médicament ?</p>
            <Link href="/dashboard/patient/declarer"
              className="inline-block bg-petrol hover:bg-petrol-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Faire mon premier signalement →
            </Link>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="flex flex-col gap-3">
            {reports.map((r) => {
              const date = new Date(r.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
              const st = STATUS[r.status] ?? STATUS.soumis;
              return (
                <div key={r.id} className="bg-white border border-cream-dark rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-night">{r.drug_dci || r.drug_nom_commercial || "Médicament non précisé"}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  {r.gravite_serieux && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ background: "#fde8e8", color: "#C0392B" }}>⚡ Grave</span>
                  )}
                  <p className="text-xs text-gray-400 mt-1">📅 {date}</p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
