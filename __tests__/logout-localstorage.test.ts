/**
 * Vérifie que la déconnexion purge les clés ordonnancier du localStorage.
 * Teste la logique de purge isolément, sans monter tout le AuthContext.
 */
import { describe, it, expect, beforeEach } from "vitest";

const ORDO_KEYS = [
  "pharmavig_ordo_historique",
  "pharmavig_ordo_patients_recents",
];

// Reproduit la logique de purge de AuthContext.tsx
function purgeOrdonnancierStorage() {
  ORDO_KEYS.forEach((k) => localStorage.removeItem(k));
}

describe("logout — purge localStorage ordonnancier", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("supprime les deux clés ordonnancier après logout", () => {
    localStorage.setItem("pharmavig_ordo_historique", JSON.stringify([{ id: 1 }]));
    localStorage.setItem("pharmavig_ordo_patients_recents", JSON.stringify(["Alice"]));

    purgeOrdonnancierStorage();

    expect(localStorage.getItem("pharmavig_ordo_historique")).toBeNull();
    expect(localStorage.getItem("pharmavig_ordo_patients_recents")).toBeNull();
  });

  it("n'explose pas si les clés sont déjà absentes", () => {
    expect(() => purgeOrdonnancierStorage()).not.toThrow();
  });

  it("ne supprime pas d'autres clés non pharmavig", () => {
    localStorage.setItem("autre_app_data", "garder");
    purgeOrdonnancierStorage();
    expect(localStorage.getItem("autre_app_data")).toBe("garder");
  });
});
