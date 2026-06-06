"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ReportOut } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function MesDeclarationsPatient() {
  const { logout } = useAuth();
  const [reports, setReports] = useState<ReportOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listReports().then(setReports).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/patient" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
          <span className="font-semibold text-gray-900">Mes déclarations</span>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">Déconnexion</button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Mes signalements</h1>
          <Link href="/dashboard/patient/declarer"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            + Nouveau
          </Link>
        </div>

        {loading && <div className="text-center py-16 text-gray-400 text-sm">Chargement...</div>}

        {!loading && reports.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">Aucun signalement pour l&apos;instant</p>
            <Link href="/dashboard/patient/declarer"
              className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
              Faire mon premier signalement
            </Link>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="flex flex-col gap-3">
            {reports.map((r) => {
              const date = new Date(r.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
              return (
                <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{r.drug_dci || "Médicament non précisé"}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Soumis</span>
                  </div>
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
