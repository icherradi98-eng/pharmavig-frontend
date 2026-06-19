"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  type DoctorProfile, type RecentPatient, type MedicamentRx, type OrdonnanceType,
  type InteractionResult, type SavedOrdonnance,
  readProfile, saveProfile, readRecentPatients, pushRecentPatient, removeRecentPatient,
  nextOrdonnanceNumber, emptyMedRx, posologieLabel, dureeLabel, ageFromDateNaissance,
  checkInteraction,
  saveToHistory, deleteFromHistory, readHistory,
} from "@/lib/ordonnancier";
import MedecinLayout, { PageHeader } from "@/components/medecin/MedecinLayout";
import {
  type RxTemplate, allTemplates, favoriteTemplates, saveTemplate, bumpUsage,
  findByDiagnostic,
} from "@/lib/templates";
import { TemplatePicker, SaveTemplateModal } from "./components/TemplatePicker";
import { ProfileModal } from "./components/ProfileModal";
import { OrdonnancePreview } from "./components/OrdonnancePreview";
import { MedicamentCard } from "./components/MedicamentCard";
import { QuickStartBar } from "./components/QuickStartBar";
import { MedecinHeaderCard } from "./components/MedecinHeaderCard";
import { SuiviCard } from "./components/SuiviCard";
import { OptionsAvancees } from "./components/OptionsAvancees";
import { inputCls, labelCls } from "./components/styles";

/**
 * Fusionne le profil localStorage avec les données du compte utilisateur.
 * Le localStorage prend toujours le dessus (le médecin peut customiser).
 * Les champs vides sont seedés depuis `user` → plus de profil "fantôme" au premier lancement.
 */
function mergeProfileWithUser(saved: DoctorProfile, user: { nom?: string; prenom?: string; specialite?: string; email?: string } | null): DoctorProfile {
  if (!user) return saved;
  return {
    ...saved,
    nom:        saved.nom        || user.nom        || "",
    prenom:     saved.prenom     || user.prenom      || "",
    specialite: saved.specialite || user.specialite  || "",
  };
}

export default function NouvelleOrdonnance() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<DoctorProfile>(() => mergeProfileWithUser(readProfile(), null));
  const effectiveProfile = useMemo(
    () => mergeProfileWithUser(profile, user),
    [profile, user]
  );
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Pré-remplissage depuis un renouvellement OU une duplication (lu une seule fois, via sessionStorage)
  // — "renouvellement" reprend tout (même patient) ; "duplication" ne reprend que les médicaments
  // (le champ patient est vidé côté historique avant l'envoi, voir handleDuplicate).
  const [{ seed: renewalSeed }] = useState<{ seed: SavedOrdonnance | null; mode: "renew" | "duplicate" | null }>(() => {
    if (typeof window === "undefined") return { seed: null, mode: null };
    try {
      const raw = sessionStorage.getItem("pharmavig_ordo_renouvellement");
      if (!raw) return { seed: null, mode: null };
      sessionStorage.removeItem("pharmavig_ordo_renouvellement");
      const parsed = JSON.parse(raw) as { mode?: "renew" | "duplicate"; ordonnance?: SavedOrdonnance } | SavedOrdonnance;
      if (parsed && typeof parsed === "object" && "ordonnance" in parsed && parsed.ordonnance) {
        return { seed: parsed.ordonnance, mode: parsed.mode || "renew" };
      }
      return { seed: parsed as SavedOrdonnance, mode: "renew" };
    } catch {
      return { seed: null, mode: null };
    }
  });

  // Patient
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>(() => readRecentPatients());
  const [patientNom, setPatientNom] = useState(() => renewalSeed?.patient.nom || "");
  const [patientShowSuggestions, setPatientShowSuggestions] = useState(false);
  const [patientAge, setPatientAge] = useState(() => renewalSeed?.patient.age || "");
  const [patientDateNaissance, setPatientDateNaissance] = useState("");
  const [ageMode, setAgeMode] = useState<"age" | "naissance">("age");
  const [patientSexe, setPatientSexe] = useState<"" | "M" | "F">(() => (renewalSeed?.patient.sexe as "M" | "F" | "") || "");
  const [patientPoids, setPatientPoids] = useState(() => renewalSeed?.patient.poids || "");
  const [motif, setMotif] = useState(() => renewalSeed?.patient.motif || "");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Médicaments
  const [meds, setMeds] = useState<MedicamentRx[]>(() =>
    renewalSeed ? renewalSeed.meds.map((m, i) => ({ ...m, id: i + 1 })) : [emptyMedRx(1)]
  );
  const [nextMedId, setNextMedId] = useState(() => (renewalSeed ? renewalSeed.meds.length + 1 : 2));

  // Options
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [ordonnanceType, setOrdonnanceType] = useState<OrdonnanceType>(() => renewalSeed?.type || "simple");
  const [validite, setValidite] = useState(() => renewalSeed?.validite || "1");
  const [suiviActif, setSuiviActif] = useState(true); // ON par défaut — opt-out plutôt qu'opt-in
  const [patientTelephone, setPatientTelephone] = useState("");

  const [generated, setGenerated] = useState<SavedOrdonnance | null>(null);
  const [prescriptionToken, setPrescriptionToken] = useState<string | null>(null);
  const [suiviLoading, setSuiviLoading] = useState(false);

  // ── Modèles + démarrage rapide ──────────────────────────────────────────────
  const [favTemplates, setFavTemplates] = useState<RxTemplate[]>(() => favoriteTemplates());
  const [allTpls, setAllTpls] = useState<RxTemplate[]>(() => allTemplates());
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [recentOrdos] = useState<SavedOrdonnance[]>(() => readHistory().slice(0, 4));
  const [saveTplOpen, setSaveTplOpen] = useState(false);

  function applyTemplate(t: RxTemplate) {
    setMeds(t.meds.map((m, i) => ({ ...m, id: i + 1 })));
    setNextMedId(t.meds.length + 1);
    setSuiviActif(t.suiviDefault);
    setMotif((prev) => prev || t.diagnostic || "");
    bumpUsage(t.id);
    setTemplatePickerOpen(false);
  }

  function applyDiagnostic(diag: string) {
    setMotif(diag);
    const t = findByDiagnostic(diag);
    if (t) applyTemplate(t);
  }

  function reuseOrdo(o: SavedOrdonnance) {
    setMeds(o.meds.map((m, i) => ({ ...m, id: i + 1 })));
    setNextMedId(o.meds.length + 1);
    setMotif((prev) => prev || o.patient.motif || "");
  }

  function handleSaveAsTemplate(nom: string) {
    const validMeds = meds.filter((m) => m.nom.trim());
    if (!nom.trim() || validMeds.length === 0) return;
    saveTemplate({ nom: nom.trim(), diagnostic: motif || undefined, meds: validMeds, suiviDefault: suiviActif });
    setAllTpls(allTemplates());
    setFavTemplates(favoriteTemplates());
    setSaveTplOpen(false);
  }

  // Vérification d'interactions — dérivée du contenu (pure), résultat mis en cache
  // et alimenté UNIQUEMENT depuis le callback asynchrone (jamais de setState synchrone dans l'effet).
  const interactionPair = useMemo<[string, string] | null>(() => {
    const named = meds.filter((m) => (m.dci || m.nom).trim().length > 1);
    if (named.length < 2) return null;
    const [a, b] = named;
    return [(a.dci || a.nom).trim(), (b.dci || b.nom).trim()];
  }, [meds]);

  const [interactionCache, setInteractionCache] = useState<Record<string, InteractionResult>>({});

  useEffect(() => {
    if (!interactionPair) return;
    const key = `${interactionPair[0]}|${interactionPair[1]}`.toLowerCase();
    if (interactionCache[key]) return;
    let cancelled = false;
    checkInteraction(interactionPair[0], interactionPair[1]).then((r) => {
      if (!cancelled) setInteractionCache((c) => ({ ...c, [key]: r }));
    });
    return () => { cancelled = true; };
  }, [interactionPair, interactionCache]);

  const interactionResult: InteractionResult | null = interactionPair
    ? interactionCache[`${interactionPair[0]}|${interactionPair[1]}`.toLowerCase()] ?? null
    : null;

  function updateMed(id: number, patch: Partial<MedicamentRx>) {
    setMeds((cur) => cur.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function addMed() {
    setMeds((cur) => [...cur, emptyMedRx(nextMedId)]);
    setNextMedId((n) => n + 1);
  }

  function removeMed(id: number) {
    setMeds((cur) => (cur.length > 1 ? cur.filter((m) => m.id !== id) : cur));
  }

  function pickRecentPatient(p: RecentPatient) {
    setPatientNom(p.nom);
    if (p.dateNaissance) { setAgeMode("naissance"); setPatientDateNaissance(p.dateNaissance); setPatientAge(ageFromDateNaissance(p.dateNaissance)); }
    else if (p.age) { setAgeMode("age"); setPatientAge(p.age); }
    if (p.sexe) setPatientSexe(p.sexe as "M" | "F");
    if (p.poids) setPatientPoids(p.poids);
    setPatientShowSuggestions(false);
  }

  const filteredRecent = recentPatients.filter((p) => p.nom.toLowerCase().includes(patientNom.toLowerCase()) && patientNom.trim().length > 0);

  const ageFinal = ageMode === "naissance" ? ageFromDateNaissance(patientDateNaissance) : patientAge;

  function canGenerate() {
    return patientNom.trim().length > 0 && meds.some((m) => m.nom.trim().length > 0);
  }

  async function handleGenerate() {
    if (!canGenerate()) return;
    const numero = nextOrdonnanceNumber();
    const validMeds = meds.filter((m) => m.nom.trim());
    const firstMed = validMeds[0];
    const ordonnance: SavedOrdonnance = {
      id: `${Date.now()}`,
      numero,
      date,
      createdAt: new Date().toISOString(),
      type: ordonnanceType,
      validite,
      patient: { nom: patientNom.trim(), age: ageFinal, dateNaissance: ageMode === "naissance" ? patientDateNaissance : undefined, sexe: patientSexe || undefined, poids: patientPoids || undefined, motif: motif || undefined },
      meds: validMeds,
      suiviActif,
    };
    saveToHistory(ordonnance);
    pushRecentPatient({ nom: ordonnance.patient.nom, age: ordonnance.patient.age, dateNaissance: ordonnance.patient.dateNaissance, sexe: ordonnance.patient.sexe, poids: ordonnance.patient.poids, lastUsed: new Date().toISOString() });
    setRecentPatients(readRecentPatients());
    setGenerated(ordonnance);

    // ── S3.1 : Créer la prescription dans le système de suivi si activé ──
    if (suiviActif && firstMed) {
      setSuiviLoading(true);
      // Initiales depuis le nom complet (ex. "Fatima Zahra Alami" → "F.Z.A")
      const initiales = patientNom.trim()
        .split(/\s+/)
        .map((p) => p[0]?.toUpperCase())
        .filter(Boolean)
        .join(".");

      const prescriptionPayload: Record<string, unknown> = {
        patient_initiales: initiales,
        patient_age:       ageFinal || undefined,
        patient_sexe:      patientSexe || undefined,
        drug_dci:          firstMed.dci || firstMed.nom,
        drug_dose:         firstMed.dosage || undefined,
        drug_frequence:    posologieLabel(firstMed),
        drug_duree:        dureeLabel(firstMed),
        indication:        motif || undefined,
        date_debut:        date,
        monitoring_active: true,
        protocol_type:     "standard",
        contact_method:    patientTelephone ? "whatsapp" : "email",
        contact_tel:       patientTelephone || undefined,
      };

      try {
        const rx = await api.createPrescription(prescriptionPayload);
        setPrescriptionToken(rx.access_token);
      } catch {
        // Suivi non créé (backend indispo) — l'ordonnance existe quand même
        setPrescriptionToken(null);
      } finally {
        setSuiviLoading(false);
      }
    }
  }

  const doctorName = (effectiveProfile.nom || effectiveProfile.prenom)
    ? `Dr. ${effectiveProfile.prenom || ""} ${effectiveProfile.nom || ""}`.trim()
    : (user ? `Dr. ${user.prenom || ""} ${user.nom || ""}`.trim() : "");
  const specialite = effectiveProfile.specialite || user?.specialite || "";

  if (generated) {
    return (
      <MedecinLayout>
      <OrdonnancePreview
        ordonnance={generated}
        doctorName={doctorName}
        specialite={specialite}
        profile={effectiveProfile}
        prescriptionToken={prescriptionToken}
        suiviLoading={suiviLoading}
        onBack={() => {
          deleteFromHistory(generated.id);
          setGenerated(null);
          setPrescriptionToken(null);
        }}
        onGoToSuivi={() => {
          // Fallback si l'API suivi a échoué : on redirige vers le formulaire manuel
          const initiales = generated.patient.nom.split(/\s+/).map((p) => p[0]?.toUpperCase()).filter(Boolean).join(".");
          const firstMed = generated.meds[0];
          const prefill = {
            initiales,
            age: generated.patient.age || "",
            sexe: generated.patient.sexe === "M" || generated.patient.sexe === "F" ? generated.patient.sexe : "",
            dci: firstMed?.dci || firstMed?.nom || "",
            dose: firstMed?.dosage || "",
            frequence: firstMed ? posologieLabel(firstMed) : "",
            indication: generated.patient.motif || "",
            dateDebut: generated.date,
          };
          sessionStorage.setItem("pharmavig_ordo_to_suivi", JSON.stringify(prefill));
          router.push("/prescriptions/nouvelle");
        }}
      />
      </MedecinLayout>
    );
  }

  return (
    <MedecinLayout>
      <PageHeader
        title="Nouvelle ordonnance"
        subtitle="Rédigez, imprimez et activez le suivi patient — en quelques secondes."
        action={
          <Link href="/ordonnances/historique" className="text-sm font-semibold text-petrol hover:text-petrol-dark">Historique →</Link>
        }
      />
      <div className="px-6 md:px-8 py-6 w-full max-w-3xl mx-auto pb-28">

        {/* ── Démarrage rapide ── */}
        <QuickStartBar
          favTemplates={favTemplates}
          recentOrdos={recentOrdos}
          onApplyTemplate={applyTemplate}
          onReuseOrdo={reuseOrdo}
          onApplyDiagnostic={applyDiagnostic}
          onOpenPicker={() => setTemplatePickerOpen(true)}
        />

        <div className="space-y-5">
          {/* ── En-tête médecin ──────────────────────────────────────── */}
          <MedecinHeaderCard
            doctorName={doctorName}
            specialite={specialite}
            profile={effectiveProfile}
            onEditProfile={() => setProfileModalOpen(true)}
          />

          {/* ── Patient ──────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Patient</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative md:col-span-2">
                <label className={labelCls}>Nom et prénom *</label>
                <input
                  className={inputCls}
                  value={patientNom}
                  onChange={(e) => { setPatientNom(e.target.value); setPatientShowSuggestions(true); }}
                  onFocus={() => setPatientShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setPatientShowSuggestions(false), 150)}
                  placeholder="Nom et prénom du patient"
                  autoComplete="off"
                />
                {patientShowSuggestions && filteredRecent.length > 0 && (
                  <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredRecent.map((p, i) => (
                      <li key={i} className="flex items-center group">
                        <button type="button" onMouseDown={() => pickRecentPatient(p)} className="flex-1 text-left px-3 py-2 text-sm hover:bg-petrol/5 flex items-center justify-between">
                          <span>{p.nom}</span>
                          <span className="text-xs text-gray-400">Patient récent{p.age ? ` · ${p.age}` : ""}</span>
                        </button>
                        <button
                          type="button"
                          title="Retirer des patients récents"
                          onMouseDown={(e) => { e.preventDefault(); removeRecentPatient(p.nom); setRecentPatients(readRecentPatients()); }}
                          className="px-2 text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className={labelCls}>Date de naissance</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className={inputCls}
                    value={patientDateNaissance}
                    onChange={(e) => {
                      setPatientDateNaissance(e.target.value);
                      setAgeMode("naissance");
                      if (e.target.value) setPatientAge(ageFromDateNaissance(e.target.value));
                    }}
                  />
                  {patientDateNaissance && (
                    <span className="shrink-0 text-sm font-semibold text-petrol bg-petrol/10 border border-petrol/20 px-3 py-2 rounded-lg whitespace-nowrap">
                      {ageFromDateNaissance(patientDateNaissance) || "—"}
                    </span>
                  )}
                </div>
                {!patientDateNaissance && (
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-xs text-gray-400">ou saisir directement :</span>
                    <input className="border-b border-gray-300 text-xs w-20 focus:outline-none focus:border-petrol" value={ageMode === "age" ? patientAge : ""} onChange={(e) => { setAgeMode("age"); setPatientAge(e.target.value); }} placeholder="45 ans" />
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>Sexe</label>
                <div className="flex gap-2">
                  {([["M", "♂ Homme"], ["F", "♀ Femme"]] as const).map(([s, label]) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPatientSexe(patientSexe === s ? "" : s)}
                      className={`flex-1 border rounded-lg py-2.5 text-sm font-medium transition-colors ${patientSexe === s ? "bg-petrol border-petrol text-white shadow-sm" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Poids (kg)</label>
                <input className={inputCls} value={patientPoids} onChange={(e) => setPatientPoids(e.target.value)} placeholder="Ex. 72" inputMode="decimal" />
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className={labelCls}>Motif / Diagnostic</label>
                <input className={inputCls} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder='Ex. "Diabète type 2", "Infection urinaire"...' />
              </div>
            </div>
          </div>

          {/* ── Médicaments ──────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Médicaments prescrits *</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setSaveTplOpen(true)} className="text-xs text-petrol hover:text-petrol-dark font-medium">Enregistrer comme modèle</button>
                <button onClick={addMed} className="text-xs text-petrol hover:text-petrol-dark font-medium">+ Ajouter</button>
              </div>
            </div>
            <div className="space-y-4">
              {meds.map((m, idx) => (
                <MedicamentCard key={m.id} med={m} index={idx} canRemove={meds.length > 1} onChange={(patch) => updateMed(m.id, patch)} onRemove={() => removeMed(m.id)} />
              ))}
            </div>

            {interactionPair && (
              <div className="mt-4">
                {interactionResult === null && (
                  <p className="text-xs text-gray-400">🔄 Vérification des interactions entre {interactionPair[0]} et {interactionPair[1]}...</p>
                )}
                {interactionResult === "interaction" && (
                  <div className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-sm text-amber-800">
                    ⚠️ Interaction potentielle détectée entre <strong>{interactionPair[0]}</strong> et <strong>{interactionPair[1]}</strong>. Vérifiez avant de prescrire.
                    <p className="text-xs text-amber-600 mt-1">Cette vérification est indicative (base locale MAI DAWA). Le prescripteur reste seul responsable.</p>
                  </div>
                )}
                {interactionResult === "aucune" && (
                  <div className="inline-flex items-center gap-1.5 bg-mint/10 border border-mint/30 rounded-full px-3 py-1 text-xs text-mint font-medium">
                    Aucune interaction connue détectée
                  </div>
                )}
                {interactionResult === "indisponible" && (
                  <p className="text-xs text-gray-400">Vérification d&apos;interactions indisponible pour le moment.</p>
                )}
              </div>
            )}
          </div>

          {/* ── Suivi MAI DAWA — bloc star (la proposition de valeur) ── */}
          <SuiviCard
            suiviActif={suiviActif}
            setSuiviActif={setSuiviActif}
            patientTelephone={patientTelephone}
            setPatientTelephone={setPatientTelephone}
          />

          {/* ── Options avancées (repliées par défaut) ────────── */}
          <OptionsAvancees
            open={optionsOpen}
            setOpen={setOptionsOpen}
            ordonnanceType={ordonnanceType}
            setOrdonnanceType={setOrdonnanceType}
            validite={validite}
            setValidite={setValidite}
          />

          <p className="text-xs text-center px-4" style={{ color: "var(--md-text-muted)" }}>
            Vos ordonnances sont stockées uniquement sur cet appareil. MAI DAWA ne conserve aucune donnée patient.
          </p>
        </div>
      </div>

      {/* Bouton générer — sticky, décalé sous la sidebar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-[240px] right-0 bg-white/95 backdrop-blur px-4 py-3 z-20" style={{ borderTop: "1px solid var(--md-cream-dark)" }}>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate()}
            className="w-full bg-petrol disabled:bg-gray-300 text-white py-3 rounded-lg text-sm font-semibold hover:bg-petrol-dark transition-colors"
          >
            {suiviActif ? "Générer + activer le suivi patient" : "Générer l'ordonnance"}
          </button>
          {!canGenerate() && (
            <p className="text-xs text-center mt-1.5" style={{ color: "var(--md-text-muted)" }}>Renseignez au moins le nom du patient et un médicament.</p>
          )}
        </div>
      </div>

      {templatePickerOpen && (
        <TemplatePicker templates={allTpls} onApply={applyTemplate} onClose={() => setTemplatePickerOpen(false)} />
      )}
      {saveTplOpen && (
        <SaveTemplateModal onSave={handleSaveAsTemplate} onClose={() => setSaveTplOpen(false)} />
      )}
      {profileModalOpen && (
        <ProfileModal
          initial={effectiveProfile}
          onClose={() => setProfileModalOpen(false)}
          onSave={(p) => { setProfile(p); saveProfile(p); setProfileModalOpen(false); }}
        />
      )}
    </MedecinLayout>
  );
}

