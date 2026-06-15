"use client";

import { type FormData, REGIONS } from "../constants";
import { Label, RadioGroup, AgePicker } from "./FormPrimitives";

type Props = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  geoLoading: boolean;
};

export function Section1Vous({ form, set, geoLoading }: Props) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-600">
        <p className="mb-1">🔒 <strong>Identité anonyme</strong> — aucun nom ni prénom demandé.</p>
        <p className="text-xs text-gray-500" dir="rtl">🇲🇦 هويتك — ما كتخص اسم ولا لقب.</p>
      </div>
      <div>
        <Label fr="Votre tranche d'âge" dar="شحال عندك فعمرك؟" required />
        <AgePicker value={form.age} onChange={(v) => set("age", v)} />
      </div>
      <div>
        <Label fr="Votre sexe" dar="شكون نتا / نتي؟" required />
        <RadioGroup value={form.sexe} onChange={(v) => set("sexe", v)} options={[
          { val: "homme", fr: "Homme",                      dar: "راجل" },
          { val: "femme", fr: "Femme",                      dar: "مرا" },
          { val: "nr",    fr: "Je préfère ne pas répondre", dar: "ما بغيتش نجاوب" },
        ]} />
      </div>
      <div>
        <Label fr="Votre région" dar="فين كتسكن؟" />
        {geoLoading && (
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <span className="inline-block w-3 h-3 border border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
            Détection de votre région...
          </p>
        )}
        {form.regionAuto && form.region && (
          <div className="mb-2 flex items-center gap-2 bg-petrol/5 border border-petrol/20 rounded-lg px-3 py-2">
            <span className="text-petrol text-xs">📍 Région détectée :</span>
            <span className="text-petrol text-xs font-semibold">{form.region}</span>
          </div>
        )}
        <select value={form.region} onChange={(e) => set("region", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol">
          <option value="">{form.regionAuto ? "Modifier ma région..." : "Choisir une région / اختار منطقة"}</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          <option value="nr">Je préfère ne pas répondre / ما بغيتش نجاوب</option>
        </select>
      </div>
    </div>
  );
}
