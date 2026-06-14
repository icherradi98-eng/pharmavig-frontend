"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type FormData = {
  age: string; sexe: string; region: string; regionAuto: boolean;
  medicamentNom: string; medicamentLot: string; medicamentPeremption: string;
  medicamentLabo: string; medicamentDateDebut: string;
  indication: string; duree: string; prescripteur: string;
  symptomes: string[]; aucunSymptome: boolean;
  description: string; delaiApparition: string;
  gravite: string; arretMedicament: string; ameliorationApresArret: string; problemePersiste: string;
  autresMedicaments: string; autresMedicamentsDetail: string;
  maladiesChroniquesOuiNon: string; maladiesChroniques: string[];
  grossesse: string; reactionPassee: string; reactionPasseeDetail: string;
  contact: string; contactEmail: string; contactTel: string;
  signaleAuMedecin: string; documents: boolean; consentement: boolean;
};

const DRAFT_KEY = "pharmavig_patient_draft";

const INITIAL: FormData = {
  age: "", sexe: "", region: "", regionAuto: false,
  medicamentNom: "", medicamentLot: "", medicamentPeremption: "",
  medicamentLabo: "", medicamentDateDebut: "",
  indication: "", duree: "", prescripteur: "",
  symptomes: [], aucunSymptome: false,
  description: "", delaiApparition: "",
  gravite: "", arretMedicament: "", ameliorationApresArret: "", problemePersiste: "",
  autresMedicaments: "", autresMedicamentsDetail: "",
  maladiesChroniquesOuiNon: "", maladiesChroniques: [],
  grossesse: "", reactionPassee: "", reactionPasseeDetail: "",
  contact: "", contactEmail: "", contactTel: "",
  signaleAuMedecin: "", documents: false, consentement: false,
};

const SECTIONS = [
  { id: 1, label: "Vous",               labelDarija: "أنت" },
  { id: 2, label: "Médicament",         labelDarija: "الدوا" },
  { id: 3, label: "Ce qui s'est passé", labelDarija: "أشمن مشكل" },
  { id: 4, label: "Gravité",            labelDarija: "الخطورة" },
  { id: 5, label: "Contexte médical",   labelDarija: "الحال الطبي" },
  { id: 6, label: "Finalisation",       labelDarija: "آخر خطوة" },
];

const REGIONS = [
  "Casablanca-Settat", "Rabat-Salé-Kénitra", "Marrakech-Safi", "Fès-Meknès",
  "Tanger-Tétouan-Al Hoceïma", "Souss-Massa", "Oriental", "Béni Mellal-Khénifra",
  "Drâa-Tafilalet", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab",
];

const CITY_TO_REGION: Record<string, string> = {
  casablanca: "Casablanca-Settat", mohammedia: "Casablanca-Settat", settat: "Casablanca-Settat",
  rabat: "Rabat-Salé-Kénitra", "salé": "Rabat-Salé-Kénitra", kenitra: "Rabat-Salé-Kénitra",
  marrakech: "Marrakech-Safi", safi: "Marrakech-Safi", essaouira: "Marrakech-Safi",
  fez: "Fès-Meknès", meknes: "Fès-Meknès",
  tanger: "Tanger-Tétouan-Al Hoceïma", tetouan: "Tanger-Tétouan-Al Hoceïma",
  agadir: "Souss-Massa", tiznit: "Souss-Massa",
  oujda: "Oriental", nador: "Oriental",
  errachidia: "Drâa-Tafilalet", ouarzazate: "Drâa-Tafilalet",
  guelmim: "Guelmim-Oued Noun",
  laayoune: "Laâyoune-Sakia El Hamra",
  dakhla: "Dakhla-Oued Ed-Dahab",
};

const AGE_RANGES = [
  { val: "<18",   fr: "< 18 ans",    dar: "دون 18 عام" },
  { val: "18-29", fr: "18 – 29 ans", dar: "18 – 29 عام" },
  { val: "30-39", fr: "30 – 39 ans", dar: "30 – 39 عام" },
  { val: "40-49", fr: "40 – 49 ans", dar: "40 – 49 عام" },
  { val: "50-59", fr: "50 – 59 ans", dar: "50 – 59 عام" },
  { val: "60-69", fr: "60 – 69 ans", dar: "60 – 69 عام" },
  { val: "70-79", fr: "70 – 79 ans", dar: "70 – 79 عام" },
  { val: ">79",   fr: "> 79 ans",    dar: "فوق 79 عام" },
  { val: "nr",    fr: "Non précisé", dar: "ما بغيتش نجاوب" },
];

// ── #13 : clés internes propres séparées des libellés bilingues ──────────────
const SYMPTOMES_CATEGORIES: { cat: string; items: { key: string; label: string }[] }[] = [
  { cat: "🩺 Peau / جلد", items: [
    { key: "boutons",         label: "Boutons / حبوب" },
    { key: "rougeurs",        label: "Rougeurs / حمرة" },
    { key: "demangeaisons",   label: "Démangeaisons / شكيوة" },
    { key: "gonflement_peau", label: "Gonflement / توورم" },
    { key: "desquamation",    label: "Peau qui pèle / تسلاخ" },
  ]},
  { cat: "🤢 Digestion / كرش", items: [
    { key: "nausees",         label: "Nausées / تقيان" },
    { key: "vomissements",    label: "Vomissements / توقية" },
    { key: "diarrhee",        label: "Diarrhée / خروج" },
    { key: "douleur_ventre",  label: "Douleurs ventre / وجع فكرش" },
    { key: "perte_appetit",   label: "Perte appétit / ما عندوش شهية" },
  ]},
  { cat: "🧠 Tête / راس", items: [
    { key: "cephalees",       label: "Mal de tête / وجع راس" },
    { key: "vertiges",        label: "Vertiges / دواخة" },
    { key: "vision_trouble",  label: "Vision trouble / ضلعة فعينين" },
    { key: "confusion",       label: "Confusion / خلطيطة" },
    { key: "somnolence",      label: "Somnolence / نعاس بزاف" },
  ]},
  { cat: "🫀 Cœur / قلب", items: [
    { key: "palpitations",    label: "Palpitations / تخبيطة" },
    { key: "dyspnee",         label: "Essoufflement / ما كينفسش" },
    { key: "douleur_thorax",  label: "Douleur poitrine / وجع صدر" },
    { key: "oedeme_membres",  label: "Jambes gonflées / رجلين توورمت" },
    { key: "asthenie",        label: "Fatigue intense / عيا بزاف" },
  ]},
  { cat: "💊 Général / عام", items: [
    { key: "fievre",          label: "Fièvre / سخانة" },
    { key: "frissons",        label: "Frissons / برودة" },
    { key: "sueurs",          label: "Sueurs / عرق" },
    { key: "perte_poids",     label: "Perte de poids / نقص فالوزن" },
    { key: "myalgies",        label: "Douleurs musculaires / وجع فالعظام" },
    { key: "reaction_allergique", label: "Réaction allergique / حساسية" },
  ]},
];

// Map key → label (pour l'affichage dans la liste des symptômes sélectionnés)
const SYMPTOME_LABEL: Record<string, string> = Object.fromEntries(
  SYMPTOMES_CATEGORIES.flatMap((c) => c.items.map((i) => [i.key, i.label]))
);

const INDICATION_SUGGESTIONS = [
  "Hypertension / ضغط الدم", "Diabète / السكر", "Douleur / وجع",
  "Infection / عدوى", "Cancer / السرطان", "Maladie cardiaque / القلب",
  "Asthme / الربو", "Problème digestif / الكرش", "Allergie / حساسية",
  "Dépression / الاكتئاب", "Anxiété / القلق", "Douleur articulaire / وجع المفاصل",
  "Fièvre / سخانة", "Toux / الكحة", "Maladie rénale / الكلوة",
  "Thyroïde / الغدة", "Épilepsie / الصرع", "Anémie / فقر الدم",
  "Grossesse / حمل", "Contraception / تحديد النسل", "Cholestérol / الكوليسترول",
  "Ostéoporose / هشاشة العظام", "Migraine / الصداع", "Insomnie / الأرق",
  "Ménopause / سن اليأس", "Prostate / البروستات", "Glaucome / المياه الزرقاء",
];

// ── #15 : mots-clés détectant une gravité potentiellement sous-estimée ────────
const GRAVITE_KEYWORDS = [
  "hospit", "urgence", "urgences", "réanimation", "reanimation",
  "icu", "coma", "inconscient", "mort", "décès", "deces",
  "ambulance", "samu", "mourir", "failli mourir", "failli",
  "sbitar", "سبيطار", "أورجونس", "الموت",
];

function detectGraviteKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return GRAVITE_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── #12 : conversion durée → format lisible backend ──────────────────────────
function dureeToDays(d: string): number | undefined {
  if (d === "<1sem")   return 3;
  if (d === "1-4sem")  return 14;
  if (d === "1-6mois") return 90;
  if (d === ">6mois")  return 180;
  return undefined;
}

// ─── Validation par section ───────────────────────────────────────────────────

function sectionErrors(step: number, f: FormData): string[] {
  const errs: string[] = [];
  if (step === 1) {
    if (!f.age)  errs.push("Votre tranche d'âge");
    if (!f.sexe) errs.push("Votre sexe");
  }
  if (step === 2) {
    if (!f.medicamentNom) errs.push("Nom du médicament");
    if (!f.indication)    errs.push("Raison de la prise");
    if (!f.duree)         errs.push("Durée de traitement");
    if (!f.prescripteur)  errs.push("Qui a prescrit le médicament");
  }
  if (step === 3) {
    if (!f.description)     errs.push("Description de ce qui s'est passé");
    if (!f.delaiApparition) errs.push("Délai d'apparition");
  }
  if (step === 4) {
    if (!f.gravite)          errs.push("Gravité de l'effet");
    if (!f.arretMedicament)  errs.push("Avez-vous arrêté le médicament ?");
    if (!f.problemePersiste) errs.push("Le problème persiste-t-il ?");
  }
  return errs;
}

// ─── Helper components ────────────────────────────────────────────────────────

function Label({ fr, dar, required }: { fr: string; dar: string; required?: boolean }) {
  return (
    <div className="mb-2">
      <span className="font-medium text-gray-900 text-sm">{fr}{required && <span className="text-red-500 ml-1">★</span>}</span>
      <div className="text-xs text-petrol mt-0.5" dir="rtl">{dar}</div>
    </div>
  );
}

function RadioGroup({ options, value, onChange }: {
  options: { val: string; fr: string; dar: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => (
        <label key={o.val} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${value === o.val ? "border-petrol bg-petrol/5" : "border-gray-200 hover:border-gray-300"}`}>
          <input type="radio" className="accent-emerald-600" checked={value === o.val} onChange={() => onChange(o.val)} />
          <div>
            <div className="text-sm text-gray-800">{o.fr}</div>
            <div className="text-xs text-gray-500" dir="rtl">{o.dar}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

function CheckboxItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${checked ? "border-petrol/40 bg-petrol/5 text-petrol" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>
      <input type="checkbox" className="accent-emerald-600" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function InfoBox({ text, textDar }: { text: string; textDar?: string }) {
  return (
    <div className="bg-petrol/5 border border-petrol/10 rounded-xl p-3 mb-4 text-xs text-petrol">
      <p>💡 {text}</p>
      {textDar && <p className="mt-1 text-petrol" dir="rtl">🇲🇦 {textDar}</p>}
    </div>
  );
}

function Collapsible({ label, labelDar, children }: {
  label: string; labelDar?: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {labelDar && <span className="text-xs text-gray-400 mr-2" dir="rtl"> — {labelDar}</span>}
        </div>
        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 py-4 space-y-4 bg-white">{children}</div>}
    </div>
  );
}

function AgePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {AGE_RANGES.map((r) => (
          <button key={r.val} type="button" onClick={() => onChange(r.val)}
            className={`snap-center shrink-0 flex flex-col items-center justify-center px-5 py-4 rounded-2xl border-2 transition-all min-w-[120px] ${
              value === r.val
                ? "border-petrol bg-petrol/5 shadow-md scale-105"
                : "border-gray-200 bg-white text-gray-600 hover:border-petrol/30"
            }`}>
            <span className={`text-base font-bold ${value === r.val ? "text-petrol" : "text-gray-700"}`}>{r.fr}</span>
            <span className="text-xs mt-1 text-gray-400" dir="rtl">{r.dar}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center mt-1">← Faites défiler / سحب لليمين أو اليسار →</p>
      {value && value !== "nr" && (
        <div className="mt-2 text-center">
          <span className="inline-block bg-petrol/10 text-petrol text-sm font-semibold px-4 py-1.5 rounded-full">
            ✓ {AGE_RANGES.find((r) => r.val === value)?.fr}
          </span>
        </div>
      )}
    </div>
  );
}

// ── #11 fix : onChange via ref pour éviter recréation de useCallback ──────────
function IndicationSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const search = useCallback((q: string) => {
    onChangeRef.current(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => {
      const ql = q.toLowerCase();
      const matches = INDICATION_SUGGESTIONS.filter((s) => s.toLowerCase().includes(ql)).slice(0, 5);
      setSuggestions(matches);
      setOpen(matches.length > 0);
    }, 200);
  }, []); // stable — onChange via ref

  return (
    <div className="relative">
      <input type="text" value={value} onChange={(e) => search(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Ex : tension, infection, douleur... / وصّف علاش كتاخود الدوا"
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-petrol"
      />
      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button key={s} type="button" onMouseDown={() => { onChangeRef.current(s); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-petrol/5 hover:text-petrol transition-colors border-b border-gray-50 last:border-0">
              {s}
            </button>
          ))}
          <p className="px-4 py-2 text-xs text-gray-400 bg-gray-50">💡 Suggestion automatique — vous pouvez écrire librement</p>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FormulairePatient() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) { try { return { ...INITIAL, ...JSON.parse(saved) }; } catch { /* ignore */ } }
    }
    return INITIAL;
  });
  const [submitted, setSubmitted]     = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reportRef, setReportRef]     = useState<string>("");
  const [geoLoading, setGeoLoading]   = useState(false);
  const [triedNext, setTriedNext]     = useState(false);
  const [draftRestored]               = useState(() => typeof window !== "undefined" && !!localStorage.getItem(DRAFT_KEY));
  // ── #10 : toast feedback sauvegarde ─────────────────────────────────────
  const [savedToast, setSavedToast]   = useState(false);
  const firstSave                     = useRef(false);
  // ── #15 : avertissement contradiction gravité ─────────────────────────
  const [graviteWarning, setGraviteWarning] = useState(false);

  const set = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [field]: value })), []);

  const toggleSymptome = useCallback((key: string) => {
    setForm((prev) => {
      const arr = prev.symptomes;
      return { ...prev, symptomes: arr.includes(key) ? arr.filter((x) => x !== key) : [...arr, key] };
    });
  }, []);

  const toggleMaladie = useCallback((item: string) => {
    setForm((prev) => {
      const arr = prev.maladiesChroniques;
      return { ...prev, maladiesChroniques: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] };
    });
  }, []);

  // ── Autosave draft avec toast (#10) ────────────────────────────────────────
  useEffect(() => {
    if (submitted) return;
    const timeout = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      if (!firstSave.current) {
        firstSave.current = true;
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [form, submitted]);

  // ── Détection contradiction gravité/description (#15) ──────────────────────
  useEffect(() => {
    if (!form.description) { setGraviteWarning(false); return; }
    const keywords = detectGraviteKeywords(form.description);
    const graviteMineure = !form.gravite || form.gravite === "rien" || form.gravite === "activites";
    setGraviteWarning(keywords && graviteMineure);
  }, [form.description, form.gravite]);

  // ── Géolocalisation IP (#1 fix AbortController) ────────────────────────────
  useEffect(() => {
    if (form.region) return;
    setGeoLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    fetch("https://ipapi.co/json/", { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { city?: string; country_code?: string }) => {
        if (data.country_code !== "MA") return;
        const city = (data.city || "").toLowerCase();
        const matched = CITY_TO_REGION[city] || REGIONS.find((r) => r.toLowerCase().includes(city)) || null;
        if (matched) setForm((prev) => ({ ...prev, region: matched, regionAuto: true }));
      })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); setGeoLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Soumission ─────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!form.consentement) return;
    setSubmitError("");
    try {
      const payload = {
        source:              user ? "patient" : "invite",
        patient_age:         form.age,
        patient_sexe:        form.sexe,
        region:              form.region || undefined,
        region_auto:         form.regionAuto,                                    // #2
        drug_dci:            form.medicamentNom,
        drug_lot:            form.medicamentLot || undefined,
        drug_peremption:     form.medicamentPeremption || undefined,             // #14
        drug_laboratoire:    form.medicamentLabo || undefined,
        drug_indication:     form.indication || undefined,
        drug_date_debut:     form.medicamentDateDebut || undefined,
        drug_duree_label:    form.duree || undefined,                            // label lisible
        drug_duree_jours:    dureeToDays(form.duree),                           // #12 : valeur numérique
        prescripteur:        form.prescripteur || undefined,
        ei_description:      form.description,
        ei_symptomes_keys:   form.aucunSymptome ? [] : form.symptomes,          // #13 : clés propres
        ei_symptomes_labels: form.aucunSymptome                                 // labels lisibles en bonus
          ? []
          : form.symptomes.map((k) => SYMPTOME_LABEL[k] || k),
        ei_delai_apparition:   form.delaiApparition,
        ei_evolution:          form.problemePersiste,
        ei_amelioration_arret: form.ameliorationApresArret || undefined,
        gravite_hospitalisation:
          form.gravite === "urgences" || form.gravite === "hospitalise" || form.gravite === "vie-danger",
        gravite_vie_danger:    form.gravite === "vie-danger",
        gravite_incapacite:    form.gravite === "activites",
        gravite_deces:         false,
        arret_medicament:      form.arretMedicament || undefined,
        autres_medicaments:    form.autresMedicamentsDetail || undefined,
        maladies_chroniques:   form.maladiesChroniques,
        grossesse:             form.grossesse || undefined,
        reaction_passee:       form.reactionPassee || undefined,
        reaction_passee_detail: form.reactionPasseeDetail || undefined,
        signale_medecin:       form.signaleAuMedecin || undefined,
        contact_email:         form.contactEmail || undefined,
        contact_tel:           form.contactTel || undefined,
        raw_data:              form,
      };
      const resp = user
        ? await api.createReport(payload)
        : await api.createAnonymousReport(payload);
      const ref = resp?.id ? `PV-${new Date().getFullYear()}-${String(resp.id).slice(0, 8).toUpperCase()}` : "";
      setReportRef(ref);
      localStorage.removeItem(DRAFT_KEY);
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-lg w-full">

          {/* Titre */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-petrol/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Déclaration envoyée !</h1>
            <p className="text-gray-500 text-sm">Merci — votre signalement aide à protéger d&apos;autres patients au Maroc.</p>
            <p className="text-petrol text-sm font-medium mt-1" dir="rtl">شكرا بزاف — بلاغتك كتساعد المرضى الآخرين فالمغرب 🇲🇦</p>
          </div>

          {/* Numéro de référence */}
          {reportRef && (
            <div className="bg-petrol/5 border border-petrol/20 rounded-xl px-5 py-3 text-center mb-6">
              <p className="text-xs text-petrol font-medium mb-1">Numéro de référence</p>
              <p className="text-lg font-mono font-bold text-petrol">{reportRef}</p>
              <p className="text-xs text-petrol mt-1">Conservez ce numéro pour le suivi de votre déclaration</p>
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
                  <p className="text-sm font-medium text-gray-800">Accusé de réception</p>
                  <p className="text-xs text-gray-500">Vous recevrez un email de confirmation dans quelques minutes.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-base mt-0.5">🔬</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">Analyse pharmacovigilance</p>
                  <p className="text-xs text-gray-500">Le Centre Anti-Poison et de Pharmacovigilance du Maroc analysera votre déclaration.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-base mt-0.5">📋</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">Suivi de votre dossier</p>
                  <p className="text-xs text-gray-500">Retrouvez votre déclaration et son statut dans votre espace personnel.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-base mt-0.5">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">En cas d&apos;urgence médicale</p>
                  <p className="text-xs text-gray-500">Contactez immédiatement le <strong>SAMU (15)</strong> ou rendez-vous aux urgences. Cette déclaration ne remplace pas une consultation médicale.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard/patient"
              className="w-full text-center bg-petrol text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-petrol-dark transition-colors"
            >
              Retour au tableau de bord
            </Link>
            <button
              onClick={() => { setForm(INITIAL); setSubmitted(false); setReportRef(""); localStorage.removeItem(DRAFT_KEY); }}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 underline py-2"
            >
              Faire une autre déclaration
            </button>
          </div>

        </div>
      </div>
    );
  }

  const stepErrs = sectionErrors(step, form);
  const hasErrs  = stepErrs.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Toast sauvegarde (#10) ── */}
      {savedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
          💾 Brouillon sauvegardé automatiquement
        </div>
      )}

      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/patient" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
          <div>
            <div className="font-semibold text-gray-900 text-sm">Déclaration d&apos;effet indésirable</div>
            <div className="text-xs text-gray-500">Section {step} / {SECTIONS.length} — {SECTIONS[step - 1].label}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {draftRestored && (
            <button onClick={() => { setForm(INITIAL); localStorage.removeItem(DRAFT_KEY); window.location.reload(); }}
              className="text-xs text-gray-400 hover:text-red-500 underline">
              Effacer le brouillon
            </button>
          )}
          <span className="text-xs text-gray-400">{Math.round((step / SECTIONS.length) * 100)}%</span>
        </div>
      </header>

      <div className="h-1 bg-gray-200">
        <div className="h-1 bg-petrol transition-all duration-300" style={{ width: `${(step / SECTIONS.length) * 100}%` }} />
      </div>

      <div className="overflow-x-auto border-b border-gray-100 bg-white px-6">
        <div className="flex gap-1 py-2 min-w-max">
          {SECTIONS.map((s) => (
            <button key={s.id}
              onClick={() => { if (s.id < step) { setTriedNext(false); setStep(s.id); } }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${step === s.id ? "bg-petrol text-white" : s.id < step ? "bg-petrol/10 text-petrol cursor-pointer" : "text-gray-400 cursor-default"}`}>
              {s.id}. {s.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* ══ S1 — Vous ════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-600">
              <p className="mb-1">🔒 <strong>Identité anonyme</strong> — aucun nom ni prénom demandé.</p>
              <p className="text-xs text-gray-500" dir="rtl">🇲🇦 هويتك — ما كتخص اسم ولا لقب.</p>
            </div>
            <div>
              <Label fr="Votre tranche d'âge" dar="شحال عندك فعمرك؟" required />
              <AgePicker value={form.age} onChange={(v) => set("age", v)} />
            </div>
            <div>
              <Label fr="Votre sexe" dar="شكون نتا / نتي؟" required />
              <RadioGroup value={form.sexe} onChange={(v) => set("sexe", v)} options={[
                { val: "homme", fr: "Homme",                      dar: "راجل" },
                { val: "femme", fr: "Femme",                      dar: "مرا" },
                { val: "nr",    fr: "Je préfère ne pas répondre", dar: "ما بغيتش نجاوب" },
              ]} />
            </div>
            <div>
              <Label fr="Votre région" dar="فين كتسكن؟" />
              {geoLoading && (
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <span className="inline-block w-3 h-3 border border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
                  Détection de votre région...
                </p>
              )}
              {form.regionAuto && form.region && (
                <div className="mb-2 flex items-center gap-2 bg-petrol/5 border border-petrol/20 rounded-lg px-3 py-2">
                  <span className="text-petrol text-xs">📍 Région détectée :</span>
                  <span className="text-petrol text-xs font-semibold">{form.region}</span>
                </div>
              )}
              <select value={form.region} onChange={(e) => set("region", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol">
                <option value="">{form.regionAuto ? "Modifier ma région..." : "Choisir une région / اختار منطقة"}</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                <option value="nr">Je préfère ne pas répondre / ما بغيتش نجاوب</option>
              </select>
            </div>
          </div>
        )}

        {/* ══ S2 — Médicament ══════════════════════════════════════════════════ */}
        {step === 2 && (
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
                { val: "medecin",    fr: "Un médecin",             dar: "طبيب" },
                { val: "pharmacien", fr: "Un pharmacien",          dar: "صيدلي" },
                { val: "soi-meme",   fr: "Je l'ai acheté moi-même", dar: "شريتو براسي" },
                { val: "proche",     fr: "Un proche / la famille",  dar: "واحد من العيلة أو الصحاب" },
                { val: "autre",      fr: "Autre",                   dar: "خور" },
              ]} />
            </div>
          </div>
        )}

        {/* ══ S3 — Ce qui s'est passé ══════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label fr="Racontez-nous ce qui s'est passé" dar="حدّثنا أشمن مشكل وقع" required />
              <InfoBox text="Pas besoin de mots médicaux — écrivez comme vous le raconteriez à un ami." textDar="ما خاصكش تكون طبيب — هدر بحال ما كتحدّث لواحد صاحبك" />
              <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Ex : J'ai eu des boutons rouges sur les bras 2 jours après avoir commencé le médicament..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-petrol resize-none" />
            </div>

            {/* Symptômes avec clés internes (#13) */}
            <div>
              <Label fr="Quels symptômes avez-vous ressentis ?" dar="أشمن أعراض حسيتي بهم؟" />
              <p className="text-xs text-gray-500 mb-3">Cochez tout ce qui s&apos;applique / ممكن تختار بزاف</p>
              <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all text-sm mb-3 ${form.aucunSymptome ? "border-gray-400 bg-gray-100 text-gray-700 font-medium" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                <input type="checkbox" className="accent-gray-500" checked={form.aucunSymptome}
                  onChange={() => setForm((prev) => ({ ...prev, aucunSymptome: !prev.aucunSymptome, symptomes: !prev.aucunSymptome ? [] : prev.symptomes }))} />
                Aucun des symptômes listés / ما فيهم والو
              </label>
              {!form.aucunSymptome && (
                <div className="space-y-4">
                  {SYMPTOMES_CATEGORIES.map((cat) => (
                    <div key={cat.cat} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{cat.cat}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {cat.items.map((s) => (
                          <CheckboxItem key={s.key} label={s.label}
                            checked={form.symptomes.includes(s.key)}
                            onChange={() => toggleSymptome(s.key)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label fr="Quand ce problème a-t-il commencé par rapport à la prise du médicament ?" dar="إمتى بدات هاد المشكل مع هاد الدوا؟" required />
              <RadioGroup value={form.delaiApparition} onChange={(v) => set("delaiApparition", v)} options={[
                { val: "meme-jour", fr: "Le jour même de la prise",  dar: "نفس النهار خديت الدوا" },
                { val: "24h",       fr: "Dans les 24 heures",        dar: "ف 24 ساعة" },
                { val: "2-7j",      fr: "Entre 2 et 7 jours",       dar: "بين جوج و سبع أيام" },
                { val: ">1sem",     fr: "Plus d'une semaine après",  dar: "فوق سيمانة من بعد" },
                { val: "nsp",       fr: "Je ne sais pas",            dar: "ما عرفتش" },
              ]} />
            </div>
          </div>
        )}

        {/* ══ S4 — Gravité ════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              ⚠️ Si vous avez été hospitalisé(e) ou si votre vie était en danger, votre déclaration sera traitée en priorité.
              <div className="text-xs text-amber-700 mt-1" dir="rtl">إلا دخلتي لسبيطار أو كان وداعك فخطر، هاد البلاغة غاتتساراج بالأولوية.</div>
            </div>

            {/* Alerte urgence (#7) */}
            {form.gravite === "vie-danger" && (
              <div className="bg-red-600 text-white rounded-xl p-4 flex gap-3 items-start">
                <span className="text-2xl shrink-0">🚨</span>
                <div>
                  <p className="font-bold text-sm mb-1">Si vous êtes encore en danger, appelez le 15 maintenant.</p>
                  <p dir="rtl" className="text-red-100 text-xs">إلا مازلتي فخطر، اتصل ب 15 دابا.</p>
                  <a href="tel:15" className="mt-2 inline-block bg-white text-red-700 font-bold px-4 py-1.5 rounded-lg text-sm">📞 Appeler le 15</a>
                </div>
              </div>
            )}

            {/* Avertissement contradiction gravité/description (#15) */}
            {graviteWarning && (
              <div className="bg-orange-50 border border-orange-300 rounded-xl p-4 flex gap-3 items-start">
                <span className="text-xl shrink-0">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-orange-800 mb-1">Votre description semble indiquer une situation grave.</p>
                  <p className="text-xs text-orange-700">Vous avez mentionné des mots comme &quot;hospitalisé&quot; ou &quot;urgences&quot; dans votre récit — pensez à sélectionner la bonne case ci-dessous.</p>
                </div>
              </div>
            )}

            <div>
              <Label fr="Comment ce problème a-t-il affecté votre vie ?" dar="كيفاش أثر عليك هاد المشكل؟" required />
              <div className="flex flex-col gap-2">
                {[
                  { val: "rien",        fr: "Gêne légère, j'ai continué normalement", dar: "شوية عدم راحة، كملت حياتي عادي", danger: false },
                  { val: "activites",   fr: "J'ai dû réduire ou arrêter mes activités", dar: "خصني نوقف أو نخفف من أشغالي",   danger: false },
                  { val: "urgences",    fr: "Je suis allé(e) aux urgences",             dar: "مشيت للأورجونس",                 danger: true },
                  { val: "hospitalise", fr: "J'ai été hospitalisé(e)",                  dar: "دخلت لسبيطار",                   danger: true },
                  { val: "vie-danger",  fr: "Ma vie était en danger",                   dar: "كان وداعي فخطر",                 danger: true },
                ].map((o) => (
                  <label key={o.val} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    form.gravite === o.val
                      ? o.danger ? "border-red-500 bg-red-50" : "border-petrol bg-petrol/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <input type="radio" className="accent-emerald-600" checked={form.gravite === o.val} onChange={() => set("gravite", o.val)} />
                    <div>
                      <div className="text-sm text-gray-800">{o.fr}</div>
                      <div className="text-xs text-gray-500" dir="rtl">{o.dar}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label fr="Avez-vous arrêté le médicament ?" dar="واش وقفتي الدوا؟" required />
              <RadioGroup value={form.arretMedicament} onChange={(v) => set("arretMedicament", v)} options={[
                { val: "oui-seul",     fr: "Oui, de moi-même",                          dar: "إيه، براسي" },
                { val: "oui-medecin",  fr: "Oui, sur conseil du médecin",               dar: "إيه، الطبيب قال" },
                { val: "non-continue", fr: "Non, je continue",                           dar: "لا، مازال كتاخدو" },
                { val: "non-fini",     fr: "Non, j'ai terminé le traitement normalement", dar: "لا، كملتو نورمال" },
              ]} />
            </div>

            {(form.arretMedicament === "oui-seul" || form.arretMedicament === "oui-medecin") && (
              <div>
                <Label fr="Après avoir arrêté, le problème s'est-il amélioré ?" dar="من بعد ما وقفتي، واش المشكل حسن؟" />
                <RadioGroup value={form.ameliorationApresArret} onChange={(v) => set("ameliorationApresArret", v)} options={[
                  { val: "ameliore", fr: "Oui, amélioré",                dar: "إيه، حسن" },
                  { val: "disparu",  fr: "Oui, complètement disparu",     dar: "إيه، دات بزاف" },
                  { val: "non",      fr: "Non, pas de changement",        dar: "لا، بقى بحال بحال" },
                ]} />
              </div>
            )}

            <div>
              <Label fr="Est-ce que ce problème est toujours présent aujourd'hui ?" dar="واش هاد المشكل مازال كاين ليوم؟" required />
              <RadioGroup value={form.problemePersiste} onChange={(v) => set("problemePersiste", v)} options={[
                { val: "oui",     fr: "Oui, toujours",         dar: "إيه، مازال" },
                { val: "non",     fr: "Non, c'est passé",       dar: "لا، دات" },
                { val: "partiel", fr: "Partiellement amélioré", dar: "حسن شوية" },
                { val: "nsp",     fr: "Je ne sais pas",         dar: "ما عرفتش" },
              ]} />
            </div>
          </div>
        )}

        {/* ══ S5 — Contexte médical ════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 bg-gray-100 rounded-xl px-4 py-2">
              Section optionnelle — aide à mieux analyser votre déclaration. / هاد القسم اختياري ولكن مهم.
            </p>
            <div>
              <Label fr="Prenez-vous d'autres médicaments en même temps ?" dar="واش كتاخود دويور دويات فنفس الوقت؟" />
              <InfoBox text="Incluez vitamines, compléments alimentaires, plantes médicinales." textDar="دخّل فيتامينات، نباتات، أعشاب" />
              <RadioGroup value={form.autresMedicaments} onChange={(v) => set("autresMedicaments", v)} options={[
                { val: "oui", fr: "Oui", dar: "إيه" },
                { val: "non", fr: "Non", dar: "لا" },
                { val: "nsp", fr: "Je ne sais pas", dar: "ما عرفتش" },
              ]} />
              {form.autresMedicaments === "oui" && (
                <textarea rows={2} placeholder="Lesquels ? / أشمنين؟"
                  value={form.autresMedicamentsDetail} onChange={(e) => set("autresMedicamentsDetail", e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol resize-none" />
              )}
            </div>
            <div>
              <Label fr="Avez-vous des maladies chroniques ?" dar="واش عندك مرض مزمن؟" />
              <RadioGroup value={form.maladiesChroniquesOuiNon} onChange={(v) => {
                set("maladiesChroniquesOuiNon", v);
                if (v !== "oui") set("maladiesChroniques", []);
              }} options={[
                { val: "oui", fr: "Oui", dar: "إيه" },
                { val: "non", fr: "Non", dar: "لا" },
                { val: "nsp", fr: "Je ne sais pas", dar: "ما عرفتش" },
              ]} />
              {form.maladiesChroniquesOuiNon === "oui" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {["Diabète / السكر", "Hypertension / الضغط", "Cancer / السرطان",
                    "Maladie rénale / الكلوة", "Maladie cardiaque / القلب", "Asthme / الربو",
                    "Épilepsie / الصرع", "Dépression / الاكتئاب", "Autre / خور",
                  ].map((item) => (
                    <CheckboxItem key={item} label={item}
                      checked={form.maladiesChroniques.includes(item)}
                      onChange={() => toggleMaladie(item)} />
                  ))}
                </div>
              )}
            </div>
            {/* Grossesse strictement conditionnel (#3) */}
            {form.sexe === "femme" && (
              <div>
                <Label fr="Si applicable — êtes-vous enceinte ou allaitez-vous ?" dar="إلا كان — واش حامل أو كترضعي؟" />
                <RadioGroup value={form.grossesse} onChange={(v) => set("grossesse", v)} options={[
                  { val: "enceinte",    fr: "Oui, enceinte",           dar: "إيه، حامل" },
                  { val: "allaitement", fr: "Oui, j'allaite",          dar: "إيه، كترضعي" },
                  { val: "non",         fr: "Non",                      dar: "لا" },
                  { val: "nr",          fr: "Préfère ne pas répondre", dar: "ما بغيتش نجاوب" },
                ]} />
              </div>
            )}
            <div>
              <Label fr="Avez-vous déjà eu une réaction similaire à un médicament par le passé ?" dar="واش من قبل عندك ريأكسيون بحال هادي مع الدوا؟" />
              <RadioGroup value={form.reactionPassee} onChange={(v) => set("reactionPassee", v)} options={[
                { val: "oui", fr: "Oui", dar: "إيه" },
                { val: "non", fr: "Non", dar: "لا" },
                { val: "nsp", fr: "Je ne sais pas", dar: "ما عرفتش" },
              ]} />
              {form.reactionPassee === "oui" && (
                <input type="text" placeholder="Avec quel médicament ? / أشمن دوا؟"
                  value={form.reactionPasseeDetail} onChange={(e) => set("reactionPasseeDetail", e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol" />
              )}
            </div>
          </div>
        )}

        {/* ══ S6 — Finalisation ════════════════════════════════════════════════ */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <Label fr="Avez-vous déjà signalé ce problème à votre médecin ou pharmacien ?" dar="واش غير عارف الطبيب أو الصيدلي بهاد المشكل؟" />
              <RadioGroup value={form.signaleAuMedecin} onChange={(v) => set("signaleAuMedecin", v)} options={[
                { val: "medecin",        fr: "Oui, au médecin",       dar: "إيه، الطبيب عارف" },
                { val: "pharmacien",     fr: "Oui, au pharmacien",     dar: "إيه، الصيدلي عارف" },
                { val: "les-deux",       fr: "Oui, aux deux",          dar: "إيه، جوج عارفين" },
                { val: "non",            fr: "Non, pas encore",         dar: "لا، مازال" },
                { val: "pas-de-medecin", fr: "Je n'ai pas de médecin", dar: "لا، ما عنديش طبيب" },
              ]} />
            </div>
            <div>
              <Label fr="Souhaitez-vous être recontacté(e) ?" dar="باغي/باغية يتصلو بيك إلا كان فيه سؤال؟" />
              <RadioGroup value={form.contact} onChange={(v) => set("contact", v)} options={[
                { val: "email", fr: "Oui, par email",        dar: "إيه، بالإيميل" },
                { val: "tel",   fr: "Oui, par téléphone",    dar: "إيه، بالتيليفون" },
                { val: "non",   fr: "Non, je reste anonyme", dar: "لا، بغيت نبقى مجهول" },
              ]} />
              {form.contact === "email" && (
                <input type="email" placeholder="votre@email.com" value={form.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol" />
              )}
              {form.contact === "tel" && (
                <input type="tel" placeholder="+212 6XX XXX XXX" value={form.contactTel}
                  onChange={(e) => set("contactTel", e.target.value)}
                  className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol" />
              )}
            </div>
            <div>
              <Label fr="Avez-vous des documents ou photos à joindre ?" dar="واش عندك وثيقة أو صورة تزيدها؟" />
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-petrol/40 rounded-xl p-6 text-sm text-gray-500 hover:text-petrol transition-all cursor-pointer">
                📎 Joindre un fichier / زيد وثيقة
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={() => set("documents", true)} />
              </label>
              {form.documents && <p className="text-xs text-petrol mt-1">✓ Fichier joint</p>}
            </div>

            {/* Récap enrichi */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs text-gray-600 space-y-1.5">
              <p className="font-semibold text-gray-800 mb-2 text-sm">Récapitulatif / ملخص</p>
              <p>💊 Médicament : <span className="font-medium text-gray-900">{form.medicamentNom || "—"}</span></p>
              <p>📋 Indication : <span className="font-medium text-gray-900">{form.indication || "—"}</span></p>
              <p>⏱ Durée : <span className="font-medium text-gray-900">{form.duree || "—"}</span></p>
              <p>👤 Prescripteur : <span className="font-medium text-gray-900">{form.prescripteur || "—"}</span></p>
              <p>📍 Région : <span className="font-medium text-gray-900">{form.region || "—"}</span></p>
              <p>🩺 Symptômes : <span className="font-medium text-gray-900">{form.aucunSymptome ? "Aucun" : form.symptomes.length > 0 ? `${form.symptomes.length} sélectionné(s)` : "—"}</span></p>
              <p>⏰ Délai : <span className="font-medium text-gray-900">{form.delaiApparition || "—"}</span></p>
              <p>⚠️ Gravité : <span className="font-medium text-gray-900">{form.gravite || "—"}</span></p>
              <p>📝 Description : <span className={`font-medium ${form.description ? "text-gray-900" : "text-amber-600"}`}>{form.description ? "✓ Remplie" : "⚠️ Manquante"}</span></p>
            </div>

            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.consentement ? "border-petrol bg-petrol/5" : "border-gray-300"}`}>
              <input type="checkbox" className="accent-emerald-600 mt-1" checked={form.consentement}
                onChange={(e) => set("consentement", e.target.checked)} />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  J&apos;accepte que ces informations soient utilisées de manière anonyme pour améliorer la sécurité des médicaments au Maroc. <span className="text-red-500">★</span>
                </p>
                <p className="text-xs text-gray-500 mt-1" dir="rtl">🇲🇦 قبلت باش تستخدم هاد المعلومات بأنونيمات باش تحسن سلامة الدوا فالمغرب.</p>
              </div>
            </label>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
                ⚠️ {submitError}
              </div>
            )}

            <button onClick={handleSubmit}
              disabled={!form.consentement || !form.medicamentNom || !form.description}
              className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all ${
                form.consentement && form.medicamentNom && form.description
                  ? "bg-petrol hover:bg-petrol-dark shadow-md"
                  : "bg-gray-300 cursor-not-allowed"
              }`}>
              Envoyer ma déclaration / سيفيت البلاغة →
            </button>

            {/* #1 : liens cliquables vers les sections manquantes */}
            {(!form.medicamentNom || !form.description) && (
              <div className="text-xs text-center text-amber-600 space-y-1">
                {!form.medicamentNom && (
                  <p>⚠️ Nom du médicament manquant —{" "}
                    <button onClick={() => setStep(2)} className="underline font-semibold hover:text-amber-800">
                      Aller à la section 2
                    </button>
                  </p>
                )}
                {!form.description && (
                  <p>⚠️ Description manquante —{" "}
                    <button onClick={() => setStep(3)} className="underline font-semibold hover:text-amber-800">
                      Aller à la section 3
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ───────────────────────────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
          {triedNext && hasErrs && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex gap-3">
              <span className="text-red-500 text-lg shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">Champs obligatoires manquants :</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {stepErrs.map((e) => <li key={e} className="text-sm text-red-600">{e}</li>)}
                </ul>
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <button onClick={() => { setTriedNext(false); setStep((s) => Math.max(1, s - 1)); }}
              disabled={step === 1}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              ← Précédent
            </button>
            {step < SECTIONS.length && (
              <button onClick={() => {
                setTriedNext(true);
                if (sectionErrors(step, form).length === 0) { setTriedNext(false); setStep((s) => s + 1); }
              }}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  triedNext && hasErrs
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : "bg-petrol text-white hover:bg-petrol-dark"
                }`}>
                Suivant →
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
