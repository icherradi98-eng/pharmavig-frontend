"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { WelcomeModal } from "./WelcomeModal";

// ── SVG Icons professionnels ──────────────────────────────────────────────────

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}
function IconDeclarations() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  );
}
function IconOrdonnances() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
    </svg>
  );
}
function IconSurveillance() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function IconAlertes() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
    </svg>
  );
}
function IconInteractions() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="8" r="3"/><circle cx="17" cy="16" r="3"/>
      <path d="M10 8h4m-2-2v4"/><path d="M14 16h-4m2-2v4"/>
      <line x1="10" y1="10" x2="14" y2="14" strokeDasharray="2 2"/>
    </svg>
  );
}
function IconMolecules() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2"/><circle cx="19" cy="14" r="2"/><circle cx="5" cy="14" r="2"/>
      <line x1="12" y1="7" x2="19" y2="12"/><line x1="12" y1="7" x2="5" y2="12"/>
      <line x1="5" y1="16" x2="19" y2="16"/>
    </svg>
  );
}
function IconProfil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

// ── Navigation items ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/dashboard/medecin",                  label: "Vue d'ensemble", Icon: IconDashboard,     match: (p: string) => p === "/dashboard/medecin" },
  { href: "/dashboard/medecin/mes-declarations", label: "Déclarations",   Icon: IconDeclarations,  match: (p: string) => p.startsWith("/dashboard/medecin/mes-declarations") || p.startsWith("/dashboard/medecin/nouvelle-declaration") },
  { href: "/dashboard/medecin/suivi",            label: "Suivi patients", Icon: IconSurveillance,  match: (p: string) => p.startsWith("/dashboard/medecin/suivi") || p.startsWith("/dashboard/medecin/surveillance") || p.startsWith("/prescriptions") },
  { href: "/ordonnances/nouvelle",               label: "Ordonnances",    Icon: IconOrdonnances,   match: (p: string) => p.startsWith("/ordonnances") },
  { href: "/dashboard/medecin/alertes",          label: "Alertes",        Icon: IconAlertes,       match: (p: string) => p.startsWith("/dashboard/medecin/alertes"), hasAlert: true },
  { href: "/interactions",                       label: "Interactions",   Icon: IconInteractions,  match: (p: string) => p.startsWith("/interactions") },
  { href: "/dashboard/medecin/molecules",        label: "Molécules",      Icon: IconMolecules,     match: (p: string) => p.startsWith("/dashboard/medecin/molecules") },
  { href: "/dashboard/medecin/profil",           label: "Profil",         Icon: IconProfil,        match: (p: string) => p.startsWith("/dashboard/medecin/profil") },
];

const READ_ALERTS_KEY = "pharmavig_medecin_alerts_read";

function computeUnread(totalAlerts: number): number {
  if (typeof window === "undefined") return totalAlerts;
  try {
    const read: string[] = JSON.parse(localStorage.getItem(READ_ALERTS_KEY) || "[]");
    return Math.max(totalAlerts - read.length, 0);
  } catch {
    return totalAlerts;
  }
}

export function useUnreadAlertsCount(totalAlerts: number) {
  const [unread] = useState(() => computeUnread(totalAlerts));
  return unread;
}

// ── Logo MAIA DAWA ────────────────────────────────────────────────────────────

function MaiaLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Bouclier stylisé */}
      <div style={{ background: "var(--md-petrol)" }} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9"/>
          <path d="M9 12l2 2 4-4" stroke="var(--md-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {!collapsed && (
        <div>
          <div className="flex items-baseline gap-1">
            <span style={{ color: "var(--md-petrol)", fontWeight: 900, fontSize: 15, letterSpacing: "-0.3px" }}>MAIA</span>
            <span style={{ color: "var(--md-gold)", fontWeight: 900, fontSize: 15, letterSpacing: "-0.3px" }}>DAWA</span>
          </div>
          <p style={{ color: "var(--md-text-muted)", fontSize: 9, letterSpacing: "0.5px", textTransform: "uppercase", marginTop: -1 }}>
            Pharmacovigilance
          </p>
        </div>
      )}
    </div>
  );
}

// ── Layout principal ──────────────────────────────────────────────────────────

export default function MedecinLayout({ children, unreadAlerts = 0 }: { children: React.ReactNode; unreadAlerts?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex" style={{ background: "var(--md-cream)" }}>

      {/* Modal de bienvenue — première visite uniquement (médecin connecté) */}
      <WelcomeModal enabled={!!user && user.role === "medecin"} />

      {/* ── Sidebar desktop ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col min-h-screen"
        style={{ background: "var(--md-night)", borderRight: "none" }}>

        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/">
            <MaiaLogo />
          </Link>
          <div className="mt-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--md-gold)" }} />
            <span style={{ color: "var(--md-gold)", fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
              Espace Médecin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group"
                style={{
                  background: active ? "rgba(212, 175, 55, 0.12)" : "transparent",
                  color: active ? "var(--md-gold)" : "rgba(255,255,255,0.6)",
                  fontWeight: active ? 600 : 400,
                  borderLeft: active ? "2px solid var(--md-gold)" : "2px solid transparent",
                }}
              >
                <item.Icon />
                <span className="flex-1">{item.label}</span>
                {item.hasAlert && unreadAlerts > 0 && (
                  <span className="text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    style={{ background: "#C0392B", color: "#fff" }}>
                    {unreadAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Séparateur + CTA déclaration rapide */}
        <div className="mx-3 mb-3">
          <Link href="/dashboard/medecin/nouvelle-declaration"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "var(--md-petrol)", color: "#fff" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouvelle déclaration
          </Link>
        </div>

        {/* Profil bas */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--md-petrol)", color: "var(--md-gold)" }}>
              {(user?.prenom?.[0] || "D").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "rgba(255,255,255,0.9)" }}>
                Dr. {user?.prenom} {user?.nom}
              </p>
              <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                {user?.specialite || user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="text-xs transition-colors w-full text-left"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C0392B")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            Déconnexion →
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        {children}
      </div>

      {/* ── Bottom nav mobile ────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 flex items-center justify-around py-2 z-30"
        style={{ background: "var(--md-night)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = item.match(pathname);
          return (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1 relative min-w-[48px]"
              style={{ color: active ? "var(--md-gold)" : "rgba(255,255,255,0.45)" }}>
              <item.Icon />
              <span className="text-[9px] font-medium">{item.label.split(" ")[0]}</span>
              {item.hasAlert && unreadAlerts > 0 && (
                <span className="absolute top-0 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "#C0392B" }} />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// ── Composants réutilisables ──────────────────────────────────────────────────

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="px-6 md:px-8 pt-7 md:pt-8 pb-3 flex items-start justify-between"
      style={{ borderBottom: "1px solid var(--md-cream-dark)", background: "var(--md-cream)" }}>
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--md-night)" }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: "var(--md-text-muted)" }}>{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}

export function SectionCard({ title, children, className = "", accent = false }: { title?: string; children: React.ReactNode; className?: string; accent?: boolean }) {
  return (
    <div className={`bg-white rounded-xl ${className}`}
      style={{ border: "1px solid rgba(15, 91, 87, 0.1)", boxShadow: "0 1px 3px rgba(31,45,61,0.06)" }}>
      {title && (
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--md-cream-dark)" }}>
          <div className="flex items-center gap-2">
            {accent && <div className="w-1 h-4 rounded-full" style={{ background: "var(--md-gold)" }} />}
            <h3 className="font-semibold text-sm" style={{ color: "var(--md-night)" }}>{title}</h3>
          </div>
        </div>
      )}
      <div className={title ? "px-5 pb-5 pt-4" : "p-5"}>{children}</div>
    </div>
  );
}

/**
 * Badge « DÉMO » réutilisable — à placer près de toute donnée fictive/illustrative
 * pour qu'aucune ne soit confondue avec une vraie donnée patient ou un vrai signal.
 */
export function DemoBadge({ label = "DÉMO" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0"
      style={{ background: "rgba(212,175,55,0.18)", color: "#92700a", border: "1px solid rgba(212,175,55,0.4)" }}
      title="Données de démonstration — non réelles"
    >
      <span aria-hidden>●</span> {label}
    </span>
  );
}

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("pharmavig_demo_banner_dismissed") === "1"
  );
  if (dismissed) return null;
  return (
    <div className="mx-6 md:mx-8 mt-5 rounded-xl px-4 py-3 flex items-start gap-3"
      style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--md-gold)" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: "var(--md-night)" }}>Données de démonstration</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--md-text-secondary)" }}>
          Cet aperçu est peuplé d&apos;exemples. Il sera remplacé par vos données réelles au fur et à mesure de vos déclarations.
        </p>
      </div>
      <button
        onClick={() => { localStorage.setItem("pharmavig_demo_banner_dismissed", "1"); setDismissed(true); }}
        className="shrink-0 text-sm"
        style={{ color: "var(--md-text-muted)" }}
      >
        ✕
      </button>
    </div>
  );
}

export function KpiCard({ label, value, sub, icon, color = "petrol" }: {
  label: string; value: string | number; sub?: string; icon?: React.ReactNode; color?: "petrol" | "gold" | "mint" | "danger";
}) {
  const colors = {
    petrol: { bg: "rgba(15,91,87,0.07)", accent: "var(--md-petrol)" },
    gold:   { bg: "rgba(212,175,55,0.1)", accent: "var(--md-gold)" },
    mint:   { bg: "rgba(47,168,143,0.09)", accent: "var(--md-mint)" },
    danger: { bg: "rgba(192,57,43,0.08)", accent: "#C0392B" },
  };
  const c = colors[color];
  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid rgba(15,91,87,0.08)", boxShadow: "0 1px 3px rgba(31,45,61,0.05)" }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium" style={{ color: "var(--md-text-muted)" }}>{label}</p>
        {icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.bg, color: c.accent }}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold" style={{ color: "var(--md-night)" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--md-text-muted)" }}>{sub}</p>}
    </div>
  );
}
