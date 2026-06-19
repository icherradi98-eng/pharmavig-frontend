"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type ReportOut } from "@/lib/api";

const C = {
  petrol: "#0F5B57", gold: "#D4AF37", night: "#1F2D3D",
  cream: "#F7F3EE", creamDark: "#ede8e2", red: "#C0392B",
};

function MaiaLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: C.petrol }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9" />
          <path d="M9 12l2 2 4-4" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="font-black text-[15px] tracking-tight">
        <span style={{ color: C.petrol }}>MAI</span>{" "}
        <span style={{ color: C.gold }}>DAWA</span>
      </span>
    </div>
  );
}

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  brouillon:     { label: "Brouillon",     bg: "#f3f4f6",                color: "#6b7280" },
  soumis:        { label: "Soumis",        bg: "rgba(212,175,55,0.15)",  color: "#92700a" },
  transmis_capm: { label: "Transmis",      bg: "rgba(15,91,87,0.1)",     color: C.petrol },
  traite:        { label: "Traité",        bg: "rgba(47,168,143,0.12)",  color: "#1f8a73" },
};

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [declarations, setDeclarations] = useState<ReportOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listReports()
      .then(setDeclarations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const recent = declarations.slice(0, 3);
  const graves = declarations.filter((d) => d.gravite_serieux).length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-md" style={{ background: "rgba(247,243,238,0.93)", borderBottom: `1px solid ${C.creamDark}` }}>
        <div className="max-w-2xl mx-auto px-6 flex items-center justify-between py-3">
          <MaiaLogo />
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(15,91,87,0.08)", color: C.petrol }}>
              Patient
            </span>
            <button onClick={logout} className="text-sm" style={{ color: "#8a9ab0" }}>Déconnexion</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 space-y-6">

        {/* Bonjour */}
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: C.night }}>
            Bonjour{user?.prenom ? ` ${user.prenom}` : ""} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Votre espace de pharmacovigilance patient
          </p>
        </div>

        {/* KPIs */}
        {!loading && declarations.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center" style={{ border: `1px solid ${C.creamDark}` }}>
              <p className="text-2xl font-black" style={{ color: C.petrol }}>{declarations.length}</p>
              <p className="text-xs mt-0.5" style={{ color: "#8a9ab0" }}>déclaration{declarations.length > 1 ? "s" : ""}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center" style={{ border: `1px solid ${C.creamDark}` }}>
              <p className="text-2xl font-black" style={{ color: graves > 0 ? C.red : "#d1d5db" }}>{graves}</p>
              <p className="text-xs mt-0.5" style={{ color: "#8a9ab0" }}>grave{graves > 1 ? "s" : ""}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center" style={{ border: `1px solid ${C.creamDark}` }}>
              <p className="text-2xl font-black" style={{ color: C.night }}>
                {declarations.filter((d) => d.status === "traite").length}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#8a9ab0" }}>traité{declarations.filter((d) => d.status === "traite").length > 1 ? "s" : ""}</p>
            </div>
          </div>
        )}

        {/* Action principale */}
        <Link href="/dashboard/patient/declarer"
          className="flex items-center gap-4 rounded-2xl p-5 transition-all group"
          style={{ background: C.night }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: "rgba(255,255,255,0.07)" }}>📋</div>
          <div className="flex-1">
            <p className="font-bold text-white text-base">Déclarer un effet indésirable</p>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              Formulaire guidé — 5 minutes, sans jargon médical
            </p>
          </div>
          <span className="text-xl transition-transform group-hover:translate-x-1 shrink-0" style={{ color: C.gold }}>→</span>
        </Link>

        {/* Déclarations récentes */}
        {!loading && recent.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.creamDark}` }}>
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.creamDark}` }}>
              <p className="text-sm font-bold" style={{ color: C.night }}>Déclarations récentes</p>
              <Link href="/dashboard/patient/mes-declarations" className="text-xs font-semibold" style={{ color: C.petrol }}>
                Voir tout →
              </Link>
            </div>
            <div className="divide-y" style={{ "--tw-divide-opacity": "1" } as React.CSSProperties}>
              {recent.map((d) => {
                const st = STATUS_LABELS[d.status] ?? { label: d.status, bg: "#f3f4f6", color: "#6b7280" };
                return (
                  <div key={d.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: C.night }}>
                        {d.drug_dci || d.drug_nom_commercial || "Médicament non précisé"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#8a9ab0" }}>
                        {new Date(d.created_at).toLocaleDateString("fr-MA")}
                      </p>
                    </div>
                    {d.gravite_serieux && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: "#fde8e8", color: C.red }}>⚡ Grave</span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && declarations.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ border: `1px solid ${C.creamDark}` }}>
            <p className="text-3xl mb-3">📋</p>
            <p className="text-sm font-semibold" style={{ color: C.night }}>Aucune déclaration pour l&apos;instant</p>
            <p className="text-xs mt-1 mb-4" style={{ color: "#8a9ab0" }}>
              Vous avez ressenti un effet indésirable suite à un médicament ?
            </p>
            <Link href="/dashboard/patient/declarer"
              className="inline-block text-white text-sm font-bold px-5 py-2.5 rounded-xl"
              style={{ background: C.petrol }}>
              Faire ma première déclaration →
            </Link>
          </div>
        )}

        {/* Liens secondaires */}
        <div className="grid grid-cols-1 gap-3">
          {[
            { href: "/dashboard/patient/mes-declarations", icon: "📁", label: "Mes déclarations", sub: "Historique de vos signalements" },
            { href: "/medicaments", icon: "💊", label: "Référentiel médicament", sub: "Indications, EI connus, alertes de sécurité" },
            { href: "/dashboard/patient/profil", icon: "👤", label: "Mon profil", sub: "Paramètres et informations" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 transition-all group"
              style={{ border: `1px solid ${C.creamDark}` }}>
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: C.night }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8a9ab0" }}>{item.sub}</p>
              </div>
              <span className="text-lg transition-transform group-hover:translate-x-0.5 shrink-0" style={{ color: C.creamDark }}>→</span>
            </Link>
          ))}
        </div>

        {/* Notice confidentialité */}
        <div className="rounded-2xl px-5 py-4 flex items-start gap-3"
          style={{ background: "rgba(15,91,87,0.05)", border: `1px solid rgba(15,91,87,0.12)` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.petrol} strokeWidth="2" className="shrink-0 mt-0.5">
            <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z"/>
          </svg>
          <p className="text-xs" style={{ color: C.petrol }}>
            <strong>Vos données sont protégées.</strong> Toutes les déclarations sont anonymisées — mise en conformité loi 09-08 (CNDP) en cours.
          </p>
        </div>

      </main>
    </div>
  );
}
