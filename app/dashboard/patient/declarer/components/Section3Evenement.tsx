"use client";

import { type FormData, SYMPTOMES_CATEGORIES } from "../constants";
import { Label, RadioGroup, InfoBox, CheckboxItem } from "./FormPrimitives";

type Props = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  toggleSymptome: (key: string) => void;
};

export function Section3Evenement({ form, set, toggleSymptome }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <Label fr="Racontez-nous ce qui s'est passé" dar="حدّثنا أشمن مشكل وقع" required />
        <InfoBox text="Pas besoin de mots médicaux — écrivez comme vous le raconteriez à un ami." textDar="ما خاصكش تكون طبيب — هدر بحال ما كتحدّث لواحد صاحبك" />
        <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)}
          placeholder="Ex : J'ai eu des boutons rouges sur les bras 2 jours après avoir commencé le médicament..."
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-petrol resize-none" />
      </div>

      <div>
        <Label fr="Quels symptômes avez-vous ressentis ?" dar="أشمن أعراض حسيتي بهم؟" />
        <p className="text-xs text-gray-500 mb-3">Cochez tout ce qui s&apos;applique / ممكن تختار بزاف</p>
        <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all text-sm mb-3 ${form.aucunSymptome ? "border-gray-400 bg-gray-100 text-gray-700 font-medium" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
          <input type="checkbox" className="accent-gray-500" checked={form.aucunSymptome}
            onChange={() => set("aucunSymptome" as keyof FormData, !form.aucunSymptome as FormData[keyof FormData])} />
          Aucun des symptômes listés / ما فيهم والو
        </label>
        {!form.aucunSymptome && (
          <div className="space-y-4">
            {SYMPTOMES_CATEGORIES.map((cat) => (
              <div key={cat.cat} className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{cat.cat}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {cat.items.map((s) => (
                    <CheckboxItem key={s.key} label={s.label}
                      checked={form.symptomes.includes(s.key)}
                      onChange={() => toggleSymptome(s.key)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label fr="Quand ce problème a-t-il commencé par rapport à la prise du médicament ?" dar="إمتى بدات هاد المشكل مع هاد الدوا؟" required />
        <RadioGroup value={form.delaiApparition} onChange={(v) => set("delaiApparition", v)} options={[
          { val: "meme-jour", fr: "Le jour même de la prise",  dar: "نفس النهار خديت الدوا" },
          { val: "24h",       fr: "Dans les 24 heures",        dar: "ف 24 ساعة" },
          { val: "2-7j",      fr: "Entre 2 et 7 jours",       dar: "بين جوج و سبع أيام" },
          { val: ">1sem",     fr: "Plus d'une semaine après",  dar: "فوق سيمانة من بعد" },
          { val: "nsp",       fr: "Je ne sais pas",            dar: "ما عرفتش" },
        ]} />
      </div>
    </div>
  );
}
