"use client";

import { type FormData } from "../constants";
import { Label, RadioGroup, InfoBox, CheckboxItem } from "./FormPrimitives";

type Props = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  toggleMaladie: (item: string) => void;
};

export function Section5Contexte({ form, set, toggleMaladie }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 bg-gray-100 rounded-xl px-4 py-2">
        Section optionnelle — aide à mieux analyser votre déclaration. / هاد القسم اختياري ولكن مهم.
      </p>
      <div>
        <Label fr="Prenez-vous d'autres médicaments en même temps ?" dar="واش كتاخود دويور دويات فنفس الوقت؟" />
        <InfoBox text="Incluez vitamines, compléments alimentaires, plantes médicinales." textDar="دخّل فيتامينات، نباتات، أعشاب" />
        <RadioGroup value={form.autresMedicaments} onChange={(v) => set("autresMedicaments", v)} options={[
          { val: "oui", fr: "Oui", dar: "إيه" },
          { val: "non", fr: "Non", dar: "لا" },
          { val: "nsp", fr: "Je ne sais pas", dar: "ما عرفتش" },
        ]} />
        {form.autresMedicaments === "oui" && (
          <textarea rows={2} placeholder="Lesquels ? / أشمنين؟"
            value={form.autresMedicamentsDetail} onChange={(e) => set("autresMedicamentsDetail", e.target.value)}
            className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol resize-none" />
        )}
      </div>
      <div>
        <Label fr="Avez-vous des maladies chroniques ?" dar="واش عندك مرض مزمن؟" />
        <RadioGroup value={form.maladiesChroniquesOuiNon} onChange={(v) => {
          set("maladiesChroniquesOuiNon", v);
          if (v !== "oui") set("maladiesChroniques", []);
        }} options={[
          { val: "oui", fr: "Oui", dar: "إيه" },
          { val: "non", fr: "Non", dar: "لا" },
          { val: "nsp", fr: "Je ne sais pas", dar: "ما عرفتش" },
        ]} />
        {form.maladiesChroniquesOuiNon === "oui" && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {["Diabète / السكر", "Hypertension / الضغط", "Cancer / السرطان",
              "Maladie rénale / الكلوة", "Maladie cardiaque / القلب", "Asthme / الربو",
              "Épilepsie / الصرع", "Dépression / الاكتئاب", "Autre / خور",
            ].map((item) => (
              <CheckboxItem key={item} label={item}
                checked={form.maladiesChroniques.includes(item)}
                onChange={() => toggleMaladie(item)} />
            ))}
          </div>
        )}
      </div>
      {form.sexe === "femme" && (
        <div>
          <Label fr="Si applicable — êtes-vous enceinte ou allaitez-vous ?" dar="إلا كان — واش حامل أو كترضعي؟" />
          <RadioGroup value={form.grossesse} onChange={(v) => set("grossesse", v)} options={[
            { val: "enceinte",    fr: "Oui, enceinte",           dar: "إيه، حامل" },
            { val: "allaitement", fr: "Oui, j'allaite",          dar: "إيه، كترضعي" },
            { val: "non",         fr: "Non",                      dar: "لا" },
            { val: "nr",          fr: "Préfère ne pas répondre", dar: "ما بغيتش نجاوب" },
          ]} />
        </div>
      )}
      <div>
        <Label fr="Avez-vous déjà eu une réaction similaire à un médicament par le passé ?" dar="واش من قبل عندك ريأكسيون بحال هادي مع الدوا؟" />
        <RadioGroup value={form.reactionPassee} onChange={(v) => set("reactionPassee", v)} options={[
          { val: "oui", fr: "Oui", dar: "إيه" },
          { val: "non", fr: "Non", dar: "لا" },
          { val: "nsp", fr: "Je ne sais pas", dar: "ما عرفتش" },
        ]} />
        {form.reactionPassee === "oui" && (
          <input type="text" placeholder="Avec quel médicament ? / أشمن دوا؟"
            value={form.reactionPasseeDetail} onChange={(e) => set("reactionPasseeDetail", e.target.value)}
            className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol" />
        )}
      </div>
    </div>
  );
}
