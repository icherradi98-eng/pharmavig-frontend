"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ReportOut } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  brouillon:     { label: "Brouillon",        color: "bg-gray-100 text-gray-600" },
  soumis:        { label: "Soumis",           color: "bg-blue-100 text-blue-700" },
  transmis_capm: { label: "Transmis au CAPM", color: "bg-emerald-100 text-emerald-700" },
  traite:        { label: "Traité",           color: "bg-violet-100 text-violet-700" },
};

export default function MesDeclarations() {
  const { logout } = useAuth();
  const [reports, setReports] = useState<ReportOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listReports()
      .then(setReports)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/medecin" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
          <div>
            <span className="font-semibold text-gray-900">Mes déclarations</span>
            <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Médecin</span>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">Déconnexion</button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Historique des déclarations</h1>
          <Link href="/dashboard/medecin/nouvelle-declaration"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
            + Nouvelle déclaration
          </Link>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400 text-sm">Chargement...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">⚠️ {error}</div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">Aucune déclaration pour l&apos;instant</p>
            <p className="text-gray-400 text-sm mt-1">Vos déclarations soumises apparaîtront ici</p>
            <Link href="/dashboard/medecin/nouvelle-declaration"
              className="inline-block mt-4 bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700">
              Faire ma première déclaration
            </Link>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="flex flex-col gap-3">
            {reports.map((r) => {
              const st = STATUS_LABELS[r.status] || { label: r.status, color: "bg-gray-100 text-gray-600" };
              const date = new Date(r.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
              return (
                <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:border-gray-300 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {r.drug_dci || r.drug_nom_commercial || "Médicament non précisé"}
                      </span>
                      {r.gravite_serieux && (
                        <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">⚡ Sérieux</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>📅 {date}</span>
                      {r.imput_conclusion && <span>Imputabilité : <strong className="text-gray-600 capitalize">{r.imput_conclusion}</strong></span>}
                      {r.capm_reference && <span>Réf. CAPM : <strong className="text-gray-600">{r.capm_reference}</strong></span>}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${st.color}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
