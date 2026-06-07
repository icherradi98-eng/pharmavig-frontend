"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { autocomplete, type Suggestion } from "@/lib/drugApi";

const HEADER_KEY = "pharmavig_ordonnance_entete";

type Medicament = {
  id: number;
  dci: string;
  dosage: string;
  posologie: string;
  duree: string;
  instructions: string;
};

function emptyMed(id: number): Medicament {
  return { id, dci: "", dosage: "", posologie: "", duree: "", instructions: "" };
}

function todayFR() {
  return new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

type EnTete = { etablissement: string; ville: string; telephone: string; numOrdre: string };

function readEnTete(): EnTete {
  if (typeof window === "undefined") return { etablissement: "", ville: "", telephone: "", numOrdre: "" };
  try {
    const saved = localStorage.getItem(HEADER_KEY);
    if (!saved) return { etablissement: "", ville: "", telephone: "", numOrdre: "" };
    return JSON.parse(saved);
  } catch {
    return { etablissement: "", ville: "", telephone: "", numOrdre: "" };
  }
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

export default function NouvelleOrdonnance() {
  const { user } = useAuth();

  const [enTete, setEnTete] = useState<EnTete>(() => readEnTete());
  const [patientNom, setPatientNom] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [meds, setMeds] = useState<Medicament[]>([emptyMed(1)]);
  const [nextId, setNextId] = useState(2);
  const [generated, setGenerated] = useState(false);

  const [activeAutocomplete, setActiveAutocomplete] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateEnTete(field: keyof EnTete, value: string) {
    const next = { ...enTete, [field]: value };
    setEnTete(next);
    try { localStorage.setItem(HEADER_KEY, JSON.stringify(next)); } catch {}
  }

  function updateMed(id: number, field: keyof Medicament, value: string) {
    setMeds((cur) => cur.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  function handleDciChange(id: number, value: string) {
    updateMed(id, "dci", value);
    setActiveAutocomplete(id);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await autocomplete(value);
      setSuggestions(res);
    }, 300);
  }

  function addMed() {
    setMeds((cur) => [...cur, emptyMed(nextId)]);
    setNextId((n) => n + 1);
  }

  function removeMed(id: number) {
    setMeds((cur) => (cur.length > 1 ? cur.filter((m) => m.id !== id) : cur));
  }

  function canGenerate() {
    return patientNom.trim().length > 0 && meds.some((m) => m.dci.trim().length > 0);
  }

  const doctorName = user ? `Dr. ${user.prenom || ""} ${user.nom || ""}`.trim() : "";

  if (generated) {
    return (
      <OrdonnancePreview
        doctorName={doctorName}
        specialite={user?.specialite}
        enTete={enTete}
        patientNom={patientNom}
        patientAge={patientAge}
        date={date}
        meds={meds.filter((m) => m.dci.trim())}
        onBack={() => setGenerated(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nouvelle ordonnance</h1>
            <p className="text-sm text-gray-500 mt-0.5">Rédigez et imprimez une ordonnance classique pour votre patient.</p>
          </div>
          <Link href="/dashboard/medecin" className="text-sm text-gray-400 hover:text-gray-600">← Retour</Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          {/* En-tête médecin */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">En-tête (cabinet / coordonnées)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Médecin</label>
                <div className={`${inputCls} bg-gray-50 text-gray-600`}>{doctorName || "—"}{user?.specialite ? ` · ${user.specialite}` : ""}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">N° d&apos;ordre</label>
                <input className={inputCls} value={enTete.numOrdre} onChange={(e) => updateEnTete("numOrdre", e.target.value)} placeholder="Ex. 12345" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Établissement / cabinet</label>
                <input className={inputCls} value={enTete.etablissement} onChange={(e) => updateEnTete("etablissement", e.target.value)} placeholder="Ex. Clinique Al Amal" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ville</label>
                <input className={inputCls} value={enTete.ville} onChange={(e) => updateEnTete("ville", e.target.value)} placeholder="Ex. Casablanca" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
                <input className={inputCls} value={enTete.telephone} onChange={(e) => updateEnTete("telephone", e.target.value)} placeholder="Ex. 05 22 00 00 00" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Ces informations sont mémorisées sur cet appareil pour vos prochaines ordonnances.</p>
          </section>

          {/* Patient */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Patient</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Nom du patient *</label>
                <input className={inputCls} value={patientNom} onChange={(e) => setPatientNom(e.target.value)} placeholder="Nom et prénom" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Âge</label>
                <input className={inputCls} value={patientAge} onChange={(e) => setPatientAge(e.target.value)} placeholder="Ex. 45 ans" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
          </section>

          {/* Médicaments */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Médicaments prescrits *</h2>
              <button onClick={addMed} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">+ Ajouter un médicament</button>
            </div>
            <div className="space-y-4">
              {meds.map((m, idx) => (
                <div key={m.id} className="border border-gray-200 rounded-xl p-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400">Médicament {idx + 1}</span>
                    {meds.length > 1 && (
                      <button onClick={() => removeMed(m.id)} className="text-xs text-red-400 hover:text-red-600">Retirer</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">DCI / nom du médicament</label>
                      <input
                        className={inputCls}
                        value={m.dci}
                        onChange={(e) => handleDciChange(m.id, e.target.value)}
                        onFocus={() => setActiveAutocomplete(m.id)}
                        onBlur={() => setTimeout(() => setActiveAutocomplete((cur) => (cur === m.id ? null : cur)), 150)}
                        placeholder="Ex. Paracétamol"
                        autoComplete="off"
                      />
                      {activeAutocomplete === m.id && suggestions.length > 0 && (
                        <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {suggestions.map((s, i) => (
                            <li key={i}>
                              <button
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50"
                                onMouseDown={() => { updateMed(m.id, "dci", s.dci); setSuggestions([]); setActiveAutocomplete(null); }}
                              >
                                {s.dci}{s.brand ? <span className="text-gray-400"> — {s.brand}</span> : null}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Dosage</label>
                      <input className={inputCls} value={m.dosage} onChange={(e) => updateMed(m.id, "dosage", e.target.value)} placeholder="Ex. 500 mg" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Posologie</label>
                      <input className={inputCls} value={m.posologie} onChange={(e) => updateMed(m.id, "posologie", e.target.value)} placeholder="Ex. 1 comprimé 3x/jour" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Durée</label>
                      <input className={inputCls} value={m.duree} onChange={(e) => updateMed(m.id, "duree", e.target.value)} placeholder="Ex. 7 jours" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Instructions</label>
                      <input className={inputCls} value={m.instructions} onChange={(e) => updateMed(m.id, "instructions", e.target.value)} placeholder="Ex. À prendre après les repas" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button
            onClick={() => setGenerated(true)}
            disabled={!canGenerate()}
            className="w-full bg-emerald-600 disabled:bg-gray-300 text-white py-3 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            📄 Générer l&apos;ordonnance
          </button>
          {!canGenerate() && (
            <p className="text-xs text-gray-400 text-center -mt-3">Renseignez au moins le nom du patient et un médicament.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function OrdonnancePreview({
  doctorName, specialite, enTete, patientNom, patientAge, date, meds, onBack,
}: {
  doctorName: string;
  specialite?: string;
  enTete: EnTete;
  patientNom: string;
  patientAge: string;
  date: string;
  meds: Medicament[];
  onBack: () => void;
}) {
  const dateLabel = date ? new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : todayFR();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">← Modifier</button>
          <button
            onClick={() => window.print()}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            🖨️ Imprimer / générer le PDF
          </button>
        </div>

        <div id="ordonnance-pdf" className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
          {/* En-tête */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="font-bold text-gray-900 text-lg">{doctorName || "Dr. —"}</p>
              {specialite && <p className="text-sm text-gray-500">{specialite}</p>}
              {enTete.numOrdre && <p className="text-xs text-gray-400 mt-0.5">N° d&apos;ordre : {enTete.numOrdre}</p>}
            </div>
            <div className="text-right text-sm text-gray-500">
              {enTete.etablissement && <p>{enTete.etablissement}</p>}
              {enTete.ville && <p>{enTete.ville}</p>}
              {enTete.telephone && <p>{enTete.telephone}</p>}
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Ordonnance médicale</p>
          </div>

          {/* Patient */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-400">Patient : </span>
              <span className="font-medium text-gray-900">{patientNom}</span>
              {patientAge && <span className="text-gray-500"> · {patientAge}</span>}
            </div>
            <div className="text-gray-500">{dateLabel}</div>
          </div>

          {/* Médicaments */}
          <ol className="space-y-4 list-decimal list-inside">
            {meds.map((m) => (
              <li key={m.id} className="text-sm">
                <span className="font-semibold text-gray-900">{m.dci}</span>
                {m.dosage && <span className="text-gray-700"> — {m.dosage}</span>}
                <div className="ml-5 mt-0.5 text-gray-600 space-y-0.5">
                  {m.posologie && <p>Posologie : {m.posologie}</p>}
                  {m.duree && <p>Durée : {m.duree}</p>}
                  {m.instructions && <p className="italic text-gray-500">{m.instructions}</p>}
                </div>
              </li>
            ))}
          </ol>

          {/* Signature */}
          <div className="pt-10 flex justify-end">
            <div className="text-center text-xs text-gray-400">
              <div className="w-40 border-b border-gray-300 mb-1" />
              Signature et cachet
            </div>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            body * { visibility: hidden; }
            #ordonnance-pdf, #ordonnance-pdf * { visibility: visible; }
            #ordonnance-pdf { position: absolute; top: 0; left: 0; width: 100%; border: none; border-radius: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
