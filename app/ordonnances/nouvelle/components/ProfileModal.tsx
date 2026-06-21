"use client";

import { useState } from "react";
import Link from "next/link";
import { type DoctorProfile, EMPTY_PROFILE } from "@/lib/ordonnancier";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol";
const labelCls = "block text-xs text-gray-500 mb-1";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProfileModal({ initial, onClose, onSave }: {
  initial: DoctorProfile;
  onClose: () => void;
  onSave: (p: DoctorProfile) => void;
}) {
  const [form, setForm] = useState<DoctorProfile>({ ...EMPTY_PROFILE, ...initial });

  async function handleImage(field: "signatureDataUrl" | "cachetDataUrl", file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((f) => ({ ...f, [field]: dataUrl }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Mon profil — en-tête d&apos;ordonnance</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Prénom</label>
              <input className={inputCls} value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Nom</label>
              <input className={inputCls} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Spécialité (apparaît sur l&apos;ordonnance)</label>
            <input className={inputCls} value={form.specialite} onChange={(e) => setForm({ ...form, specialite: e.target.value })} placeholder="Ex. Oncologie médicale" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>N° Ordre (CNOM)</label>
              <input className={inputCls} value={form.numOrdre} onChange={(e) => setForm({ ...form, numOrdre: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Téléphone</label>
              <input className={inputCls} value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Établissement / cabinet</label>
              <input className={inputCls} value={form.etablissement} onChange={(e) => setForm({ ...form, etablissement: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Ville</label>
              <input className={inputCls} value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className={labelCls}>Signature (image, optionnel)</label>
              {form.signatureDataUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.signatureDataUrl} alt="Signature" className="h-12 object-contain border border-gray-100 rounded mb-1" />
              )}
              <input type="file" accept="image/png,image/jpeg" onChange={(e) => handleImage("signatureDataUrl", e.target.files?.[0] || null)} className="text-xs" />
            </div>
            <div>
              <label className={labelCls}>Cachet (image, optionnel)</label>
              {form.cachetDataUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.cachetDataUrl} alt="Cachet" className="h-12 object-contain border border-gray-100 rounded mb-1" />
              )}
              <input type="file" accept="image/png,image/jpeg" onChange={(e) => handleImage("cachetDataUrl", e.target.files?.[0] || null)} className="text-xs" />
            </div>
          </div>

          <Link href="/dashboard/medecin/parametres/ordonnancier"
            className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-petrol/5"
            style={{ border: "1px solid rgba(15,91,87,0.2)" }}>
            <span className="text-petrol font-medium">🎨 Personnaliser la mise en page complète (logo, filigrane, positions)</span>
            <span className="text-petrol shrink-0">→</span>
          </Link>

          <div className="border border-gray-100 rounded-xl p-3 bg-gray-50">
            <p className="text-xs text-gray-400 mb-2">Aperçu de l&apos;en-tête tel qu&apos;il apparaîtra sur le PDF :</p>
            <p className="font-semibold text-gray-900 text-sm">{`Dr. ${form.prenom} ${form.nom}`.trim() || "Dr. —"}</p>
            {form.specialite && <p className="text-xs text-gray-500">{form.specialite}</p>}
            <p className="text-xs text-gray-400">
              {[form.numOrdre && `N° Ordre : ${form.numOrdre}`, form.etablissement, form.ville, form.telephone].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={() => onSave(form)} className="flex-1 bg-petrol text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-petrol-dark">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
