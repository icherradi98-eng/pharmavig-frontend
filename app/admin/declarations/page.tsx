"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminNav } from "../dashboard/page";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type AdminReport = {
  id: string;
  created_at: string;
  status: string;
  source: string;
  drug_dci?: string;
  drug_nom_commercial?: string;
  gravite_serieux: boolean;
  imput_conclusion?: string;
  capm_reference?: string;
  declarant_nom?: string;
  declarant_prenom?: string;
  raw_data?: Record<string, unknown>;
};

const STATUS_COLORS: Record<string, string> = {
  soumis: "bg-blue-900/40 text-blue-300 border-blue-800",
  transmis_capm: "bg-emerald-900/40 text-emerald-300 border-emerald-800",
  traite: "bg-violet-900/40 text-violet-300 border-violet-800",
  brouillon: "bg-gray-800 text-gray-400 border-gray-700",
};

const SOURCE_LABELS: Record<string, string> = {
  medecin: "Médecin", patient: "Patient", pharmacien: "Pharmacien", invite: "Invité",
};

export default function AdminDeclarations() {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterSerieux, setFilterSerieux] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchReports = useCallback(() => {
    if (!token) return;
    const params = new URLSearchParams();
    if (filterSource) params.set("source", filterSource);
    if (filterSerieux === "oui") params.set("serieux", "true");
    if (filterSerieux === "non") params.set("serieux", "false");
    if (filterStatus) params.set("status", filterStatus);
    if (search) params.set("search", search);

    fetch(`${BASE}/admin/declarations?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setReports)
      .finally(() => setLoading(false));
  }, [token, filterSource, filterSerieux, filterStatus, search]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchReports();
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminNav active="Déclarations" />

      <main className="flex-1 px-8 py-8 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Déclarations</h1>
          <p className="text-gray-400 text-sm mt-1">Toutes les déclarations reçues</p>
        </div>

        {/* Filtres */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par médicament..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Chercher
            </button>
          </form>
          {[
            { value: filterSource, setter: setFilterSource, placeholder: "Tous les profils", options: [["medecin", "Médecin"], ["patient", "Patient"], ["pharmacien", "Pharmacien"]] },
            { value: filterSerieux, setter: setFilterSerieux, placeholder: "Toute gravité", options: [["oui", "Sérieux"], ["non", "Non sérieux"]] },
            { value: filterStatus, setter: setFilterStatus, placeholder: "Tous les statuts", options: [["soumis", "Soumis"], ["transmis_capm", "Transmis CAPM"], ["traite", "Traité"]] },
          ].map((f, i) => (
            <select key={i} value={f.value} onChange={(e) => f.setter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">{f.placeholder}</option>
              {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          ))}
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-gray-400 text-xs">{reports.length} déclaration(s)</span>
          </div>

          {loading && <div className="py-16 text-center text-gray-500 text-sm">Chargement...</div>}

          {!loading && reports.length === 0 && (
            <div className="py-16 text-center text-gray-500 text-sm">Aucune déclaration trouvée</div>
          )}

          {!loading && reports.map((r) => {
            const date = new Date(r.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
            const st = STATUS_COLORS[r.status] || "bg-gray-800 text-gray-400 border-gray-700";
            const meddra = r.raw_data?.eiMeddraTerm as string | undefined;
            return (
              <Link key={r.id} href={`/admin/declarations/${r.id}`}
                className="flex items-center gap-4 px-5 py-4 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">
                      {r.drug_dci || r.drug_nom_commercial || "Médicament non précisé"}
                    </span>
                    {r.gravite_serieux && (
                      <span className="text-xs bg-red-900/50 text-red-400 font-bold px-1.5 py-0.5 rounded-full">⚡ Sérieux</span>
                    )}
                    {r.capm_reference && (
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-900/30 px-1.5 py-0.5 rounded">
                        {r.capm_reference}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📅 {date}</span>
                    <span>{SOURCE_LABELS[r.source]}{r.declarant_nom ? ` — ${r.declarant_prenom} ${r.declarant_nom}` : ""}</span>
                    {meddra && <span className="text-gray-600">MedDRA: {meddra}</span>}
                    {r.imput_conclusion && <span>Bégaud: <strong className="text-gray-400">{r.imput_conclusion}</strong></span>}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${st}`}>
                  {r.status}
                </span>
                <span className="text-gray-700 group-hover:text-gray-400 transition-colors">→</span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
