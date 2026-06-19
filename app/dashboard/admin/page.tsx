"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type AdminStats, type AdminReportOut, type ReportStatus } from "@/lib/api";

const C = {
  petrol: "#0F5B57", gold: "#D4AF37", night: "#1F2D3D",
  cream: "#F7F3EE", creamDark: "#ede8e2", red: "#C0392B", mint: "#2FA88F",
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  brouillon: "Brouillon",
  soumis: "Soumis",
  transmis_capm: "Transmis CAPM",
  traite: "Traité",
};
const STATUS_COLORS: Record<ReportStatus, { bg: string; color: string }> = {
  brouillon:     { bg: "#f3f4f6",                color: "#6b7280" },
  soumis:        { bg: "rgba(212,175,55,0.15)",  color: "#92700a" },
  transmis_capm: { bg: "rgba(15,91,87,0.1)",     color: C.petrol },
  traite:        { bg: "rgba(47,168,143,0.12)",  color: "#1f8a73" },
};

const SOURCE_LABELS: Record<string, string> = {
  medecin: "Médecin", patient: "Patient", pharmacien: "Pharmacien", invite: "Anonyme",
};

function StatusBadge({ status }: { status: ReportStatus }) {
  const c = STATUS_COLORS[status] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={c}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-black" style={{ color: color ?? C.night }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [declarations, setDeclarations] = useState<AdminReportOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtres
  const [filterSource, setFilterSource] = useState("");
  const [filterSerieux, setFilterSerieux] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  // Inline status update
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    api.adminStats()
      .then(setStats)
      .catch(() => setError("Impossible de charger les statistiques."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filterSource) params.source = filterSource;
    if (filterSerieux) params.serieux = filterSerieux;
    if (filterStatus) params.status = filterStatus;
    if (search.trim().length >= 2) params.search = search.trim();
    api.adminListDeclarations(params)
      .then(setDeclarations)
      .catch(() => {});
  }, [filterSource, filterSerieux, filterStatus, search]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const updated = await api.adminUpdateDeclaration(id, { status });
      setDeclarations((prev) => prev.map((d) => (d.id === id ? { ...d, status: updated.status } : d)));
      if (stats) {
        const fresh = await api.adminStats();
        setStats(fresh);
      }
    } catch {
      //
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.cream }}>
        <p className="text-sm text-gray-400">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.petrol }}>
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="font-bold text-sm" style={{ color: C.night }}>Admin — MAI DAWA</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard/admin/utilisateurs" className="font-medium" style={{ color: C.petrol }}>
              Utilisateurs →
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-gray-600">Déconnexion</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total déclarations" value={stats.total} />
            <StatCard label="Ce mois" value={stats.this_month} sub="nouvelles déclarations" color={C.petrol} />
            <StatCard label="Cas sérieux" value={stats.serieux} sub={`${stats.serieux_pct}% du total`} color={C.red} />
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-2">Par source</p>
              {Object.entries(stats.by_source).map(([src, n]) => (
                <div key={src} className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{SOURCE_LABELS[src] ?? src}</span>
                  <span className="font-bold" style={{ color: C.night }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtres + liste */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <h2 className="text-sm font-bold text-gray-900 mr-2">Déclarations</h2>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une DCI…"
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 w-48"
              style={{ ["--tw-ring-color" as string]: C.petrol }}
            />

            <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 focus:outline-none">
              <option value="">Toutes sources</option>
              {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>

            <select value={filterSerieux} onChange={(e) => setFilterSerieux(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 focus:outline-none">
              <option value="">Gravité (tout)</option>
              <option value="true">Sérieux</option>
              <option value="false">Non sérieux</option>
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 focus:outline-none">
              <option value="">Tous statuts</option>
              {(Object.keys(STATUS_LABELS) as ReportStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Réf.</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Source</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">DCI</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Déclarant</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Gravité</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Imput.</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Statut</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {declarations.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-400">Aucune déclaration.</td></tr>
                )}
                {declarations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(d.created_at).toLocaleDateString("fr-MA")}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                      {d.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{SOURCE_LABELS[d.source] ?? d.source}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {d.drug_dci || d.drug_nom_commercial || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {d.declarant_nom
                        ? `Dr ${d.declarant_prenom ?? ""} ${d.declarant_nom}`
                        : <span className="text-gray-300">Anonyme</span>}
                    </td>
                    <td className="px-4 py-3">
                      {d.gravite_serieux
                        ? <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">⚡ Sérieux</span>
                        : <span className="text-[11px] text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-[12px]">{d.imput_conclusion || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={d.status}
                        disabled={updating === d.id}
                        onChange={(e) => updateStatus(d.id, e.target.value)}
                        className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 focus:outline-none disabled:opacity-50"
                      >
                        {(Object.keys(STATUS_LABELS) as ReportStatus[]).map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
