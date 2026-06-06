"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ProfilPatient() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/patient" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
          <span className="font-semibold text-gray-900">Mon profil</span>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">Déconnexion</button>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8 space-y-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {user.prenom?.[0]?.toUpperCase() ?? "P"}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{user.prenom} {user.nom}</h1>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Patient</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold text-gray-800 mb-3">Informations</h2>
          <div className="flex items-center gap-3 py-2 border-b border-gray-100">
            <span>✉️</span>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-800">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2">
            <span>🔒</span>
            <div>
              <p className="text-xs text-gray-400">Confidentialité</p>
              <p className="text-sm text-gray-600">Vos déclarations sont anonymisées — aucun nom ne figure dans les rapports transmis au CAPM.</p>
            </div>
          </div>
        </div>

        <button onClick={logout}
          className="w-full border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl text-sm font-semibold transition-colors">
          Se déconnecter
        </button>
      </main>
    </div>
  );
}
