// ─────────────────────────────────────────────────────────────────────────────
// Détection visuelle d'incohérences probables sur une fiche médicament.
//
// PURE et NON destructive : ne corrige jamais la donnée, ne la masque pas.
// Sert uniquement à afficher un badge discret « À vérifier » et un résumé dans
// l'accordéon qualité. Les heuristiques sont volontairement prudentes.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProductView } from "./index";
import type { ClinicalMonograph } from "./types";

export type Inconsistency = { code: string; label: string };

const ORAL_FORM_HINTS = ["comprime", "gelule", "buvable", "sirop", "sachet", "orale", "capsule"];
const TOPICAL_FORM_HINTS = ["pommade", "creme", "gel", "patch", "transdermique", "cutane"];

function norm(s: string | null | undefined): string {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Renvoie la liste des incohérences probables détectées (vide si tout est cohérent).
 * @param view produit marocain (référentiel)
 * @param monograph monographie clinique éventuelle (pour détecter combiné vs mono-substance)
 */
export function detectInconsistencies(
  view: ProductView | null,
  monograph: ClinicalMonograph | null,
): Inconsistency[] {
  const out: Inconsistency[] = [];
  if (!view) return out;

  const { presentation, substances } = view;
  const form = norm(presentation?.pharmaceutical_form);
  const route = norm(presentation?.route);

  // Champs manquants
  if (substances.length === 0) out.push({ code: "no_substance", label: "Aucune substance active renseignée." });
  else if (substances.every((s) => !s.substance?.dci_fr)) out.push({ code: "no_dci", label: "DCI non renseignée." });
  if (!presentation?.pharmaceutical_form) out.push({ code: "no_form", label: "Forme pharmaceutique absente." });
  if (!presentation?.strength) out.push({ code: "no_dosage", label: "Dosage absent." });
  if (presentation?.ppv == null) out.push({ code: "no_price", label: "Prix public non renseigné." });

  // Incohérence forme ↔ voie (heuristique prudente)
  if (form && route) {
    const looksOral = ORAL_FORM_HINTS.some((h) => form.includes(h));
    const looksTopical = TOPICAL_FORM_HINTS.some((h) => form.includes(h));
    if (looksOral && route.includes("cutane")) out.push({ code: "route_mismatch", label: "Forme orale mais voie cutanée." });
    if (looksTopical && route.includes("orale")) out.push({ code: "route_mismatch_topical", label: "Forme topique mais voie orale." });
  }

  // Médicament combiné mais synthèse clinique mono-substance
  if (substances.length > 1 && monograph) {
    out.push({ code: "combo_mono_synthesis", label: "Association de substances, mais synthèse clinique pour une seule substance." });
  }

  return out;
}
