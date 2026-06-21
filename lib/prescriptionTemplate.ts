// ─────────────────────────────────────────────────────────────────────────────
// Modèle visuel d'ordonnance — configuration STRUCTURÉE (jamais une image plate).
//
// Le médecin configure une seule fois la mise en page de marque (logo, signature,
// cachet, header/footer, filigrane) ; on enregistre uniquement des COORDONNÉES
// (en mm, repère A4) + les images uploadées. Le générateur PDF reconstruit ensuite
// l'ordonnance proprement à partir de ces données. Le corps médical reste verrouillé.
//
// Stockage : localStorage (cohérent avec l'ordonnancier — aucune donnée envoyée au
// serveur). Migration-ready : structure proche d'une future table `rx_templates`.
// ─────────────────────────────────────────────────────────────────────────────

export const A4 = { width: 210, height: 297, margin: 15 } as const; // mm

export type HeaderLayout = "left" | "center" | "right";
export type TemplateStyle = "classic" | "minimal" | "bordered";

/** Boîte de positionnement en millimètres (repère A4, origine coin haut-gauche). */
export type Box = { x: number; y: number; width: number; height: number };

export type PrescriptionTemplate = {
  // ── Images uploadées (data URLs) ──
  logoDataUrl?: string;
  signatureDataUrl?: string;
  stampDataUrl?: string;
  headerImageDataUrl?: string;
  footerImageDataUrl?: string;
  watermarkDataUrl?: string;

  // ── Mise en page (mm) ──
  logo: Box;
  signature: Box;
  stamp: Box;
  watermark: Box;
  watermarkOpacity: number;   // 0 → 1
  headerHeight: number;       // hauteur de la zone d'en-tête (mm)
  footerHeight: number;       // hauteur de la zone de pied (mm)
  headerLayout: HeaderLayout; // alignement du bloc en-tête
  primaryColor: string;       // couleur d'accent (hex)
  templateStyle: TemplateStyle;

  updatedAt: string;
};

const STORE_KEY = "pharmavig_ordo_modele";

// ── Modèle par défaut MAI DAWA (fallback si aucune personnalisation) ──────────
export const DEFAULT_TEMPLATE: PrescriptionTemplate = {
  logo:       { x: A4.margin, y: A4.margin, width: 28, height: 16 },
  signature:  { x: 120, y: 252, width: 45, height: 22 },
  stamp:      { x: 30, y: 252, width: 42, height: 22 },
  watermark:  { x: 55, y: 115, width: 100, height: 60 },
  watermarkOpacity: 0.06,
  headerHeight: 32,
  footerHeight: 40,
  headerLayout: "left",
  primaryColor: "#0F5B57",
  templateStyle: "classic",
  updatedAt: "1970-01-01T00:00:00.000Z",
};

// ── Zones autorisées (dérivées des hauteurs) ─────────────────────────────────
export function headerZone(t: PrescriptionTemplate): Box {
  return { x: A4.margin, y: A4.margin, width: A4.width - 2 * A4.margin, height: t.headerHeight };
}
export function footerZone(t: PrescriptionTemplate): Box {
  return {
    x: A4.margin,
    y: A4.height - A4.margin - t.footerHeight,
    width: A4.width - 2 * A4.margin,
    height: t.footerHeight,
  };
}
/** Zone du corps médical — VERROUILLÉE (contenu non déplaçable). */
export function bodyZone(t: PrescriptionTemplate): Box {
  const top = A4.margin + t.headerHeight;
  const bottom = A4.height - A4.margin - t.footerHeight;
  return { x: A4.margin, y: top, width: A4.width - 2 * A4.margin, height: bottom - top };
}

// ── Persistance ──────────────────────────────────────────────────────────────
export function readTemplate(): PrescriptionTemplate {
  if (typeof window === "undefined") return DEFAULT_TEMPLATE;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULT_TEMPLATE;
    return { ...DEFAULT_TEMPLATE, ...(JSON.parse(raw) as Partial<PrescriptionTemplate>) };
  } catch {
    return DEFAULT_TEMPLATE;
  }
}

/** true si le médecin a déjà personnalisé un modèle (sinon on utilise le défaut). */
export function hasCustomTemplate(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(STORE_KEY);
}

export function saveTemplate(t: PrescriptionTemplate): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...t, updatedAt: new Date().toISOString() }));
  } catch {
    /* quota / mode privé : ignoré */
  }
}

export function resetTemplate(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(STORE_KEY); } catch {}
}

// ── Validation d'upload d'image ──────────────────────────────────────────────
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 Mo
// PNG/JPEG uniquement : seuls formats rendus de façon fiable par jsPDF (addImage).
const ALLOWED_TYPES = ["image/png", "image/jpeg"];

export type UploadResult = { ok: true; dataUrl: string } | { ok: false; error: string };

export function validateImageFile(file: File): Promise<UploadResult> {
  return new Promise((resolve) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      resolve({ ok: false, error: "Format non supporté (PNG ou JPEG)." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      resolve({ ok: false, error: "Image trop volumineuse (max 2 Mo)." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ ok: true, dataUrl: reader.result as string });
    reader.onerror = () => resolve({ ok: false, error: "Lecture du fichier impossible." });
    reader.readAsDataURL(file);
  });
}

/** Détecte le format jsPDF depuis un data URL image. */
export function imageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  if (dataUrl.startsWith("data:image/jpeg")) return "JPEG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  return "PNG";
}
