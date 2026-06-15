"use client";

import { type FormData } from "../constants";
import { Label, RadioGroup, InfoBox, Collapsible, IndicationSearch } from "./FormPrimitives";

type Props = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
};

export function Section2Medicament({ form, set }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <Label fr="Nom du médicament" dar="سمية الدوا" required />
        <input type="text" placeholder="Ex : Doliprane, Amoxicilline..."
          value={form.medicamentNom} onChange={(e) => set("medicamentNom", e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-petrol" />
      </div>
      <Collapsible label="Vous avez la boîte sous la main ?" labelDar="عندك العلبة قدامك؟">
        <p className="text-xs text-gray-400 mb-1">Optionnel — très utile pour la déclaration.</p>
        <div className="space-y-3">
          {[
            { field: "medicamentLot" as const,        label: "Numéro de lot / نومرو لو",           ph: "Ex : BH2345" },
            { field: "medicamentPeremption" as const, label: "Date de péremption / تاريخ الانتهاء", ph: "JJ/MM/AAAA" },
            { field: "medicamentLabo" as const,       label: "Laboratoire / لابوراطوار",            ph: "Ex : Sanofi, Cooper Maroc..." },
          ].map(({ field, label, ph }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input type="text" placeholder={ph} value={form[field] as string}
                onChange={(e) => set(field, e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date de début du traitement</label>
            <input type="date" value={form.medicamentDateDebut}
              onChange={(e) => set("medicamentDateDebut", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol" />
          </div>
        </div>
      </Collapsible>
      <div>
        <Label fr="Pourquoi prenez-vous ce médicament ?" dar="علاش كتاخود هاد الدوا؟" required />
        <InfoBox text="Écrivez en quelques mots — des suggestions apparaîtront automatiquement." textDar="كتب بكلماتك — غيخرج ليك اقتراحات" />
        <IndicationSearch value={form.indication} onChange={(v) => set("indication", v)} />
      </div>
      <div>
        <Label fr="Depuis combien de temps prenez-vous ce médicament ?" dar="شحال من وقت وأنت كتاخدو؟" required />
        <RadioGroup value={form.duree} onChange={(v) => set("duree", v)} options={[
          { val: "<1sem",   fr: "Moins d'une semaine", dar: "دون سيمانة" },
          { val: "1-4sem",  fr: "1 à 4 semaines",      dar: "سيمانة لأربعة سيمانات" },
          { val: "1-6mois", fr: "1 à 6 mois",          dar: "شهر لستة شهور" },
          { val: ">6mois",  fr: "Plus de 6 mois",      dar: "فوق ستة شهور" },
          { val: "nsp",     fr: "Je ne sais pas",       dar: "ما عرفتش" },
        ]} />
      </div>
      <div>
        <Label fr="Qui vous a prescrit ce médicament ?" dar="شكون عطاك هاد الدوا؟" required />
        <RadioGroup value={form.prescripteur} onChange={(v) => set("prescripteur", v)} options={[
          { val: "medecin",    fr: "Un médecin",              dar: "طبيب" },
          { val: "pharmacien", fr: "Un pharmacien",           dar: "صيدلي" },
          { val: "soi-meme",   fr: "Je l'ai acheté moi-même", dar: "شريتو براسي" },
          { val: "proche",     fr: "Un proche / la famille",  dar: "واحد من العيلة أو الصحاب" },
          { val: "autre",      fr: "Autre",                   dar: "خور" },
        ]} />
      </div>
    </div>
  );
}
