"use client";

import { type FormData } from "@/lib/declaration/types";
import { DRAFT_KEY } from "@/lib/declaration/constants";
import { type ImputScore } from "../ImputabiliteBegaud";
import { SectionTitle, Textarea, Field } from "./FormPrimitives";
import { TypeDeclarationInline } from "./TypeDeclarationInline";

type Props = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  isSerieux: boolean;
  isFatal: boolean;
  delaiLegal: number | null;
  champsManquants: string[];
  submitError: string;
  imputScore: ImputScore | null;
  uploadedFiles: File[];
  setUploadedFiles: (fn: (prev: File[]) => File[]) => void;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onSubmit: () => void;
};

export function Section6Finalisation({
  form, set, isSerieux, isFatal, delaiLegal, champsManquants, submitError,
  imputScore, uploadedFiles, setUploadedFiles, dragOver, setDragOver, onSubmit,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle title="Finalisation et envoi" subtitle="Vérifiez votre déclaration avant envoi." />

      {/* Récapitulatif */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2 text-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Récapitulatif</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Type de déclaration</p>
            <TypeDeclarationInline value={form.typeDeclaration} onChange={(v) => set("typeDeclaration", v)} />
          </div>
          {delaiLegal && (
            <div className={`rounded-lg p-3 ${isFatal ? "bg-red-100" : "bg-amber-50"}`}>
              <p className="text-gray-500 mb-1">Délai légal de notification</p>
              <p className={`font-bold ${isFatal ? "text-red-700" : "text-amber-700"}`}>{delaiLegal} jours calendaires</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Déclarant</p>
            <p className="font-medium text-gray-800">{form.declarantPrenom} {form.declarantNom} — {form.declarantSpecialite || "—"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Patient</p>
            <p className="font-medium text-gray-800">{form.patientAge ? `${form.patientAge} ans` : "—"}, {form.patientSexe || "—"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Médicament suspect</p>
            <p className="font-medium text-gray-800">{form.medicamentDCI || form.medicamentNomCommercial || "—"}</p>
          </div>
          <div className={`rounded-lg p-3 ${form.eiMeddraTerm ? "bg-emerald-50" : "bg-red-50"}`}>
            <p className="text-gray-500 mb-1">Effet déclaré</p>
            <p className="font-medium text-gray-800 text-xs">
              {form.eiMeddraTerm || <span className="text-red-500">⚠️ Non renseigné</span>}
              {form.eiMeddraCode && <span className="ml-1 text-gray-400 font-mono">#{form.eiMeddraCode}</span>}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Gravité</p>
            <p className={`font-bold ${isSerieux ? "text-red-600" : "text-gray-600"}`}>{isSerieux ? "⚡ Sérieux" : "Non sérieux"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Imputabilité</p>
            <p className="font-medium text-gray-800 capitalize">
              {imputScore ? `I${imputScore.Iscore}` : form.imputConclusion || "Non renseignée"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Médicaments concomitants</p>
            <p className="font-medium text-gray-800">{form.medicamentsConcomitants.length} déclaré(s)</p>
          </div>
        </div>
        {delaiLegal && (
          <div className={`border rounded-lg p-3 text-xs mt-2 ${isFatal ? "bg-red-100 border-red-300 text-red-800" : "bg-red-50 border-red-200 text-red-700"}`}>
            ⚡ <strong>EIM {isFatal ? "fatal / pronostic vital engagé" : "sérieux"}</strong> — Délai réglementaire de transmission : <strong>{delaiLegal} jours calendaires</strong>.
          </div>
        )}
      </div>

      {/* Upload documents */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-800">Documents joints</label>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">✦ Pièces jointes — analyse IA à venir</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">Ordonnance, résultats biologiques, imagerie, courrier de sortie.</p>
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const files = Array.from(e.dataTransfer.files).filter(f => /\.(pdf|jpe?g|png)$/i.test(f.name));
            if (files.length) { setUploadedFiles(prev => [...prev, ...files]); set("documents", true); }
          }}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${dragOver ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"}`}
        >
          <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
          <p className="text-sm text-gray-500 font-medium">Glissez vos fichiers ici ou <span className="text-emerald-600 underline">cliquez pour sélectionner</span></p>
          <p className="text-xs text-gray-400">PDF, JPG, PNG — max 10 Mo par fichier</p>
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) { setUploadedFiles(prev => [...prev, ...files]); set("documents", true); }
          }} />
        </label>
        {uploadedFiles.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {uploadedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                <span className="text-base">{f.name.endsWith(".pdf") ? "📄" : "🖼️"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{f.name}</p>
                  <p className="text-[10px] text-gray-400">{(f.size / 1024).toFixed(0)} Ko</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded shrink-0">Joint ✓</span>
                <button type="button" onClick={() => { setUploadedFiles(prev => prev.filter((_, j) => j !== i)); if (uploadedFiles.length <= 1) set("documents", false); }} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Field label="Commentaires libres">
        <Textarea value={form.commentaires} onChange={(v) => set("commentaires", v)} placeholder="Toute information complémentaire jugée pertinente..." rows={3} />
      </Field>

      {/* Notifications */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
          <span className="text-base">🔔</span>
          <span className="text-sm font-medium text-gray-700">Notifications</span>
        </div>
        <div className="px-4 py-4 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" className="accent-emerald-600 mt-0.5 shrink-0" checked={form.notifAccuseReception} onChange={(e) => set("notifAccuseReception", e.target.checked)} />
            <div>
              <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">Accusé de réception par e-mail</p>
              <p className="text-xs text-gray-400 mt-0.5">Confirmation immédiate dès l&apos;envoi de la déclaration</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" className="accent-emerald-600 mt-0.5 shrink-0" checked={form.notifSuiviStatut} onChange={(e) => set("notifSuiviStatut", e.target.checked)} />
            <div>
              <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">Suivi du statut de la déclaration</p>
              <p className="text-xs text-gray-400 mt-0.5">Notification quand votre déclaration est prise en charge ou traitée</p>
            </div>
          </label>
          {(form.notifAccuseReception || form.notifSuiviStatut) && (
            <div className="pt-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Adresse e-mail</label>
              <input type="email" value={form.notifEmail} onChange={(e) => set("notifEmail", e.target.value)} placeholder="votre@email.ma" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              {form.notifEmail && <p className="text-xs text-emerald-600 mt-1">✓ Notifications envoyées à {form.notifEmail}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Consentement */}
      <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.consentement ? "border-emerald-500 bg-emerald-50" : "border-gray-300"}`}>
        <input type="checkbox" className="accent-emerald-600 mt-1" checked={form.consentement} onChange={(e) => set("consentement", e.target.checked)} />
        <div>
          <p className="text-sm font-medium text-gray-900">
            Je certifie l&apos;exactitude des informations déclarées et consens à leur traitement anonymisé conforme à la loi 09-08. <span className="text-red-500">*</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Conformément à l&apos;article 18 de la loi 17-04 relative au Code du médicament et de la pharmacie.</p>
        </div>
      </label>

      {champsManquants.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ Informations manquantes avant envoi :</p>
          <ul className="flex flex-col gap-1">
            {champsManquants.map((c) => (
              <li key={c} className="text-xs text-amber-700 flex items-start gap-2"><span className="mt-0.5">•</span> {c}</li>
            ))}
          </ul>
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">⚠️ {submitError}</div>
      )}
      <div className="text-xs text-gray-400 text-center">
        Un numéro de déclaration <span className="font-mono font-semibold text-gray-600">PV-MA-{new Date().getFullYear()}-XXXXX</span> sera généré automatiquement.
      </div>
      <button
        onClick={onSubmit}
        disabled={!form.consentement || champsManquants.length > 0}
        className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all ${form.consentement && champsManquants.length === 0 ? "bg-emerald-600 hover:bg-emerald-700 shadow-md" : "bg-gray-300 cursor-not-allowed"}`}
      >
        {isFatal ? "🚨 Envoyer — Urgence 7 jours →" : isSerieux ? "⚡ Envoyer la déclaration sérieuse →" : "Envoyer la déclaration →"}
      </button>

      <style jsx global>{`
        @media print { body * { visibility: hidden; } }
      `}</style>
      {/* Suppression du draft côté client après soumission — géré dans page.tsx via localStorage.removeItem(DRAFT_KEY) */}
      <span className="hidden">{DRAFT_KEY}</span>
    </div>
  );
}
