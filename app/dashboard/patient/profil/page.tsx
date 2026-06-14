"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function ProfilPatient() {
  const { user, logout } = useAuth();
  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  if (!user) return null;

  async function handleChangePassword() {
    setPwdError("");
    setPwdSuccess(false);
    if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) { setPwdError("Tous les champs sont obligatoires."); return; }
    if (pwdForm.next !== pwdForm.confirm) { setPwdError("Les nouveaux mots de passe ne correspondent pas."); return; }
    if (pwdForm.next.length < 8 || !pwdForm.next.match(/[a-zA-Z]/) || !pwdForm.next.match(/[0-9]/)) {
      setPwdError("Minimum 8 caractères, une lettre et un chiffre.");
      return;
    }
    setPwdLoading(true);
    try {
      await api.changePassword(pwdForm.current, pwdForm.next);
      setPwdForm({ current: "", next: "", confirm: "" });
      setPwdSuccess(true);
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (e: unknown) {
      setPwdError(e instanceof Error ? e.message : "Erreur lors du changement.");
    } finally {
      setPwdLoading(false);
    }
  }

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
        {/* Identité */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {user.prenom?.[0]?.toUpperCase() ?? "P"}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{user.prenom} {user.nom}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Patient</span>
          </div>
        </div>

        {/* Confidentialité */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-lg">🔒</span>
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">Confidentialité</p>
              <p className="text-sm text-gray-500">Vos déclarations sont anonymisées — aucun nom ne figure dans les rapports anonymisés, conformément à la loi 09-08.</p>
            </div>
          </div>
        </div>

        {/* Changer mot de passe */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold text-gray-800">Changer mon mot de passe</h2>
          <input type="password" placeholder="Mot de passe actuel" value={pwdForm.current}
            onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="password" placeholder="Nouveau mot de passe" value={pwdForm.next}
            onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="password" placeholder="Confirmer" value={pwdForm.confirm}
            onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {pwdError && <p className="text-xs text-red-600">⚠️ {pwdError}</p>}
          {pwdSuccess && <p className="text-xs text-emerald-600">✓ Mot de passe mis à jour.</p>}
          <button onClick={handleChangePassword} disabled={pwdLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
            {pwdLoading ? "Mise à jour…" : "Mettre à jour"}
          </button>
        </div>

        <button onClick={logout}
          className="w-full border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl text-sm font-semibold transition-colors">
          Se déconnecter
        </button>
      </main>
    </div>
  );
}
