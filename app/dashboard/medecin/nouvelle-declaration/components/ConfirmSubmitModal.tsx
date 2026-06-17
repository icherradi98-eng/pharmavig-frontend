"use client";

import type { FormData } from "@/lib/declaration/types";
import type { ImputScore } from "../ImputabiliteBegaud";
import { useModalClose } from "@/lib/useModalClose";

type Props = {
  form: FormData;
  isSerieux: boolean;
  isFatal: boolean;
  delaiLegal: number | null;
  imputScore: ImputScore | null;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmSubmitModal({ form, isSerieux, isFatal, delaiLegal, imputScore, submitting, onCancel, onConfirm }: Props) {
  const dialogRef = useModalClose(onCancel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onCancel}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Confirmer l'envoi de la déclaration" className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden outline-none" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Confirmer l&apos;envoi de la déclaration</h3>
          <p className="text-xs text-gray-500 mt-0.5">Vérifiez ces informations avant transmission. Cette action enregistre la déclaration.</p>
        </div>
        <div className="px-6 py-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3"><span className="text-gray-500">Médicament suspect</span><span className="font-medium text-gray-900 text-right">{form.medicamentDCI || form.medicamentNomCommercial || "—"}</span></div>
          <div className="flex justify-between gap-3"><span className="text-gray-500">Effet observé</span><span className="font-medium text-gray-900 text-right">{form.eiMeddraTerm || "—"}</span></div>
          <div className="flex justify-between gap-3"><span className="text-gray-500">Gravité</span><span className={`font-semibold text-right ${isSerieux ? "text-red-600" : "text-gray-700"}`}>{isSerieux ? "⚡ Sérieux" : "Non sérieux"}</span></div>
          <div className="flex justify-between gap-3"><span className="text-gray-500">Imputabilité</span><span className="font-medium text-gray-900 text-right">{imputScore ? `I${imputScore.Iscore}` : form.imputConclusion || "Non renseignée"}</span></div>
          {delaiLegal && (
            <div className={`rounded-lg px-3 py-2 mt-2 text-xs ${isFatal ? "bg-red-100 text-red-800" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
              ⚡ Cas {isFatal ? "fatal / pronostic vital" : "sérieux"} — délai réglementaire de transmission : <strong>{delaiLegal} jours</strong>.
            </div>
          )}
        </div>
        <div className="px-6 pb-5 pt-2 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            ← Revenir
          </button>
          <button onClick={onConfirm} disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity" style={{ background: "#0F5B57" }}>
            {submitting ? "Envoi…" : "Confirmer l'envoi"}
          </button>
        </div>
      </div>
    </div>
  );
}
