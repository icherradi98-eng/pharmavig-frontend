"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { AuthShell, inputCls, inputStyle, C } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await api.forgotPassword(email); } catch { /* anti-énumération */ }
    finally { setLoading(false); setSent(true); }
  }

  return (
    <AuthShell>
      {sent ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(15,91,87,0.08)" }}>
            <span className="text-2xl">📧</span>
          </div>
          <h1 className="text-lg font-bold mb-2" style={{ color: C.night }}>Vérifiez votre boîte mail</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Si un compte existe pour <span className="font-medium">{email}</span>, un lien de réinitialisation vient d&apos;être envoyé. Il est valable 1 heure.
          </p>
          <Link href="/login" className="inline-block mt-6 text-sm font-semibold" style={{ color: C.petrol }}>
            ← Retour à la connexion
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-lg font-bold mb-1" style={{ color: C.night }}>Mot de passe oublié</h1>
          <p className="text-sm mb-5" style={{ color: "#6b7280" }}>
            Entrez votre email : nous vous enverrons un lien pour définir un nouveau mot de passe.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: C.night }}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com" className={inputCls} style={inputStyle} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
              style={{ background: C.petrol }}>
              {loading ? "Envoi…" : "Envoyer le lien de réinitialisation"}
            </button>
          </form>
          <div className="mt-6 pt-6 text-center" style={{ borderTop: `1px solid ${C.creamDark}` }}>
            <Link href="/login" className="text-sm underline underline-offset-2" style={{ color: "#8a9ab0" }}>
              ← Retour à la connexion
            </Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}
