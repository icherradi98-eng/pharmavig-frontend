"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import ImputabiliteBegaud, { ImputScore } from "./ImputabiliteBegaud";

const DRAFT_KEY = "pharmavig_medecin_draft";

// ─── Types ────────────────────────────────────────────────────────────────────

type MedicamentConcomitant = {
  id: number;
  nom: string;
  posologie: string;
  indication: string;
  arretAvantEI: boolean;
  suspectSecondaire: boolean;
};

type FormData = {
  // Section 1 — Déclarant
  typeDeclaration: string;
  declarantNom: string;
  declarantPrenom: string;
  declarantSpecialite: string;
  declarantSpecialiteAutre: string;
  declarantNumOrdre: string;
  declarantEtablissement: string;
  declarantVille: string;
  declarantEmail: string;
  declarantTel: string;

  // Section 2 — Patient
  patientAge: string;
  patientSexe: string;
  patientPoids: string;
  patientTaille: string;
  patientGrossesse: string;
  patientGrossesseSemaines: string;
  patientAllaitement: string;
  patientInsuffisanceRenaleStade: string;
  patientInsuffisanceHepatiqueStade: string;
  patientAntecedents: string;
  patientAllergies: string;

  // Section 3 — Médicament suspect
  medicamentDCI: string;
  medicamentNomCommercial: string;
  medicamentForme: string;
  medicamentVoie: string;
  medicamentPosologie: string;
  medicamentFrequence: string;
  medicamentIndication: string;
  medicamentDateDebut: string;
  medicamentDateFin: string;
  medicamentEnCours: boolean;
  medicamentLot: string;
  medicamentPeremption: string;
  medicamentLaboratoire: string;
  medicamentAMM: string;
  medicamentPrescripteur: string;

  // Section 4 — Concomitants
  aucunConcomitant: boolean;
  medicamentsConcomitants: MedicamentConcomitant[];

  // Section 5 — Effet indésirable
  eiDescription: string;
  eiDateDebut: string;
  eiDateFin: string;
  eiEnCours: boolean;
  eiEvolution: string;
  // Gravité ICH E2B
  graviteDeces: boolean;
  graviteVieDanger: boolean;
  graviteHospitalisation: boolean;
  graviteIncapacite: boolean;
  graviteAnomalieCongenitale: boolean;
  graviteMedicalementSignificatif: boolean;
  graviteNonSerieux: boolean;
  // Examens complémentaires
  examensComplementaires: string;

  // Section 6 — Imputabilité
  imputChronologie: string;
  imputDelaiApparition: string;
  imputEvolutionArret: string;
  imputReadministration: string;
  imputReadministrationResultat: string;
  imputSemiologie: string;
  imputBilanEtiologique: string;
  imputConclusion: string;

  // Section 7 — Finalisation
  documents: boolean;
  commentaires: string;
  consentement: boolean;
};

const STADES_RENALE = ["Légère (DFG 60–89)", "Modérée (DFG 30–59)", "Sévère (DFG 15–29)", "Terminale / Dialyse (DFG < 15)"];
const STADES_HEPATIQUE = ["Légère (Child-Pugh A)", "Modérée (Child-Pugh B)", "Sévère (Child-Pugh C)"];

const INITIAL: FormData = {
  typeDeclaration: "",
  declarantNom: "", declarantPrenom: "", declarantSpecialite: "", declarantSpecialiteAutre: "",
  declarantNumOrdre: "", declarantEtablissement: "", declarantVille: "", declarantEmail: "", declarantTel: "",
  patientAge: "", patientSexe: "", patientPoids: "", patientTaille: "", patientGrossesse: "",
  patientGrossesseSemaines: "", patientAllaitement: "", patientInsuffisanceRenaleStade: "",
  patientInsuffisanceHepatiqueStade: "", patientAntecedents: "", patientAllergies: "",
  medicamentDCI: "", medicamentNomCommercial: "", medicamentForme: "", medicamentVoie: "",
  medicamentPosologie: "", medicamentFrequence: "", medicamentIndication: "", medicamentDateDebut: "",
  medicamentDateFin: "", medicamentEnCours: false, medicamentLot: "", medicamentPeremption: "",
  medicamentLaboratoire: "", medicamentAMM: "", medicamentPrescripteur: "",
  aucunConcomitant: false,
  medicamentsConcomitants: [],
  eiDescription: "", eiDateDebut: "", eiDateFin: "", eiEnCours: false, eiEvolution: "",
  graviteDeces: false, graviteVieDanger: false, graviteHospitalisation: false,
  graviteIncapacite: false, graviteAnomalieCongenitale: false,
  graviteMedicalementSignificatif: false, graviteNonSerieux: false,
  examensComplementaires: "",
  imputChronologie: "", imputDelaiApparition: "", imputEvolutionArret: "",
  imputReadministration: "", imputReadministrationResultat: "", imputSemiologie: "",
  imputBilanEtiologique: "", imputConclusion: "",
  documents: false, commentaires: "", consentement: false,
};

const SECTIONS = [
  { id: 1, label: "Déclarant", icon: "👨‍⚕️" },
  { id: 2, label: "Patient", icon: "🧑" },
  { id: 3, label: "Médicament suspect", icon: "💊" },
  { id: 4, label: "Concomitants", icon: "📋" },
  { id: 5, label: "Effet indésirable", icon: "⚠️" },
  { id: 6, label: "Imputabilité", icon: "🔬" },
  { id: 7, label: "Finalisation", icon: "📤" },
];

const SPECIALITES = [
  "Médecine générale", "Cardiologie", "Oncologie", "Neurologie", "Pneumologie",
  "Gastro-entérologie", "Endocrinologie", "Rhumatologie", "Dermatologie", "Pédiatrie",
  "Gynécologie-obstétrique", "Chirurgie", "Urgences", "Réanimation", "Psychiatrie",
  "Ophtalmologie", "ORL", "Urologie", "Hématologie", "Infectiologie", "Autre",
];

const FORMES = [
  "Comprimé", "Gélule", "Solution injectable", "Sirop", "Pommade / Crème", "Patch",
  "Suppositoire", "Inhalateur", "Gouttes", "Sachet", "Autre",
];

const VOIES = [
  "Orale (per os)", "Intraveineuse (IV)", "Intramusculaire (IM)", "Sous-cutanée (SC)",
  "Transdermique", "Inhalée", "Rectale", "Ophtalmique", "Autre",
];

// ─── Helper components ────────────────────────────────────────────────────────

function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-sm font-medium text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
    />
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
    />
  );
}

function RadioGroup({ options, value, onChange }: {
  options: { val: string; label: string; desc?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => (
        <label key={o.val} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${value === o.val ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
          <input type="radio" className="accent-emerald-600 mt-0.5" checked={value === o.val} onChange={() => onChange(o.val)} />
          <div>
            <div className="text-sm font-medium text-gray-800">{o.label}</div>
            {o.desc && <div className="text-xs text-gray-500 mt-0.5">{o.desc}</div>}
          </div>
        </label>
      ))}
    </div>
  );
}

function CheckRow({ label, checked, onChange, desc }: {
  label: string; checked: boolean; onChange: () => void; desc?: string;
}) {
  return (
    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${checked ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
      <input type="checkbox" className="accent-emerald-600 mt-0.5" checked={checked} onChange={onChange} />
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {desc && <div className="text-xs text-gray-500">{desc}</div>}
      </div>
    </label>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
      {children}
    </div>
  );
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} hint={hint} />
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function FormulaireMedecin() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [nextConcoId, setNextConcoId] = useState(1);
  const [imputScore, setImputScore] = useState<ImputScore | null>(null);
  const [pvNumber, setPvNumber] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restaurer le brouillon au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const { form: savedForm, step: savedStep } = JSON.parse(saved);
        setForm(savedForm);
        setStep(savedStep || 1);
        setDraftRestored(true);
      }
    } catch {}
  }, []);

  // Auto-save avec debounce 800ms après chaque changement
  useEffect(() => {
    if (submitted) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step }));
      } catch {}
    }, 800);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [form, step, submitted]);

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  function addConcomitant() {
    setForm((prev) => ({
      ...prev,
      medicamentsConcomitants: [
        ...prev.medicamentsConcomitants,
        { id: nextConcoId, nom: "", posologie: "", indication: "", arretAvantEI: false, suspectSecondaire: false },
      ],
    }));
    setNextConcoId((n) => n + 1);
  }

  function updateConcomitant(id: number, field: keyof MedicamentConcomitant, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      medicamentsConcomitants: prev.medicamentsConcomitants.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    }));
  }

  function removeConcomitant(id: number) {
    setForm((prev) => ({
      ...prev,
      medicamentsConcomitants: prev.medicamentsConcomitants.filter((m) => m.id !== id),
    }));
  }

  function generatePvNumber() {
    const year = new Date().getFullYear();
    const seq = Math.floor(Math.random() * 90000) + 10000;
    return `PV-MA-${year}-${seq}`;
  }

  async function handleSubmit() {
    if (!form.consentement) return;
    setSubmitError("");
    const pv = generatePvNumber();
    setPvNumber(pv);
    try {
      await api.createReport({
        source: "medecin",
        patient_age: form.patientAge,
        patient_sexe: form.patientSexe,
        patient_poids: form.patientPoids ? parseInt(form.patientPoids) : undefined,
        patient_taille: form.patientTaille ? parseInt(form.patientTaille) : undefined,
        patient_grossesse: form.patientGrossesse || undefined,
        patient_antecedents: form.patientAntecedents || undefined,
        patient_allergies: form.patientAllergies || undefined,
        drug_dci: form.medicamentDCI,
        drug_nom_commercial: form.medicamentNomCommercial || undefined,
        drug_forme: form.medicamentForme || undefined,
        drug_voie: form.medicamentVoie || undefined,
        drug_posologie: form.medicamentPosologie || undefined,
        drug_indication: form.medicamentIndication || undefined,
        drug_date_debut: form.medicamentDateDebut || undefined,
        drug_date_fin: form.medicamentDateFin || undefined,
        drug_lot: form.medicamentLot || undefined,
        drug_laboratoire: form.medicamentLaboratoire || undefined,
        concomitants: form.medicamentsConcomitants.map(({ nom, posologie, indication }) => ({ nom, posologie, indication })),
        ei_description: form.eiDescription,
        ei_date_debut: form.eiDateDebut || undefined,
        ei_date_fin: form.eiDateFin || undefined,
        ei_evolution: form.eiEvolution || undefined,
        gravite_deces: form.graviteDeces,
        gravite_vie_danger: form.graviteVieDanger,
        gravite_hospitalisation: form.graviteHospitalisation,
        gravite_incapacite: form.graviteIncapacite,
        gravite_anomalie_congenitale: form.graviteAnomalieCongenitale,
        imput_chronologie: form.imputChronologie || undefined,
        imput_evolution_arret: form.imputEvolutionArret || undefined,
        imput_readministration: form.imputReadministration || undefined,
        imput_conclusion: imputScore
          ? `I${imputScore.Iscore} (C${imputScore.Cscore}/S${imputScore.Sscore})`
          : form.imputConclusion || undefined,
        commentaires: form.commentaires || undefined,
        raw_data: {
          ...form,
          begaud_score: imputScore ?? undefined,
        },
      });
      localStorage.removeItem(DRAFT_KEY);
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    }
  }

  const isSerieux =
    form.graviteDeces || form.graviteVieDanger || form.graviteHospitalisation ||
    form.graviteIncapacite || form.graviteAnomalieCongenitale || form.graviteMedicalementSignificatif;

  const isFatal = form.graviteDeces || form.graviteVieDanger;
  const delaiLegal = isFatal ? 7 : isSerieux ? 15 : null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Déclaration envoyée au CAPM</h1>
          {pvNumber && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm font-mono font-bold text-emerald-700 mb-3">
              {pvNumber}
            </div>
          )}
          <p className="text-gray-500 text-sm mb-1">Vous recevrez un accusé de réception par email.</p>
          {isSerieux && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-xs text-red-700 font-medium">
              ⚡ Déclaration sérieuse — traitement prioritaire sous 24h
            </div>
          )}
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/dashboard/medecin" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
              Retour au tableau de bord
            </Link>
            <button onClick={() => { setForm(INITIAL); setStep(1); setSubmitted(false); setDraftRestored(false); localStorage.removeItem(DRAFT_KEY); }}
              className="text-sm text-gray-500 hover:text-gray-700 underline">
              Faire une nouvelle déclaration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière brouillon restauré */}
      {draftRestored && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-sm text-amber-800">
          <span>📝 Brouillon restauré — vous avez repris là où vous vous étiez arrêté.</span>
          <button
            onClick={() => { setForm(INITIAL); setStep(1); setDraftRestored(false); localStorage.removeItem(DRAFT_KEY); }}
            className="text-xs text-amber-600 hover:text-amber-800 underline ml-4"
          >
            Recommencer à zéro
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/medecin" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
          <div>
            <div className="font-semibold text-gray-900 text-sm">Déclaration d&apos;EIM — Interface Médecin</div>
            <div className="text-xs text-gray-500">{SECTIONS[step - 1].icon} Section {step}/{SECTIONS.length} — {SECTIONS[step - 1].label}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isSerieux && step >= 5 && (
            <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-1 rounded-full">⚡ Sérieux</span>
          )}
          <span className="text-xs text-gray-400 font-medium">{Math.round((step / SECTIONS.length) * 100)}%</span>
        </div>
      </header>

      {/* Barre de progression */}
      <div className="h-1 bg-gray-200">
        <div className="h-1 bg-emerald-500 transition-all duration-300" style={{ width: `${(step / SECTIONS.length) * 100}%` }} />
      </div>

      {/* Onglets */}
      <div className="overflow-x-auto border-b border-gray-100 bg-white px-4">
        <div className="flex gap-1 py-2 min-w-max">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => s.id < step && setStep(s.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${step === s.id ? "bg-emerald-600 text-white" : s.id < step ? "bg-emerald-100 text-emerald-700 cursor-pointer" : "text-gray-400 cursor-default"}`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Section 1 : Déclarant ── */}
        {step === 1 && (
          <div className="space-y-5">
            <SectionTitle
              title="Informations sur le déclarant"
              subtitle="Ces informations permettent au CAPM de vous recontacter si nécessaire. Elles restent confidentielles."
            />
            <Field label="Type de déclaration" required hint="E2B C.1.3 — Nature de la source">
              <RadioGroup
                value={form.typeDeclaration}
                onChange={(v) => set("typeDeclaration", v)}
                options={[
                  { val: "spontanee", label: "Déclaration spontanée", desc: "Observation directe d'un effet indésirable en pratique courante" },
                  { val: "observationnelle", label: "Étude observationnelle", desc: "Données issues d'une étude ou d'un registre" },
                  { val: "litterature", label: "Rapport de littérature", desc: "Cas publié dans une revue médicale" },
                ]}
              />
            </Field>
            <Grid>
              <Field label="Nom" required>
                <Input value={form.declarantNom} onChange={(v) => set("declarantNom", v)} placeholder="Nom de famille" />
              </Field>
              <Field label="Prénom" required>
                <Input value={form.declarantPrenom} onChange={(v) => set("declarantPrenom", v)} placeholder="Prénom" />
              </Field>
            </Grid>
            <Grid>
              <Field label="Spécialité" required>
                <Select
                  value={form.declarantSpecialite}
                  onChange={(v) => set("declarantSpecialite", v)}
                  options={SPECIALITES}
                  placeholder="Choisir une spécialité"
                />
              </Field>
              {form.declarantSpecialite === "Autre" && (
                <Field label="Précisez la spécialité">
                  <Input value={form.declarantSpecialiteAutre} onChange={(v) => set("declarantSpecialiteAutre", v)} placeholder="Votre spécialité" />
                </Field>
              )}
              <Field label="N° d'inscription à l'Ordre" hint="N° INPE ou Conseil de l'Ordre">
                <Input value={form.declarantNumOrdre} onChange={(v) => set("declarantNumOrdre", v)} placeholder="Ex : MA-12345" />
              </Field>
            </Grid>
            <Grid>
              <Field label="Établissement / Structure de soins">
                <Input value={form.declarantEtablissement} onChange={(v) => set("declarantEtablissement", v)} placeholder="CHU, clinique, cabinet..." />
              </Field>
              <Field label="Ville">
                <Input value={form.declarantVille} onChange={(v) => set("declarantVille", v)} placeholder="Ville d'exercice" />
              </Field>
            </Grid>
            <Grid>
              <Field label="Email professionnel" required>
                <Input type="email" value={form.declarantEmail} onChange={(v) => set("declarantEmail", v)} placeholder="medecin@exemple.ma" />
              </Field>
              <Field label="Téléphone professionnel">
                <Input type="tel" value={form.declarantTel} onChange={(v) => set("declarantTel", v)} placeholder="+212 6XX XXX XXX" />
              </Field>
            </Grid>
          </div>
        )}

        {/* ── Section 2 : Patient ── */}
        {step === 2 && (
          <div className="space-y-5">
            <SectionTitle
              title="Informations sur le patient"
              subtitle="Données anonymisées — aucun nom, prénom ou N° CNI ne doit figurer."
            />
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              🔒 Conformément à la loi 09-08 sur la protection des données personnelles, le patient ne doit pas être identifiable dans ce formulaire.
            </div>
            <Grid>
              <Field label="Âge (années)" required>
                <Input type="number" value={form.patientAge} onChange={(v) => set("patientAge", v)} placeholder="Ex : 45" />
              </Field>
              <Field label="Sexe" required>
                <Select value={form.patientSexe} onChange={(v) => set("patientSexe", v)} options={["Masculin", "Féminin"]} placeholder="Sélectionner" />
              </Field>
            </Grid>
            <Grid>
              <Field label="Poids (kg)" hint="Optionnel mais utile pour l'analyse">
                <Input type="number" value={form.patientPoids} onChange={(v) => set("patientPoids", v)} placeholder="Ex : 70" />
              </Field>
              <Field label="Taille (cm)">
                <Input type="number" value={form.patientTaille} onChange={(v) => set("patientTaille", v)} placeholder="Ex : 170" />
              </Field>
            </Grid>

            {/* Grossesse / allaitement (si sexe féminin) */}
            {(form.patientSexe === "Féminin" || !form.patientSexe) && (
              <Grid>
                <Field label="Grossesse">
                  <Select
                    value={form.patientGrossesse}
                    onChange={(v) => set("patientGrossesse", v)}
                    options={["Oui", "Non", "Inconnue"]}
                    placeholder="Sélectionner"
                  />
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
              <Field label="Insuffisance rénale" hint="Stade selon DFG (KDIGO)">
                <Select
                  value={form.patientInsuffisanceRenaleStade}
                  onChange={(v) => set("patientInsuffisanceRenaleStade", v)}
                  options={STADES_RENALE}
                  placeholder="Aucune / Non évaluée"
                />
              </Field>
              <Field label="Insuffisance hépatique" hint="Stade selon Child-Pugh">
                <Select
                  value={form.patientInsuffisanceHepatiqueStade}
                  onChange={(v) => set("patientInsuffisanceHepatiqueStade", v)}
                  options={STADES_HEPATIQUE}
                  placeholder="Aucune / Non évaluée"
                />
              </Field>
            </Grid>
            <Field label="Antécédents médicaux pertinents" hint="Maladies chroniques, chirurgies, allergie connues">
              <Textarea value={form.patientAntecedents} onChange={(v) => set("patientAntecedents", v)} placeholder="Ex : HTA, diabète type 2, allergie à la pénicilline..." rows={3} />
            </Field>
            <Field label="Allergies médicamenteuses connues">
              <Input value={form.patientAllergies} onChange={(v) => set("patientAllergies", v)} placeholder="Ex : pénicilline, AINS..." />
            </Field>
          </div>
        )}

        {/* ── Section 3 : Médicament suspect ── */}
        {step === 3 && (
          <div className="space-y-5">
            <SectionTitle
              title="Médicament(s) suspect(s)"
              subtitle="Médicament suspecté d'être responsable de l'effet indésirable."
            />
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-xl p-4 text-sm text-gray-500 hover:text-emerald-600 transition-all">
                📷 Scanner la boîte
              </button>
              <button className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-xl p-4 text-sm text-gray-500 hover:text-emerald-600 transition-all">
                📄 Scanner l&apos;ordonnance
              </button>
            </div>
            <Grid>
              <Field label="DCI (Dénomination Commune Internationale)" required hint="Nom générique du principe actif">
                <Input value={form.medicamentDCI} onChange={(v) => set("medicamentDCI", v)} placeholder="Ex : métformine, amoxicilline..." />
              </Field>
              <Field label="Nom commercial">
                <Input value={form.medicamentNomCommercial} onChange={(v) => set("medicamentNomCommercial", v)} placeholder="Ex : Glucophage, Amoxil..." />
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
            <Grid>
              <Field label="Posologie" required hint="Dose par prise">
                <Input value={form.medicamentPosologie} onChange={(v) => set("medicamentPosologie", v)} placeholder="Ex : 500 mg, 1 g..." />
              </Field>
              <Field label="Fréquence" required>
                <Select
                  value={form.medicamentFrequence}
                  onChange={(v) => set("medicamentFrequence", v)}
                  options={["1×/jour", "2×/jour", "3×/jour", "4×/jour", "1×/semaine", "Autre"]}
                  placeholder="Sélectionner"
                />
              </Field>
            </Grid>
            <Field label="Indication thérapeutique" required hint="Pourquoi ce médicament a-t-il été prescrit ?">
              <Input value={form.medicamentIndication} onChange={(v) => set("medicamentIndication", v)} placeholder="Ex : traitement du diabète type 2, infection urinaire..." />
            </Field>
            <Grid>
              <Field label="Date de début du traitement" required>
                <Input type="date" value={form.medicamentDateDebut} onChange={(v) => set("medicamentDateDebut", v)} />
              </Field>
              <Field label="Date de fin du traitement">
                <Input type="date" value={form.medicamentDateFin} onChange={(v) => set("medicamentDateFin", v)} disabled={form.medicamentEnCours} />
              </Field>
            </Grid>
            <CheckRow
              label="Traitement toujours en cours"
              checked={form.medicamentEnCours}
              onChange={() => set("medicamentEnCours", !form.medicamentEnCours)}
            />
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
                  { val: "moi", label: "Moi-même (auto-déclaration)" },
                  { val: "confrere", label: "Un confrère médecin" },
                  { val: "pharmacien", label: "Un pharmacien" },
                  { val: "automédication", label: "Automédication du patient" },
                ]}
              />
            </Field>
          </div>
        )}

        {/* ── Section 4 : Médicaments concomitants ── */}
        {step === 4 && (
          <div className="space-y-5">
            <SectionTitle
              title="Médicaments concomitants"
              subtitle="Tous les médicaments pris simultanément, incluant vitamines, compléments et automédication."
            />
            <CheckRow
              label="✅ Le patient ne prenait aucun autre médicament concomitant"
              checked={form.aucunConcomitant}
              onChange={() => {
                const next = !form.aucunConcomitant;
                setForm((prev) => ({ ...prev, aucunConcomitant: next, medicamentsConcomitants: next ? [] : prev.medicamentsConcomitants }));
              }}
              desc="Confirmez explicitement l'absence de co-médications (inclus automédication et phytothérapie)"
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
                <Grid cols={3}>
                  <div className="md:col-span-1">
                    <FieldLabel label="Nom / DCI" />
                    <Input value={m.nom} onChange={(v) => updateConcomitant(m.id, "nom", v)} placeholder="Nom ou DCI" />
                  </div>
                  <div>
                    <FieldLabel label="Posologie" />
                    <Input value={m.posologie} onChange={(v) => updateConcomitant(m.id, "posologie", v)} placeholder="Ex : 10 mg/j" />
                  </div>
                  <div>
                    <FieldLabel label="Indication" />
                    <Input value={m.indication} onChange={(v) => updateConcomitant(m.id, "indication", v)} placeholder="Ex : HTA" />
                  </div>
                </Grid>
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

            <button
              onClick={addConcomitant}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300 hover:border-emerald-500 text-emerald-600 hover:text-emerald-700 rounded-xl py-3 text-sm font-medium transition-all"
            >
              + Ajouter un médicament concomitant
            </button>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
              💡 N&apos;oubliez pas d&apos;inclure les plantes médicinales, les anti-VEGF, les immunosuppresseurs et tout médicament pris sans prescription.
            </div>
          </div>
        )}

        {/* ── Section 5 : Effet indésirable ── */}
        {step === 5 && (
          <div className="space-y-5">
            <SectionTitle
              title="Description de l'effet indésirable"
              subtitle="Description clinique précise. Utilisez la terminologie médicale."
            />
            <Field label="Description clinique de l'EIM" required hint="Symptômes, signes cliniques, résultats paracliniques anormaux">
              <Textarea
                rows={5}
                value={form.eiDescription}
                onChange={(v) => set("eiDescription", v)}
                placeholder="Décrivez l'effet indésirable de façon précise : symptômes, chronologie, intensité, évolution..."
              />
            </Field>
            <Grid>
              <Field label="Date de début de l'EIM" required>
                <Input type="date" value={form.eiDateDebut} onChange={(v) => set("eiDateDebut", v)} />
              </Field>
              <Field label="Date de fin / guérison">
                <Input type="date" value={form.eiDateFin} onChange={(v) => set("eiDateFin", v)} disabled={form.eiEnCours} />
              </Field>
            </Grid>
            <CheckRow
              label="L'EIM est toujours en cours"
              checked={form.eiEnCours}
              onChange={() => set("eiEnCours", !form.eiEnCours)}
            />
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

            {/* Gravité — Critères ICH E2B R3 */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">Critères de gravité (ICH E2B R3)</h3>
                {isSerieux && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">⚡ Sérieux</span>}
              </div>
              <p className="text-xs text-gray-500 mb-4">Un EIM est <strong>sérieux</strong> s&apos;il remplit au moins un des critères ci-dessous. Les EIM sérieux sont transmis au CAPM en priorité (délai réglementaire : 15 jours calendaires).</p>
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

            <Field label="Examens complémentaires / Résultats biologiques pertinents" hint="Bilan hépatique, créatinine, NFS, ECG... tout résultat anormal en lien avec l'EIM">
              <Textarea
                value={form.examensComplementaires}
                onChange={(v) => set("examensComplementaires", v)}
                placeholder="Ex : ALAT 3×N, créatinine 180 μmol/L, hyperkaliémie à 6,2 mmol/L..."
                rows={3}
              />
            </Field>
          </div>
        )}

        {/* ── Section 6 : Imputabilité ── */}
        {step === 6 && (
          <div className="space-y-5">
            <SectionTitle
              title="Imputabilité médicamenteuse"
              subtitle="Méthode française (BÉGAUD) — évaluation du lien de causalité entre le médicament et l'EIM."
            />
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <ImputabiliteBegaud onScoreChange={(score) => setImputScore(score)} />
            </div>
            {imputScore && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
                ✅ Score enregistré — Imputabilité {["I0", "I1", "I2", "I3", "I4"][imputScore.Iscore]} · {imputScore.isGrave ? "⚡ Effet grave" : "Non grave"}
              </div>
            )}
          </div>
        )}

        {/* ── Section 7 : Finalisation ── */}
        {step === 7 && (
          <div className="space-y-5">
            <SectionTitle title="Finalisation et envoi" subtitle="Vérifiez votre déclaration avant envoi au CAPM." />

            {/* Récapitulatif */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2 text-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Récapitulatif</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Type de déclaration</p>
                  <p className="font-medium text-gray-800 capitalize">{form.typeDeclaration || "—"}</p>
                </div>
                {delaiLegal && (
                  <div className={`rounded-lg p-3 ${isFatal ? "bg-red-100" : "bg-amber-50"}`}>
                    <p className="text-gray-500 mb-1">Délai légal CAPM</p>
                    <p className={`font-bold ${isFatal ? "text-red-700" : "text-amber-700"}`}>{delaiLegal} jours calendaires</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Déclarant</p>
                  <p className="font-medium text-gray-800">{form.declarantPrenom} {form.declarantNom} — {form.declarantSpecialite || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Patient</p>
                  <p className="font-medium text-gray-800">{form.patientAge ? `${form.patientAge} ans` : "—"}, {form.patientSexe || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Médicament suspect</p>
                  <p className="font-medium text-gray-800">{form.medicamentDCI || form.medicamentNomCommercial || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Gravité</p>
                  <p className={`font-bold ${isSerieux ? "text-red-600" : "text-gray-600"}`}>{isSerieux ? "⚡ Sérieux" : "Non sérieux"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Imputabilité</p>
                  <p className="font-medium text-gray-800 capitalize">{form.imputConclusion || "Non renseignée"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Médicaments concomitants</p>
                  <p className="font-medium text-gray-800">{form.medicamentsConcomitants.length} déclaré(s)</p>
                </div>
              </div>
              {delaiLegal && (
                <div className={`border rounded-lg p-3 text-xs mt-2 ${isFatal ? "bg-red-100 border-red-300 text-red-800" : "bg-red-50 border-red-200 text-red-700"}`}>
                  ⚡ <strong>EIM {isFatal ? "fatal / pronostic vital engagé" : "sérieux"}</strong> — Délai réglementaire de transmission au CAPM : <strong>{delaiLegal} jours calendaires</strong>.
                </div>
              )}
            </div>

            <Field label="Documents joints" hint="Ordonnance, résultats biologiques, imagerie, courrier de sortie...">
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-xl p-5 text-sm text-gray-500 hover:text-emerald-600 transition-all cursor-pointer">
                📎 Joindre des fichiers (PDF, JPG, PNG)
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={() => set("documents", true)} />
              </label>
              {form.documents && <p className="text-xs text-emerald-600 mt-1">✓ Fichier(s) joint(s)</p>}
            </Field>

            <Field label="Commentaires libres">
              <Textarea
                value={form.commentaires}
                onChange={(v) => set("commentaires", v)}
                placeholder="Toute information complémentaire jugée pertinente..."
                rows={3}
              />
            </Field>

            {/* Consentement */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.consentement ? "border-emerald-500 bg-emerald-50" : "border-gray-300"}`}>
              <input type="checkbox" className="accent-emerald-600 mt-1" checked={form.consentement} onChange={(e) => set("consentement", e.target.checked)} />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Je certifie l&apos;exactitude des informations déclarées et consens à leur transmission anonymisée au Centre Anti-Poison et de Pharmacovigilance du Maroc (CAPM). <span className="text-red-500">*</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">Conformément à l&apos;article 18 de la loi 17-04 relative au Code du médicament et de la pharmacie.</p>
              </div>
            </label>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
                ⚠️ {submitError}
              </div>
            )}
            <div className="text-xs text-gray-400 text-center">
              Un numéro de déclaration <span className="font-mono font-semibold text-gray-600">PV-MA-{new Date().getFullYear()}-XXXXX</span> sera généré automatiquement.
            </div>
            <button
              onClick={handleSubmit}
              disabled={!form.consentement}
              className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all ${form.consentement ? "bg-emerald-600 hover:bg-emerald-700 shadow-md" : "bg-gray-300 cursor-not-allowed"}`}
            >
              {isFatal ? "🚨 Envoyer — Urgence 7 jours →" : isSerieux ? "⚡ Envoyer la déclaration sérieuse au CAPM →" : "Envoyer la déclaration au CAPM →"}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ← Précédent
          </button>
          {step < SECTIONS.length && (
            <button
              onClick={() => setStep((s) => Math.min(SECTIONS.length, s + 1))}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all"
            >
              Suivant →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
