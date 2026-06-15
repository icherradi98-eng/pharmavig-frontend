"use client";

/**
 * ScanBoite — Scanner de boîte médicament
 *
 * Stratégie 1 : BarcodeDetector API (natif Chrome/Edge mobile) → très rapide
 * Stratégie 2 : ZXing via caméra en temps réel (tous navigateurs)
 * Stratégie 3 : Upload photo → ZXing sur image statique (fallback universel)
 *
 * Décode les codes GS1 DataMatrix (boîtes européennes/marocaines) et EAN-13.
 * Extrait : GTIN, lot, date d'expiration, numéro de série.
 * Recherche le nom commercial via OpenFDA (GTIN → NDC).
 */

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScannedData = {
  /** Texte brut du code-barres */
  raw: string;
  /** Format détecté */
  format: string;
  /** GTIN/EAN (01) */
  gtin?: string;
  /** Numéro de lot (10) */
  lot?: string;
  /** Date d'expiration YYMMDD (17) */
  expiryRaw?: string;
  /** Date formatée ISO YYYY-MM-DD */
  expiryDate?: string;
  /** Numéro de série (21) */
  serial?: string;
  /** Nom commercial issu d'OpenFDA (si trouvé) */
  nomCommercial?: string;
  /** DCI issu d'OpenFDA */
  dci?: string;
};

// ─── Parser GS1 DataMatrix ────────────────────────────────────────────────────

/**
 * Décode les Application Identifiers GS1 dans un texte DataMatrix.
 * Format : (01)03701234000024(10)LOT123(17)251231(21)SN456
 * Ou sans parenthèses : 0103701234000024101234567891712312121...
 */
function parseGS1(raw: string): Partial<ScannedData> {
  const result: Partial<ScannedData> = {};

  // Format avec parenthèses : (01)... (10)... etc.
  if (raw.includes("(")) {
    const gtin = raw.match(/\(01\)(\d{14})/)?.[1];
    const lot   = raw.match(/\(10\)([^\(]+)/)?.[1]?.trim();
    const exp   = raw.match(/\(17\)(\d{6})/)?.[1];
    const sn    = raw.match(/\(21\)([^\(]+)/)?.[1]?.trim();

    if (gtin) result.gtin = gtin;
    if (lot)  result.lot  = lot;
    if (exp)  { result.expiryRaw = exp; result.expiryDate = gs1DateToISO(exp); }
    if (sn)   result.serial = sn;
    return result;
  }

  // Format GS1 sans parenthèses (séquence brute)
  let pos = 0;
  while (pos < raw.length) {
    const ai2 = raw.substring(pos, pos + 2);
    const ai4 = raw.substring(pos, pos + 4);

    if (ai4 === "0100" || ai2 === "01") {
      const start = ai4 === "0100" ? pos + 4 : pos + 2;
      result.gtin = raw.substring(start, start + 14);
      pos = start + 14;
    } else if (ai2 === "10") {
      pos += 2;
      // Lot : variable length, se termine au prochain AI connu ou fin
      const end = raw.search(/(?<=.{${pos}})(?:17|21|11|00)\d/);
      result.lot = end > pos ? raw.substring(pos, end) : raw.substring(pos, pos + 20).trim();
      pos = end > pos ? end : pos + (result.lot?.length ?? 0);
    } else if (ai2 === "17") {
      result.expiryRaw = raw.substring(pos + 2, pos + 8);
      result.expiryDate = gs1DateToISO(result.expiryRaw);
      pos += 8;
    } else if (ai2 === "21") {
      pos += 2;
      result.serial = raw.substring(pos, pos + 20).trim();
      pos += result.serial.length;
    } else {
      pos++; // avancer si AI non reconnu
    }
  }

  return result;
}

function gs1DateToISO(gs1: string): string {
  // YYMMDD → YYYY-MM-DD (les deux chiffres année : < 50 = 2000+, ≥ 50 = 1900+)
  if (gs1.length !== 6) return "";
  const yy = parseInt(gs1.substring(0, 2));
  const mm = gs1.substring(2, 4);
  const dd = gs1.substring(4, 6);
  const yyyy = yy < 50 ? `20${yy.toString().padStart(2, "0")}` : `19${yy}`;
  // Si DD = "00", signifie "fin du mois"
  const day = dd === "00" ? new Date(parseInt(yyyy), parseInt(mm), 0).getDate().toString() : dd;
  return `${yyyy}-${mm}-${day.padStart(2, "0")}`;
}

// ─── Lookup OpenFDA par GTIN ──────────────────────────────────────────────────
// Désactivé : OpenFDA est une base US (FDA) — les GTIN marocains n'y sont pas
// référencés et les noms retournés (brand_name FDA) peuvent différer des noms
// commerciaux marocains, créant un risque d'erreur de déclaration.
// À remplacer par une lookup BDPM/DMP marocain quand disponible.
async function lookupByGTIN(_gtin: string): Promise<{ nomCommercial?: string; dci?: string }> {
  return {};
}

// ─── Composant principal ──────────────────────────────────────────────────────

type ScanBoiteProps = {
  onScanned: (data: ScannedData) => void;
  onClose: () => void;
};

type ScanState = "idle" | "camera" | "scanning" | "success" | "error";

export default function ScanBoite({ onScanned, onClose }: ScanBoiteProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScannedData | null>(null);
  const [error, setError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  // Nettoyage caméra
  const stopCamera = useCallback(() => {
    if (scannerRef.current) { clearInterval(scannerRef.current); scannerRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Démarrer caméra ────────────────────────────────────────────────────────

  async function startCamera() {
    setState("camera");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      startDetectionLoop();
    } catch {
      setError("Impossible d'accéder à la caméra. Utilisez l'option 'Importer une photo'.");
      setState("error");
    }
  }

  // ── Boucle de détection (BarcodeDetector natif si dispo) ──────────────────

  function startDetectionLoop() {
    // @ts-expect-error — BarcodeDetector n'est pas encore dans les types TS standard
    if (!window.BarcodeDetector) {
      // Fallback : ZXing en dynamique
      startZXingLoop();
      return;
    }
    // @ts-expect-error BarcodeDetector n'est pas encore dans les types lib.dom de TS
    const detector = new window.BarcodeDetector({
      formats: ["data_matrix", "qr_code", "ean_13", "ean_8", "code_128", "pdf417"],
    });
    scannerRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          clearInterval(scannerRef.current!);
          await handleRaw(barcodes[0].rawValue, barcodes[0].format);
        }
      } catch {}
    }, 250) as unknown as ReturnType<typeof setInterval>;
  }

  async function startZXingLoop() {
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      if (!videoRef.current) return;
      reader.decodeFromVideoElement(videoRef.current, async (res) => {
        if (res) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (reader as any).reset?.();
          await handleRaw(res.getText(), res.getBarcodeFormat().toString());
        }
      });
    } catch {
      setError("Scanner non disponible. Utilisez l'option 'Importer une photo'.");
      setState("error");
    }
  }

  // ── Traitement résultat brut ───────────────────────────────────────────────

  async function handleRaw(raw: string, format: string) {
    stopCamera();
    setState("scanning");
    const gs1 = parseGS1(raw);
    const data: ScannedData = { raw, format, ...gs1 };

    // Lookup OpenFDA si GTIN présent
    if (gs1.gtin) {
      setLookingUp(true);
      const fda = await lookupByGTIN(gs1.gtin);
      if (fda.nomCommercial) data.nomCommercial = fda.nomCommercial;
      if (fda.dci) data.dci = fda.dci;
      setLookingUp(false);
    }

    setResult(data);
    setState("success");
  }

  // ── Upload fichier ─────────────────────────────────────────────────────────

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setState("scanning");
    setError("");
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const img = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      // Utiliser decodeFromImageUrl sur un blob URL
      const url = URL.createObjectURL(file);
      const res = await reader.decodeFromImageUrl(url);
      URL.revokeObjectURL(url);
      await handleRaw(res.getText(), res.getBarcodeFormat().toString());
    } catch {
      setError("Aucun code-barres détecté dans cette image. Essayez une photo plus nette ou rapprochez-vous.");
      setState("error");
    }
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-base">📦 Scanner une boîte</h2>
            <p className="text-xs text-gray-400 mt-0.5">Code DataMatrix, EAN-13 ou QR Code</p>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Contenu */}
        <div className="p-5 space-y-4">

          {/* État : idle */}
          {state === "idle" && (
            <div className="space-y-3">
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-semibold text-sm transition-colors"
                style={{ background: "#0F5B57" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Utiliser la caméra
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-gray-700 font-semibold text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Importer une photo
              </button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
              <p className="text-xs text-center text-gray-400">
                Pointez vers le DataMatrix (petit carré pixelisé) ou le code-barres EAN sur la boîte.
              </p>
            </div>
          )}

          {/* État : caméra active */}
          {state === "camera" && (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
                {/* Viseur */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white/70 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br" />
                    {/* Ligne de scan animée */}
                    <div className="absolute left-0 right-0 h-0.5 bg-teal-400/80 animate-scan" style={{ top: "50%", animation: "scan 1.5s ease-in-out infinite alternate" }} />
                  </div>
                </div>
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="text-white text-xs bg-black/50 px-3 py-1 rounded-full">Recherche du code-barres…</span>
                </div>
              </div>
              <button onClick={() => { stopCamera(); setState("idle"); }} className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">
                Annuler
              </button>
            </div>
          )}

          {/* État : analyse en cours */}
          {state === "scanning" && (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-teal-700/20 border-t-teal-700 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600 font-medium">
                {lookingUp ? "Recherche du médicament…" : "Analyse du code-barres…"}
              </p>
            </div>
          )}

          {/* État : erreur */}
          {state === "error" && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 text-center">
                {error}
              </div>
              <button onClick={() => setState("idle")} className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">
                Réessayer
              </button>
            </div>
          )}

          {/* État : succès */}
          {state === "success" && result && (
            <div className="space-y-4">
              {/* Carte résultat */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-emerald-600 text-lg">✅</span>
                  <span className="font-semibold text-emerald-800 text-sm">Code-barres décodé</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-auto">{result.format}</span>
                </div>
                {result.nomCommercial && <Row label="Médicament" value={result.nomCommercial} highlight />}
                {result.dci && result.dci !== result.nomCommercial && <Row label="DCI" value={result.dci} />}
                {result.lot && <Row label="N° de lot" value={result.lot} />}
                {result.expiryDate && <Row label="Date d'expiration" value={new Date(result.expiryDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} />}
                {result.gtin && <Row label="GTIN" value={result.gtin} mono />}
                {!result.nomCommercial && !result.lot && !result.expiryDate && (
                  <Row label="Données brutes" value={result.raw.slice(0, 60)} mono />
                )}
              </div>

              {/* Actions */}
              <button
                onClick={() => { onScanned(result); onClose(); }}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors"
                style={{ background: "#0F5B57" }}
              >
                ✓ Utiliser ces données dans le formulaire
              </button>
              <button
                onClick={() => { setState("idle"); setResult(null); }}
                className="w-full py-2 rounded-xl text-gray-500 text-sm hover:text-gray-700 underline"
              >
                Scanner à nouveau
              </button>
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          from { top: 20%; }
          to   { top: 80%; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 shrink-0 w-32">{label}</span>
      <span className={`font-medium ${highlight ? "text-emerald-800" : "text-gray-900"} ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
