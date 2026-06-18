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
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#0F5B57" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9"/><path d="M9 12l2 2 4-4" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="w-5 h-5 border-2 border-[rgba(15,91,87,0.3)] border-t-[#0F5B57] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
