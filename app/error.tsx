"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En production, logger vers un service de monitoring si disponible
    console.error("[MAI DAWA] Erreur non capturée :", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#F7F3EE" }}>
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "#0F5B57" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9"/><path d="M9 12l2 2 4-4" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="font-bold text-gray-900 text-xl">MAI DAWA</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10">
          <p className="text-5xl mb-4">⚠️</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Une erreur est survenue</h1>
          <p className="text-gray-500 text-sm mb-8">
            Un problème inattendu s&apos;est produit. Vos données locales sont intactes.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="hover:opacity-90 text-white font-semibold py-3 rounded-xl text-sm transition-opacity"
              style={{ background: "#0F5B57" }}
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl text-sm transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Conformément à la loi 09-08, aucune donnée personnelle n&apos;est transmise lors de ce rapport d&apos;erreur.
        </p>
      </div>
    </div>
  );
}
