"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Status = "loading" | "success" | "error" | "already";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide — aucun token trouvé.");
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
    fetch(`${apiBase}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.detail ?? "Lien invalide ou expiré.");
        } else if (data.detail?.includes("déjà")) {
          setStatus("already");
          setMessage(data.detail);
        } else {
          setStatus("success");
          setMessage(data.detail);
          // Redirection automatique vers login après 3 secondes
          setTimeout(() => router.push("/login"), 3000);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erreur réseau — réessayez.");
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {/* Logo */}
        <div className="mb-6">
          <span className="text-2xl font-black text-emerald-600">PharmaVig</span>
          <p className="text-xs text-gray-400 mt-1">Pharmacovigilance · المملكة المغربية 🇲🇦</p>
        </div>

        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Vérification en cours…</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Email vérifié !</h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <p className="text-xs text-gray-400 mb-4">Redirection automatique dans 3 secondes…</p>
            <Link
              href="/login"
              className="inline-block bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-emerald-700 transition-colors"
            >
              Se connecter →
            </Link>
          </>
        )}

        {status === "already" && (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">ℹ️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Déjà vérifié</h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-emerald-700 transition-colors"
            >
              Se connecter →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✕</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <p className="text-xs text-gray-400 mb-4">
              Le lien a peut-être expiré ou déjà été utilisé.
            </p>
            <Link
              href="/login"
              className="inline-block bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-emerald-700 transition-colors"
            >
              Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
