"use client";

import { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import MedecinLayout, { PageHeader } from "@/components/medecin/MedecinLayout";
import {
  A4, readTemplate, saveTemplate, resetTemplate, hasCustomTemplate,
  headerZone, footerZone, bodyZone, validateImageFile,
  type PrescriptionTemplate, type Box, type HeaderLayout, type TemplateStyle,
} from "@/lib/prescriptionTemplate";
import { readProfile } from "@/lib/ordonnancier";
import { generateOrdonnancePDF } from "@/lib/generateOrdonnancePDF";

// Échelle d'affichage : px par mm (A4 = 210×297 mm → 504×713 px).
const S = 2.4;
const mmToPx = (mm: number) => mm * S;
const pxToMm = (px: number) => px / S;

type AssetKey = "logo" | "signature" | "stamp" | "watermark";
type ImageKey = "logoDataUrl" | "signatureDataUrl" | "stampDataUrl" | "headerImageDataUrl" | "footerImageDataUrl" | "watermarkDataUrl";

export default function ModeleOrdonnancePage() {
  const [tpl, setTpl] = useState<PrescriptionTemplate | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [custom, setCustom] = useState(false);

  // Chargement post-montage (localStorage = système externe).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture localStorage post-montage
    setTpl(readTemplate());
    setCustom(hasCustomTemplate());
    setLoaded(true);
  }, []);

  function patch(p: Partial<PrescriptionTemplate>) {
    setTpl((t) => (t ? { ...t, ...p } : t));
    setSaved(false);
  }
  function patchBox(key: AssetKey, box: Box) {
    setTpl((t) => (t ? { ...t, [key]: box } : t));
    setSaved(false);
  }

  async function handleUpload(field: ImageKey, file: File | null) {
    setUploadError("");
    if (!file) return;
    const res = await validateImageFile(file);
    if (!res.ok) { setUploadError(res.error); return; }
    patch({ [field]: res.dataUrl } as Partial<PrescriptionTemplate>);
  }
  function clearImage(field: ImageKey) { patch({ [field]: undefined } as Partial<PrescriptionTemplate>); }

  function handleSave() {
    if (!tpl) return;
    saveTemplate(tpl);
    setSaved(true);
    setCustom(true);
    setTimeout(() => setSaved(false), 2500);
  }
  function handleReset() {
    resetTemplate();
    const fresh = readTemplate();
    setTpl(fresh);
    setCustom(false);
  }
  async function handlePreviewPdf() {
    if (!tpl) return;
    await generateOrdonnancePDF(SAMPLE_ORDONNANCE, readProfile(), tpl);
  }

  if (!loaded || !tpl) {
    return (
      <MedecinLayout>
        <PageHeader title="Modèle d'ordonnance" subtitle="Chargement…" />
      </MedecinLayout>
    );
  }

  const hz = headerZone(tpl), fz = footerZone(tpl), bz = bodyZone(tpl);

  return (
    <MedecinLayout>
      <PageHeader
        title="Modèle d'ordonnance"
        subtitle="Personnalisez votre mise en page une fois — MAI DAWA l'applique à chaque ordonnance."
      />

      <div className="px-5 md:px-8 py-6 flex flex-col lg:flex-row gap-8">
        {/* ── Aperçu A4 contrôlé ── */}
        <div className="shrink-0">
          <p className="text-xs text-gray-400 mb-2">Aperçu A4 — déplacez/redimensionnez le logo (en-tête), la signature et le cachet (pied).</p>
          <div
            className="relative bg-white shadow-md mx-auto"
            style={{ width: mmToPx(A4.width), height: mmToPx(A4.height), border: "1px solid #e5e7eb" }}
          >
            {/* Filigrane (derrière) */}
            {tpl.watermarkDataUrl && (
              <Rnd
                bounds="parent"
                size={{ width: mmToPx(tpl.watermark.width), height: mmToPx(tpl.watermark.height) }}
                position={{ x: mmToPx(tpl.watermark.x), y: mmToPx(tpl.watermark.y) }}
                onDragStop={(_e, d) => patchBox("watermark", { ...tpl.watermark, x: pxToMm(d.x), y: pxToMm(d.y) })}
                onResizeStop={(_e, _dir, ref, _delta, pos) =>
                  patchBox("watermark", { x: pxToMm(pos.x), y: pxToMm(pos.y), width: pxToMm(ref.offsetWidth), height: pxToMm(ref.offsetHeight) })}
                style={{ zIndex: 0, opacity: tpl.watermarkOpacity }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tpl.watermarkDataUrl} alt="Filigrane" className="w-full h-full object-contain pointer-events-none select-none" draggable={false} />
              </Rnd>
            )}

            {/* Zone en-tête */}
            <div
              style={{
                position: "absolute", left: mmToPx(hz.x), top: mmToPx(hz.y),
                width: mmToPx(hz.width), height: mmToPx(hz.height),
                background: "rgba(15,91,87,0.04)", border: "1px dashed rgba(15,91,87,0.25)", zIndex: 1,
              }}
            >
              {tpl.headerImageDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={tpl.headerImageDataUrl} alt="En-tête" className="w-full h-full object-contain" />
              ) : (
                <>
                  <div className="absolute inset-0 flex flex-col justify-center px-2 pointer-events-none"
                    style={{ alignItems: tpl.headerLayout === "left" ? "flex-start" : tpl.headerLayout === "right" ? "flex-end" : "center", textAlign: tpl.headerLayout }}>
                    <span className="text-[10px] font-bold text-gray-800">Dr. Prénom Nom</span>
                    <span className="text-[8px] text-gray-500">Spécialité · N° Ordre</span>
                  </div>
                  {tpl.logoDataUrl && (
                    <Rnd
                      bounds="parent"
                      size={{ width: mmToPx(tpl.logo.width), height: mmToPx(tpl.logo.height) }}
                      position={{ x: mmToPx(tpl.logo.x - hz.x), y: mmToPx(tpl.logo.y - hz.y) }}
                      onDragStop={(_e, d) => patchBox("logo", { ...tpl.logo, x: pxToMm(d.x) + hz.x, y: pxToMm(d.y) + hz.y })}
                      onResizeStop={(_e, _dir, ref, _delta, pos) =>
                        patchBox("logo", { x: pxToMm(pos.x) + hz.x, y: pxToMm(pos.y) + hz.y, width: pxToMm(ref.offsetWidth), height: pxToMm(ref.offsetHeight) })}
                      style={{ zIndex: 2, border: "1px solid rgba(15,91,87,0.4)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tpl.logoDataUrl} alt="Logo" className="w-full h-full object-contain select-none" draggable={false} />
                    </Rnd>
                  )}
                </>
              )}
            </div>

            {/* Corps médical — VERROUILLÉ */}
            <div
              style={{ position: "absolute", left: mmToPx(bz.x), top: mmToPx(bz.y), width: mmToPx(bz.width), height: mmToPx(bz.height), zIndex: 1 }}
              className="flex flex-col gap-1.5 px-2 py-2"
            >
              <span className="text-[9px] font-bold text-gray-300">Rp/ — contenu médical (verrouillé)</span>
              {[80, 65, 72, 50].map((w, i) => (
                <div key={i} className="h-1.5 rounded-full bg-gray-100" style={{ width: `${w}%` }} />
              ))}
              <span className="text-[7px] text-gray-300 mt-1">Patient, médicaments, posologies et sécurité ne sont pas déplaçables.</span>
            </div>

            {/* Zone pied */}
            <div
              style={{
                position: "absolute", left: mmToPx(fz.x), top: mmToPx(fz.y),
                width: mmToPx(fz.width), height: mmToPx(fz.height),
                background: "rgba(212,175,55,0.05)", border: "1px dashed rgba(212,175,55,0.3)", zIndex: 1,
              }}
            >
              {tpl.footerImageDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={tpl.footerImageDataUrl} alt="Pied" className="w-full h-full object-contain" />
              ) : (
                <>
                  {tpl.signatureDataUrl && (
                    <Rnd
                      bounds="parent"
                      size={{ width: mmToPx(tpl.signature.width), height: mmToPx(tpl.signature.height) }}
                      position={{ x: mmToPx(tpl.signature.x - fz.x), y: mmToPx(tpl.signature.y - fz.y) }}
                      onDragStop={(_e, d) => patchBox("signature", { ...tpl.signature, x: pxToMm(d.x) + fz.x, y: pxToMm(d.y) + fz.y })}
                      onResizeStop={(_e, _dir, ref, _delta, pos) =>
                        patchBox("signature", { x: pxToMm(pos.x) + fz.x, y: pxToMm(pos.y) + fz.y, width: pxToMm(ref.offsetWidth), height: pxToMm(ref.offsetHeight) })}
                      style={{ zIndex: 2, border: "1px solid rgba(15,91,87,0.4)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tpl.signatureDataUrl} alt="Signature" className="w-full h-full object-contain select-none" draggable={false} />
                    </Rnd>
                  )}
                  {tpl.stampDataUrl && (
                    <Rnd
                      bounds="parent"
                      size={{ width: mmToPx(tpl.stamp.width), height: mmToPx(tpl.stamp.height) }}
                      position={{ x: mmToPx(tpl.stamp.x - fz.x), y: mmToPx(tpl.stamp.y - fz.y) }}
                      onDragStop={(_e, d) => patchBox("stamp", { ...tpl.stamp, x: pxToMm(d.x) + fz.x, y: pxToMm(d.y) + fz.y })}
                      onResizeStop={(_e, _dir, ref, _delta, pos) =>
                        patchBox("stamp", { x: pxToMm(pos.x) + fz.x, y: pxToMm(pos.y) + fz.y, width: pxToMm(ref.offsetWidth), height: pxToMm(ref.offsetHeight) })}
                      style={{ zIndex: 2, border: "1px solid rgba(212,175,55,0.5)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tpl.stampDataUrl} alt="Cachet" className="w-full h-full object-contain select-none" draggable={false} />
                    </Rnd>
                  )}
                  <span className="absolute bottom-1 left-2 text-[7px] text-gray-300">Signature & cachet — zone pied</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Panneau de contrôle ── */}
        <div className="flex-1 min-w-0 max-w-md space-y-5">
          {uploadError && (
            <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "#fde8e8", color: "#C0392B" }}>⚠️ {uploadError}</div>
          )}

          <Panel title="Images de marque">
            <UploadRow label="Logo" value={tpl.logoDataUrl} onUpload={(f) => handleUpload("logoDataUrl", f)} onClear={() => clearImage("logoDataUrl")} />
            <UploadRow label="Signature" value={tpl.signatureDataUrl} onUpload={(f) => handleUpload("signatureDataUrl", f)} onClear={() => clearImage("signatureDataUrl")} />
            <UploadRow label="Cachet" value={tpl.stampDataUrl} onUpload={(f) => handleUpload("stampDataUrl", f)} onClear={() => clearImage("stampDataUrl")} />
            <UploadRow label="Filigrane (optionnel)" value={tpl.watermarkDataUrl} onUpload={(f) => handleUpload("watermarkDataUrl", f)} onClear={() => clearImage("watermarkDataUrl")} />
            <UploadRow label="Bandeau en-tête (optionnel)" hint="remplace logo + identité" value={tpl.headerImageDataUrl} onUpload={(f) => handleUpload("headerImageDataUrl", f)} onClear={() => clearImage("headerImageDataUrl")} />
            <UploadRow label="Bandeau pied (optionnel)" hint="remplace signature + cachet" value={tpl.footerImageDataUrl} onUpload={(f) => handleUpload("footerImageDataUrl", f)} onClear={() => clearImage("footerImageDataUrl")} />
            <p className="text-[11px] text-gray-400 mt-1">PNG ou JPEG, max 2 Mo.</p>
          </Panel>

          <Panel title="Mise en page">
            <Field label="Alignement de l'en-tête">
              <div className="flex gap-1.5">
                {(["left", "center", "right"] as HeaderLayout[]).map((a) => (
                  <button key={a} onClick={() => patch({ headerLayout: a })}
                    className="flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-colors"
                    style={tpl.headerLayout === a ? { background: "#0F5B57", color: "#fff", borderColor: "#0F5B57" } : { background: "#fff", color: "#4b5563", borderColor: "#e5e7eb" }}>
                    {a === "left" ? "Gauche" : a === "center" ? "Centre" : "Droite"}
                  </button>
                ))}
              </div>
            </Field>
            <Slider label={`Hauteur en-tête : ${tpl.headerHeight} mm`} min={20} max={55} value={tpl.headerHeight} onChange={(v) => patch({ headerHeight: v })} />
            <Slider label={`Hauteur pied : ${tpl.footerHeight} mm`} min={25} max={60} value={tpl.footerHeight} onChange={(v) => patch({ footerHeight: v })} />
            <Slider label={`Opacité filigrane : ${Math.round(tpl.watermarkOpacity * 100)} %`} min={2} max={30} value={Math.round(tpl.watermarkOpacity * 100)} onChange={(v) => patch({ watermarkOpacity: v / 100 })} />
            <Field label="Couleur d'accent">
              <input type="color" value={tpl.primaryColor} onChange={(e) => patch({ primaryColor: e.target.value })} className="h-9 w-16 rounded border border-gray-200 cursor-pointer" />
            </Field>
            <Field label="Style">
              <select value={tpl.templateStyle} onChange={(e) => patch({ templateStyle: e.target.value as TemplateStyle })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-petrol">
                <option value="classic">Classique</option>
                <option value="minimal">Minimal</option>
                <option value="bordered">Encadré</option>
              </select>
            </Field>
          </Panel>

          <div className="flex flex-wrap gap-2">
            <button onClick={handleSave} className="flex-1 min-w-[140px] py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#0F5B57" }}>
              {saved ? "✓ Enregistré" : "Enregistrer comme modèle par défaut"}
            </button>
            <button onClick={handlePreviewPdf} className="py-2.5 px-4 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50">
              Aperçu PDF
            </button>
          </div>
          <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 underline">
            Réinitialiser au modèle MAI DAWA par défaut
          </button>
          <p className="text-[11px] text-gray-400">
            {custom ? "Un modèle personnalisé est actif." : "Aucune personnalisation — le modèle MAI DAWA par défaut est utilisé."}{" "}
            Tout est stocké sur cet appareil ; aucune donnée patient n&apos;est concernée.
          </p>
        </div>
      </div>
    </MedecinLayout>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────────
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gold mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
function Slider({ label, min, max, value, onChange }: { label: string; min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <Field label={label}>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-petrol" />
    </Field>
  );
}
function UploadRow({ label, hint, value, onUpload, onClear }: { label: string; hint?: string; value?: string; onUpload: (f: File | null) => void; onClear: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700">{label}</p>
        {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
      </div>
      {value && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={value} alt="" className="h-8 w-12 object-contain border border-gray-100 rounded" />
      )}
      <label className="text-xs font-semibold text-petrol cursor-pointer shrink-0">
        {value ? "Changer" : "Ajouter"}
        <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => onUpload(e.target.files?.[0] || null)} />
      </label>
      {value && <button onClick={onClear} className="text-xs text-gray-400 hover:text-red-500 shrink-0">✕</button>}
    </div>
  );
}

// Ordonnance fictive pour l'aperçu PDF (aucune donnée réelle).
const SAMPLE_ORDONNANCE = {
  id: "preview", numero: "PV-MA-2026-APERCU", date: new Date().toISOString().slice(0, 10),
  createdAt: new Date().toISOString(), type: "simple" as const, validite: "3",
  patient: { nom: "Patient Exemple", age: "45 ans", sexe: "F", poids: "62", motif: "Aperçu du modèle" },
  meds: [
    { id: 1, nom: "Paracétamol", dci: "Paracétamol", forme: "Comprimé" as const, dosage: "1000 mg", voie: "orale" as const, quantite: "1 comprimé", frequenceNombre: "3", frequenceUnite: "jour" as const, dureeValeur: "5", dureeUnite: "jours" as const, dureeChronique: false, instructions: "Au cours des repas", nonSubstituable: false, renouvelable: false, renouvellements: "0" },
    { id: 2, nom: "Amoxicilline", dci: "Amoxicilline", forme: "Gélule" as const, dosage: "500 mg", voie: "orale" as const, quantite: "1 gélule", frequenceNombre: "2", frequenceUnite: "jour" as const, dureeValeur: "7", dureeUnite: "jours" as const, dureeChronique: false, instructions: "", nonSubstituable: false, renouvelable: false, renouvellements: "0" },
  ],
  suiviActif: false,
};
