"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur de connexion");
      if (data.user.role !== "admin") throw new Error("Accès réservé aux administrateurs");
      localStorage.setItem("admin_token", data.access_token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm">PV</span>
          </div>
          <div>
            <div className="text-white font-bold text-lg">PharmaVig</div>
            <div className="text-gray-400 text-xs">Administration CAPM</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
          <h1 className="text-white font-bold text-xl mb-1">Espace administrateur</h1>
          <p className="text-gray-400 text-sm mb-6">Accès restreint — CAPM / PharmaVig</p>

          {error && (
            <div className="bg-red-900/40 border border-red-700 rounded-lg px-4 py-2.5 text-sm text-red-300 mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500"
                placeholder="admin@pharmavig.ma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg text-sm font-semibold transition-colors mt-1 disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Accéder au tableau de bord →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Accès non autorisé — toutes les tentatives sont enregistrées
        </p>
      </div>
    </div>
  );
}
