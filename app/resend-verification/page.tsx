"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell, inputCls, inputStyle, C } from "@/components/auth/AuthShell";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${apiBase}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Erreur");
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      {sent ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(15,91,87,0.08)" }}>
            <span className="text-2xl">✉️</span>
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: C.night }}>Email envoyé !</h1>
          <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
            Si cet email est enregistré, un nouveau lien de vérification vous a été envoyé. Vérifiez vos spams.
          </p>
          <Link href="/login" className="inline-block text-white font-semibold px-6 py-3 rounded-xl text-sm"
            style={{ background: C.petrol }}>
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-xl font-bold mb-1" style={{ color: C.night }}>Renvoyer le lien</h1>
          <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
            Entrez vos identifiants pour recevoir un nouveau lien de vérification.
          </p>

          {error && (
            <div className="rounded-xl px-4 py-2.5 text-sm mb-4" style={{ background: "#fde8e8", border: "1px solid #fecaca", color: "#C0392B" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: C.night }}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: C.night }}>Mot de passe</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className={inputCls} style={inputStyle} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
              style={{ background: C.petrol }}>
              {loading ? "Envoi…" : "Renvoyer le lien"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm underline underline-offset-2" style={{ color: "#8a9ab0" }}>
              Retour à la connexion
            </Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}
