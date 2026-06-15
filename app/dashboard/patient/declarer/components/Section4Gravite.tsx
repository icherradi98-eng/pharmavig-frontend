"use client";

import { type FormData } from "../constants";
import { Label, RadioGroup } from "./FormPrimitives";

type Props = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  graviteWarning: boolean;
};

export function Section4Gravite({ form, set, graviteWarning }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        ⚠️ Si vous avez été hospitalisé(e) ou si votre vie était en danger, votre déclaration sera traitée en priorité.
        <div className="text-xs text-amber-700 mt-1" dir="rtl">إلا دخلتي لسبيطار أو كان وداعك فخطر، هاد البلاغة غاتتساراج بالأولوية.</div>
      </div>

      {form.gravite === "vie-danger" && (
        <div className="bg-red-600 text-white rounded-xl p-4 flex gap-3 items-start">
          <span className="text-2xl shrink-0">🚨</span>
          <div>
            <p className="font-bold text-sm mb-1">Si vous êtes encore en danger, appelez le 15 maintenant.</p>
            <p dir="rtl" className="text-red-100 text-xs">إلا مازلتي فخطر، اتصل ب 15 دابا.</p>
            <a href="tel:15" className="mt-2 inline-block bg-white text-red-700 font-bold px-4 py-1.5 rounded-lg text-sm">📞 Appeler le 15</a>
          </div>
        </div>
      )}

      {graviteWarning && (
        <div className="bg-orange-50 border border-orange-300 rounded-xl p-4 flex gap-3 items-start">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-orange-800 mb-1">Votre description semble indiquer une situation grave.</p>
            <p className="text-xs text-orange-700">Vous avez mentionné des mots comme &quot;hospitalisé&quot; ou &quot;urgences&quot; dans votre récit — pensez à sélectionner la bonne case ci-dessous.</p>
          </div>
        </div>
      )}

      <div>
        <Label fr="Comment ce problème a-t-il affecté votre vie ?" dar="كيفاش أثر عليك هاد المشكل؟" required />
        <div className="flex flex-col gap-2">
          {[
            { val: "rien",        fr: "Gêne légère, j'ai continué normalement", dar: "شوية عدم راحة، كملت حياتي عادي", danger: false },
            { val: "activites",   fr: "J'ai dû réduire ou arrêter mes activités", dar: "خصني نوقف أو نخفف من أشغالي",   danger: false },
            { val: "urgences",    fr: "Je suis allé(e) aux urgences",             dar: "مشيت للأورجونس",                 danger: true },
            { val: "hospitalise", fr: "J'ai été hospitalisé(e)",                  dar: "دخلت لسبيطار",                   danger: true },
            { val: "vie-danger",  fr: "Ma vie était en danger",                   dar: "كان وداعي فخطر",                 danger: true },
          ].map((o) => (
            <label key={o.val} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              form.gravite === o.val
                ? o.danger ? "border-red-500 bg-red-50" : "border-petrol bg-petrol/5"
                : "border-gray-200 hover:border-gray-300"
            }`}>
              <input type="radio" className="accent-emerald-600" checked={form.gravite === o.val} onChange={() => set("gravite", o.val)} />
              <div>
                <div className="text-sm text-gray-800">{o.fr}</div>
                <div className="text-xs text-gray-500" dir="rtl">{o.dar}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label fr="Avez-vous arrêté le médicament ?" dar="واش وقفتي الدوا؟" required />
        <RadioGroup value={form.arretMedicament} onChange={(v) => set("arretMedicament", v)} options={[
          { val: "oui-seul",     fr: "Oui, de moi-même",                           dar: "إيه، براسي" },
          { val: "oui-medecin",  fr: "Oui, sur conseil du médecin",                dar: "إيه، الطبيب قال" },
          { val: "non-continue", fr: "Non, je continue",                            dar: "لا، مازال كتاخدو" },
          { val: "non-fini",     fr: "Non, j'ai terminé le traitement normalement", dar: "لا، كملتو نورمال" },
        ]} />
      </div>

      {(form.arretMedicament === "oui-seul" || form.arretMedicament === "oui-medecin") && (
        <div>
          <Label fr="Après avoir arrêté, le problème s'est-il amélioré ?" dar="من بعد ما وقفتي، واش المشكل حسن؟" />
          <RadioGroup value={form.ameliorationApresArret} onChange={(v) => set("ameliorationApresArret", v)} options={[
            { val: "ameliore", fr: "Oui, amélioré",               dar: "إيه، حسن" },
            { val: "disparu",  fr: "Oui, complètement disparu",    dar: "إيه، دات بزاف" },
            { val: "non",      fr: "Non, pas de changement",       dar: "لا، بقى بحال بحال" },
          ]} />
        </div>
      )}

      <div>
        <Label fr="Est-ce que ce problème est toujours présent aujourd'hui ?" dar="واش هاد المشكل مازال كاين ليوم؟" required />
        <RadioGroup value={form.problemePersiste} onChange={(v) => set("problemePersiste", v)} options={[
          { val: "oui",     fr: "Oui, toujours",         dar: "إيه، مازال" },
          { val: "non",     fr: "Non, c'est passé",       dar: "لا، دات" },
          { val: "partiel", fr: "Partiellement amélioré", dar: "حسن شوية" },
          { val: "nsp",     fr: "Je ne sais pas",         dar: "ما عرفتش" },
        ]} />
      </div>
    </div>
  );
}
