/**
 * Vérifie que la Content-Security-Policy ne régresserait pas vers des valeurs
 * permissives. Teste la valeur exportée directement depuis next.config.ts.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";

const configSrc = readFileSync(
  path.resolve(__dirname, "../next.config.ts"),
  "utf-8"
);

describe("next.config.ts — Content-Security-Policy", () => {
  it("contient frame-ancestors 'none' (anti-clickjacking)", () => {
    expect(configSrc).toContain("frame-ancestors 'none'");
  });

  it("connect-src ne contient pas de wildcard *", () => {
    const connectSrcLine = configSrc
      .split("\n")
      .find((l) => l.includes("connect-src"));
    expect(connectSrcLine).toBeTruthy();
    // Le wildcard brut * (hors sous-domaine *.railway.app) n'est pas autorisé
    const stripped = connectSrcLine!.replace(/\*\.\w+/g, "");
    expect(stripped).not.toMatch(/connect-src[^"]*\s\*/);
  });

  it("object-src et base-uri sont restreints à 'none'/'self'", () => {
    expect(configSrc).toContain("object-src 'none'");
    expect(configSrc).toContain("base-uri 'self'");
  });
});
