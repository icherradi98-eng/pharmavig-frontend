"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import MedecinLayout, { PageHeader, SectionCard, DemoBanner, DemoBadge, useUnreadAlertsCount } from "@/components/medecin/MedecinLayout";
import { NATIONAL_BENCHMARK } from "@/lib/mockMedecinData";
import { api, type ReportStats } from "@/lib/api";

// Nombre total d'alertes réglementaires publiées (doit rester synchronisé avec alertes/page.tsx)
const TOTAL_PUBLISHED_ALERTS = 8;

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function monthLabel(yyyyMM: string): string {
  const [, m] = yyyyMM.split("-");
  return MONTH_NAMES[parseInt(m, 10) - 1] ?? yyyyMM;
}

const SOC_COLORS = ["#047857", "#0d9488", "#0891b2", "#2563eb", "#7c3aed"];

export default function MedecinVueEnsemble() {
  const { user } = useAuth();
  // Badge alertes non lues — live depuis localStorage (même clé que alertes/page.tsx)
  const unread = useUnreadAlertsCount(TOTAL_PUBLISHED_ALERTS);

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
          <div className="space-y-6 animate-pulse">
            {/* KPI cards skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
            {/* Recent declarations skeleton */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-48" />
                    <div className="h-2.5 bg-gray-100 rounded w-32" />
                  </div>
                  <div className="h-5 bg-gray-200 rounded-full w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : !stats ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Impossible de charger vos statistiques. Vérifiez votre connexion.
          </div>
        ) : (
          <>
            {/* KPI cards — cliquables → mes-declarations filtrées */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dashboard/medecin/mes-declarations" className="block group">
                <SectionCard className="hover:shadow-md transition-shadow cursor-pointer group-hover:border-teal-200">
                  <p className="text-xs text-gray-500 mb-1">Total déclarations</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-400 mt-1 group-hover:text-teal-600">Voir toutes →</p>
                </SectionCard>
              </Link>
              <Link href="/dashboard/medecin/mes-declarations" className="block group">
                <SectionCard className="hover:shadow-md transition-shadow cursor-pointer group-hover:border-teal-200">
                  <p className="text-xs text-gray-500 mb-1">Ce mois-ci</p>
                  <p className="text-3xl font-bold text-[#0F5B57]">{stats.this_month}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
                </SectionCard>
              </Link>
              <Link href="/dashboard/medecin/mes-declarations?gravite=grave" className="block group">
                <SectionCard className="hover:shadow-md transition-shadow cursor-pointer group-hover:border-red-200">
                  <p className="text-xs text-gray-500 mb-1">Effets graves</p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.graves}{" "}
                    <span className="text-base font-medium text-gray-400">({stats.graves_pct}%)</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1 group-hover:text-red-500">Critères ICH E2A →</p>
                </SectionCard>
              </Link>
              <Link href="/dashboard/medecin/alertes" className="block group">
                <SectionCard className="hover:shadow-md transition-shadow cursor-pointer group-hover:border-amber-200">
                  <p className="text-xs text-gray-500 mb-1">Alertes de sécurité</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-amber-600">{unread}</p>
                    {unread > 0 && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">non lues</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 group-hover:text-amber-600">
                    {unread > 0 ? "Voir les alertes →" : "Toutes lues ✓"}
                  </p>
                </SectionCard>
              </Link>
            </div>

            {stats.total === 0 ? (
              <div className="space-y-4">
                {/* Bannière de bienvenue */}
                <div className="bg-gradient-to-br from-[#0F5B57] to-[#1F2D3D] rounded-2xl p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2">Bienvenue sur MAI DAWA</p>
                  <h2 className="text-xl font-bold mb-1">
                    Bonjour Dr. {user?.prenom || user?.nom || ""} 👋
                  </h2>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Votre espace de pharmacovigilance est prêt. Suivez ces 3 étapes pour commencer.
                  </p>
                </div>

                {/* Checklist — 4 étapes dont démo en premier */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-700">Pour commencer</p>
                    <span className="text-xs text-gray-400">4 étapes</span>
                  </div>

                  {/* Étape 0 — Démo (toujours affichée pour les nouveaux) */}
                  <Link href="/demo" className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50/60 transition-colors border-b border-gray-100 group">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(212,175,55,0.15)" }}>
                      <span style={{ color: "var(--md-gold)" }} className="font-bold text-sm">▶</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-amber-700">
                          Explorer en mode démonstration
                        </p>
                        <DemoBadge label="DEMO" />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Cas clinique Paclitaxel pré-rempli — aucune donnée réelle soumise
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-amber-400 text-lg shrink-0">→</span>
                  </Link>

                  {/* Étape 1 — Profil */}
                  <Link href="/dashboard/medecin/profil" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 group">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(15,91,87,0.1)" }}>
                      <span className="text-[#0F5B57] font-bold text-sm">
                        {user?.specialite ? "✓" : "1"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-[#0F5B57]">
                        Compléter mon profil médecin
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Spécialité, N° Ordre, établissement — requis pour les déclarations officielles
                      </p>
                    </div>
                    <span className={`text-lg shrink-0 ${user?.specialite ? "text-[#0F5B57]/60" : "text-gray-300 group-hover:text-[#0F5B57]"}`}>
                      {user?.specialite ? "✓" : "→"}
                    </span>
                  </Link>

                  {/* Étape 2 — Première déclaration */}
                  <Link href="/dashboard/medecin/nouvelle-declaration" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 group">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-[#0F5B57]">
                        Faire ma première déclaration
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Formulaire CIOMS avec score d&apos;imputabilité Bégaud — prêt à transmettre
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-[#0F5B57] text-lg shrink-0">→</span>
                  </Link>

                  {/* Étape 3 — Alertes */}
                  <Link href="/dashboard/medecin/alertes" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <span className="text-amber-600 font-bold text-sm">3</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-[#0F5B57]">
                          Consulter les alertes de sécurité
                        </p>
                        {unread > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                            {unread} non lues
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Veille réglementaire EMA, ANSM, CAPM — personnalisée pour vos molécules
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-[#0F5B57] text-lg shrink-0">→</span>
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

                <SectionCard title="Vous vs la communauté MAI DAWA">
                  {stats.total < 5 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">📊 Disponible après 5 déclarations</p>
                      <p className="text-gray-400 text-xs mt-1">Encore {5 - stats.total} déclaration{5 - stats.total > 1 ? "s" : ""} avant de débloquer cette comparaison</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-end mb-2"><DemoBadge label="Données démo" /></div>
                      <div className="space-y-3">
                        <BenchmarkRow label="Taux de déclarations graves" you={`${stats.graves_pct}%`} national={`${NATIONAL_BENCHMARK.tauxGravesPct}%`} />
                        {begaudAvg !== null && (
                          <BenchmarkRow label="Score Bégaud moyen" you={`I${begaudAvg.toFixed(1)}`} national={`I${NATIONAL_BENCHMARK.begaudMoyen.toFixed(1)}`} />
                        )}
                        <BenchmarkRow label="Délai moyen de déclaration après EIM" you="7 jours" national={`${NATIONAL_BENCHMARK.delaiMoyenJours} jours`} />
                      </div>
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4">⚠️ Données illustratives — référentiel national indisponible. Ces valeurs ne reflètent pas de statistiques réelles de la communauté MAI DAWA.</p>
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
        <span className="font-semibold text-[#0F5B57]">Vous : {you}</span>
        <span className="text-gray-400">National : {national}</span>
      </div>
    </div>
  );
}
