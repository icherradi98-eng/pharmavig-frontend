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
  findByDiagnostic, QUICK_DIAGNOSES,
} from "@/lib/templates";
import { TemplatePicker, SaveTemplateModal } from "./components/TemplatePicker";
import { ProfileModal } from "./components/ProfileModal";
import { OrdonnancePreview } from "./components/OrdonnancePreview";
import { MedicamentCard } from "./components/MedicamentCard";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol";
const labelCls = "block text-xs text-gray-500 mb-1";

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
        <div className="bg-white rounded-2xl p-4 mb-5" style={{ border: "1px solid var(--md-cream-dark)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gold">Démarrage rapide</p>
            <button onClick={() => setTemplatePickerOpen(true)} className="text-xs font-semibold text-petrol hover:text-petrol-dark">Tous les modèles →</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {favTemplates.map((t) => (
              <button key={t.id} onClick={() => applyTemplate(t)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors" style={{ background: "rgba(212,175,55,0.12)", color: "#92700a", border: "1px solid rgba(212,175,55,0.4)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z"/></svg>
                {t.nom}
              </button>
            ))}
            {recentOrdos.map((o) => (
              <button key={o.id} onClick={() => reuseOrdo(o)} className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-white hover:border-petrol transition-colors" style={{ border: "1px solid var(--md-cream-dark)", color: "var(--md-text-secondary)" }} title="Réutiliser les médicaments">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>
                {o.patient.nom} · {o.meds[0]?.nom ?? "—"}
              </button>
            ))}
            {favTemplates.length === 0 && recentOrdos.length === 0 && (
              <p className="text-xs" style={{ color: "var(--md-text-muted)" }}>Vos modèles favoris et ordonnances récentes apparaîtront ici.</p>
            )}
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--md-cream-dark)" }}>
            <p className="text-[11px] mb-2" style={{ color: "var(--md-text-muted)" }}>Diagnostic rapide — charge un modèle</p>
            <div className="flex gap-2 flex-wrap">
              {QUICK_DIAGNOSES.map((d) => (
                <button key={d} onClick={() => applyDiagnostic(d)} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white hover:border-petrol hover:text-petrol transition-colors" style={{ border: "1px solid var(--md-cream-dark)", color: "var(--md-text-secondary)" }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* ── En-tête médecin ──────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">En-tête médecin</h2>
              <button onClick={() => setProfileModalOpen(true)} className="text-xs text-petrol hover:text-petrol-dark font-medium">
                Modifier mon profil
              </button>
            </div>
            <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 text-sm">
              <p className="font-semibold text-gray-900">{doctorName || "Dr. — (complétez votre profil)"}</p>
              {specialite && <p className="text-gray-500">{specialite}</p>}
              <p className="text-gray-400 text-xs mt-1">
                {[effectiveProfile.numOrdre && `N° Ordre : ${effectiveProfile.numOrdre}`, effectiveProfile.etablissement, effectiveProfile.ville, effectiveProfile.telephone].filter(Boolean).join(" · ") || "Complétez vos coordonnées pour qu'elles apparaissent sur le PDF"}
              </p>
              <div className="flex items-center gap-4 mt-2">
                {effectiveProfile.signatureDataUrl && (
                  <div className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={effectiveProfile.signatureDataUrl} alt="Signature" className="h-10 object-contain" />
                    <p className="text-[10px] text-gray-400">Signature</p>
                  </div>
                )}
                {effectiveProfile.cachetDataUrl && (
                  <div className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={effectiveProfile.cachetDataUrl} alt="Cachet" className="h-10 object-contain" />
                    <p className="text-[10px] text-gray-400">Cachet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                    <p className="text-xs text-amber-600 mt-1">Cette vérification est indicative (base locale MAIA DAWA). Le prescripteur reste seul responsable.</p>
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

          {/* ── Suivi MAIA DAWA — bloc star (la proposition de valeur) ── */}
          <div className="rounded-2xl p-5 transition-colors" style={{ border: suiviActif ? "2px solid var(--md-petrol)" : "2px solid var(--md-cream-dark)", background: suiviActif ? "rgba(15,91,87,0.04)" : "#fff" }}>
            {/* Header + toggle */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: suiviActif ? "var(--md-petrol)" : "#e5e7eb" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={suiviActif ? "#fff" : "#9ca3af"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <div>
                  <p className="text-base font-bold" style={{ color: "var(--md-night)" }}>Suivi de tolérance</p>
                  <p className="text-xs font-medium" style={{ color: suiviActif ? "var(--md-petrol)" : "var(--md-text-muted)" }}>
                    {suiviActif ? "Activé — le patient sera surveillé automatiquement" : "Désactivé"}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setSuiviActif(!suiviActif)} className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors" style={{ background: suiviActif ? "var(--md-petrol)" : "#d1d5db" }}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${suiviActif ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* La boucle — proposition de valeur visuelle */}
            <div className="rounded-xl px-3 py-3 mb-4" style={{ background: suiviActif ? "#fff" : "#f9fafb", border: `1px solid ${suiviActif ? "rgba(15,91,87,0.15)" : "#e5e7eb"}` }}>
              <div className="flex items-center justify-between gap-1">
                {[
                  { l: "Prescription", on: true },
                  { l: "Suivi", on: suiviActif },
                  { l: "Signal", on: suiviActif },
                  { l: "Déclaration", on: suiviActif },
                  { l: "National", on: suiviActif },
                ].map((step, i, arr) => (
                  <div key={step.l} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: step.on ? "var(--md-gold)" : "#d1d5db" }} />
                      <span className="text-[9.5px] font-semibold whitespace-nowrap" style={{ color: step.on ? "var(--md-petrol)" : "var(--md-text-muted)" }}>{step.l}</span>
                    </div>
                    {i < arr.length - 1 && <span className="flex-1 h-px mx-1" style={{ background: step.on ? "var(--md-gold)" : "#e5e7eb" }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Stat choc */}
            <div className="rounded-xl px-4 py-3 mb-4" style={{ background: suiviActif ? "rgba(212,175,55,0.1)" : "#f9fafb", border: `1px solid ${suiviActif ? "rgba(212,175,55,0.3)" : "#e5e7eb"}` }}>
              <p className="text-sm leading-relaxed" style={{ color: suiviActif ? "var(--md-night)" : "var(--md-text-muted)" }}>
                <span className="font-bold">95 % des effets indésirables ne sont jamais signalés.</span>{" "}
                Le suivi les détecte précocement — et transforme chaque cas en connaissance nationale.
              </p>
            </div>

            {suiviActif ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--md-petrol)" }}>Questionnaires automatiques</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ label: "J+7", desc: "Tolérance initiale" }, { label: "J+30", desc: "Bilan intermédiaire" }, { label: "J+90", desc: "Suivi long terme" }].map((item) => (
                      <div key={item.label} className="bg-white rounded-xl p-3 text-center" style={{ border: "1px solid rgba(15,91,87,0.15)" }}>
                        <p className="text-sm font-bold" style={{ color: "var(--md-petrol)" }}>{item.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--md-text-muted)" }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--md-petrol)" }}>
                    Téléphone patient <span className="font-normal" style={{ color: "var(--md-text-muted)" }}>(pour recevoir le lien de suivi)</span>
                  </label>
                  <input type="tel" value={patientTelephone} onChange={(e) => setPatientTelephone(e.target.value)} placeholder="+212 6 XX XX XX XX" className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-petrol bg-white" style={{ border: "1px solid rgba(15,91,87,0.3)" }} />
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setSuiviActif(true)} className="w-full border-2 border-dashed rounded-xl py-3 text-sm transition-colors hover:bg-petrol/5" style={{ borderColor: "#d1d5db", color: "var(--md-text-muted)" }}>
                Activer le suivi pharmacovigilance →
              </button>
            )}
          </div>

          {/* ── Options avancées (repliées par défaut) ────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <button onClick={() => setOptionsOpen((v) => !v)} className="w-full flex items-center justify-between text-sm font-medium text-gray-500 hover:text-gray-700">
              <span>⚙️ Options avancées</span>
              <span className="text-gray-400 text-xs">{optionsOpen ? "▲ Réduire" : "▼ Type, validité, renouvellement..."}</span>
            </button>
            {optionsOpen && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className={labelCls}>Type d&apos;ordonnance</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {([
                      { v: "simple", l: "Ordonnance simple" },
                      { v: "securisee", l: "Ordonnance sécurisée (stupéfiants)" },
                      { v: "exception", l: "Médicaments d'exception" },
                    ] as const).map((opt) => (
                      <button key={opt.v} type="button" onClick={() => setOrdonnanceType(opt.v)}
                        className={`flex-1 border rounded-lg py-2 px-3 text-xs font-medium text-left transition-colors ${ordonnanceType === opt.v ? "bg-petrol/10 border-petrol text-petrol" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Validité</label>
                    <select className={inputCls} value={validite} onChange={(e) => setValidite(e.target.value)}>
                      <option value="1">1 mois</option>
                      <option value="3">3 mois</option>
                      <option value="6">6 mois</option>
                      <option value="12">12 mois</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>N° d&apos;ordonnance</label>
                    <div className={`${inputCls} bg-gray-50 text-gray-400`}>Généré à la création</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-center px-4" style={{ color: "var(--md-text-muted)" }}>
            Vos ordonnances sont stockées uniquement sur cet appareil. MAIA DAWA ne conserve aucune donnée patient.
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

