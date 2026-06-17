"use client";

import { type FormData } from "@/lib/declaration/types";
import { FORMES, VOIES } from "@/lib/declaration/constants";
import { parsePostologie } from "@/lib/parsePostologie";
import { SectionTitle, Input, Select, Collapsible, Grid, Field, CheckRow, RadioGroup } from "./FormPrimitives";
import { MedicamentSearch } from "./MedicamentSearch";

type Props = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onScanOpen: () => void;
};

export function Section2Medicament({ form, set, onScanOpen }: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Médicament(s) suspect(s)"
        subtitle="Médicament suspecté d'être responsable de l'effet indésirable."
      />

      <Field label="Recherche rapide" hint="DCI ou nom commercial — pré-remplit automatiquement voie, forme et laboratoire">
        <div className="flex gap-2">
          <div className="flex-1">
            <MedicamentSearch
              onSelect={(e) => {
                set("medicamentDCI", e.dci);
                if (e.nomCommercial) set("medicamentNomCommercial", e.nomCommercial);
                if (e.voie) set("medicamentVoie", e.voie);
                if (e.forme) set("medicamentForme", e.forme);
                if (e.laboratoire) set("medicamentLaboratoire", e.laboratoire);
              }}
            />
          </div>
          <button
            type="button"
            onClick={onScanOpen}
            title="Scanner la boîte de médicament"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span className="hidden sm:inline">Scanner</span>
          </button>
        </div>
      </Field>

      <Grid>
        <Field label="DCI (Dénomination Commune Internationale)" required hint="Nom générique — vérifiez après recherche">
          <Input value={form.medicamentDCI} onChange={(v) => set("medicamentDCI", v)} placeholder="Ex : métformine, nivolumab, amoxicilline..." />
        </Field>
        <Field label="Nom commercial">
          <Input value={form.medicamentNomCommercial} onChange={(v) => set("medicamentNomCommercial", v)} placeholder="Ex : Glucophage, Opdivo, Amoxil..." />
        </Field>
      </Grid>
      <Grid>
        <Field label="Forme pharmaceutique" required>
          <Select value={form.medicamentForme} onChange={(v) => set("medicamentForme", v)} options={FORMES} placeholder="Sélectionner" />
        </Field>
        <Field label="Voie d'administration" required>
          <Select value={form.medicamentVoie} onChange={(v) => set("medicamentVoie", v)} options={VOIES} placeholder="Sélectionner" />
        </Field>
      </Grid>

      {/* Posologie intelligente */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-800">
            Posologie & Fréquence <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
            ✦ Parser IA
          </span>
        </div>
        <p className="text-xs text-gray-400">Tapez librement — la posologie est analysée automatiquement.</p>
        <input
          type="text"
          value={`${form.medicamentPosologie}${form.medicamentPosologie && form.medicamentFrequence ? " " : ""}${form.medicamentFrequence}`}
          onChange={(e) => {
            const raw = e.target.value;
            const parsed = parsePostologie(raw);
            if (parsed && parsed.confidence >= 0.65) {
              const doseStr = parsed.dose && parsed.unite ? `${parsed.dose} ${parsed.unite}` : parsed.dose;
              set("medicamentPosologie", doseStr);
              if (parsed.frequence) set("medicamentFrequence", parsed.frequence);
            } else {
              set("medicamentPosologie", raw);
              set("medicamentFrequence", "");
            }
          }}
          placeholder="Ex : 500 mg 2x/jour · 1g matin et soir · 175 mg/m² J1-J21"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          style={{ "--tw-ring-color": "rgba(15,91,87,0.3)" } as React.CSSProperties}
        />
        {(() => {
          const raw = `${form.medicamentPosologie}${form.medicamentPosologie && form.medicamentFrequence ? " " : ""}${form.medicamentFrequence}`;
          const parsed = raw ? parsePostologie(raw) : null;
          if (!parsed) return null;
          const hasAll = parsed.dose && parsed.unite && parsed.frequence;
          return (
            <div className={`flex items-center gap-2 flex-wrap text-xs px-3 py-2 rounded-lg border ${hasAll ? "text-[#0F5B57]" : "bg-gray-50 border-gray-200 text-gray-600"}`}
              style={hasAll ? { background: "rgba(15,91,87,0.06)", borderColor: "rgba(15,91,87,0.2)" } : undefined}>
              <span className="font-semibold">{hasAll ? "✅ Parsé :" : "⚙️ Détecté :"}</span>
              {parsed.dose && <span className="px-2 py-0.5 rounded-full bg-white border border-gray-300 font-mono">{parsed.dose}</span>}
              {parsed.unite && <span className="px-2 py-0.5 rounded-full bg-white border border-gray-300 font-mono">{parsed.unite}</span>}
              {parsed.frequence && <span className="px-2 py-0.5 rounded-full bg-white border border-gray-300 font-mono">{parsed.frequence}</span>}
              <span className="text-gray-400 ml-auto">{Math.round(parsed.confidence * 100)}% confiance</span>
            </div>
          );
        })()}
        {form.medicamentPosologie && !form.medicamentFrequence && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Field label="Fréquence" required>
              <Select value={form.medicamentFrequence} onChange={(v) => set("medicamentFrequence", v)} options={["1×/jour", "2×/jour", "3×/jour", "4×/jour", "1×/semaine", "1×/2 semaines", "1×/3 semaines", "Autre"]} placeholder="Sélectionner" />
            </Field>
          </div>
        )}
      </div>

      <Field label="Indication thérapeutique" required hint="Pourquoi ce médicament a-t-il été prescrit ?">
        <Input value={form.medicamentIndication} onChange={(v) => set("medicamentIndication", v)} placeholder="Ex : diabète type 2, mélanome métastatique, infection urinaire..." />
      </Field>
      <Grid>
        <Field label="Date de début du traitement" required>
          <Input type="date" value={form.medicamentDateDebut} onChange={(v) => set("medicamentDateDebut", v)} />
        </Field>
        <Field label="Date de fin du traitement">
          <Input type="date" value={form.medicamentDateFin} onChange={(v) => set("medicamentDateFin", v)} disabled={form.medicamentEnCours} />
        </Field>
      </Grid>
      <CheckRow label="Traitement toujours en cours" checked={form.medicamentEnCours} onChange={() => set("medicamentEnCours", !form.medicamentEnCours)} />

      <Collapsible label="Informations avancées" hint="— lot, péremption, laboratoire, AMM, prescripteur">
        <Grid>
          <Field label="Numéro de lot">
            <Input value={form.medicamentLot} onChange={(v) => set("medicamentLot", v)} placeholder="Sur la boîte" />
          </Field>
          <Field label="Date de péremption">
            <Input type="month" value={form.medicamentPeremption} onChange={(v) => set("medicamentPeremption", v)} />
          </Field>
        </Grid>
        <Grid>
          <Field label="Laboratoire fabricant">
            <Input value={form.medicamentLaboratoire} onChange={(v) => set("medicamentLaboratoire", v)} placeholder="Ex : Sanofi, Pfizer, Maphar..." />
          </Field>
          <Field label="N° d'AMM (si connu)" hint="Autorisation de Mise sur le Marché">
            <Input value={form.medicamentAMM} onChange={(v) => set("medicamentAMM", v)} placeholder="Ex : MA-XXXX" />
          </Field>
        </Grid>
        <Field label="Médicament prescrit par">
          <RadioGroup
            value={form.medicamentPrescripteur}
            onChange={(v) => set("medicamentPrescripteur", v)}
            options={[
              { val: "moi", label: "Moi-même" },
              { val: "confrere", label: "Un confrère médecin" },
              { val: "pharmacien", label: "Un pharmacien" },
              { val: "automédication", label: "Automédication du patient" },
            ]}
          />
        </Field>
      </Collapsible>
    </div>
  );
}
