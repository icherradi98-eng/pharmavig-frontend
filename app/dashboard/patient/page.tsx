"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function PatientDashboard() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PV</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">PharmaVig</span>
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Patient</span>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">Déconnexion</button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bonjour 👋</h1>
          <p className="text-gray-500 mt-1">Vous avez ressenti un effet indésirable suite à un médicament ?</p>
        </div>

        {/* Action principale */}
        <Link
          href="/dashboard/patient/declarer"
          className="flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-5 mb-6 transition-colors"
        >
          <span className="text-3xl">📋</span>
          <div>
            <div className="font-semibold text-lg">Déclarer un effet indésirable</div>
            <div className="text-blue-100 text-sm">Formulaire guidé — 5 minutes</div>
          </div>
          <span className="ml-auto text-2xl">→</span>
        </Link>

        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/dashboard/patient/mes-declarations"
            className="flex items-center gap-4 bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all"
          >
            <span className="text-2xl">📁</span>
            <div>
              <div className="font-medium text-gray-900">Mes déclarations</div>
              <div className="text-sm text-gray-500">Historique de vos signalements</div>
            </div>
            <span className="ml-auto text-gray-300">→</span>
          </Link>
          <Link
            href="/dashboard/patient/profil"
            className="flex items-center gap-4 bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all"
          >
            <span className="text-2xl">👤</span>
            <div>
              <div className="font-medium text-gray-900">Mon profil</div>
              <div className="text-sm text-gray-500">Paramètres et informations</div>
            </div>
            <span className="ml-auto text-gray-300">→</span>
          </Link>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <strong>Vos données sont protégées.</strong> Toutes les déclarations sont anonymisées conformément à la loi marocaine 09-08 sur la protection des données personnelles.
        </div>
      </main>
    </div>
  );
}
