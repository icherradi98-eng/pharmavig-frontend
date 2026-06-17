/**
 * Tests du référentiel Morocco-first (logique pure, sans DOM ni backend).
 * Verrouille la normalisation des substances et la recherche produit — le cœur
 * différenciant du produit. Ne teste PAS le matching BDPM lui-même (intouché).
 */
import { describe, it, expect } from "vitest";
import { searchProducts, referentielStats, referentielData } from "@/lib/referentiel/index";
import { normalizeSubstanceName } from "@/lib/referentiel/bdpmMatcher";

describe("normalizeSubstanceName", () => {
  it("retire les accents et met en minuscules", () => {
    expect(normalizeSubstanceName("Paracétamol")).toBe("paracetamol");
  });

  it("réduit les espaces multiples et trim", () => {
    expect(normalizeSubstanceName("  Acide   Acétylsalicylique ")).toBe("acide acetylsalicylique");
  });

  it("est idempotent", () => {
    const once = normalizeSubstanceName("Amoxicilline");
    expect(normalizeSubstanceName(once)).toBe(once);
  });
});

describe("searchProducts", () => {
  it("retourne [] pour une requête trop courte (< 2 caractères)", () => {
    expect(searchProducts("")).toEqual([]);
    expect(searchProducts("a")).toEqual([]);
  });

  it("retourne [] quand rien ne correspond", () => {
    expect(searchProducts("zzzxqwk-introuvable")).toEqual([]);
  });

  it("trouve un produit réel du référentiel et expose les bons champs", () => {
    const sample = referentielData.medicinal_products[0];
    const results = searchProducts(sample.brand_name);
    expect(results.length).toBeGreaterThan(0);
    const match = results.find((r) => r.id === sample.id);
    expect(match).toBeDefined();
    // Champs attendus par l'UI (badges source / disponibilité)
    expect(match).toHaveProperty("brand_name");
    expect(match).toHaveProperty("dci");
    expect(match).toHaveProperty("availability_status");
    expect(match).toHaveProperty("validation_status");
  });

  it("respecte la limite de résultats", () => {
    // Une lettre fréquente pour maximiser les correspondances, limite = 1
    const limited = searchProducts(referentielData.medicinal_products[0].brand_name.slice(0, 3), 1);
    expect(limited.length).toBeLessThanOrEqual(1);
  });
});

describe("référentiel embarqué", () => {
  it("contient des données (produits + substances)", () => {
    expect(referentielStats.products).toBeGreaterThan(0);
    expect(referentielStats.substances).toBeGreaterThan(0);
  });
});
