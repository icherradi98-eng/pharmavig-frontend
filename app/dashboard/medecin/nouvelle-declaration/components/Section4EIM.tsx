"use client";

import { type FormData } from "@/lib/declaration/types";
import { SectionTitle, Input, Textarea, CheckRow, RadioGroup, Collapsible, Field } from "./FormPrimitives";
import { MedDRASearch } from "./MedDRASearch";

type Props = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  isSerieux: boolean;
};

export function Section4EIM({ form, set, isSerieux }: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Description de l'effet indésirable"
        subtitle="Description clinique précise. Utilisez la terminologie médicale."
      />
      <Field label="Effet observé" required hint="Tapez le symptôme — le codage MedDRA est automatique (E2B R3)">
        <MedDRASearch
          value={form.eiMeddraTerm}
          code={form.eiMeddraCode}
          soc={form.eiMeddraSoc}
          onChange={(term, code, soc) => {
            set("eiMeddraTerm", term);
            set("eiMeddraCode", code);
            set("eiMeddraSoc", soc);
          }}
        />
      </Field>
      <Field label="Description clinique de l'EIM" required hint="Symptômes, signes cliniques, résultats paracliniques anormaux">
        <Textarea rows={5} value={form.eiDescription} onChange={(v) => set("eiDescription", v)} placeholder="Décrivez l'effet indésirable de façon précise : symptômes, chronologie, intensité, évolution..." />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Date de début de l'EIM" required>
          <Input type="date" value={form.eiDateDebut} onChange={(v) => set("eiDateDebut", v)} />
        </Field>
        <Field label="Date de fin / guérison">
          <Input type="date" value={form.eiDateFin} onChange={(v) => set("eiDateFin", v)} disabled={form.eiEnCours} />
        </Field>
      </div>
      <CheckRow label="L'EIM est toujours en cours" checked={form.eiEnCours} onChange={() => set("eiEnCours", !form.eiEnCours)} />
      <Field label="Évolution / Résultat de l'EIM" required>
        <RadioGroup
          value={form.eiEvolution}
          onChange={(v) => set("eiEvolution", v)}
          options={[
            { val: "guerison", label: "Guérison sans séquelles" },
            { val: "guerison-sequelles", label: "Guérison avec séquelles" },
            { val: "amelioration", label: "Amélioration en cours" },
            { val: "stable", label: "Stable / Non résolu" },
            { val: "aggravation", label: "Aggravation" },
            { val: "deces", label: "Décès (lié à l'EIM)" },
            { val: "deces-autre", label: "Décès (cause autre)" },
            { val: "inconnu", label: "Inconnu" },
          ]}
        />
      </Field>

      <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm">Critères de gravité (ICH E2B R3)</h3>
          {isSerieux && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">⚡ Sérieux</span>}
        </div>
        <p className="text-xs text-gray-500 mb-4">Un EIM est <strong>sérieux</strong> s&apos;il remplit au moins un des critères ci-dessous. Les EIM sérieux sont traités en priorité (délai réglementaire : 15 jours calendaires).</p>
        <div className="flex flex-col gap-2">
          <CheckRow label="Décès" checked={form.graviteDeces} onChange={() => set("graviteDeces", !form.graviteDeces)} desc="L'EIM a entraîné le décès du patient" />
          <CheckRow label="Mise en danger de vie immédiate" checked={form.graviteVieDanger} onChange={() => set("graviteVieDanger", !form.graviteVieDanger)} desc="Le patient a été en danger vital" />
          <CheckRow label="Hospitalisation ou prolongation d'hospitalisation" checked={form.graviteHospitalisation} onChange={() => set("graviteHospitalisation", !form.graviteHospitalisation)} />
          <CheckRow label="Incapacité / invalidité persistante ou significative" checked={form.graviteIncapacite} onChange={() => set("graviteIncapacite", !form.graviteIncapacite)} />
          <CheckRow label="Anomalie congénitale / malformation" checked={form.graviteAnomalieCongenitale} onChange={() => set("graviteAnomalieCongenitale", !form.graviteAnomalieCongenitale)} />
          <CheckRow label="Médicalement significatif" checked={form.graviteMedicalementSignificatif} onChange={() => set("graviteMedicalementSignificatif", !form.graviteMedicalementSignificatif)} desc="EIM important selon jugement médical, sans remplir les critères ci-dessus" />
          <CheckRow label="Non sérieux" checked={form.graviteNonSerieux} onChange={() => set("graviteNonSerieux", !form.graviteNonSerieux)} desc="Aucun critère de gravité — déclaration volontaire" />
        </div>
      </div>

      <Collapsible label="Examens complémentaires" hint="— biologie, ECG, imagerie en lien avec l'EIM">
        <Field label="Résultats biologiques / paracliniques pertinents">
          <Textarea value={form.examensComplementaires} onChange={(v) => set("examensComplementaires", v)} placeholder="Ex : ALAT 3×N, créatinine 180 μmol/L, hyperkaliémie à 6,2 mmol/L..." rows={3} />
        </Field>
      </Collapsible>
    </div>
  );
}
