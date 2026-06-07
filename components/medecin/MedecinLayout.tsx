"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard/medecin", label: "Vue d'ensemble", icon: "🏠", match: (p: string) => p === "/dashboard/medecin" },
  { href: "/dashboard/medecin/mes-declarations", label: "Mes déclarations", icon: "📋", match: (p: string) => p.startsWith("/dashboard/medecin/mes-declarations") },
  { href: "/dashboard/medecin/alertes", label: "Alertes sécurité", icon: "🔔", match: (p: string) => p.startsWith("/dashboard/medecin/alertes") },
  { href: "/dashboard/medecin/molecules", label: "Mes molécules", icon: "🧬", match: (p: string) => p.startsWith("/dashboard/medecin/molecules") },
  { href: "/dashboard/medecin/profil", label: "Mon profil", icon: "👤", match: (p: string) => p.startsWith("/dashboard/medecin/profil") },
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

export default function MedecinLayout({ children, unreadAlerts = 0 }: { children: React.ReactNode; unreadAlerts?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-[220px] shrink-0 bg-white border-r border-gray-200 flex-col min-h-screen">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PV</span>
            </div>
            <span className="font-semibold text-gray-900">PharmaVig</span>
          </Link>
          <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Médecin</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative ${
                  active ? "bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.label === "Alertes sécurité" && unreadAlerts > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-900">{user?.prenom} {user?.nom}</p>
          <p className="text-xs text-gray-500 mb-2">{user?.email}</p>
          <button onClick={() => { logout(); router.push("/"); }} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            Déconnexion →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        {children}
      </div>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex items-center justify-around py-2 z-30">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 px-2 py-1 relative min-w-[56px]">
              <span className={`text-lg ${active ? "" : "opacity-60"}`}>{item.icon}</span>
              <span className={`text-[10px] ${active ? "text-emerald-700 font-semibold" : "text-gray-500"}`}>
                {item.label.split(" ")[0]}
              </span>
              {item.label === "Alertes sécurité" && unreadAlerts > 0 && (
                <span className="absolute top-0 right-2 bg-red-500 w-2 h-2 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-5 md:px-8 pt-6 md:pt-8 pb-2">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

export function SectionCard({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {title && (
        <div className="border-l-4 border-emerald-600 px-4 py-3">
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        </div>
      )}
      <div className={title ? "px-5 pb-5" : "p-5"}>{children}</div>
    </div>
  );
}

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("pharmavig_demo_banner_dismissed") === "1"
  );
  if (dismissed) return null;
  return (
    <div className="mx-5 md:mx-8 mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
      <span className="text-blue-500 text-lg">ℹ️</span>
      <div className="flex-1">
        <p className="text-sm text-blue-800 font-medium">Données de démonstration</p>
        <p className="text-xs text-blue-700 mt-0.5">
          Cet aperçu est peuplé avec des exemples pour vous montrer le potentiel de votre tableau de bord. Il sera progressivement remplacé par vos données réelles à mesure que vous soumettez des déclarations.
        </p>
      </div>
      <button
        onClick={() => { localStorage.setItem("pharmavig_demo_banner_dismissed", "1"); setDismissed(true); }}
        className="text-blue-400 hover:text-blue-600 text-sm shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
