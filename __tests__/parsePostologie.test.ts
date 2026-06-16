import { describe, it, expect } from "vitest";
import { parsePostologie } from "@/lib/parsePostologie";

describe("parsePostologie — cas critiques ordonnancier", () => {
  it("parse dose + unité + fréquence standard", () => {
    const r = parsePostologie("500 mg 2x/jour");
    expect(r).not.toBeNull();
    expect(r!.dose).toBe("500");
    expect(r!.unite).toBe("mg");
    expect(r!.frequence).toBe("2×/jour");
    expect(r!.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("normalise 'matin et soir' → 2×/jour", () => {
    const r = parsePostologie("1 g matin et soir");
    expect(r).not.toBeNull();
    expect(r!.unite).toBe("g");
    expect(r!.frequence).toBe("2×/jour");
  });

  it("retourne null sur entrée totalement non parseable", () => {
    expect(parsePostologie("blabla inconnu")).toBeNull();
    expect(parsePostologie("")).toBeNull();
  });

  it("parse mg/kg (onco pédiatrique)", () => {
    const r = parsePostologie("50 mg/kg 1x/jour");
    expect(r).not.toBeNull();
    expect(r!.unite).toBe("mg/kg");
    expect(r!.frequence).toBe("1×/jour");
  });

  it("parse mg/m² suivi d'un espace (protocole onco)", () => {
    const r = parsePostologie("175 mg/m² J1-J21");
    expect(r).not.toBeNull();
    expect(r!.unite).toBe("mg/m²");
  });
});
