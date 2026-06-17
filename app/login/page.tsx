"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const C = {
  petrol: "#0F5B57", petrolDark: "#0a3f3c", gold: "#D4AF37",
  night: "#1F2D3D", cream: "#F7F3EE", creamDark: "#ede8e2",
};

const inputCls = "w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors";
const inputStyle = { borderColor: C.creamDark, ["--tw-ring-color" as string]: C.petrol };

function MaiaLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: C.petrol }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9" />
          <path d="M9 12l2 2 4-4" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="font-black text-lg tracking-tight">
        <span style={{ color: C.petrol }}>MAIA</span>{" "}
        <span style={{ color: C.gold }}>DAWA</span>
      </span>
    </div>
  );
}

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
      if (redirect) router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream }}>

      {/* Navbar minimale */}
      <nav className="sticky top-0 z-40 backdrop-blur-md" style={{ background: "rgba(247,243,238,0.93)", borderBottom: `1px solid ${C.creamDark}` }}>
        <div className="max-w-sm mx-auto px-6 flex items-center justify-between py-3">
          <Link href="/"><MaiaLogo /></Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">

          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: C.night }}>Connexion</h1>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Accédez à votre espace déclaration</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: `1px solid ${C.creamDark}` }}>

            {sessionExpired && (
              <div className="rounded-xl px-4 py-2.5 text-sm mb-4" style={{ background: "rgba(212,175,55,0.08)", border: `1px solid rgba(212,175,55,0.25)`, color: "#92700a" }}>
                🔒 Votre session a expiré. Veuillez vous reconnecter.
              </div>
            )}

            {error && (
              <div className="rounded-xl px-4 py-2.5 text-sm mb-4" style={{ background: "#fde8e8", border: "1px solid #fecaca", color: "#C0392B" }}>
                ⚠️ {error}
                {error.toLowerCase().includes("vérifié") && (
                  <p className="mt-2 text-xs" style={{ color: "#C0392B" }}>
                    Vous n&apos;avez pas reçu l&apos;email ?{" "}
                    <Link href="/resend-verification" className="underline font-medium">Renvoyer le lien</Link>
                  </p>
                )}
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
                <div className="text-right mt-1.5">
                  <Link href="/forgot-password" className="text-xs font-medium" style={{ color: C.petrol }}>
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-colors mt-1 disabled:opacity-60"
                style={{ background: C.petrol }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = C.petrolDark; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = C.petrol; }}
              >
                {loading ? "Connexion…" : "Se connecter"}
              </button>
            </form>

            <div className="mt-6 pt-6 flex flex-col gap-3 items-center" style={{ borderTop: `1px solid ${C.creamDark}` }}>
              <p className="text-sm" style={{ color: "#6b7280" }}>
                Pas encore de compte ?{" "}
                <Link href={role ? `/register?role=${role}` : "/register"}
                  className="font-semibold underline" style={{ color: C.petrol }}>
                  S&apos;inscrire gratuitement
                </Link>
              </p>
              <Link href="/dashboard/invite" className="text-sm underline underline-offset-2" style={{ color: "#8a9ab0" }}>
                Continuer sans compte →
              </Link>
            </div>
          </div>

          <p className="text-center text-[11px] mt-4" style={{ color: "#8a9ab0" }}>
            Vos données sont traitées avec confidentialité — mise en conformité loi 09-08 (CNDP) en cours
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
