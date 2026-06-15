"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { type FormData, DRAFT_KEY, INITIAL, SECTIONS, REGIONS, CITY_TO_REGION, SYMPTOME_LABEL } from "./constants";
import { detectGraviteKeywords, dureeToDays, sectionErrors } from "./helpers";
import { Section1Vous } from "./components/Section1Vous";
import { Section2Medicament } from "./components/Section2Medicament";
import { Section3Evenement } from "./components/Section3Evenement";
import { Section4Gravite } from "./components/Section4Gravite";
import { Section5Contexte } from "./components/Section5Contexte";
import { Section6Finalisation } from "./components/Section6Finalisation";

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
  const [geoLoading, setGeoLoading]   = useState(() => !form.region);
  const [triedNext, setTriedNext]     = useState(false);
  const [draftRestored]               = useState(() => typeof window !== "undefined" && !!localStorage.getItem(DRAFT_KEY));
  // ── #10 : toast feedback sauvegarde ─────────────────────────────────────
  const [savedToast, setSavedToast]   = useState(false);
  const firstSave                     = useRef(false);
  // ── #15 : avertissement contradiction gravité ─────────────────────────
  const graviteWarning = useMemo(() => {
    if (!form.description) return false;
    const keywords = detectGraviteKeywords(form.description);
    const graviteMineure = !form.gravite || form.gravite === "rien" || form.gravite === "activites";
    return keywords && graviteMineure;
  }, [form.description, form.gravite]);

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

  // ── Géolocalisation IP (#1 fix AbortController) ────────────────────────────
  useEffect(() => {
    if (form.region) return;
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

        {step === 1 && <Section1Vous form={form} set={set} geoLoading={geoLoading} />}
        {step === 2 && <Section2Medicament form={form} set={set} />}
        {step === 3 && <Section3Evenement form={form} set={set} toggleSymptome={toggleSymptome} />}
        {step === 4 && <Section4Gravite form={form} set={set} graviteWarning={graviteWarning} />}
        {step === 5 && <Section5Contexte form={form} set={set} toggleMaladie={toggleMaladie} />}
        {step === 6 && <Section6Finalisation form={form} set={set} submitError={submitError} onSubmit={handleSubmit} onGoToStep={setStep} />}

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
