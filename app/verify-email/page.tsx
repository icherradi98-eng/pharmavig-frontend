"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell, C } from "@/components/auth/AuthShell";

type Status = "loading" | "success" | "error" | "already";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(() => token ? "loading" : "error");
  const [message, setMessage] = useState(() => token ? "" : "Lien invalide — aucun token trouvé.");

  useEffect(() => {
    if (!token) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
    fetch(`${apiBase}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) { setStatus("error"); setMessage(data.detail ?? "Lien invalide ou expiré."); }
        else if (data.detail?.includes("déjà")) { setStatus("already"); setMessage(data.detail); }
        else { setStatus("success"); setMessage(data.detail); setTimeout(() => router.push("/login"), 3000); }
      })
      .catch(() => { setStatus("error"); setMessage("Erreur réseau — réessayez."); });
  }, [token, router]);

  const iconBg = status === "success" || status === "already"
    ? "rgba(15,91,87,0.08)"
    : status === "error" ? "#fde8e8" : "rgba(15,91,87,0.05)";

  return (
    <AuthShell>
      <div className="text-center">
        {/* Logo texte */}
        <div className="mb-6">
          <span className="text-xl font-black" style={{ color: C.petrol }}>MAI </span>
          <span className="text-xl font-black" style={{ color: C.gold }}>DAWA</span>
          <p className="text-xs mt-0.5" style={{ color: "#8a9ab0" }}>Pharmacovigilance · المملكة المغربية 🇲🇦</p>
        </div>

        {status === "loading" && (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
              style={{ borderColor: `rgba(15,91,87,0.2)`, borderTopColor: C.petrol }} />
            <p className="text-sm" style={{ color: "#6b7280" }}>Vérification en cours…</p>
          </>
        )}

        {status !== "loading" && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: iconBg }}>
              <span className="text-3xl">
                {status === "success" ? "✓" : status === "already" ? "ℹ️" : "✕"}
              </span>
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: C.night }}>
              {status === "success" ? "Email vérifié !" : status === "already" ? "Déjà vérifié" : "Lien invalide"}
            </h1>
            <p className="text-sm mb-5" style={{ color: "#6b7280" }}>
              {status === "success" ? <>{message}<br /><span className="text-xs" style={{ color: "#8a9ab0" }}>Redirection dans 3 secondes…</span></> : message}
            </p>
            {status === "error" && (
              <p className="text-xs mb-4" style={{ color: "#8a9ab0" }}>Le lien a peut-être expiré ou déjà été utilisé.</p>
            )}
            <Link href="/login"
              className="inline-block text-white font-semibold px-6 py-3 rounded-xl text-sm"
              style={{ background: C.petrol }}>
              {status === "error" ? "Retour à la connexion" : "Se connecter →"}
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailContent /></Suspense>;
}
