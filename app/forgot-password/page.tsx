"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch {
      // Réponse volontairement générique (anti-énumération) — on confirme quand même.
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

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
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900 mb-1">Vérifiez votre boîte mail</h1>
              <p className="text-sm text-gray-500">
                Si un compte existe pour <span className="font-medium">{email}</span>, un lien de
                réinitialisation vient d&apos;être envoyé. Il est valable 1 heure.
              </p>
              <Link href="/login" className="inline-block mt-6 text-sm text-emerald-600 font-medium hover:underline">
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-bold text-gray-900 mb-1">Mot de passe oublié</h1>
              <p className="text-sm text-gray-500 mb-5">
                Entrez votre email : nous vous enverrons un lien pour définir un nouveau mot de passe.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2">
                  ← Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
