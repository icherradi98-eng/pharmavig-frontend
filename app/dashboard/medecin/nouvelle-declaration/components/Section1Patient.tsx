"use client";

import { type FormData } from "@/lib/declaration/types";
import { STADES_RENALE, STADES_HEPATIQUE } from "@/lib/declaration/constants";
import { SectionTitle, Input, Select, Textarea, Collapsible, Grid, Field } from "./FormPrimitives";

type Props = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  anneeNaissance: string;
  setAnneeNaissance: (v: string) => void;
};

export function Section1Patient({ form, set, anneeNaissance, setAnneeNaissance }: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Informations sur le patient"
        subtitle="Données anonymisées — aucun nom, prénom ou N° CNI ne doit figurer."
      />
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
        🔒 Conformément à la loi 09-08 sur la protection des données personnelles, le patient ne doit pas être identifiable dans ce formulaire.
      </div>
      <Grid>
        <Field label="Année de naissance" required>
          <div className="relative">
            <input
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              value={anneeNaissance}
              placeholder={`Ex : ${new Date().getFullYear() - 40}`}
              onChange={(e) => {
                const val = e.target.value;
                setAnneeNaissance(val);
                const yr = parseInt(val, 10);
                const currentYear = new Date().getFullYear();
                if (yr >= 1900 && yr <= currentYear) {
                  set("patientAge", String(currentYear - yr));
                } else {
                  set("patientAge", "");
                }
              }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5B57] pr-20"
            />
            {form.patientAge && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#0F5B57] font-semibold px-2 py-0.5 rounded-md" style={{ background: "rgba(15,91,87,0.08)", border: "1px solid rgba(15,91,87,0.2)" }}>
                {form.patientAge} ans
              </span>
            )}
          </div>
        </Field>
        <Field label="Sexe" required>
          <Select value={form.patientSexe} onChange={(v) => set("patientSexe", v)} options={["Masculin", "Féminin"]} placeholder="Sélectionner" />
        </Field>
      </Grid>
      <Field label="Antécédents médicaux pertinents" hint="Maladies chroniques, chirurgies, allergies connues">
        <Textarea value={form.patientAntecedents} onChange={(v) => set("patientAntecedents", v)} placeholder="Ex : HTA, diabète type 2, allergie à la pénicilline..." rows={3} />
      </Field>
      <Field label="Allergies médicamenteuses connues">
        <Input value={form.patientAllergies} onChange={(v) => set("patientAllergies", v)} placeholder="Ex : pénicilline, AINS..." />
      </Field>

      <Collapsible label="Informations avancées" hint="— poids, taille, grossesse, insuffisance rénale / hépatique">
        <Grid>
          <Field label="Poids (kg)">
            <Input type="number" value={form.patientPoids} onChange={(v) => set("patientPoids", v)} placeholder="Ex : 70" />
          </Field>
          <Field label="Taille (cm)">
            <Input type="number" value={form.patientTaille} onChange={(v) => set("patientTaille", v)} placeholder="Ex : 170" />
          </Field>
        </Grid>
        {form.patientSexe === "Féminin" && (
          <Grid>
            <Field label="Grossesse">
              <Select value={form.patientGrossesse} onChange={(v) => set("patientGrossesse", v)} options={["Oui", "Non", "Inconnue"]} placeholder="Sélectionner" />
            </Field>
            {form.patientGrossesse === "Oui" && (
              <Field label="Terme (semaines d'aménorrhée)">
                <Input type="number" value={form.patientGrossesseSemaines} onChange={(v) => set("patientGrossesseSemaines", v)} placeholder="Ex : 24" />
              </Field>
            )}
            <Field label="Allaitement">
              <Select value={form.patientAllaitement} onChange={(v) => set("patientAllaitement", v)} options={["Oui", "Non", "Inconnu"]} placeholder="Sélectionner" />
            </Field>
          </Grid>
        )}
        <Grid>
          <Field label="Insuffisance rénale" hint="Stade KDIGO">
            <Select value={form.patientInsuffisanceRenaleStade} onChange={(v) => set("patientInsuffisanceRenaleStade", v)} options={STADES_RENALE} placeholder="Aucune / Non évaluée" />
          </Field>
          <Field label="Insuffisance hépatique" hint="Stade Child-Pugh">
            <Select value={form.patientInsuffisanceHepatiqueStade} onChange={(v) => set("patientInsuffisanceHepatiqueStade", v)} options={STADES_HEPATIQUE} placeholder="Aucune / Non évaluée" />
          </Field>
        </Grid>
      </Collapsible>
    </div>
  );
}
