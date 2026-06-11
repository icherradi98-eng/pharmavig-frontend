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
    // eslint-disable-next-line no-console
    console.error("[PharmaVig] Erreur non capturée :", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">PV</span>
            </div>
            <span className="font-bold text-gray-900 text-xl">PharmaVig</span>
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
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
