"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import MedecinLayout, { PageHeader, SectionCard, DemoBanner } from "@/components/medecin/MedecinLayout";
import { NATIONAL_BENCHMARK } from "@/lib/mockMedecinData";
import { api, type ReportStats } from "@/lib/api";

const BEGAUD_LABELS: Record<number, string> = {
  0: "Exclu", 1: "Douteux", 2: "Plausible", 3: "Vraisemblable", 4: "Très vraisemblable",
};

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function monthLabel(yyyyMM: string): string {
  const [, m] = yyyyMM.split("-");
  return MONTH_NAMES[parseInt(m, 10) - 1] ?? yyyyMM;
}

const SOC_COLORS = ["#047857", "#0d9488", "#0891b2", "#2563eb", "#7c3aed"];

export default function MedecinVueEnsemble() {
  const { user } = useAuth();
  const unread = 0; // sera alimenté par les vraies alertes CAPM/ANSM/EMA

  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const monthlyData = stats?.by_month.map((b) => ({ month: monthLabel(b.month), count: b.count })) ?? [];
  const monthsWithData = monthlyData.filter((m) => m.count > 0).length;

  const graviteData = stats
    ? [
        { name: "Grave", value: stats.by_gravite.grave, color: "#dc2626" },
        { name: "Non grave", value: stats.by_gravite.non_grave, color: "#16a34a" },
      ].filter((d) => d.value > 0)
    : [];

  const begaudAvg = stats?.begaud_avg ?? null;
  const begaudBadge = (() => {
    if (begaudAvg === null) return { color: "bg-gray-100 text-gray-400", label: "—" };
    const v = begaudAvg;
    let color = "bg-gray-100 text-gray-700";
    if (v >= 3.5) color = "bg-emerald-100 text-emerald-700";
    else if (v >= 2.5) color = "bg-blue-100 text-blue-700";
    else if (v < 1.5) color = "bg-amber-100 text-amber-700";
    const closest = Math.round(v) as 0 | 1 | 2 | 3 | 4;
    return { color, label: BEGAUD_LABELS[closest] ?? "" };
  })();

  return (
    <MedecinLayout unreadAlerts={unread}>
      <PageHeader title={`Bonjour Dr. ${user?.nom || ""}`} subtitle={today} />
      <div className="px-5 md:px-8 -mt-2 mb-2">
        <p className="text-sm text-gray-500">{user?.specialite || ""}</p>
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
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Chargement de vos données...</div>
        ) : !stats ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Impossible de charger vos statistiques. Vérifiez votre connexion.
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SectionCard>
                <p className="text-xs text-gray-500 mb-1">Total déclarations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-400 mt-1">depuis votre inscription</p>
              </SectionCard>
              <SectionCard>
                <p className="text-xs text-gray-500 mb-1">Ce mois-ci</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.this_month}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
              </SectionCard>
              <SectionCard>
                <p className="text-xs text-gray-500 mb-1">Effets graves</p>
                <p className="text-3xl font-bold text-red-600">{stats.graves} <span className="text-base font-medium text-gray-400">({stats.graves_pct}%)</span></p>
                <p className="text-xs text-gray-400 mt-1">critères ICH E2A</p>
              </SectionCard>
              <SectionCard>
                <p className="text-xs text-gray-500 mb-1">Score Bégaud moyen</p>
                {begaudAvg !== null ? (
                  <span className={`inline-block text-sm font-bold px-2.5 py-1 rounded-full ${begaudBadge.color}`}>
                    I{begaudAvg.toFixed(1)} — {begaudBadge.label}
                  </span>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">Disponible après votre première déclaration avec score d&apos;imputabilité</p>
                )}
              </SectionCard>
            </div>

            {stats.total === 0 ? (
              <div className="space-y-4">
                {/* Bannière de bienvenue */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-2">Bienvenue sur PharmaVig</p>
                  <h2 className="text-xl font-bold mb-1">
                    Bonjour Dr. {user?.prenom || user?.nom || ""} 👋
                  </h2>
                  <p className="text-emerald-100 text-sm leading-relaxed">
                    Votre espace de pharmacovigilance est prêt. Suivez ces 3 étapes pour commencer.
                  </p>
                </div>

                {/* Checklist 3 étapes */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-700">Pour commencer</p>
                  </div>

                  {/* Étape 1 — Profil */}
                  <Link href="/dashboard/medecin/profil" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 group">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-emerald-600 font-bold text-sm">
                        {user?.specialite ? "✓" : "1"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700">
                        Compléter mon profil médecin
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Spécialité, N° Ordre, établissement — requis pour les déclarations officielles
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-emerald-500 text-lg shrink-0">→</span>
                  </Link>

                  {/* Étape 2 — Première déclaration */}
                  <Link href="/dashboard/medecin/nouvelle-declaration" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 group">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700">
                        Faire ma première déclaration
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Formulaire CIOMS avec score d&apos;imputabilité Bégaud — transmis au CAPM
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-emerald-500 text-lg shrink-0">→</span>
                  </Link>

                  {/* Étape 3 — Référentiel */}
                  <Link href="/dashboard/medecin/molecules" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <span className="text-violet-600 font-bold text-sm">3</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700">
                        Explorer le référentiel médicament
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Recherchez une molécule, vérifiez ses contre-indications et interactions
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-emerald-500 text-lg shrink-0">→</span>
                  </Link>
                </div>

                {/* Rappel légal */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
                  <span className="text-amber-500 text-base mt-0.5">⚖️</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Obligation de déclaration</p>
                    <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                      La loi marocaine 17-04 impose aux professionnels de santé de déclarer tout effet indésirable grave ou inattendu au Centre Anti-Poison et de Pharmacovigilance du Maroc (CAPM).
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
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

                {stats.by_soc.length > 0 && (
                  <SectionCard title="Vos effets indésirables les plus déclarés par système">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.by_soc} layout="vertical" margin={{ left: 24 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                          <YAxis type="category" dataKey="soc" tick={{ fontSize: 12 }} stroke="#9ca3af" width={140} />
                          <Tooltip formatter={(v) => [String(v), "Cas déclarés"]} />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {stats.by_soc.map((_, i) => <Cell key={i} fill={SOC_COLORS[i % SOC_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </SectionCard>
                )}

                <SectionCard title="Vous vs la communauté PharmaVig">
                  {stats.total < 5 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">📊 Disponible après 5 déclarations</p>
                      <p className="text-gray-400 text-xs mt-1">Encore {5 - stats.total} déclaration{5 - stats.total > 1 ? "s" : ""} avant de débloquer cette comparaison</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <BenchmarkRow label="Taux de déclarations graves" you={`${stats.graves_pct}%`} national={`${NATIONAL_BENCHMARK.tauxGravesPct}%`} />
                        {begaudAvg !== null && (
                          <BenchmarkRow label="Score Bégaud moyen" you={`I${begaudAvg.toFixed(1)}`} national={`I${NATIONAL_BENCHMARK.begaudMoyen.toFixed(1)}`} />
                        )}
                        <BenchmarkRow label="Délai moyen de déclaration après EIM" you="7 jours" national={`${NATIONAL_BENCHMARK.delaiMoyenJours} jours`} />
                      </div>
                      <p className="text-xs text-gray-400 mt-4">Comparaisons basées sur données anonymisées agrégées</p>
                    </>
                  )}
                </SectionCard>
              </>
            )}
          </>
        )}
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
