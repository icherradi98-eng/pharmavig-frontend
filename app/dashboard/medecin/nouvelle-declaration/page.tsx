"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ImputabiliteBegaud, { ImputScore } from "./ImputabiliteBegaud";
import { readProfile } from "@/lib/ordonnancier";
import { autocomplete, fetchAnsm, type Suggestion } from "@/lib/drugApi";
import { MEDDRA_TERMS, type MedDRATerm } from "@/lib/meddraTerms";
import { parsePostologie } from "@/lib/parsePostologie";
import ScanBoite, { type ScannedData } from "@/components/medecin/ScanBoite";
import { searchLocalInteraction } from "@/lib/interactionsLocales";

const DRAFT_KEY = "pharmavig_medecin_draft";
const PREFILL_KEY = "pharmavig_prefill_declaration";

// ─── Types ────────────────────────────────────────────────────────────────────

type MedicamentConcomitant = {
  id: number;
  nom: string;
  posologieDose: string;       // ex. "500"
  posologieUnite: string;      // "mg" | "g" | "µg" | "mL" | "UI" | "mg/kg"
  posologieFrequence: string;  // "1×/jour" etc.
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
  eiMeddraTerm: string;
  eiMeddraCode: string;
  eiMeddraSoc: string;
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
  notifAccuseReception: boolean;   // email immédiat à la soumission
  notifSuiviStatut: boolean;       // email quand le statut de la déclaration change
  notifEmail: string;              // adresse cible (pré-remplie depuis declarantEmail)
};

const STADES_RENALE = ["Légère (DFG 60–89)", "Modérée (DFG 30–59)", "Sévère (DFG 15–29)", "Terminale / Dialyse (DFG < 15)"];
const STADES_HEPATIQUE = ["Légère (Child-Pugh A)", "Modérée (Child-Pugh B)", "Sévère (Child-Pugh C)"];

const INITIAL: FormData = {
  typeDeclaration: "spontanee",
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
  medicamentsConcomitants: [] as MedicamentConcomitant[],
  eiMeddraTerm: "", eiMeddraCode: "", eiMeddraSoc: "",
  eiDescription: "", eiDateDebut: "", eiDateFin: "", eiEnCours: false, eiEvolution: "",
  graviteDeces: false, graviteVieDanger: false, graviteHospitalisation: false,
  graviteIncapacite: false, graviteAnomalieCongenitale: false,
  graviteMedicalementSignificatif: false, graviteNonSerieux: false,
  examensComplementaires: "",
  imputChronologie: "", imputDelaiApparition: "", imputEvolutionArret: "",
  imputReadministration: "", imputReadministrationResultat: "", imputSemiologie: "",
  imputBilanEtiologique: "", imputConclusion: "",
  documents: false, commentaires: "", consentement: false,
  notifAccuseReception: true, notifSuiviStatut: true, notifEmail: "",
};

const SECTIONS = [
  { id: 1, label: "Patient", icon: "🧑" },
  { id: 2, label: "Médicament suspect", icon: "💊" },
  { id: 3, label: "Concomitants", icon: "📋" },
  { id: 4, label: "Effet indésirable", icon: "⚠️" },
  { id: 5, label: "Imputabilité", icon: "🔬" },
  { id: 6, label: "Finalisation", icon: "📤" },
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

function Collapsible({ label, hint, children, defaultOpen = false }: {
  label: string; hint?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {hint && <span className="ml-2 text-xs text-gray-400">{hint}</span>}
        </div>
        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 py-4 space-y-4 bg-white">{children}</div>}
    </div>
  );
}

// ── Mapping BDPM / référentiel → valeurs de nos selects ─────────────────────

function mapVoie(raw: string): string {
  const v = raw.toLowerCase();
  if (v.includes("orale") || v.includes("oral")) return "Orale (per os)";
  if (v.includes("intraveineuse") || v.includes("intravenous")) return "Intraveineuse (IV)";
  if (v.includes("intramusculaire") || v.includes("intramuscular")) return "Intramusculaire (IM)";
  if (v.includes("sous-cutanée") || v.includes("sous-cutanee") || v.includes("subcutaneous")) return "Sous-cutanée (SC)";
  if (v.includes("transdermique") || v.includes("transdermal")) return "Transdermique";
  if (v.includes("inhalée") || v.includes("inhalation") || v.includes("inhaled")) return "Inhalée";
  if (v.includes("rectale") || v.includes("rectal")) return "Rectale";
  if (v.includes("ophtalmique") || v.includes("ophthalmic") || v.includes("ocular")) return "Ophtalmique";
  return "";
}

function mapForme(raw: string): string {
  const f = raw.toLowerCase();
  if (f.includes("comprimé") || f.includes("comprimes") || f.includes("tablet")) return "Comprimé";
  if (f.includes("gélule") || f.includes("gelule") || f.includes("capsule")) return "Gélule";
  if (f.includes("injectable") || f.includes("injection") || f.includes("solution for injection")) return "Solution injectable";
  if (f.includes("sirop") || f.includes("syrup") || f.includes("oral solution")) return "Sirop";
  if (f.includes("pommade") || f.includes("crème") || f.includes("creme") || f.includes("ointment") || f.includes("cream") || f.includes("gel")) return "Pommade / Crème";
  if (f.includes("patch") || f.includes("transdermal")) return "Patch";
  if (f.includes("suppositoire") || f.includes("suppository")) return "Suppositoire";
  if (f.includes("inhalateur") || f.includes("inhaler") || f.includes("aerosol")) return "Inhalateur";
  if (f.includes("gouttes") || f.includes("drops")) return "Gouttes";
  if (f.includes("sachet")) return "Sachet";
  return "";
}

// ── Composant MedicamentSearch ────────────────────────────────────────────────

type DrugEnrichment = {
  dci: string;
  nomCommercial: string;
  forme: string;
  voie: string;
  laboratoire: string;
};

function MedicamentSearch({ onSelect }: { onSelect: (e: DrugEnrichment) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enriched, setEnriched] = useState<DrugEnrichment | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await autocomplete(q);
      setSuggestions(res);
      setOpen(res.length > 0);
    }, 300);
  }, []);

  async function select(s: Suggestion) {
    setOpen(false);
    setQuery(s.brand ? `${s.dci} (${s.brand})` : s.dci);
    setSuggestions([]);
    setEnriching(true);
    setEnriched(null);

    const enrichment: DrugEnrichment = {
      dci: s.dci,
      nomCommercial: s.brand ?? "",
      forme: "",
      voie: "",
      laboratoire: "",
    };

    // 1. BDPM — source française prioritaire
    try {
      const bdpm = await fetchAnsm(s.dci);
      if (bdpm) {
        if (bdpm.forme) enrichment.forme = mapForme(bdpm.forme);
        if (bdpm.voies?.[0]) enrichment.voie = mapVoie(bdpm.voies[0]);
        if (bdpm.denomination && !enrichment.nomCommercial) enrichment.nomCommercial = bdpm.denomination;
      }
    } catch {}

    // Enrichissement complémentaire via référentiel local si BDPM insuffisant
    if (!enrichment.voie || !enrichment.forme || !enrichment.nomCommercial) {
      try {
        const { searchProducts, getProductView } = await import("@/lib/referentiel/index");
        const results = searchProducts(s.dci, 1);
        if (results.length > 0) {
          const view = getProductView(results[0].id);
          if (view) {
            if (!enrichment.forme && view.presentation?.pharmaceutical_form)
              enrichment.forme = mapForme(view.presentation.pharmaceutical_form);
            if (!enrichment.voie && view.presentation?.route)
              enrichment.voie = mapVoie(view.presentation.route);
            if (!enrichment.laboratoire && view.product.lab_name)
              enrichment.laboratoire = view.product.lab_name;
            if (!enrichment.nomCommercial && view.product.brand_name)
              enrichment.nomCommercial = view.product.brand_name;
          }
        }
      } catch {}
    }

    setEnriched(enrichment);
    setEnriching(false);
    onSelect(enrichment);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); search(e.target.value); setEnriched(null); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Tapez une DCI ou un nom commercial (ex. Opdivo, nivolumab, metformine...)"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {enriching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {open && suggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => select(s)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50 text-left transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">{s.dci}</span>
                {s.brand && <span className="text-xs text-gray-400 ml-2 truncate max-w-[180px]">{s.brand}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Récap enrichissement */}
      {enriched && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-800">
          <span>💊 <strong>DCI :</strong> {enriched.dci}</span>
          {enriched.nomCommercial && <span><strong>Marque :</strong> {enriched.nomCommercial}</span>}
          {enriched.voie && <span><strong>Voie :</strong> {enriched.voie}</span>}
          {enriched.forme && <span><strong>Forme :</strong> {enriched.forme}</span>}
          {enriched.laboratoire && <span><strong>Labo :</strong> {enriched.laboratoire}</span>}
          <span className="text-emerald-600 ml-auto">✓ Champs pré-remplis depuis le référentiel</span>
        </div>
      )}
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

// ─── MedDRA — importé depuis lib/meddraTerms.ts (250 termes) ─────────────────
// MedDRATerm et MEDDRA_TERMS sont importés en haut du fichier.

function MedDRASearch({ value, code, soc, onChange }: {
  value: string;
  code: string;
  soc: string;
  onChange: (term: string, code: string, soc: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  const filtered = query.length >= 2
    ? MEDDRA_TERMS.filter((t) => t.pt.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  function select(t: MedDRATerm) {
    setQuery(t.pt);
    onChange(t.pt, t.code, t.soc);
    setOpen(false);
  }

  function handleBlur() {
    setTimeout(() => setOpen(false), 150);
    if (!code) onChange(query, "", "");
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value, "", ""); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder="Ex : Nausées, Urticaire, Insuffisance rénale aiguë..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {filtered.map((t) => (
            <button
              key={t.code}
              type="button"
              onMouseDown={() => select(t)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50 text-left transition-colors"
            >
              <div>
                <span className="text-sm font-medium text-gray-900">{t.pt}</span>
                <span className="ml-2 text-xs text-gray-400">{t.soc}</span>
              </div>
              <span className="text-xs font-mono text-gray-300">{t.code}</span>
            </button>
          ))}
        </div>
      )}
      {code && (
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">PT MedDRA</span>
          <span className="text-xs text-gray-500">{soc}</span>
          <span className="text-xs font-mono text-gray-400">#{code}</span>
        </div>
      )}
      {query && !code && query.length > 2 && (
        <p className="text-xs text-amber-600 mt-1">⚠️ Terme non codé — sera codé à réception.</p>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// Pré-remplit la section Déclarant depuis le JWT (user) + localStorage (profil ordonnancier)
function buildDeclarantOverrides(
  user: { nom?: string; prenom?: string; email?: string; specialite?: string } | null
): Partial<FormData> {
  if (!user) return {};
  const profile = readProfile();
  return {
    declarantNom: user.nom || "",
    declarantPrenom: user.prenom || "",
    declarantEmail: user.email || "",
    declarantSpecialite: profile.specialite || user.specialite || "",
    declarantNumOrdre: profile.numOrdre || "",
    declarantEtablissement: profile.etablissement || "",
    declarantVille: profile.ville || "",
    declarantTel: profile.telephone || "",
    notifEmail: user.email || "",
  };
}

function readDraft(): { form: FormData; step: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return null;
    const { form: savedForm, step: savedStep } = JSON.parse(saved);
    return { form: savedForm, step: savedStep || 1 };
  } catch {
    return null;
  }
}

function readPrefill(): Partial<FormData> | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(PREFILL_KEY);
    if (!saved) return null;
    sessionStorage.removeItem(PREFILL_KEY);
    const raw = JSON.parse(saved) as Partial<FormData> & { medicamentConcomitantNom?: string };
    // Transformer medicamentConcomitantNom → première entrée medicamentsConcomitants
    if (raw.medicamentConcomitantNom) {
      raw.medicamentsConcomitants = [
        {
          id: Date.now(),
          nom: raw.medicamentConcomitantNom,
          posologieDose: "",
          posologieUnite: "mg",
          posologieFrequence: "1×/jour",
          indication: "",
          arretAvantEI: false,
          suspectSecondaire: true,
        },
      ];
      delete raw.medicamentConcomitantNom;
    }
    return raw;
  } catch {
    return null;
  }
}

/** Retourne la liste des champs manquants pour l'étape donnée */
function sectionErrors(step: number, f: FormData): string[] {
  const errs: string[] = [];
  // step 1 = Patient (Déclarant supprimé du flux — validé via profil)
  if (step === 1) {
    if (!f.patientAge) errs.push("Âge du patient");
    if (!f.patientSexe) errs.push("Sexe du patient");
  }
  if (step === 2) {
    if (!f.medicamentDCI) errs.push("DCI du médicament");
    if (!f.medicamentForme) errs.push("Forme pharmaceutique");
    if (!f.medicamentVoie) errs.push("Voie d'administration");
    if (!f.medicamentPosologie) errs.push("Posologie");
    if (!f.medicamentFrequence) errs.push("Fréquence");
    if (!f.medicamentIndication) errs.push("Indication");
    if (!f.medicamentDateDebut) errs.push("Date de début du traitement");
  }
  if (step === 4) {
    if (!f.eiMeddraTerm) errs.push("Effet observé");
    if (!f.eiDescription) errs.push("Description de l'effet indésirable");
    if (!f.eiDateDebut) errs.push("Date de début de l'effet");
    const hasGravite =
      f.graviteHospitalisation ||
      f.graviteVieDanger ||
      f.graviteIncapacite ||
      f.graviteDeces ||
      f.graviteAnomalieCongenitale ||
      f.graviteMedicalementSignificatif ||
      f.graviteNonSerieux; // ← fix critique : "non sérieux" est un critère de gravité valide
    if (!hasGravite) errs.push("Gravité de l'effet (au moins une case — y compris « Non sérieux »)");
  }
  return errs;
}

/** Lien discret en section 7 pour modifier le type de déclaration (cas rares) */
function TypeDeclarationInline({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const labels: Record<string, string> = {
    spontanee: "Déclaration spontanée",
    observationnelle: "Étude observationnelle",
    litterature: "Rapport de littérature",
  };
  const current = labels[value] || "Déclaration spontanée";
  return (
    <div>
      <p className="font-medium text-gray-800 text-xs">{current}</p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-[10px] text-gray-400 underline underline-offset-2 mt-0.5 hover:text-gray-600"
      >
        {open ? "Fermer" : "Modifier (cas rare)"}
      </button>
      {open && (
        <div className="mt-2 space-y-1">
          {Object.entries(labels).map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
              <input
                type="radio"
                name="typeDeclarationInline"
                value={val}
                checked={value === val}
                onChange={() => { onChange(val); setOpen(false); }}
                className="accent-teal-700"
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Pré-calcul automatique Bégaud depuis les dates ──────────────────────────

/**
 * Propose c1 (chronologie d'apparition) et c2 (évolution à l'arrêt)
 * depuis les données déjà saisies dans le formulaire.
 * Retourne null si les données sont insuffisantes.
 */
function autoFillBegaud(
  medicamentDateDebut: string,
  eiDateDebut: string,
  eiEvolution: string
): Record<string, string> | null {
  if (!medicamentDateDebut || !eiDateDebut) return null;

  const tStart = new Date(medicamentDateDebut).getTime();
  const tEI    = new Date(eiDateDebut).getTime();
  if (isNaN(tStart) || isNaN(tEI)) return null;

  const diffDays = Math.round((tEI - tStart) / (1000 * 60 * 60 * 24));

  // c1 — délai d'apparition
  let c1: string;
  if (diffDays < 0)         c1 = "incompatible";   // EIM avant le médicament
  else if (diffDays <= 7)   c1 = "tres_compatible"; // 0–7 j = très compatible
  else if (diffDays <= 30)  c1 = "compatible";      // 8–30 j = compatible
  else if (diffDays <= 365) c1 = "nr";              // > 30 j = douteux/suggère C1
  else                      c1 = "incompatible";    // > 1 an = incompatible

  // c2 — évolution à l'arrêt / sous traitement
  let c2: string;
  const ev = (eiEvolution || "").toLowerCase();
  if (ev.includes("résolu") || ev.includes("résolution") || ev.includes("guéri")) {
    c2 = "favorable";
  } else if (ev.includes("amélioration") || ev.includes("amélio")) {
    c2 = "favorable";
  } else if (ev.includes("décès") || ev.includes("deces") || ev.includes("fatal")) {
    c2 = "favorable"; // évolution conclusive
  } else {
    c2 = "inconnu";
  }

  return { c1, c2 };
}

export default function FormulaireMedecin() {
  const { user } = useAuth();
  const router = useRouter();
  const [draft] = useState<{ form: FormData; step: number } | null>(() => readDraft());
  const [prefill] = useState<Partial<FormData> | null>(() => (draft ? null : readPrefill()));
  const [step, setStep] = useState(draft?.step ?? 1);
  const [form, setForm] = useState<FormData>(draft?.form ?? (prefill ? { ...INITIAL, ...prefill } : INITIAL));

  // Vérification de profil à l'entrée : redirect si profil incomplet
  // Pré-remplit aussi les champs déclarant silencieusement (sans étape dédiée)
  const declarantPrefilled = useRef(false);
  useEffect(() => {
    if (!user) return;
    const profile = readProfile();
    // Profil jugé complet si nom + spécialité + email présents
    const profileComplete = !!(
      (user.nom || profile.nom) &&
      (profile.specialite || user.specialite) &&
      user.email
    );
    if (!profileComplete) {
      router.replace("/profile?next=/dashboard/medecin/nouvelle-declaration");
      return;
    }
    // Pré-remplissage silencieux des champs déclarant (pas d'étape dédiée)
    if (declarantPrefilled.current || draft) return;
    declarantPrefilled.current = true;
    const overrides = buildDeclarantOverrides(user);
    setForm((prev) => ({ ...prev, ...overrides }));
  }, [user, draft, router]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [nextConcoId, setNextConcoId] = useState(1);
  const [imputScore, setImputScore] = useState<ImputScore | null>(null);
  const [begaudOpen, setBegaudOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [begaudInitial, setBegaudInitial] = useState<Record<string, string> | undefined>(undefined);
  const [pvNumber, setPvNumber] = useState("");
  const [draftRestored, setDraftRestored] = useState(() => draft !== null);
  const [prefilled, setPrefilled] = useState(() => prefill !== null);
  const [triedNext, setTriedNext] = useState(false); // affiche les erreurs inline seulement après tentative
  const [anneeNaissance, setAnneeNaissance] = useState(""); // champ UI uniquement, pas stocké dans form
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const savedConcomitants = useRef<MedicamentConcomitant[]>([]); // préserve la liste lors du toggle aucunConcomitant
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      aucunConcomitant: false, // désactiver "aucun" si on ajoute un médicament
      medicamentsConcomitants: [
        ...prev.medicamentsConcomitants,
        { id: nextConcoId, nom: "", posologieDose: "", posologieUnite: "mg", posologieFrequence: "1×/jour", indication: "", arretAvantEI: false, suspectSecondaire: false },
      ],
    }));
    setNextConcoId((n) => n + 1);
  }

  function toggleAucunConcomitant() {
    const next = !form.aucunConcomitant;
    if (next) {
      // Sauvegarde la liste avant de la vider
      savedConcomitants.current = form.medicamentsConcomitants;
      setForm((prev) => ({ ...prev, aucunConcomitant: true, medicamentsConcomitants: [] }));
    } else {
      // Restaure la liste sauvegardée
      setForm((prev) => ({ ...prev, aucunConcomitant: false, medicamentsConcomitants: savedConcomitants.current }));
    }
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

  async function handleSubmit() {
    if (!form.consentement) return;
    setSubmitError("");
    try {
      const submitFn = user ? api.createReport : api.createAnonymousReport;
      const resp = await submitFn({
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
        concomitants: form.medicamentsConcomitants.map(({ nom, posologieDose, posologieUnite, posologieFrequence, indication }) => ({ nom, posologie: `${posologieDose} ${posologieUnite} — ${posologieFrequence}`, indication })),
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
        notifications: {
          accuse_reception: form.notifAccuseReception,
          suivi_statut: form.notifSuiviStatut,
          email: form.notifEmail || form.declarantEmail || undefined,
        },
        raw_data: {
          ...form,
          begaud_score: imputScore ?? undefined,
        },
      });
      const ref = resp?.id
        ? `PV-MA-${new Date().getFullYear()}-${String(resp.id).slice(0, 8).toUpperCase()}`
        : `PV-MA-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
      setPvNumber(ref);
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

  const champsManquants = [
    !form.medicamentDCI && "Médicament suspect — DCI (Section 2)",
    !form.eiMeddraTerm && "Effet observé (Section 4)",
    !form.eiDescription && "Description clinique de l'effet indésirable (Section 4)",
    !isSerieux && !form.graviteNonSerieux && "Critère de gravité — cochez au moins une case (y compris « Non sérieux ») (Section 4)",
  ].filter(Boolean) as string[];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-lg w-full">

          {/* Titre */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Déclaration enregistrée</h1>
            <p className="text-gray-500 text-sm">Votre déclaration a bien été enregistrée.</p>
          </div>

          {/* Numéro de référence */}
          {pvNumber && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 text-center mb-4">
              <p className="text-xs text-emerald-600 font-medium mb-1">Référence de déclaration</p>
              <p className="text-lg font-mono font-bold text-emerald-800">{pvNumber}</p>
              <p className="text-xs text-emerald-600 mt-1">Conservez cette référence pour le suivi</p>
            </div>
          )}

          {/* Alerte si sérieux */}
          {isSerieux && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <span className="text-base">⚡</span>
              <div>
                <p className="text-sm font-bold text-red-700">Déclaration sérieuse</p>
                <p className="text-xs text-red-600">
                  {isFatal
                    ? "Cas fatal ou mettant en jeu le pronostic vital — délai réglementaire de notification : 7 jours."
                    : "Traitement prioritaire — délai réglementaire de notification : 15 jours."}
                </p>
              </div>
            </div>
          )}

          {/* Que se passe-t-il maintenant */}
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Que se passe-t-il maintenant ?</p>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-base mt-0.5">📧</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">Accusé de réception par email</p>
                  <p className="text-xs text-gray-500">Un email de confirmation vous a été envoyé avec le numéro de référence.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-base mt-0.5">🔬</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">Analyse pharmacovigilance</p>
                  <p className="text-xs text-gray-500">
                    Votre déclaration sera analysée par les services de pharmacovigilance.{" "}
                    {delaiLegal ? `Délai réglementaire : ${delaiLegal} jours.` : "Délai habituel : 30 jours."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-base mt-0.5">📄</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">PDF CIOMS disponible</p>
                  <p className="text-xs text-gray-500">Téléchargez le formulaire CIOMS complet depuis &quot;Mes déclarations&quot;.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-base mt-0.5">📊</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">Suivi du statut</p>
                  <p className="text-xs text-gray-500">Consultez l&apos;évolution de votre déclaration dans &quot;Mes déclarations&quot;.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {/* Télécharger le PDF */}
            {pvNumber && (
              <button
                onClick={async () => {
                  const { generateDeclarationPDF } = await import("@/lib/generateDeclarationPDF");
                  await generateDeclarationPDF(form as unknown as Record<string, unknown>, {
                    pvNumber,
                    declarantNom:         form.declarantNom,
                    declarantPrenom:      form.declarantPrenom,
                    declarantSpecialite:  form.declarantSpecialite,
                    declarantEmail:       form.declarantEmail,
                    declarantTel:         form.declarantTel,
                    declarantNumOrdre:    form.declarantNumOrdre,
                    declarantEtablissement: form.declarantEtablissement,
                    declarantVille:       form.declarantVille,
                  });
                }}
                className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                📄 Télécharger PDF de ma déclaration
              </button>
            )}
            <Link
              href="/dashboard/medecin/mes-declarations"
              className="w-full text-center bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Voir mes déclarations →
            </Link>
            <Link href="/dashboard/medecin" className="w-full text-center text-sm text-gray-500 hover:text-gray-700 underline py-2">
              Retour au tableau de bord
            </Link>
            <button
              onClick={() => { setForm(INITIAL); setStep(1); setSubmitted(false); setDraftRestored(false); localStorage.removeItem(DRAFT_KEY); }}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-500 underline"
            >
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

      {/* Bannière pré-remplissage depuis le suivi actif */}
      {prefilled && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-sm text-emerald-800">
          <span>🛰️ Formulaire pré-rempli depuis le suivi patient actif. Vérifiez et complétez les informations cliniques avant soumission.</span>
          <button
            onClick={() => setPrefilled(false)}
            className="text-xs text-emerald-600 hover:text-emerald-800 underline ml-4"
          >
            Compris
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
              onClick={() => { if (s.id < step) { setTriedNext(false); setStep(s.id); } }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${step === s.id ? "bg-emerald-600 text-white" : s.id < step ? "bg-emerald-100 text-emerald-700 cursor-pointer" : "text-gray-400 cursor-default"}`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Bannière déclarant (persistante, toutes sections) ── */}
        {form.declarantNom && (
          <div className="mb-4 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                {form.declarantPrenom?.[0]?.toUpperCase() ?? "D"}
              </div>
              <span className="text-gray-700">
                <span className="font-medium">Dr {form.declarantPrenom} {form.declarantNom}</span>
                {form.declarantSpecialite && <span className="text-gray-400"> · {form.declarantSpecialite}</span>}
              </span>
            </div>
            <Link href="/dashboard/medecin/profil" className="text-xs text-gray-400 hover:text-emerald-600 underline underline-offset-2">
              Modifier mon profil
            </Link>
          </div>
        )}

        {/* ── Section 1 : Patient ── */}
        {step === 1 && (
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
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-20"
                  />
                  {form.patientAge && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
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
                <Field label="Insuffisance rénale" hint="Stade KDIGO">
                  <Select
                    value={form.patientInsuffisanceRenaleStade}
                    onChange={(v) => set("patientInsuffisanceRenaleStade", v)}
                    options={STADES_RENALE}
                    placeholder="Aucune / Non évaluée"
                  />
                </Field>
                <Field label="Insuffisance hépatique" hint="Stade Child-Pugh">
                  <Select
                    value={form.patientInsuffisanceHepatiqueStade}
                    onChange={(v) => set("patientInsuffisanceHepatiqueStade", v)}
                    options={STADES_HEPATIQUE}
                    placeholder="Aucune / Non évaluée"
                  />
                </Field>
              </Grid>
            </Collapsible>
          </div>
        )}

        {/* ── Section 2 : Médicament suspect ── */}
        {step === 2 && (
          <div className="space-y-5">
            <SectionTitle
              title="Médicament(s) suspect(s)"
              subtitle="Médicament suspecté d'être responsable de l'effet indésirable."
            />

            {/* ── Recherche intelligente + bouton scan ── */}
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
                  onClick={() => setScanOpen(true)}
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
                    // Confiance haute → auto-split dans les deux champs
                    const doseStr = parsed.dose && parsed.unite ? `${parsed.dose} ${parsed.unite}` : parsed.dose;
                    set("medicamentPosologie", doseStr);
                    if (parsed.frequence) set("medicamentFrequence", parsed.frequence);
                  } else {
                    // Confiance faible → stocker brut dans posologie seulement
                    set("medicamentPosologie", raw);
                    set("medicamentFrequence", "");
                  }
                }}
                placeholder="Ex : 500 mg 2x/jour · 1g matin et soir · 175 mg/m² J1-J21"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "rgba(15,91,87,0.3)" } as React.CSSProperties}
              />
              {/* Feedback parser en temps réel */}
              {(() => {
                const raw = `${form.medicamentPosologie}${form.medicamentPosologie && form.medicamentFrequence ? " " : ""}${form.medicamentFrequence}`;
                const parsed = raw ? parsePostologie(raw) : null;
                if (!parsed) return null;
                const hasAll = parsed.dose && parsed.unite && parsed.frequence;
                return (
                  <div className={`flex items-center gap-2 flex-wrap text-xs px-3 py-2 rounded-lg border ${hasAll ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                    <span className="font-semibold">{hasAll ? "✅ Parsé :" : "⚙️ Détecté :"}</span>
                    {parsed.dose && <span className="px-2 py-0.5 rounded-full bg-white border border-gray-300 font-mono">{parsed.dose}</span>}
                    {parsed.unite && <span className="px-2 py-0.5 rounded-full bg-white border border-gray-300 font-mono">{parsed.unite}</span>}
                    {parsed.frequence && <span className="px-2 py-0.5 rounded-full bg-white border border-gray-300 font-mono">{parsed.frequence}</span>}
                    <span className="text-gray-400 ml-auto">
                      {Math.round(parsed.confidence * 100)}% confiance
                    </span>
                  </div>
                );
              })()}
              {/* Fallback : champs manuels si parser insuffisant */}
              {form.medicamentPosologie && !form.medicamentFrequence && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Field label="Fréquence" required>
                    <Select
                      value={form.medicamentFrequence}
                      onChange={(v) => set("medicamentFrequence", v)}
                      options={["1×/jour", "2×/jour", "3×/jour", "4×/jour", "1×/semaine", "1×/2 semaines", "1×/3 semaines", "Autre"]}
                      placeholder="Sélectionner"
                    />
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
            <CheckRow
              label="Traitement toujours en cours"
              checked={form.medicamentEnCours}
              onChange={() => set("medicamentEnCours", !form.medicamentEnCours)}
            />

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
        )}

        {/* ── Section 3 : Médicaments concomitants ── */}
        {step === 3 && (
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
                    {/* Alerte interaction inline — vérification synchrone sur la table locale */}
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
                            <a
                              href={`/interactions?drug1=${encodeURIComponent(form.medicamentDCI)}&drug2=${encodeURIComponent(m.nom)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 underline font-semibold"
                            >
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
                      <select
                        value={m.posologieUnite}
                        onChange={(e) => updateConcomitant(m.id, "posologieUnite", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        {["mg", "g", "µg", "mL", "UI", "mg/kg", "%", "autre"].map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <FieldLabel label="Fréquence" />
                      <select
                        value={m.posologieFrequence}
                        onChange={(e) => updateConcomitant(m.id, "posologieFrequence", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
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

        {/* ── Section 4 : Effet indésirable ── */}
        {step === 4 && (
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
                <Textarea
                  value={form.examensComplementaires}
                  onChange={(v) => set("examensComplementaires", v)}
                  placeholder="Ex : ALAT 3×N, créatinine 180 μmol/L, hyperkaliémie à 6,2 mmol/L..."
                  rows={3}
                />
              </Field>
            </Collapsible>
          </div>
        )}

        {/* ── Section 5 : Imputabilité ── */}
        {step === 5 && (
          <div className="space-y-5">
            <SectionTitle
              title="Imputabilité médicamenteuse"
              subtitle="Méthode française (BÉGAUD) — évaluation du lien de causalité entre le médicament et l'EIM."
            />

            {/* Accordéon avec badge Optionnel + pré-calcul */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {/* En-tête de l'accordéon */}
              <button
                type="button"
                onClick={() => setBegaudOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🔬</span>
                  <div className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">Questionnaire Bégaud</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Optionnel
                      </span>
                      {imputScore && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          ✅ Score I{imputScore.Iscore} enregistré
                        </span>
                      )}
                      {begaudInitial && !imputScore && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          ✦ Pré-rempli automatiquement
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {imputScore
                        ? `Imputabilité ${["I0 — Exclu", "I1 — Douteux", "I2 — Plausible", "I3 — Probable", "I4 — Très probable"][imputScore.Iscore]}`
                        : "Evaluez le lien de causalité médicament → EIM (recommandé pour cas sérieux)"}
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 text-lg">{begaudOpen ? "▲" : "▼"}</span>
              </button>

              {/* Suggestion auto-calcul (visible même accordéon fermé) */}
              {!begaudOpen && !imputScore && (() => {
                const suggestion = autoFillBegaud(form.medicamentDateDebut, form.eiDateDebut, form.eiEvolution);
                if (!suggestion) return null;
                const c1Label: Record<string, string> = {
                  tres_compatible: "Très compatible (0–7 j)",
                  compatible:      "Compatible (8–30 j)",
                  nr:              "Douteux (> 30 j)",
                  incompatible:    "Incompatible",
                };
                const c2Label: Record<string, string> = {
                  favorable: "Favorable",
                  inconnu:   "Inconnu / non évalué",
                };
                return (
                  <div className="mx-5 mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-700 mb-2">
                      ✦ Pré-calcul automatique disponible depuis les dates saisies
                    </p>
                    <div className="flex gap-4 text-xs text-blue-800 mb-3">
                      <span><strong>Chronologie C :</strong> {c1Label[suggestion.c1] ?? suggestion.c1}</span>
                      <span><strong>Évolution C2 :</strong> {c2Label[suggestion.c2] ?? suggestion.c2}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBegaudInitial(suggestion);
                        setBegaudOpen(true);
                      }}
                      className="text-xs font-semibold bg-blue-700 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      Ouvrir le questionnaire pré-rempli →
                    </button>
                  </div>
                );
              })()}

              {/* Corps de l'accordéon */}
              {begaudOpen && (
                <div className="border-t border-gray-100 px-5 pt-4 pb-5">
                  {/* Bouton pré-remplir si disponible et pas encore utilisé */}
                  {!begaudInitial && (() => {
                    const suggestion = autoFillBegaud(form.medicamentDateDebut, form.eiDateDebut, form.eiEvolution);
                    if (!suggestion) return null;
                    return (
                      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-blue-700">
                          ✦ Chronologie calculée depuis les dates — <strong>C1 suggéré</strong>
                        </p>
                        <button
                          type="button"
                          onClick={() => setBegaudInitial(suggestion)}
                          className="text-xs font-semibold text-blue-700 border border-blue-300 bg-white px-3 py-1 rounded-lg hover:bg-blue-50"
                        >
                          Appliquer la suggestion
                        </button>
                      </div>
                    );
                  })()}

                  <ImputabiliteBegaud
                    key={JSON.stringify(begaudInitial)}
                    onScoreChange={(score) => setImputScore(score)}
                    initialAnswers={begaudInitial}
                  />
                </div>
              )}
            </div>

            {/* Passer sans imputabilité */}
            {!imputScore && (
              <p className="text-xs text-center text-gray-400">
                L&apos;imputabilité est recommandée pour les cas sérieux mais n&apos;est pas obligatoire pour soumettre la déclaration.
              </p>
            )}
          </div>
        )}

        {/* ── Section 6 : Finalisation ── */}
        {step === 6 && (
          <div className="space-y-5">
            <SectionTitle title="Finalisation et envoi" subtitle="Vérifiez votre déclaration avant envoi." />

            {/* Récapitulatif */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2 text-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Récapitulatif</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Type de déclaration</p>
                  <TypeDeclarationInline value={form.typeDeclaration} onChange={(v) => set("typeDeclaration", v)} />
                </div>
                {delaiLegal && (
                  <div className={`rounded-lg p-3 ${isFatal ? "bg-red-100" : "bg-amber-50"}`}>
                    <p className="text-gray-500 mb-1">Délai légal de notification</p>
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
                <div className={`rounded-lg p-3 ${form.eiMeddraTerm ? "bg-emerald-50" : "bg-red-50"}`}>
                  <p className="text-gray-500 mb-1">Effet déclaré</p>
                  <p className="font-medium text-gray-800 text-xs">
                    {form.eiMeddraTerm || <span className="text-red-500">⚠️ Non renseigné</span>}
                    {form.eiMeddraCode && <span className="ml-1 text-gray-400 font-mono">#{form.eiMeddraCode}</span>}
                  </p>
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
                  ⚡ <strong>EIM {isFatal ? "fatal / pronostic vital engagé" : "sérieux"}</strong> — Délai réglementaire de transmission de la déclaration : <strong>{delaiLegal} jours calendaires</strong>.
                </div>
              )}
            </div>

            {/* Upload documents — drag & drop */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-800">Documents joints</label>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                  ✦ Extraction IA — à venir
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Ordonnance, résultats biologiques, imagerie, courrier de sortie. L&apos;IA extraira automatiquement les données pertinentes dans une prochaine version.</p>
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const files = Array.from(e.dataTransfer.files).filter(f => /\.(pdf|jpe?g|png)$/i.test(f.name));
                  if (files.length) { setUploadedFiles(prev => [...prev, ...files]); set("documents", true); }
                }}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${dragOver ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"}`}
              >
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                <p className="text-sm text-gray-500 font-medium">Glissez vos fichiers ici ou <span className="text-emerald-600 underline">cliquez pour sélectionner</span></p>
                <p className="text-xs text-gray-400">PDF, JPG, PNG — max 10 Mo par fichier</p>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length) { setUploadedFiles(prev => [...prev, ...files]); set("documents", true); }
                }} />
              </label>

              {/* Liste des fichiers uploadés */}
              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                      <span className="text-base">{f.name.endsWith(".pdf") ? "📄" : "🖼️"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{f.name}</p>
                        <p className="text-[10px] text-gray-400">{(f.size / 1024).toFixed(0)} Ko</p>
                      </div>
                      <span className="text-[10px] bg-violet-100 text-violet-700 font-semibold px-1.5 py-0.5 rounded shrink-0">IA prête</span>
                      <button type="button" onClick={() => { setUploadedFiles(prev => prev.filter((_, j) => j !== i)); if (uploadedFiles.length <= 1) set("documents", false); }}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Field label="Commentaires libres">
              <Textarea
                value={form.commentaires}
                onChange={(v) => set("commentaires", v)}
                placeholder="Toute information complémentaire jugée pertinente..."
                rows={3}
              />
            </Field>

            {/* Notifications */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                <span className="text-base">🔔</span>
                <span className="text-sm font-medium text-gray-700">Notifications</span>
              </div>
              <div className="px-4 py-4 space-y-4">
                {/* Case accusé de réception */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="accent-emerald-600 mt-0.5 shrink-0"
                    checked={form.notifAccuseReception}
                    onChange={(e) => set("notifAccuseReception", e.target.checked)}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">
                      Accusé de réception par e-mail
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Confirmation immédiate dès l&apos;envoi de la déclaration</p>
                  </div>
                </label>
                {/* Case suivi de statut */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="accent-emerald-600 mt-0.5 shrink-0"
                    checked={form.notifSuiviStatut}
                    onChange={(e) => set("notifSuiviStatut", e.target.checked)}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">
                      Suivi du statut de la déclaration
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Notification quand votre déclaration est prise en charge ou traitée</p>
                  </div>
                </label>
                {/* Adresse e-mail cible */}
                {(form.notifAccuseReception || form.notifSuiviStatut) && (
                  <div className="pt-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Adresse e-mail</label>
                    <input
                      type="email"
                      value={form.notifEmail}
                      onChange={(e) => set("notifEmail", e.target.value)}
                      placeholder="votre@email.ma"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    {form.notifEmail && (
                      <p className="text-xs text-emerald-600 mt-1">✓ Notifications envoyées à {form.notifEmail}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Consentement */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.consentement ? "border-emerald-500 bg-emerald-50" : "border-gray-300"}`}>
              <input type="checkbox" className="accent-emerald-600 mt-1" checked={form.consentement} onChange={(e) => set("consentement", e.target.checked)} />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Je certifie l&apos;exactitude des informations déclarées et consens à leur traitement anonymisé conforme à la loi 09-08. <span className="text-red-500">*</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">Conformément à l&apos;article 18 de la loi 17-04 relative au Code du médicament et de la pharmacie.</p>
              </div>
            </label>

            {champsManquants.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ Informations manquantes avant envoi :</p>
                <ul className="flex flex-col gap-1">
                  {champsManquants.map((c) => (
                    <li key={c} className="text-xs text-amber-700 flex items-start gap-2">
                      <span className="mt-0.5">•</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
              disabled={!form.consentement || champsManquants.length > 0}
              className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all ${form.consentement && champsManquants.length === 0 ? "bg-emerald-600 hover:bg-emerald-700 shadow-md" : "bg-gray-300 cursor-not-allowed"}`}
            >
              {isFatal ? "🚨 Envoyer — Urgence 7 jours →" : isSerieux ? "⚡ Envoyer la déclaration sérieuse →" : "Envoyer la déclaration →"}
            </button>
          </div>
        )}

        {/* Navigation */}
        {(() => {
          const stepErrs = sectionErrors(step, form);
          const hasErrs = stepErrs.length > 0;
          return (
            <div className="mt-10 pt-6 border-t border-gray-200 space-y-3">
              {/* Erreurs inline — visibles uniquement après tentative de passage */}
              {triedNext && hasErrs && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex gap-3">
                  <span className="text-red-500 text-lg shrink-0">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">
                      Champs obligatoires manquants :
                    </p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {stepErrs.map((e) => (
                        <li key={e} className="text-sm text-red-600">
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setTriedNext(false);
                    setStep((s) => Math.max(1, s - 1));
                  }}
                  disabled={step === 1}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Précédent
                </button>
                {step < SECTIONS.length && (
                  <button
                    onClick={() => {
                      setTriedNext(true);
                      if (sectionErrors(step, form).length === 0) {
                        setTriedNext(false);
                        setStep((s) => Math.min(SECTIONS.length, s + 1));
                      }
                    }}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      triedNext && hasErrs
                        ? "bg-red-100 text-red-700 border border-red-300 cursor-not-allowed"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    Suivant →
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </main>

      {/* ── Modal scan de boîte ── */}
      {scanOpen && (
        <ScanBoite
          onClose={() => setScanOpen(false)}
          onScanned={(data: ScannedData) => {
            // Pré-remplir les champs médicament depuis le scan
            if (data.nomCommercial) set("medicamentNomCommercial", data.nomCommercial);
            if (data.dci)           set("medicamentDCI", data.dci);
            if (data.lot)           set("medicamentLot", data.lot);
            if (data.expiryDate) {
              // expiryDate = YYYY-MM-DD → champ type="month" attend YYYY-MM
              set("medicamentPeremption", data.expiryDate.substring(0, 7));
            }
          }}
        />
      )}
    </div>
  );
}
