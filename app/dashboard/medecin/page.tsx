"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const stats = [
  { label: "Déclarations envoyées", value: "0", sub: "ce mois-ci" },
  { label: "En attente", value: "0", sub: "brouillons" },
  { label: "Transmis au CAPM", value: "0", sub: "total" },
];

const menuItems = [
  { href: "/dashboard/medecin/nouvelle-declaration", icon: "📋", label: "Nouvelle déclaration", description: "Déclarer un effet indésirable" },
  { href: "/dashboard/medecin/mes-declarations", icon: "📁", label: "Mes déclarations", description: "Historique et suivi" },
  { href: "/dashboard/medecin/profil", icon: "👤", label: "Mon profil", description: "Informations et paramètres" },
];

export default function MedecinDashboard() {
  const { user, logout } = useAuth();
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
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm font-medium text-gray-700 mt-1">{stat.label}</div>
              <div className="text-xs text-gray-400">{stat.sub}</div>
            </div>
          ))}
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

        {/* Menu */}
        <div className="grid grid-cols-1 gap-3">
          {menuItems.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 bg-white border border-gray-200 hover:border-emerald-300 rounded-xl p-4 transition-all"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
              <span className="ml-auto text-gray-300">→</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
