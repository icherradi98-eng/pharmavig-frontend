/**
 * Garde-fou qualité du seed référentiel médicament (CI).
 * Réutilise la MÊME logique que `npm run validate:referentiel` (source unique :
 * scripts/referentiel/validate-seed.mjs) pour empêcher toute régression du seed
 * à chaque modification ou futur import CNOPS.
 */
import { describe, it, expect } from "vitest";
import { validateSeed } from "../scripts/referentiel/validate-seed.mjs";
import seed from "@/lib/referentiel/seed.ma.json";

const result = validateSeed(seed as unknown as Record<string, unknown>);

describe("seed référentiel — checks bloquants", () => {
  it("ne contient AUCUNE erreur bloquante", () => {
    // Message lisible en cas d'échec
    expect(result.errors, result.errors.join("\n")).toEqual([]);
  });

  it("a un volume de données cohérent", () => {
    expect(result.stats.products).toBeGreaterThan(300);
    expect(result.stats.substances).toBeGreaterThan(100);
  });

  it("a tous les produits liés à une substance active (aucun lien FK cassé)", () => {
    const fkBroken = result.errors.filter((e: string) => e.includes("substance inexistante"));
    expect(fkBroken).toEqual([]);
  });
});

describe("seed référentiel — warnings (non bloquants, suivi)", () => {
  it("expose les warnings sans faire échouer la CI", () => {
    // On vérifie juste que la structure existe ; les warnings sont informatifs.
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});
