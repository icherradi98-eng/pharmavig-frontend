"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ProfilMedecin() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initiales = `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase() || "MD";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/medecin" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
          <span className="font-semibold text-gray-900">Mon profil</span>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">Déconnexion</button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-5">
        {/* Avatar + identité */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {initiales}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Dr {user.prenom} {user.nom}
            </h1>
            <p className="text-gray-500 text-sm">{user.specialite || "Spécialité non renseignée"}</p>
            <span className="inline-block mt-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Médecin</span>
          </div>
        </div>

        {/* Informations */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Informations du compte</h2>
          <div className="space-y-3">
            {[
              { label: "Email", value: user.email, icon: "✉️" },
              { label: "Rôle", value: "Médecin déclarant", icon: "🩺" },
              { label: "Spécialité", value: user.specialite || "—", icon: "🏥" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-lg w-6 text-center">{item.icon}</span>
                <div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conformité */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
          🔒 Vos données sont stockées de façon sécurisée conformément à la loi 09-08 sur la protection des données personnelles et à l&apos;article 18 du Code du médicament (loi 17-04).
        </div>

        <button
          onClick={logout}
          className="w-full border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl text-sm font-semibold transition-colors"
        >
          Se déconnecter
        </button>
      </main>
    </div>
  );
}
