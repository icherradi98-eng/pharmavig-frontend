/**
 * Tests du moteur de matching BDPM (lib/referentiel/bdpmMatcher).
 * Vérifie les garde-fous de sécurité clinique — rejets durs et la règle
 * CNOPS DCI1 — SANS modifier la logique (tests d'observation uniquement).
 */
import { describe, it, expect } from "vitest";
import {
  matchBdpmCandidate,
  type LocalProductContext,
  type BdpmCandidate,
} from "@/lib/referentiel/bdpmMatcher";

function local(over: Partial<LocalProductContext>): LocalProductContext {
  return {
    brandName: "PRODUIT",
    substances: [],
    form: null,
    route: null,
    substance_completeness_status: "complete",
    ...over,
  };
}

describe("matchBdpmCandidate — rejets durs", () => {
  it("rejette une composition incompatible (aucune substance commune, pas de marque)", () => {
    const r = matchBdpmCandidate(
      local({ brandName: "DOLIPRANE", substances: ["paracetamol"] }),
      { denomination: "ADVIL", substances: ["ibuprofene"] } as BdpmCandidate,
    );
    expect(r.status).toBe("rejected");
    expect(r.rejection_code).toBe("composition_mismatch");
    expect(r.score).toBe(0);
  });

  it("rejette une voie d'administration incompatible (orale vs ophtalmique)", () => {
    const r = matchBdpmCandidate(
      local({ brandName: "X", substances: ["tobramycine"], route: "orale" }),
      { denomination: "X", substances: ["tobramycine"], voies: ["ophtalmique"] } as BdpmCandidate,
    );
    expect(r.status).toBe("rejected");
    expect(r.rejection_code).toBe("route_mismatch");
  });

  it("rejette une forme pharmaceutique incompatible (comprimé vs injectable)", () => {
    const r = matchBdpmCandidate(
      local({ brandName: "Y", substances: ["amoxicilline"], form: "comprimé" }),
      { denomination: "Y", substances: ["amoxicilline"], forme: "solution injectable" } as BdpmCandidate,
    );
    expect(r.status).toBe("rejected");
    expect(r.rejection_code).toBe("form_mismatch");
  });
});

describe("matchBdpmCandidate — sécurité CNOPS DCI1", () => {
  it("ne valide PAS un candidat avec des substances supplémentaires si le contexte local est incomplet", () => {
    // Local connaît 1 SA (DCI1 CNOPS) mais BDPM en a 2 → composition non vérifiable
    const r = matchBdpmCandidate(
      local({
        brandName: "TOBRADEX",
        substances: ["tobramycine"],
        route: "ophtalmique",
        form: "collyre",
        substance_completeness_status: "incomplete",
      }),
      {
        denomination: "TOBRADEX",
        substances: ["tobramycine", "dexamethasone"],
        voies: ["ophtalmique"],
        forme: "collyre",
      } as BdpmCandidate,
    );
    expect(r.status).toBe("needs_review");
    expect(r.status).not.toBe("accepted");
    expect(r.reason).toContain("local_substance_context_incomplete");
  });
});

describe("matchBdpmCandidate — cas valide", () => {
  it("accepte un candidat marque + substance + voie + forme concordantes (contexte complet)", () => {
    const r = matchBdpmCandidate(
      local({
        brandName: "ELOXATINE",
        substances: ["oxaliplatine"],
        route: "intraveineuse",
        form: "solution pour perfusion",
        substance_completeness_status: "complete",
      }),
      {
        denomination: "ELOXATINE",
        substances: ["oxaliplatine"],
        voies: ["intraveineuse"],
        forme: "solution pour perfusion",
      } as BdpmCandidate,
    );
    expect(r.status).toBe("accepted");
    expect(r.confidence).toBe("high");
    expect(r.rejection_code).toBeUndefined();
  });
});
