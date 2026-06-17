"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { type ImputScore } from "./ImputabiliteBegaud";
import { readProfile } from "@/lib/ordonnancier";
import ScanBoite, { type ScannedData } from "@/components/medecin/ScanBoite";
import type { FormData, MedicamentConcomitant } from "@/lib/declaration/types";
import { INITIAL, SECTIONS } from "@/lib/declaration/constants";
import { readDraft, saveDraft, clearDraft, readPrefill } from "@/lib/declaration/storage";
import { sectionErrors } from "@/lib/declaration/validators";
import { SuccessScreen } from "./components/SuccessScreen";
import { ConfirmSubmitModal } from "./components/ConfirmSubmitModal";
import { Section1Patient } from "./components/Section1Patient";
import { Section2Medicament } from "./components/Section2Medicament";
import { Section3Concomitants } from "./components/Section3Concomitants";
import { Section4EIM } from "./components/Section4EIM";
import { Section5Imputabilite } from "./components/Section5Imputabilite";
import { Section6Finalisation } from "./components/Section6Finalisation";

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
  const [confirmOpen, setConfirmOpen] = useState(false); // confirmation avant envoi
  const [submitting, setSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(() => draft !== null);
  const [prefilled, setPrefilled] = useState(() => prefill !== null);
  const [triedNext, setTriedNext] = useState(false); // affiche les erreurs inline seulement après tentative
  const [anneeNaissance, setAnneeNaissance] = useState(""); // champ UI uniquement, pas stocké dans form
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const savedConcomitants = useRef<MedicamentConcomitant[]>([]); // préserve la liste lors du toggle aucunConcomitant
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const savedIndicatorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save avec debounce 800ms après chaque changement
  useEffect(() => {
    if (submitted) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveDraft(form, step);
      setSavedIndicator(true);
      if (savedIndicatorTimeout.current) clearTimeout(savedIndicatorTimeout.current);
      savedIndicatorTimeout.current = setTimeout(() => setSavedIndicator(false), 2500);
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

  // Ouvre la confirmation finale (le bouton de la section 6 est déjà gardé : consentement + champs requis)
  function requestSubmit() {
    if (!form.consentement) return;
    setSubmitError("");
    setConfirmOpen(true);
  }

  async function handleSubmit() {
    if (!form.consentement) return;
    setConfirmOpen(false);
    setSubmitting(true);
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
      clearDraft();
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
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
      <SuccessScreen
        form={form}
        pvNumber={pvNumber}
        isSerieux={isSerieux}
        isFatal={isFatal}
        delaiLegal={delaiLegal}
        imputScore={imputScore}
        onNewDeclaration={() => { setForm(INITIAL); setStep(1); setSubmitted(false); setDraftRestored(false); clearDraft(); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Bannière brouillon restauré */}
      {draftRestored && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-sm text-amber-800">
          <span>📝 Brouillon restauré — vous avez repris là où vous vous étiez arrêté.</span>
          <button
            onClick={() => { setForm(INITIAL); setStep(1); setDraftRestored(false); clearDraft(); }}
            className="text-xs text-amber-600 hover:text-amber-800 underline ml-4"
          >
            Recommencer à zéro
          </button>
        </div>
      )}

      {/* Bannière pré-remplissage depuis le suivi actif */}
      {prefilled && (
        <div className="border-b px-6 py-2.5 flex items-center justify-between text-sm" style={{ background: "rgba(15,91,87,0.06)", borderColor: "rgba(15,91,87,0.2)", color: "#0F5B57" }}>
          <span>🛰️ Formulaire pré-rempli depuis le suivi patient actif. Vérifiez et complétez les informations cliniques avant soumission.</span>
          <button
            onClick={() => setPrefilled(false)}
            className="text-xs underline ml-4 opacity-80 hover:opacity-100"
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
          <span className={`text-xs font-medium transition-all duration-300 ${savedIndicator ? "opacity-100 text-[#0F5B57]" : "opacity-0"}`}>
            ✓ Sauvegardé
          </span>
        </div>
      </header>

      {/* Barre de progression */}
      <div className="h-1 bg-gray-200">
        <div className="h-1 bg-[#0F5B57] transition-all duration-300" style={{ width: `${(step / SECTIONS.length) * 100}%` }} />
      </div>

      {/* Onglets */}
      <div className="overflow-x-auto border-b border-gray-100 bg-white px-4">
        <div className="flex gap-1 py-2 min-w-max">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => { if (s.id < step) { setTriedNext(false); setStep(s.id); } }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${step === s.id ? "text-white" : s.id < step ? "text-[#0F5B57] cursor-pointer" : "text-gray-400 cursor-default"}`}
              style={step === s.id ? { background: "#0F5B57" } : s.id < step ? { background: "rgba(15,91,87,0.1)" } : undefined}
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
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "#0F5B57" }}>
                {form.declarantPrenom?.[0]?.toUpperCase() ?? "D"}
              </div>
              <span className="text-gray-700">
                <span className="font-medium">Dr {form.declarantPrenom} {form.declarantNom}</span>
                {form.declarantSpecialite && <span className="text-gray-400"> · {form.declarantSpecialite}</span>}
              </span>
            </div>
            <Link href="/dashboard/medecin/profil" className="text-xs text-gray-400 hover:text-[#0F5B57] underline underline-offset-2">
              Modifier mon profil
            </Link>
          </div>
        )}

        {/* ── Section 1 : Patient ── */}
        {step === 1 && (
          <Section1Patient form={form} set={set} anneeNaissance={anneeNaissance} setAnneeNaissance={setAnneeNaissance} />
        )}

        {/* ── Section 2 : Médicament suspect ── */}
        {step === 2 && (
          <Section2Medicament form={form} set={set} onScanOpen={() => setScanOpen(true)} />
        )}

        {/* ── Section 3 : Médicaments concomitants ── */}
        {step === 3 && (
          <Section3Concomitants form={form} set={set} addConcomitant={addConcomitant} toggleAucunConcomitant={toggleAucunConcomitant} updateConcomitant={updateConcomitant} removeConcomitant={removeConcomitant} />
        )}

        {/* ── Section 4 : Effet indésirable ── */}
        {step === 4 && (
          <Section4EIM form={form} set={set} isSerieux={isSerieux} />
        )}

        {/* ── Section 5 : Imputabilité ── */}
        {step === 5 && (
          <Section5Imputabilite form={form} imputScore={imputScore} begaudOpen={begaudOpen} begaudInitial={begaudInitial} setBegaudOpen={setBegaudOpen} setBegaudInitial={setBegaudInitial} setImputScore={setImputScore} />
        )}

        {/* ── Section 6 : Finalisation ── */}
        {step === 6 && (
          <Section6Finalisation form={form} set={set} isSerieux={isSerieux} isFatal={isFatal} delaiLegal={delaiLegal} champsManquants={champsManquants} submitError={submitError} imputScore={imputScore} uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} dragOver={dragOver} setDragOver={setDragOver} onSubmit={requestSubmit} />
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
                        : "text-white hover:opacity-90"
                    }`}
                    style={!(triedNext && hasErrs) ? { background: "#0F5B57" } : undefined}
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

      {/* ── Confirmation avant envoi ── */}
      {confirmOpen && (
        <ConfirmSubmitModal
          form={form}
          isSerieux={isSerieux}
          isFatal={isFatal}
          delaiLegal={delaiLegal}
          imputScore={imputScore}
          submitting={submitting}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleSubmit}
        />
      )}
    </div>
  );
}
