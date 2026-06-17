"use client";

import { useState, useRef } from "react";
import { type MedicamentRx, type MedicamentSuggestion, searchMedicaments, normalizeForme, voieFromForme } from "@/lib/ordonnancier";
import { parsePostologie } from "@/lib/parsePostologie";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol";
const labelCls = "block text-xs text-gray-500 mb-1";

const FORMES = ["Comprimé", "Gélule", "Sirop", "Solution injectable", "Patch", "Pommade / Crème", "Inhalateur", "Autre"] as const;
const VOIES: { value: string; label: string }[] = [
  { value: "orale", label: "Orale" },
  { value: "IV", label: "Intraveineuse (IV)" },
  { value: "SC", label: "Sous-cutanée (SC)" },
  { value: "IM", label: "Intramusculaire (IM)" },
  { value: "topique", label: "Topique" },
  { value: "inhalée", label: "Inhalée" },
  { value: "autre", label: "Autre" },
];

export function MedicamentCard({ med, index, canRemove, onChange, onRemove }: {
  med: MedicamentRx;
  index: number;
  canRemove: boolean;
  onChange: (patch: Partial<MedicamentRx>) => void;
  onRemove: () => void;
}) {
  const [suggestions, setSuggestions] = useState<MedicamentSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  function handleNomChange(value: string) {
    onChange({ nom: value });
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setSuggestions([]); setSearching(false); return; }
    const requestId = ++requestIdRef.current;
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const res = await searchMedicaments(value);
      if (requestIdRef.current === requestId) {
        setSuggestions(res);
        setSearching(false);
      }
    }, 300);
  }

  function pickSuggestion(s: MedicamentSuggestion) {
    const forme = normalizeForme(s.forme) || med.forme;
    const voie = voieFromForme(forme) || med.voie;
    const dosage = s.dosages && s.dosages.length === 1 ? s.dosages[0] : "";
    onChange({ nom: s.nom, dci: s.dci || med.dci, forme, voie, dosage, dosagesDisponibles: s.dosages || [] });
    setSuggestions([]);
    setShowSuggestions(false);
    setAutoFilled(true);
  }

  const [autoFilled, setAutoFilled] = useState(false);
  const [posologieSaisie, setPosologieSaisie] = useState("");
  const [posologieParsed, setPosologieParsed] = useState<ReturnType<typeof parsePostologie>>(null);

  function handlePosologieSaisie(value: string) {
    setPosologieSaisie(value);
    const parsed = parsePostologie(value);
    setPosologieParsed(parsed);
    if (parsed && parsed.confidence >= 0.65) {
      const doseStr = [parsed.dose, parsed.unite].filter(Boolean).join(" ");
      if (doseStr) onChange({ dosage: doseStr });
      const freq = parsed.frequence;
      if (freq) {
        const match = freq.match(/^(\d+)[×x]\/(jour|semaine|mois)/);
        if (match) {
          onChange({ frequenceNombre: match[1], frequenceUnite: match[2] as "jour" | "semaine" | "mois" });
        } else if (/semaine/i.test(freq)) {
          onChange({ frequenceNombre: freq.match(/^(\d+)/)?.[1] || "1", frequenceUnite: "semaine" });
        } else if (/mois/i.test(freq)) {
          onChange({ frequenceNombre: freq.match(/^(\d+)/)?.[1] || "1", frequenceUnite: "mois" });
        }
      }
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400">Médicament {index + 1}</span>
        {canRemove && <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600">Retirer</button>}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <label className={labelCls}>Médicament *</label>
          <input
            className={inputCls}
            value={med.nom}
            onChange={(e) => { handleNomChange(e.target.value); setAutoFilled(false); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Ex. Metformine, Doliprane, Amoxicilline..."
            autoComplete="off"
          />
          {showSuggestions && med.nom.trim().length >= 2 && (
            <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
              {searching && (
                <li className="px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Recherche dans le référentiel Maroc...
                </li>
              )}
              {!searching && suggestions.length === 0 && (
                <li className="px-4 py-3 text-xs text-gray-500">
                  Aucun médicament trouvé dans le référentiel Maroc — ajout manuel possible ci-dessous.
                </li>
              )}
              {!searching && suggestions.map((s, i) => (
                <li key={i} className="border-b border-gray-50 last:border-0">
                  <button type="button" onMouseDown={() => pickSuggestion(s)} className="w-full text-left px-4 py-2.5 hover:bg-petrol/5 transition-colors">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900 truncate">{s.nom}</span>
                      {s.forme && <span className="text-xs text-gray-400 shrink-0">{s.forme}</span>}
                    </div>
                    {s.dci && <p className="text-xs text-gray-500 mt-0.5">{s.dci}</p>}
                    {s.dosages && s.dosages.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.dosages.slice(0, 4).map((d) => (
                          <span key={d} className="text-xs bg-petrol/5 text-petrol border border-petrol/20 px-2 py-0.5 rounded-full">{d}</span>
                        ))}
                      </div>
                    )}
                    <span className="inline-block mt-1 text-[10px] font-medium text-petrol bg-petrol/5 border border-petrol/20 px-1.5 py-0.5 rounded-full">
                      CNOPS 2014 — à confirmer
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {autoFilled && (med.forme || med.voie) && (
          <div className="flex flex-wrap items-center gap-2 bg-petrol/5 border border-petrol/20 rounded-lg px-3 py-2">
            <span className="text-xs font-semibold text-petrol">✓ Auto-rempli :</span>
            {med.forme && <span className="text-xs bg-white border border-petrol/20 text-petrol px-2 py-0.5 rounded-full">{med.forme}</span>}
            {med.voie && <span className="text-xs bg-white border border-petrol/20 text-petrol px-2 py-0.5 rounded-full">{VOIES.find(v => v.value === med.voie)?.label}</span>}
            <button type="button" onClick={() => setAutoFilled(false)} className="ml-auto text-xs text-gray-400 hover:text-gray-600">Modifier</button>
          </div>
        )}

        <div>
          <label className={labelCls}>Dosage *</label>
          {med.dosagesDisponibles && med.dosagesDisponibles.length > 1 ? (
            <div className="flex flex-wrap gap-2 mt-1">
              {med.dosagesDisponibles.map((d) => (
                <button key={d} type="button" onClick={() => onChange({ dosage: d })}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${med.dosage === d ? "bg-petrol border-petrol text-white shadow-sm" : "border-gray-300 text-gray-700 hover:border-petrol hover:bg-petrol/5"}`}>
                  {d}
                </button>
              ))}
            </div>
          ) : (
            <input className={inputCls} value={med.dosage} onChange={(e) => onChange({ dosage: e.target.value })} placeholder="Ex. 500 mg" />
          )}
        </div>

        {(!autoFilled || !med.forme || !med.voie) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Forme galénique</label>
              <select className={inputCls} value={med.forme} onChange={(e) => { const f = e.target.value as MedicamentRx["forme"]; onChange({ forme: f, voie: voieFromForme(f) || med.voie }); }}>
                <option value="">— Sélectionner —</option>
                {FORMES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Voie d&apos;administration</label>
              <select className={inputCls} value={med.voie} onChange={(e) => onChange({ voie: e.target.value as MedicamentRx["voie"] })}>
                <option value="">— Sélectionner —</option>
                {VOIES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <label className={labelCls + " mb-0"}>Posologie rapide</label>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">✦ Parser IA</span>
          </div>
          <input className={inputCls} value={posologieSaisie} onChange={(e) => handlePosologieSaisie(e.target.value)} placeholder="Ex : 500 mg 2×/jour · 1g matin et soir · 175 mg/m² J1–J21" />
          {posologieParsed && (
            <div className={`flex items-center gap-2 flex-wrap text-xs px-3 py-2 rounded-lg border ${posologieParsed.confidence >= 0.65 ? "bg-petrol/5 border-petrol/20 text-petrol" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
              <span className="font-semibold">{posologieParsed.confidence >= 0.65 ? "✅ Parsé :" : "⚙️ Détecté :"}</span>
              {posologieParsed.dose && <span className="px-2 py-0.5 rounded-full bg-white border border-gray-300 font-mono">{posologieParsed.dose}</span>}
              {posologieParsed.unite && <span className="px-2 py-0.5 rounded-full bg-white border border-gray-300 font-mono">{posologieParsed.unite}</span>}
              {posologieParsed.frequence && <span className="px-2 py-0.5 rounded-full bg-white border border-gray-300 font-mono">{posologieParsed.frequence}</span>}
              <span className="text-gray-400 ml-auto">{Math.round(posologieParsed.confidence * 100)}% confiance</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Posologie (détail)</label>
            <div className="flex gap-2">
              <input className={inputCls} value={med.quantite} onChange={(e) => onChange({ quantite: e.target.value })} placeholder="1 comprimé" />
              <input className={`${inputCls} w-16 shrink-0 text-center`} value={med.frequenceNombre} onChange={(e) => onChange({ frequenceNombre: e.target.value })} inputMode="numeric" />
              <select className={`${inputCls} w-36 shrink-0`} value={med.frequenceUnite} onChange={(e) => onChange({ frequenceUnite: e.target.value as MedicamentRx["frequenceUnite"] })}>
                <option value="jour">fois / jour</option>
                <option value="semaine">fois / semaine</option>
                <option value="mois">fois / mois</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Durée</label>
            {med.dureeChronique ? (
              <div className={`${inputCls} bg-gray-50 text-gray-500 flex items-center justify-between`}>
                <span>Traitement chronique</span>
                <button type="button" onClick={() => onChange({ dureeChronique: false })} className="text-xs text-petrol underline">Définir une durée</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input className={`${inputCls} w-20 shrink-0 text-center`} value={med.dureeValeur} onChange={(e) => onChange({ dureeValeur: e.target.value })} inputMode="numeric" />
                <select className={inputCls} value={med.dureeUnite} onChange={(e) => onChange({ dureeUnite: e.target.value as MedicamentRx["dureeUnite"] })}>
                  <option value="jours">jours</option>
                  <option value="semaines">semaines</option>
                  <option value="mois">mois</option>
                </select>
                <button type="button" onClick={() => onChange({ dureeChronique: true })} className="text-xs text-gray-400 hover:text-petrol underline whitespace-nowrap shrink-0">Chronique</button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls}>Instructions spéciales (optionnel)</label>
          <input className={inputCls} value={med.instructions} onChange={(e) => onChange({ instructions: e.target.value })} placeholder='Ex. "À prendre pendant les repas", "Éviter le soleil"...' />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={med.nonSubstituable} onChange={(e) => onChange({ nonSubstituable: e.target.checked })} />
            <span className={med.nonSubstituable ? "text-red-600 font-medium" : ""}>Non substituable</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={med.renouvelable} onChange={(e) => onChange({ renouvelable: e.target.checked })} />
            <span>À renouveler</span>
          </label>
          {med.renouvelable && (
            <select className={`${inputCls} w-auto`} value={med.renouvellements} onChange={(e) => onChange({ renouvellements: e.target.value })}>
              {["1", "2", "3", "6", "12"].map((n) => <option key={n} value={n}>{n} fois</option>)}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
