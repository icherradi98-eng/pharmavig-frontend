"use client"; // Les error boundaries doivent être des Client Components

import { useEffect } from "react";

// global-error remplace le root layout quand il est actif : il doit donc
// définir ses propres balises <html> et <body>. Il capture les erreurs
// survenues dans le root layout lui-même (que app/error.tsx ne peut pas attraper).
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // En production, logger vers un service de monitoring si disponible
    console.error("[MAIA DAWA] Erreur racine non capturée :", error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "#f9fafb",
            textAlign: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: "28rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
              Une erreur est survenue
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "2rem" }}>
              Un problème inattendu s&apos;est produit. Vos données locales sont intactes.
            </p>
            <button
              onClick={() => unstable_retry()}
              style={{
                background: "#059669",
                color: "#fff",
                fontWeight: 600,
                padding: "0.75rem 2rem",
                borderRadius: "0.75rem",
                border: "none",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "1.5rem" }}>
              Conformément à la loi 09-08, aucune donnée personnelle n&apos;est transmise lors de ce rapport d&apos;erreur.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
