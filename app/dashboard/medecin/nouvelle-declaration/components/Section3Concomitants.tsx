"use client";

import { type FormData, type MedicamentConcomitant } from "@/lib/declaration/types";
import { searchLocalInteraction } from "@/lib/interactionsLocales";
import { SectionTitle, Input, CheckRow, FieldLabel } from "./FormPrimitives";

type Props = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  addConcomitant: () => void;
  toggleAucunConcomitant: () => void;
  updateConcomitant: (id: number, field: keyof MedicamentConcomitant, value: string | boolean) => void;
  removeConcomitant: (id: number) => void;
};

export function Section3Concomitants({ form, addConcomitant, toggleAucunConcomitant, updateConcomitant, removeConcomitant }: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Médicaments concomitants"
        subtitle="Tous les médicaments pris simultanément, incluant vitamines, compléments et automédication."
      />
      <CheckRow
        label="✅ Le patient ne prenait aucun autre médicament concomitant"
        checked={form.aucunConcomitant}
        onChange={toggleAucunConcomitant}
        desc="Confirmez explicitement l'absence de co-médications (inclus automédication et phytothérapie). Décochez pour restaurer une liste précédente."
      />

      {!form.aucunConcomitant && form.medicamentsConcomitants.length === 0 && (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-sm">Aucun médicament concomitant pour l&apos;instant</p>
          <p className="text-xs mt-1">Cliquez sur &quot;Ajouter&quot; si le patient prenait d&apos;autres traitements</p>
        </div>
      )}

      {form.medicamentsConcomitants.map((m, i) => (
        <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Médicament {i + 1}</span>
            <button onClick={() => removeConcomitant(m.id)} className="text-xs text-red-400 hover:text-red-600">Supprimer ×</button>
          </div>
          <div className="space-y-3">
            <div>
              <FieldLabel label="Nom / DCI" />
              <Input value={m.nom} onChange={(v) => updateConcomitant(m.id, "nom", v)} placeholder="Nom ou DCI" />
              {(() => {
                if (!form.medicamentDCI || m.nom.length < 3) return null;
                const ix = searchLocalInteraction(form.medicamentDCI, m.nom);
                if (!ix || (ix.niveau !== "CI" && ix.niveau !== "majeur")) return null;
                const isCI = ix.niveau === "CI";
                return (
                  <div className={`mt-2 rounded-lg px-3 py-2.5 border text-xs flex items-start gap-2 ${isCI ? "bg-red-50 border-red-300 text-red-800" : "bg-orange-50 border-orange-300 text-orange-800"}`}>
                    <span className="text-base shrink-0">{isCI ? "🚫" : "⚠️"}</span>
                    <div className="flex-1">
                      <span className="font-bold">{isCI ? "Contre-indication absolue" : "Interaction majeure"} :</span>{" "}
                      {ix.consequence}
                      <a href={`/interactions?drug1=${encodeURIComponent(form.medicamentDCI)}&drug2=${encodeURIComponent(m.nom)}`} target="_blank" rel="noopener noreferrer" className="ml-2 underline font-semibold">
                        Voir le détail →
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <FieldLabel label="Dose" />
                <Input value={m.posologieDose} onChange={(v) => updateConcomitant(m.id, "posologieDose", v)} placeholder="Ex : 10" type="number" />
              </div>
              <div>
                <FieldLabel label="Unité" />
                <select value={m.posologieUnite} onChange={(e) => updateConcomitant(m.id, "posologieUnite", e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                  {["mg", "g", "µg", "mL", "UI", "mg/kg", "%", "autre"].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel label="Fréquence" />
                <select value={m.posologieFrequence} onChange={(e) => updateConcomitant(m.id, "posologieFrequence", e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                  {["1×/jour", "2×/jour", "3×/jour", "4×/jour", "1×/semaine", "si besoin", "autre"].map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div>
              <FieldLabel label="Indication" />
              <Input value={m.indication} onChange={(v) => updateConcomitant(m.id, "indication", v)} placeholder="Ex : HTA, anxiété, douleur..." />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${m.arretAvantEI ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-500"}`}>
              <input type="checkbox" className="accent-amber-500" checked={m.arretAvantEI} onChange={() => updateConcomitant(m.id, "arretAvantEI", !m.arretAvantEI)} />
              Arrêté avant l&apos;EI
            </label>
            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${m.suspectSecondaire ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-500"}`}>
              <input type="checkbox" className="accent-orange-500" checked={m.suspectSecondaire} onChange={() => updateConcomitant(m.id, "suspectSecondaire", !m.suspectSecondaire)} />
              Suspect secondaire
            </label>
          </div>
        </div>
      ))}

      <button onClick={addConcomitant} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300 hover:border-emerald-500 text-emerald-600 hover:text-emerald-700 rounded-xl py-3 text-sm font-medium transition-all">
        + Ajouter un médicament concomitant
      </button>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
        💡 N&apos;oubliez pas d&apos;inclure les plantes médicinales, les anti-VEGF, les immunosuppresseurs et tout médicament pris sans prescription.
      </div>
    </div>
  );
}
