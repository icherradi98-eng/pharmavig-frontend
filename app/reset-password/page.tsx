"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lien invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Lien invalide</h1>
        <p className="text-sm text-gray-500">Le lien de réinitialisation est incomplet ou a expiré.</p>
        <Link href="/forgot-password" className="inline-block mt-5 text-sm text-emerald-600 font-medium hover:underline">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-1">Mot de passe réinitialisé</h1>
        <p className="text-sm text-gray-500">Redirection vers la connexion…</p>
        <Link href="/login" className="inline-block mt-5 text-sm text-emerald-600 font-medium hover:underline">
          Se connecter maintenant →
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-lg font-bold text-gray-900 mb-1">Nouveau mot de passe</h1>
      <p className="text-sm text-gray-500 mb-5">Choisissez un mot de passe d&apos;au moins 8 caractères, avec une lettre et un chiffre.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
          <input
            type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {loading ? "Réinitialisation..." : "Définir le nouveau mot de passe"}
        </button>
      </form>
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2">
          ← Retour à la connexion
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">PV</span>
            </div>
            <span className="font-bold text-gray-900 text-xl">MAIA DAWA</span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <Suspense fallback={<p className="text-sm text-gray-400 text-center">Chargement…</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
