"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role");
  const redirect = searchParams.get("redirect");
  const sessionExpired = searchParams.get("session") === "expired";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // Si un redirect est demandé (ex. depuis /declarer), on l'applique après login
      if (redirect) router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
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
          <h1 className="text-xl font-bold text-gray-900 mb-1">Connexion</h1>
          <p className="text-gray-500 text-sm mb-6">Accédez à votre espace déclaration</p>

          {sessionExpired && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800 mb-4">
              🔒 Votre session a expiré. Veuillez vous reconnecter.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700 mb-4">
              ⚠️ {error}
              {error.toLowerCase().includes("vérifié") && (
                <p className="mt-2 text-xs text-red-600">
                  Vous n&apos;avez pas reçu l&apos;email ?{" "}
                  <Link href="/resend-verification" className="underline font-medium">
                    Renvoyer le lien
                  </Link>
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="text-right mt-1.5">
                <Link href="/forgot-password" className="text-xs text-emerald-600 hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-sm font-semibold transition-colors mt-1 disabled:opacity-60"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3 items-center">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{" "}
              <Link href={role ? `/register?role=${role}` : "/register"} className="text-emerald-600 font-medium hover:underline">
                S&apos;inscrire
              </Link>
            </p>
            <Link href="/dashboard/invite" className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2">
              Continuer sans compte (invité)
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Vos données sont traitées avec confidentialité — mise en conformité loi 09-08 (CNDP) en cours
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
