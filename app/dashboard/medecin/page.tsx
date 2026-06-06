"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ReportOut } from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  brouillon:     { label: "Brouillon",        color: "bg-gray-100 text-gray-600" },
  soumis:        { label: "Soumis",           color: "bg-blue-100 text-blue-700" },
  transmis_capm: { label: "Transmis au CAPM", color: "bg-emerald-100 text-emerald-700" },
  traite:        { label: "Traité",           color: "bg-violet-100 text-violet-700" },
};

export default function MedecinDashboard() {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState<ReportOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listReports()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = reports.length;
  const serieux = reports.filter((r) => r.gravite_serieux).length;
  const transmis = reports.filter((r) => r.status === "transmis_capm" || r.status === "traite").length;
  const recent = reports.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PV</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">PharmaVig</span>
            <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Médecin</span>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">Déconnexion</button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, Dr {user?.nom || "Docteur"} 👋</h1>
          <p className="text-gray-500 mt-1">Tableau de bord — Interface Médecin</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-gray-900">{loading ? "—" : total}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">Déclarations envoyées</div>
            <div className="text-xs text-gray-400">total</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-red-600">{loading ? "—" : serieux}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">Effets sérieux</div>
            <div className="text-xs text-gray-400">traitement prioritaire</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-emerald-600">{loading ? "—" : transmis}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">Transmis au CAPM</div>
            <div className="text-xs text-gray-400">confirmés</div>
          </div>
        </div>

        {/* Action principale */}
        <Link
          href="/dashboard/medecin/nouvelle-declaration"
          className="flex items-center gap-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl p-5 mb-6 transition-colors"
        >
          <span className="text-3xl">📋</span>
          <div>
            <div className="font-semibold text-lg">Nouvelle déclaration d&apos;EIM</div>
            <div className="text-emerald-100 text-sm">Remplir et soumettre un rapport d&apos;effet indésirable</div>
          </div>
          <span className="ml-auto text-2xl">→</span>
        </Link>

        {/* Déclarations récentes */}
        <div className="bg-white border border-gray-200 rounded-xl mb-4">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Déclarations récentes</h2>
            <Link href="/dashboard/medecin/mes-declarations" className="text-xs text-emerald-600 hover:underline">
              Voir tout →
            </Link>
          </div>

          {loading && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">Chargement...</div>
          )}

          {!loading && recent.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-gray-400 text-sm">Aucune déclaration pour l&apos;instant</p>
              <Link href="/dashboard/medecin/nouvelle-declaration"
                className="inline-block mt-3 text-xs text-emerald-600 hover:underline font-medium">
                Faire ma première déclaration →
              </Link>
            </div>
          )}

          {!loading && recent.map((r) => {
            const st = STATUS_LABELS[r.status] || { label: r.status, color: "bg-gray-100 text-gray-600" };
            const date = new Date(r.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
            return (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm truncate">
                      {r.drug_dci || r.drug_nom_commercial || "Médicament non précisé"}
                    </span>
                    {r.gravite_serieux && (
                      <span className="text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full shrink-0">⚡</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">📅 {date}{r.capm_reference ? ` · ${r.capm_reference}` : ""}</div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${st.color}`}>{st.label}</span>
              </div>
            );
          })}
        </div>

        {/* Lien profil */}
        <Link
          href="/dashboard/medecin/profil"
          className="flex items-center gap-4 bg-white border border-gray-200 hover:border-emerald-300 rounded-xl p-4 transition-all"
        >
          <span className="text-2xl">👤</span>
          <div>
            <div className="font-medium text-gray-900">Mon profil</div>
            <div className="text-sm text-gray-500">Informations et paramètres</div>
          </div>
          <span className="ml-auto text-gray-300">→</span>
        </Link>
      </main>
    </div>
  );
}
