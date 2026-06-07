"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import MedecinLayout, { PageHeader, SectionCard, DemoBanner, useUnreadAlertsCount } from "@/components/medecin/MedecinLayout";
import { MOCK_DECLARATIONS, MOCK_ALERTS, MOCK_PROFILE, NATIONAL_BENCHMARK } from "@/lib/mockMedecinData";

const BEGAUD_LABELS: Record<number, string> = {
  0: "Exclu", 1: "Douteux", 2: "Plausible", 3: "Vraisemblable", 4: "Très vraisemblable",
};

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export default function MedecinVueEnsemble() {
  const { user } = useAuth();
  const unread = useUnreadAlertsCount(MOCK_ALERTS.length);

  const declarations = MOCK_DECLARATIONS;

  const stats = useMemo(() => {
    const total = declarations.length;
    const now = new Date("2026-06-07");
    const thisMonth = declarations.filter((d) => {
      const dt = new Date(d.date);
      return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
    }).length;
    const graves = declarations.filter((d) => d.grave).length;
    const gravesPct = total ? Math.round((graves / total) * 100) : 0;
    const begaudAvg = total ? declarations.reduce((s, d) => s + d.begaud, 0) / total : 0;
    return { total, thisMonth, graves, gravesPct, begaudAvg };
  }, [declarations]);

  const monthlyData = useMemo(() => {
    const now = new Date("2026-06-07");
    const buckets: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${MONTH_NAMES[d.getMonth()]}`;
      const count = declarations.filter((dec) => {
        const dt = new Date(dec.date);
        return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth();
      }).length;
      buckets.push({ month: label, count });
    }
    return buckets;
  }, [declarations]);

  const monthsWithData = monthlyData.filter((m) => m.count > 0).length;

  const socData = useMemo(() => {
    const counts: Record<string, number> = {};
    declarations.forEach((d) => { counts[d.meddraSoc] = (counts[d.meddraSoc] || 0) + 1; });
    return Object.entries(counts)
      .map(([soc, count]) => ({ soc, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [declarations]);

  const graviteData = useMemo(() => {
    const grave = declarations.filter((d) => d.grave).length;
    const enCours = declarations.filter((d) => !d.grave && d.statut === "soumis").length;
    const nonGrave = declarations.length - grave - enCours;
    return [
      { name: "Grave", value: grave, color: "#dc2626" },
      { name: "Non grave", value: nonGrave, color: "#16a34a" },
      { name: "En cours d'évaluation", value: enCours, color: "#9ca3af" },
    ].filter((d) => d.value > 0);
  }, [declarations]);

  const begaudBadge = useMemo(() => {
    const v = stats.begaudAvg;
    let color = "bg-gray-100 text-gray-700";
    if (v >= 3.5) color = "bg-emerald-100 text-emerald-700";
    else if (v >= 2.5) color = "bg-blue-100 text-blue-700";
    else if (v >= 1.5) color = "bg-gray-100 text-gray-700";
    else color = "bg-amber-100 text-amber-700";
    const closest = Math.round(v) as 0 | 1 | 2 | 3 | 4;
    return { color, label: BEGAUD_LABELS[closest] ?? "" };
  }, [stats.begaudAvg]);

  const today = new Date("2026-06-07").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const SOC_COLORS = ["#047857", "#0d9488", "#0891b2", "#2563eb", "#7c3aed"];

  return (
    <MedecinLayout unreadAlerts={unread}>
      <PageHeader title={`Bonjour Dr. ${user?.nom || "Cherradi"}`} subtitle={today} />
      <div className="px-5 md:px-8 -mt-2 mb-2">
        <p className="text-sm text-gray-500">{user?.specialite || MOCK_PROFILE.specialite} · {MOCK_PROFILE.etablissement}</p>
      </div>

      <DemoBanner />

      {unread > 0 && (
        <div className="mx-5 md:mx-8 mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-amber-500 text-lg">⚠️</span>
          <p className="text-sm text-amber-800 flex-1">
            {unread} nouvelle{unread > 1 ? "s" : ""} alerte{unread > 1 ? "s" : ""} de sécurité concernant vos molécules
          </p>
          <Link href="/dashboard/medecin/alertes" className="text-sm font-semibold text-amber-700 hover:underline shrink-0">
            Voir les alertes →
          </Link>
        </div>
      )}

      <div className="px-5 md:px-8 py-6 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SectionCard>
            <p className="text-xs text-gray-500 mb-1">Total déclarations</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">depuis votre inscription</p>
          </SectionCard>
          <SectionCard>
            <p className="text-xs text-gray-500 mb-1">Ce mois-ci</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.thisMonth}</p>
            <p className="text-xs text-gray-400 mt-1">juin 2026</p>
          </SectionCard>
          <SectionCard>
            <p className="text-xs text-gray-500 mb-1">Effets graves</p>
            <p className="text-3xl font-bold text-red-600">{stats.graves} <span className="text-base font-medium text-gray-400">({stats.gravesPct}%)</span></p>
            <p className="text-xs text-gray-400 mt-1">critères ICH E2A</p>
          </SectionCard>
          <SectionCard>
            <p className="text-xs text-gray-500 mb-1">Score Bégaud moyen</p>
            <span className={`inline-block text-sm font-bold px-2.5 py-1 rounded-full ${begaudBadge.color}`}>
              I{stats.begaudAvg.toFixed(1)} — {begaudBadge.label}
            </span>
          </SectionCard>
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <SectionCard title="Déclarations dans le temps">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {monthsWithData < 3 ? (
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip formatter={(v) => [String(v), "Déclarations"]} />
                    <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip formatter={(v) => [String(v), "Déclarations"]} />
                    <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Répartition par gravité">
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={graviteData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {graviteData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">déclarations</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {graviteData.map((g) => (
                <span key={g.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: g.color }} />
                  {g.name} ({g.value})
                </span>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Vos effets indésirables les plus déclarés par système">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={socData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis type="category" dataKey="soc" tick={{ fontSize: 12 }} stroke="#9ca3af" width={140} />
                <Tooltip formatter={(v) => [String(v), "Cas déclarés"]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {socData.map((_, i) => <Cell key={i} fill={SOC_COLORS[i % SOC_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Benchmark */}
        <SectionCard title="Vous vs la communauté PharmaVig">
          {stats.total < 5 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">📊 Disponible après 5 déclarations</p>
              <p className="text-gray-400 text-xs mt-1">Encore {5 - stats.total} déclaration{5 - stats.total > 1 ? "s" : ""} avant de débloquer cette comparaison</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <BenchmarkRow label="Taux de déclarations graves" you={`${stats.gravesPct}%`} national={`${NATIONAL_BENCHMARK.tauxGravesPct}%`} />
                <BenchmarkRow label="Score Bégaud moyen" you={`I${stats.begaudAvg.toFixed(1)}`} national={`I${NATIONAL_BENCHMARK.begaudMoyen.toFixed(1)}`} />
                <BenchmarkRow label="Délai moyen de déclaration après EIM" you="7 jours" national={`${NATIONAL_BENCHMARK.delaiMoyenJours} jours`} />
              </div>
              <p className="text-xs text-gray-400 mt-4">Comparaisons basées sur données anonymisées agrégées</p>
            </>
          )}
        </SectionCard>
      </div>
    </MedecinLayout>
  );
}

function BenchmarkRow({ label, you, national }: { label: string; you: string; national: string }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-gray-100 last:border-0 pb-3 last:pb-0">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-4">
        <span className="font-semibold text-emerald-700">Vous : {you}</span>
        <span className="text-gray-400">National : {national}</span>
      </div>
    </div>
  );
}
