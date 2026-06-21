/**
 * Verrouille la logique pure du modèle visuel d'ordonnance : maths des zones
 * (header/footer/body cohérents et non chevauchants) et validation d'upload.
 */
import { describe, it, expect } from "vitest";
import {
  A4, DEFAULT_TEMPLATE, headerZone, footerZone, bodyZone, imageFormat, validateImageFile,
} from "@/lib/prescriptionTemplate";

describe("zones A4", () => {
  it("header en haut, footer en bas, body au milieu — sans chevauchement", () => {
    const t = DEFAULT_TEMPLATE;
    const hz = headerZone(t), fz = footerZone(t), bz = bodyZone(t);
    // header commence à la marge
    expect(hz.y).toBe(A4.margin);
    // body commence juste après le header
    expect(bz.y).toBe(A4.margin + t.headerHeight);
    // body se termine là où commence le footer
    expect(bz.y + bz.height).toBeCloseTo(fz.y, 5);
    // footer se termine à la marge basse
    expect(fz.y + fz.height).toBeCloseTo(A4.height - A4.margin, 5);
    // largeurs = contenu utile
    const contentW = A4.width - 2 * A4.margin;
    expect(hz.width).toBe(contentW);
    expect(fz.width).toBe(contentW);
    expect(bz.width).toBe(contentW);
    // body a une hauteur positive
    expect(bz.height).toBeGreaterThan(0);
  });
});

describe("imageFormat", () => {
  it("détecte JPEG et PNG depuis le data URL", () => {
    expect(imageFormat("data:image/jpeg;base64,xxx")).toBe("JPEG");
    expect(imageFormat("data:image/png;base64,xxx")).toBe("PNG");
    expect(imageFormat("data:something/else")).toBe("PNG"); // défaut sûr
  });
});

describe("validateImageFile", () => {
  it("rejette un format non supporté", async () => {
    const f = new File(["x"], "doc.pdf", { type: "application/pdf" });
    const res = await validateImageFile(f);
    expect(res.ok).toBe(false);
  });

  it("rejette une image trop volumineuse (> 2 Mo)", async () => {
    const big = new Uint8Array(2 * 1024 * 1024 + 10);
    const f = new File([big], "logo.png", { type: "image/png" });
    const res = await validateImageFile(f);
    expect(res.ok).toBe(false);
  });

  it("accepte un PNG valide et retourne un data URL", async () => {
    const f = new File([new Uint8Array([1, 2, 3])], "logo.png", { type: "image/png" });
    const res = await validateImageFile(f);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.dataUrl.startsWith("data:")).toBe(true);
  });
});
