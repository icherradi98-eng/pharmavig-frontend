"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AuthShell, inputCls, inputStyle, C } from "@/components/auth/AuthShell";

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
    if (password !== confirm) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lien invalide ou expiré.");
    } finally { setLoading(false); }
  }

  if (!token) return (
    <div className="text-center">
      <h1 className="text-lg font-bold mb-1" style={{ color: C.night }}>Lien invalide</h1>
      <p className="text-sm" style={{ color: "#6b7280" }}>Le lien de réinitialisation est incomplet ou a expiré.</p>
      <Link href="/forgot-password" className="inline-block mt-5 text-sm font-semibold" style={{ color: C.petrol }}>
        Demander un nouveau lien
      </Link>
    </div>
  );

  if (done) return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(15,91,87,0.08)" }}>
        <span className="text-2xl">✅</span>
      </div>
      <h1 className="text-lg font-bold mb-1" style={{ color: C.night }}>Mot de passe réinitialisé</h1>
      <p className="text-sm mb-4" style={{ color: "#6b7280" }}>Redirection vers la connexion…</p>
      <Link href="/login" className="text-sm font-semibold" style={{ color: C.petrol }}>Se connecter →</Link>
    </div>
  );

  return (
    <>
      <h1 className="text-lg font-bold mb-1" style={{ color: C.night }}>Nouveau mot de passe</h1>
      <p className="text-sm mb-5" style={{ color: "#6b7280" }}>
        Au moins 8 caractères, avec une lettre et un chiffre.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: C.night }}>Nouveau mot de passe</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: C.night }}>Confirmer</label>
          <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••" className={inputCls} style={inputStyle} />
        </div>
        {error && (
          <p className="text-sm rounded-xl px-3 py-2" style={{ background: "#fde8e8", color: "#C0392B" }}>⚠️ {error}</p>
        )}
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
          style={{ background: C.petrol }}>
          {loading ? "Réinitialisation…" : "Définir le nouveau mot de passe"}
        </button>
      </form>
      <div className="mt-6 pt-6 text-center" style={{ borderTop: `1px solid ${C.creamDark}` }}>
        <Link href="/login" className="text-sm underline underline-offset-2" style={{ color: "#8a9ab0" }}>
          ← Retour à la connexion
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={<p className="text-sm text-center" style={{ color: "#8a9ab0" }}>Chargement…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
