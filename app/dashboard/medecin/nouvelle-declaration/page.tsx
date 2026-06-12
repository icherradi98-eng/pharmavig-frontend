"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ImputabiliteBegaud, { ImputScore } from "./ImputabiliteBegaud";
import { readProfile } from "@/lib/ordonnancier";
import { autocomplete, fetchAnsm, fetchFdaLabel, type Suggestion } from "@/lib/drugApi";

const DRAFT_KEY = "pharmavig_medecin_draft";
const PREFILL_KEY = "pharmavig_prefill_declaration";

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
  notifSuiviStatut: boolean;       // email quand le CAPM change le statut
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
  medicamentsConcomitants: [],
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

// ── Mapping BDPM / FDA → valeurs de nos selects ───────────────────────────────

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

    // 2. FDA — complément si BDPM insuffisant
    if (!enrichment.voie || !enrichment.forme || !enrichment.laboratoire) {
      try {
        const fda = await fetchFdaLabel(s.dci);
        if (fda) {
          if (!enrichment.voie && fda.route?.[0]) enrichment.voie = mapVoie(fda.route[0]);
          if (!enrichment.forme && fda.route?.[0]) {
            // OpenFDA stocke voie mais pas forme — on garde forme vide plutôt qu'incorrecte
          }
          if (!enrichment.laboratoire && fda.manufacturer_name?.[0]) {
            enrichment.laboratoire = fda.manufacturer_name[0];
          }
          if (!enrichment.nomCommercial && fda.brand_name?.[0]) {
            enrichment.nomCommercial = fda.brand_name[0];
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

// ─── MedDRA ───────────────────────────────────────────────────────────────────

type MedDRATerm = { pt: string; code: string; soc: string };

const MEDDRA_TERMS: MedDRATerm[] = [
  // Gastro-intestinal
  { pt: "Nausées", code: "10028813", soc: "Gastro-intestinal" },
  { pt: "Vomissements", code: "10047700", soc: "Gastro-intestinal" },
  { pt: "Diarrhée", code: "10012735", soc: "Gastro-intestinal" },
  { pt: "Douleur abdominale", code: "10000081", soc: "Gastro-intestinal" },
  { pt: "Constipation", code: "10010774", soc: "Gastro-intestinal" },
  { pt: "Hémorragie gastro-intestinale", code: "10017955", soc: "Gastro-intestinal" },
  { pt: "Colite", code: "10009887", soc: "Gastro-intestinal" },
  // Peau
  { pt: "Éruption cutanée", code: "10037844", soc: "Peau et tissu sous-cutané" },
  { pt: "Urticaire", code: "10046735", soc: "Peau et tissu sous-cutané" },
  { pt: "Prurit", code: "10037087", soc: "Peau et tissu sous-cutané" },
  { pt: "Angio-œdème", code: "10002424", soc: "Peau et tissu sous-cutané" },
  { pt: "Syndrome de Stevens-Johnson", code: "10042033", soc: "Peau et tissu sous-cutané" },
  { pt: "Nécrolyse épidermique toxique", code: "10028506", soc: "Peau et tissu sous-cutané" },
  { pt: "Alopécie", code: "10001760", soc: "Peau et tissu sous-cutané" },
  { pt: "Photosensibilité", code: "10034976", soc: "Peau et tissu sous-cutané" },
  // Système nerveux
  { pt: "Céphalées", code: "10019211", soc: "Système nerveux" },
  { pt: "Vertiges", code: "10047340", soc: "Système nerveux" },
  { pt: "Somnolence", code: "10041349", soc: "Système nerveux" },
  { pt: "Convulsions", code: "10010952", soc: "Système nerveux" },
  { pt: "Neuropathie périphérique", code: "10029331", soc: "Système nerveux" },
  { pt: "Accident vasculaire cérébral", code: "10008190", soc: "Système nerveux" },
  { pt: "Tremblements", code: "10044565", soc: "Système nerveux" },
  { pt: "Insomnie", code: "10022437", soc: "Psychiatrie" },
  { pt: "Confusion mentale", code: "10010300", soc: "Psychiatrie" },
  { pt: "Hallucinations", code: "10019063", soc: "Psychiatrie" },
  // Cardiaque
  { pt: "Palpitations", code: "10033557", soc: "Cardiac disorders" },
  { pt: "Allongement QT", code: "10053698", soc: "Cardiac disorders" },
  { pt: "Bradycardie", code: "10006093", soc: "Cardiac disorders" },
  { pt: "Tachycardie", code: "10043071", soc: "Cardiac disorders" },
  { pt: "Fibrillation auriculaire", code: "10016281", soc: "Cardiac disorders" },
  { pt: "Infarctus du myocarde", code: "10027433", soc: "Cardiac disorders" },
  // Hépatique
  { pt: "Hépatotoxicité", code: "10019851", soc: "Hépatobiliaire" },
  { pt: "Cytolyse hépatique", code: "10061218", soc: "Hépatobiliaire" },
  { pt: "Ictère", code: "10023126", soc: "Hépatobiliaire" },
  { pt: "Insuffisance hépatique", code: "10019670", soc: "Hépatobiliaire" },
  // Rénal
  { pt: "Insuffisance rénale aiguë", code: "10069339", soc: "Rénal et urinaire" },
  { pt: "Néphrotoxicité", code: "10029155", soc: "Rénal et urinaire" },
  { pt: "Protéinurie", code: "10037032", soc: "Rénal et urinaire" },
  // Allergique / immuno
  { pt: "Anaphylaxie", code: "10002198", soc: "Système immunitaire" },
  { pt: "Hypersensibilité", code: "10020751", soc: "Système immunitaire" },
  { pt: "Réaction anaphylactoïde", code: "10002216", soc: "Système immunitaire" },
  // Hématologique
  { pt: "Thrombocytopénie", code: "10043554", soc: "Sang et lymphe" },
  { pt: "Neutropénie", code: "10029354", soc: "Sang et lymphe" },
  { pt: "Anémie", code: "10002272", soc: "Sang et lymphe" },
  { pt: "Agranulocytose", code: "10001561", soc: "Sang et lymphe" },
  { pt: "Leucopénie", code: "10024384", soc: "Sang et lymphe" },
  // Respiratoire
  { pt: "Dyspnée", code: "10013968", soc: "Respiratoire" },
  { pt: "Bronchospasme", code: "10006482", soc: "Respiratoire" },
  { pt: "Toux", code: "10011224", soc: "Respiratoire" },
  { pt: "Pneumopathie interstitielle", code: "10035742", soc: "Respiratoire" },
  // Métabolique
  { pt: "Hypoglycémie", code: "10020993", soc: "Métabolisme et nutrition" },
  { pt: "Hyperkaliémie", code: "10020951", soc: "Métabolisme et nutrition" },
  { pt: "Hyponatrémie", code: "10021036", soc: "Métabolisme et nutrition" },
  { pt: "Rhabdomyolyse", code: "10039020", soc: "Musculosquelettique" },
  { pt: "Myopathie", code: "10028597", soc: "Musculosquelettique" },
];

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
        <p className="text-xs text-amber-600 mt-1">⚠️ Terme non codé — sera codé par le CAPM à réception.</p>
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
    return JSON.parse(saved) as Partial<FormData>;
  } catch {
    return null;
  }
}

// Profil déclarant considéré complet si nom + spécialité + email sont présents
function isDeclarantComplete(f: FormData): boolean {
  return !!(f.declarantNom && f.declarantPrenom && f.declarantSpecialite && f.declarantEmail);
}

/** Retourne la liste des champs manquants pour l'étape donnée */
function sectionErrors(step: number, f: FormData): string[] {
  const errs: string[] = [];
  if (step === 1) {
    if (!f.declarantNom) errs.push("Nom");
    if (!f.declarantPrenom) errs.push("Prénom");
    if (!f.declarantSpecialite) errs.push("Spécialité");
    if (!f.declarantEmail) errs.push("E-mail professionnel");
  }
  if (step === 2) {
    if (!f.patientAge) errs.push("Âge du patient");
    if (!f.patientSexe) errs.push("Sexe du patient");
  }
  if (step === 3) {
    if (!f.medicamentDCI) errs.push("DCI du médicament");
    if (!f.medicamentForme) errs.push("Forme pharmaceutique");
    if (!f.medicamentVoie) errs.push("Voie d'administration");
    if (!f.medicamentPosologie) errs.push("Posologie");
    if (!f.medicamentFrequence) errs.push("Fréquence");
    if (!f.medicamentIndication) errs.push("Indication");
    if (!f.medicamentDateDebut) errs.push("Date de début du traitement");
  }
  if (step === 5) {
    if (!f.eiMeddraTerm) errs.push("Effet observé");
    if (!f.eiDescription) errs.push("Description de l'effet indésirable");
    if (!f.eiDateDebut) errs.push("Date de début de l'effet");
    const hasGravite =
      f.graviteHospitalisation ||
      f.graviteVieDanger ||
      f.graviteIncapacite ||
      f.graviteDeces ||
      f.graviteAnomalieCongenitale ||
      f.graviteMedicalementSignificatif;
    if (!hasGravite) errs.push("Gravité de l'effet (au moins une case)");
  }
  return errs;
}

export default function FormulaireMedecin() {
  const { user } = useAuth();
  const [draft] = useState<{ form: FormData; step: number } | null>(() => readDraft());
  const [prefill] = useState<Partial<FormData> | null>(() => (draft ? null : readPrefill()));
  const [step, setStep] = useState(draft?.step ?? 1);
  const [form, setForm] = useState<FormData>(draft?.form ?? (prefill ? { ...INITIAL, ...prefill } : INITIAL));
  // Mode édition de la card déclarant en Section 1
  const [declarantEditMode, setDeclarantEditMode] = useState(false);

  // Pré-remplir les infos déclarant depuis user + localStorage dès que user est disponible
  // — seulement si on n'a pas restauré un brouillon (qui contient déjà ces infos)
  // Si le profil est complet après pré-remplissage, avancer automatiquement à la Section 2
  const declarantPrefilled = useRef(false);
  useEffect(() => {
    if (declarantPrefilled.current) return;
    if (!user) return;
    if (draft) return; // brouillon existant → on ne touche pas
    declarantPrefilled.current = true;
    const overrides = buildDeclarantOverrides(user);
    setForm((prev) => {
      const next = { ...prev, ...overrides };
      // Skip automatique Section 1 → 2 si profil complet
      if (isDeclarantComplete(next) && step === 1) {
        setStep(2);
      }
      return next;
    });
  }, [user, draft, step]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [nextConcoId, setNextConcoId] = useState(1);
  const [imputScore, setImputScore] = useState<ImputScore | null>(null);
  const [pvNumber, setPvNumber] = useState("");
  const [draftRestored, setDraftRestored] = useState(() => draft !== null);
  const [prefilled, setPrefilled] = useState(() => prefill !== null);
  const [triedNext, setTriedNext] = useState(false); // affiche les erreurs inline seulement après tentative
  const [anneeNaissance, setAnneeNaissance] = useState(""); // champ UI uniquement, pas stocké dans form
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
    !form.medicamentDCI && "Médicament suspect — DCI (Section 3)",
    !form.eiMeddraTerm && "Effet observé (Section 5)",
    !form.eiDescription && "Description clinique de l'effet indésirable (Section 5)",
    !isSerieux && !form.graviteNonSerieux && "Critère de gravité — cochez au moins une case (Section 5)",
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
            <h1 className="text-xl font-bold text-gray-900 mb-1">Déclaration transmise au CAPM</h1>
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
                    ? "Cas fatal ou mettant en jeu le pronostic vital — délai de notification CAPM : 7 jours."
                    : "Traitement prioritaire — délai de notification CAPM : 15 jours."}
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
                  <p className="text-sm font-medium text-gray-800">Analyse CAPM</p>
                  <p className="text-xs text-gray-500">
                    Le CAPM analysera cette déclaration.{" "}
                    {delaiLegal ? `Délai réglementaire : ${delaiLegal} jours.` : "Délai habituel : 30 jours."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-base mt-0.5">📄</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">PDF CIOMS disponible</p>
                  <p className="text-xs text-gray-500">Téléchargez le formulaire CIOMS complet depuis "Mes déclarations".</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-base mt-0.5">📊</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">Suivi du statut</p>
                  <p className="text-xs text-gray-500">Consultez l&apos;évolution de votre déclaration dans "Mes déclarations".</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
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

        {/* ── Section 1 : Déclarant ── */}
        {step === 1 && (
          <div className="space-y-5">
            <SectionTitle
              title="Informations sur le déclarant"
              subtitle="Ces informations permettent au CAPM de vous recontacter si nécessaire. Elles restent confidentielles."
            />

            {/* ── Card récapitulative si profil complet et pas en mode édition ── */}
            {isDeclarantComplete(form) && !declarantEditMode ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {form.declarantPrenom?.[0]?.toUpperCase() ?? "M"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dr {form.declarantPrenom} {form.declarantNom}</p>
                    <p className="text-sm text-gray-500">{form.declarantSpecialite}{form.declarantEtablissement ? ` · ${form.declarantEtablissement}` : ""}{form.declarantVille ? ` · ${form.declarantVille}` : ""}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{form.declarantEmail}{form.declarantNumOrdre ? ` · ${form.declarantNumOrdre}` : ""}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeclarantEditMode(true)}
                  className="shrink-0 text-sm text-emerald-600 hover:text-emerald-800 border border-emerald-200 hover:border-emerald-400 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Modifier ✎
                </button>
              </div>
            ) : (
              /* ── Formulaire complet (profil incomplet ou mode édition) ── */
              <div className="space-y-5">
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
                {declarantEditMode && (
                  <button
                    onClick={() => setDeclarantEditMode(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    ← Annuler les modifications
                  </button>
                )}
              </div>
            )}

            {/* Type de déclaration — replié par défaut (95% = spontanée) */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Type de déclaration</p>
              <RadioGroup
                value={form.typeDeclaration || "spontanee"}
                onChange={(v) => set("typeDeclaration", v)}
                options={[
                  { val: "spontanee", label: "Déclaration spontanée", desc: "Observation directe en pratique courante (95% des cas)" },
                  { val: "observationnelle", label: "Étude observationnelle", desc: "Données issues d'une étude ou d'un registre" },
                  { val: "litterature", label: "Rapport de littérature", desc: "Cas publié dans une revue médicale" },
                ]}
              />
            </div>
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

        {/* ── Section 3 : Médicament suspect ── */}
        {step === 3 && (
          <div className="space-y-5">
            <SectionTitle
              title="Médicament(s) suspect(s)"
              subtitle="Médicament suspecté d'être responsable de l'effet indésirable."
            />

            {/* ── Recherche intelligente ── */}
            <Field label="Recherche rapide" hint="DCI ou nom commercial — pré-remplit automatiquement voie, forme et laboratoire">
              <MedicamentSearch
                onSelect={(e) => {
                  set("medicamentDCI", e.dci);
                  if (e.nomCommercial) set("medicamentNomCommercial", e.nomCommercial);
                  if (e.voie) set("medicamentVoie", e.voie);
                  if (e.forme) set("medicamentForme", e.forme);
                  if (e.laboratoire) set("medicamentLaboratoire", e.laboratoire);
                }}
              />
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
            <Grid>
              <Field label="Posologie" required hint="Dose par prise">
                <Input value={form.medicamentPosologie} onChange={(v) => set("medicamentPosologie", v)} placeholder="Ex : 500 mg, 1 g, 240 mg..." />
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
                      Suivi de traitement par le CAPM
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
                  Je certifie l&apos;exactitude des informations déclarées et consens à leur transmission anonymisée au Centre Anti-Poison et de Pharmacovigilance du Maroc (CAPM). <span className="text-red-500">*</span>
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
              {isFatal ? "🚨 Envoyer — Urgence 7 jours →" : isSerieux ? "⚡ Envoyer la déclaration sérieuse au CAPM →" : "Envoyer la déclaration au CAPM →"}
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
    </div>
  );
}
