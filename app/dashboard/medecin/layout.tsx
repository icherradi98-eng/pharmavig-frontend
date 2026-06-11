"use client";

/**
 * Layout de protection pour l'espace médecin.
 * Redirige vers /login si l'utilisateur n'est pas authentifié,
 * vers son propre dashboard s'il est connecté avec un autre rôle.
 * Affiche un écran de chargement neutre pendant la vérification initiale.
 */

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function MedecinLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (user.role !== "medecin") {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, loading, router, pathname]);

  // Pendant la vérification (ou si redirection imminente), on n'affiche rien
  // loading est false ici (AuthContext lit localStorage de façon synchrone)
  // mais on garde le guard au cas où l'implémentation évolue
  if (loading || !user || user.role !== "medecin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-black text-xs">PV</span>
          </div>
          <div className="w-5 h-5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
