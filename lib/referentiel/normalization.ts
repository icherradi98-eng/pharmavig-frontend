// ─────────────────────────────────────────────────────────────────────────────
// Normalisation & résolution DCI — référentiel Morocco-first.
//
// Fonctions pures, sans état, migration-ready : la même logique vaudra côté
// Postgres (colonnes normalized_name / normalized_brand_name). Centralise la
// normalisation des noms, la détection des produits combinés, les alternatives
// par DCI et la génération de slugs stables.
// ─────────────────────────────────────────────────────────────────────────────

import { referentielData } from "./index";
import type { MedicinalProduct, Substance } from "./types";

// ── Normalisation de chaînes ─────────────────────────────────────────────────

/** Minuscule, sans accents, espaces compactés. Base de toute comparaison. */
function baseNormalize(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalise un nom de DCI (substance active) pour recherche/comparaison. */
export function normalizeDci(dci: string): string {
  return baseNormalize(dci);
}

/**
 * Normalise un nom commercial : retire le dosage, l'unité et les mentions de
 * forme galénique courantes pour rapprocher les variantes d'une même marque
 * (ex. "DOLIPRANE 1000 MG CPR" → "doliprane").
 */
export function normalizeBrand(brand: string): string {
  let s = baseNormalize(brand);
  // dosages : "500 mg", "5 mg/ml", "10%", "1000ui"
  s = s.replace(/\b\d+([.,]\d+)?\s*(mg|g|ml|mcg|ug|µg|ui|%|mg\/ml|g\/l)\b/g, " ");
  // mentions de forme/galénique fréquentes
  s = s.replace(/\b(lp|cr|cpr|comprime[s]?|gelule[s]?|sirop|solution|suspension|injectable|pommade|creme|gouttes?|sachet[s]?|flacon|ad|enf|fort[e]?|retard)\b/g, " ");
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Slug stable et déterministe pour une DCI — clé d'URL canonique
 * (ex. "ACIDE CLAVULANIQUE" → "acide-clavulanique").
 */
export function dciSlug(dci: string): string {
  return normalizeDci(dci)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Index ────────────────────────────────────────────────────────────────────

const substanceById = new Map(referentielData.substances.map((s) => [s.id, s]));
const linksByProduct = new Map<string, typeof referentielData.product_substances>();
for (const l of referentielData.product_substances) {
  const arr = linksByProduct.get(l.product_id) ?? [];
  arr.push(l);
  linksByProduct.set(l.product_id, arr);
}
const productById = new Map(referentielData.medicinal_products.map((p) => [p.id, p]));

// ── Substances actives d'un produit ──────────────────────────────────────────

/** Substances actives d'un produit (role active_substance). */
export function getActiveSubstances(productId: string): Substance[] {
  const links = linksByProduct.get(productId) ?? [];
  return links
    .filter((l) => l.role === "active_substance")
    .map((l) => substanceById.get(l.substance_id))
    .filter((s): s is Substance => !!s);
}

/** true si le produit contient plusieurs substances actives (association). */
export function isCombinationProduct(productId: string): boolean {
  return getActiveSubstances(productId).length > 1;
}

// ── Alternatives par DCI ─────────────────────────────────────────────────────

/**
 * Spécialités marocaines partageant exactement le même ensemble de substances
 * actives qu'une DCI donnée. Pour une mono-substance, renvoie toutes les
 * spécialités contenant cette substance (princeps d'abord).
 */
export function listAlternativesByDci(dci: string): MedicinalProduct[] {
  const target = normalizeDci(dci);
  const substance = referentielData.substances.find((s) => normalizeDci(s.dci_fr) === target);
  if (!substance) return [];

  const out: MedicinalProduct[] = [];
  const seen = new Set<string>();
  for (const l of referentielData.product_substances) {
    if (l.substance_id !== substance.id || seen.has(l.product_id)) continue;
    const p = productById.get(l.product_id);
    if (!p) continue;
    seen.add(l.product_id);
    out.push(p);
  }
  const rank: Record<string, number> = { princeps: 0, generic: 1, biosimilar: 2, hybrid: 3, unknown: 4 };
  return out.sort((a, b) => {
    const r = (rank[a.product_type] ?? 9) - (rank[b.product_type] ?? 9);
    return r !== 0 ? r : a.brand_name.localeCompare(b.brand_name);
  });
}

// ── Audit léger (réutilisable côté outillage / tests) ────────────────────────

/** Détecte les liens product_substances pointant vers une substance inexistante. */
export function findBrokenSubstanceRefs(): { product_id: string; substance_id: string }[] {
  const ids = new Set(referentielData.substances.map((s) => s.id));
  return referentielData.product_substances
    .filter((l) => !ids.has(l.substance_id))
    .map((l) => ({ product_id: l.product_id, substance_id: l.substance_id }));
}
