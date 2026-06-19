"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, type AdminStats } from "@/lib/api";

type Stats = AdminStats;

const STATUS_COLORS: Record<string, string> = {
  soumis: "bg-blue-900/40 text-blue-300",
  transmis_capm: "bg-[rgba(15,91,87,0.3)] text-[#7ed3cf]",
  traite: "bg-violet-900/40 text-violet-300",
  brouillon: "bg-gray-700 text-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  soumis: "Soumis",
  transmis_capm: "Transmis CAPM",
  traite: "Traité",
  brouillon: "Brouillon",
};

const SOURCE_LABELS: Record<string, string> = {
  medecin: "Médecin", patient: "Patient", pharmacien: "Pharmacien", invite: "Invité",
};

function useAdminAuth() {
  const router = useRouter();
  const user = typeof window !== "undefined" ? localStorage.getItem("admin_user") : null;
  useEffect(() => {
    if (!user) router.push("/admin/login");
  }, [user, router]);
  return user;
}

function AdminNav({ active }: { active: string }) {
  const router = useRouter();
  function logout() {
    api.logout(); // efface les cookies HttpOnly côté serveur
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  }
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("admin_user") || "{}") : {};
  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#0F5B57" }}>
            <span className="text-white font-black text-xs">PV</span>
          </div>
          <span className="text-white font-bold text-sm">MAI DAWA</span>
        </div>
        <div className="text-xs text-gray-500">Administration</div>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {[
          { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          { href: "/admin/declarations", label: "Déclarations", icon: "📋" },
          { href: "/admin/users", label: "Utilisateurs", icon: "👥" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active === item.label ? "text-white font-medium" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
            style={active === item.label ? { background: "#0F5B57" } : undefined}>
            <span>{item.icon}</span> {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 mb-1">{user.prenom} {user.nom}</p>
        <button onClick={logout} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
          Déconnexion →
        </button>
      </div>
    </aside>
  );
}

export { AdminNav };

export default function AdminDashboard() {
  const token = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.adminStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminNav active="Dashboard" />

      <main className="flex-1 px-8 py-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
          <p className="text-gray-400 text-sm mt-1">Vue d&apos;ensemble — MAI DAWA</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total déclarations", value: stats?.total, color: "text-white" },
            { label: "Ce mois-ci", value: stats?.this_month, color: "text-[#7ed3cf]" },
            { label: "Effets sérieux", value: stats?.serieux, color: "text-red-400" },
            { label: "Taux sérieux", value: stats ? `${stats.serieux_pct}%` : null, color: "text-amber-400" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className={`text-3xl font-bold ${kpi.color}`}>
                {loading ? "—" : kpi.value ?? "0"}
              </div>
              <div className="text-gray-400 text-sm mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Par source */}
        {stats?.by_source && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <h2 className="text-white font-semibold mb-4 text-sm">Répartition par profil déclarant</h2>
            <div className="flex gap-6">
              {Object.entries(stats.by_source).map(([source, count]) => (
                <div key={source} className="text-center">
                  <div className="text-2xl font-bold text-[#7ed3cf]">{count}</div>
                  <div className="text-gray-400 text-xs mt-1">{SOURCE_LABELS[source] || source}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Déclarations récentes */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 className="text-white font-semibold text-sm">Déclarations récentes</h2>
            <Link href="/admin/declarations" className="text-xs text-[#7ed3cf] hover:underline">
              Voir tout →
            </Link>
          </div>

          {loading && <div className="px-5 py-10 text-center text-gray-500 text-sm">Chargement...</div>}

          {!loading && stats?.recent.map((r) => {
            const date = new Date(r.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
            const st = STATUS_COLORS[r.status] || "bg-gray-700 text-gray-400";
            return (
              <Link key={r.id} href={`/admin/declarations/${r.id}`}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium truncate">
                      {r.drug_dci || r.drug_nom_commercial || "—"}
                    </span>
                    {r.gravite_serieux && (
                      <span className="text-xs bg-red-900/50 text-red-400 font-bold px-1.5 py-0.5 rounded-full shrink-0">⚡</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {r.declarant_prenom} {r.declarant_nom} · {SOURCE_LABELS[r.source]} · {date}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${st}`}>
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
                <span className="text-gray-600 text-sm">→</span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
