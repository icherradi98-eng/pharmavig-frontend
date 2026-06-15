"use client";

import { type FormData } from "../constants";
import { Label, RadioGroup } from "./FormPrimitives";

type Props = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  submitError: string;
  onSubmit: () => void;
  onGoToStep: (step: number) => void;
};

export function Section6Finalisation({ form, set, submitError, onSubmit, onGoToStep }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <Label fr="Avez-vous déjà signalé ce problème à votre médecin ou pharmacien ?" dar="واش غير عارف الطبيب أو الصيدلي بهاد المشكل؟" />
        <RadioGroup value={form.signaleAuMedecin} onChange={(v) => set("signaleAuMedecin", v)} options={[
          { val: "medecin",        fr: "Oui, au médecin",        dar: "إيه، الطبيب عارف" },
          { val: "pharmacien",     fr: "Oui, au pharmacien",      dar: "إيه، الصيدلي عارف" },
          { val: "les-deux",       fr: "Oui, aux deux",           dar: "إيه، جوج عارفين" },
          { val: "non",            fr: "Non, pas encore",          dar: "لا، مازال" },
          { val: "pas-de-medecin", fr: "Je n'ai pas de médecin",  dar: "لا، ما عنديش طبيب" },
        ]} />
      </div>
      <div>
        <Label fr="Souhaitez-vous être recontacté(e) ?" dar="باغي/باغية يتصلو بيك إلا كان فيه سؤال؟" />
        <RadioGroup value={form.contact} onChange={(v) => set("contact", v)} options={[
          { val: "email", fr: "Oui, par email",        dar: "إيه، بالإيميل" },
          { val: "tel",   fr: "Oui, par téléphone",    dar: "إيه، بالتيليفون" },
          { val: "non",   fr: "Non, je reste anonyme", dar: "لا، بغيت نبقى مجهول" },
        ]} />
        {form.contact === "email" && (
          <input type="email" placeholder="votre@email.com" value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
            className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol" />
        )}
        {form.contact === "tel" && (
          <input type="tel" placeholder="+212 6XX XXX XXX" value={form.contactTel}
            onChange={(e) => set("contactTel", e.target.value)}
            className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol" />
        )}
      </div>
      <div>
        <Label fr="Avez-vous des documents ou photos à joindre ?" dar="واش عندك وثيقة أو صورة تزيدها؟" />
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-petrol/40 rounded-xl p-6 text-sm text-gray-500 hover:text-petrol transition-all cursor-pointer">
          📎 Joindre un fichier / زيد وثيقة
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={() => set("documents", true)} />
        </label>
        {form.documents && <p className="text-xs text-petrol mt-1">✓ Fichier joint</p>}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs text-gray-600 space-y-1.5">
        <p className="font-semibold text-gray-800 mb-2 text-sm">Récapitulatif / ملخص</p>
        <p>💊 Médicament : <span className="font-medium text-gray-900">{form.medicamentNom || "—"}</span></p>
        <p>📋 Indication : <span className="font-medium text-gray-900">{form.indication || "—"}</span></p>
        <p>⏱ Durée : <span className="font-medium text-gray-900">{form.duree || "—"}</span></p>
        <p>👤 Prescripteur : <span className="font-medium text-gray-900">{form.prescripteur || "—"}</span></p>
        <p>📍 Région : <span className="font-medium text-gray-900">{form.region || "—"}</span></p>
        <p>🩺 Symptômes : <span className="font-medium text-gray-900">{form.aucunSymptome ? "Aucun" : form.symptomes.length > 0 ? `${form.symptomes.length} sélectionné(s)` : "—"}</span></p>
        <p>⏰ Délai : <span className="font-medium text-gray-900">{form.delaiApparition || "—"}</span></p>
        <p>⚠️ Gravité : <span className="font-medium text-gray-900">{form.gravite || "—"}</span></p>
        <p>📝 Description : <span className={`font-medium ${form.description ? "text-gray-900" : "text-amber-600"}`}>{form.description ? "✓ Remplie" : "⚠️ Manquante"}</span></p>
      </div>

      <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.consentement ? "border-petrol bg-petrol/5" : "border-gray-300"}`}>
        <input type="checkbox" className="accent-emerald-600 mt-1" checked={form.consentement}
          onChange={(e) => set("consentement", e.target.checked)} />
        <div>
          <p className="text-sm font-medium text-gray-900">
            J&apos;accepte que ces informations soient utilisées de manière anonyme pour améliorer la sécurité des médicaments au Maroc. <span className="text-red-500">★</span>
          </p>
          <p className="text-xs text-gray-500 mt-1" dir="rtl">🇲🇦 قبلت باش تستخدم هاد المعلومات بأنونيمات باش تحسن سلامة الدوا فالمغرب.</p>
        </div>
      </label>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
          ⚠️ {submitError}
        </div>
      )}

      <button onClick={onSubmit}
        disabled={!form.consentement || !form.medicamentNom || !form.description}
        className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all ${
          form.consentement && form.medicamentNom && form.description
            ? "bg-petrol hover:bg-petrol-dark shadow-md"
            : "bg-gray-300 cursor-not-allowed"
        }`}>
        Envoyer ma déclaration / سيفيت البلاغة →
      </button>

      {(!form.medicamentNom || !form.description) && (
        <div className="text-xs text-center text-amber-600 space-y-1">
          {!form.medicamentNom && (
            <p>⚠️ Nom du médicament manquant —{" "}
              <button onClick={() => onGoToStep(2)} className="underline font-semibold hover:text-amber-800">
                Aller à la section 2
              </button>
            </p>
          )}
          {!form.description && (
            <p>⚠️ Description manquante —{" "}
              <button onClick={() => onGoToStep(3)} className="underline font-semibold hover:text-amber-800">
                Aller à la section 3
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
