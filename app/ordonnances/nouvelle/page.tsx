"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  type DoctorProfile, type RecentPatient, type MedicamentRx, type OrdonnanceType,
  type MedicamentSuggestion, type InteractionResult, type SavedOrdonnance,
  EMPTY_PROFILE, readProfile, saveProfile, readRecentPatients, pushRecentPatient, removeRecentPatient,
  nextOrdonnanceNumber, emptyMedRx, posologieLabel, dureeLabel, ageFromDateNaissance,
  searchMedicaments, checkInteraction, buildWhatsAppLink, buildSummaryText, normalizeForme,
  saveToHistory, deleteFromHistory,
} from "@/lib/ordonnancier";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";
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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function NouvelleOrdonnance() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<DoctorProfile>(() => readProfile());
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

  function handleGenerate() {
    if (!canGenerate()) return;
    const numero = nextOrdonnanceNumber();
    const validMeds = meds.filter((m) => m.nom.trim());
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
  }

  const doctorName = (profile.nom || profile.prenom)
    ? `Dr. ${profile.prenom || ""} ${profile.nom || ""}`.trim()
    : (user ? `Dr. ${user.prenom || ""} ${user.nom || ""}`.trim() : "");
  const specialite = profile.specialite || user?.specialite || "";

  if (generated) {
    return (
      <OrdonnancePreview
        ordonnance={generated}
        doctorName={doctorName}
        specialite={specialite}
        profile={profile}
        onBack={() => {
          // On retire le brouillon de l'historique pour éviter les doublons si le médecin régénère après modification.
          deleteFromHistory(generated.id);
          setGenerated(null);
        }}
        onGoToSuivi={() => {
          // On transmet les infos déjà saisies à la prescription suivie pour éviter une double saisie.
          const initiales = generated.patient.nom
            .split(/\s+/)
            .map((p) => p[0]?.toUpperCase())
            .filter(Boolean)
            .join(".");
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nouvelle ordonnance</h1>
            <p className="text-sm text-gray-500 mt-0.5">Rédigez et imprimez une ordonnance conforme, en quelques secondes.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/ordonnances/historique" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">📚 Historique</Link>
            <Link href="/dashboard/medecin" className="text-sm text-gray-400 hover:text-gray-600">← Retour</Link>
          </div>
        </div>

        <div className="space-y-5">
          {/* ── En-tête médecin ──────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">En-tête médecin</h2>
              <button onClick={() => setProfileModalOpen(true)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                ✏️ Modifier mon profil
              </button>
            </div>
            <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 text-sm">
              <p className="font-semibold text-gray-900">{doctorName || "Dr. — (complétez votre profil)"}</p>
              {specialite && <p className="text-gray-500">{specialite}</p>}
              <p className="text-gray-400 text-xs mt-1">
                {[profile.numOrdre && `N° Ordre : ${profile.numOrdre}`, profile.etablissement, profile.ville, profile.telephone].filter(Boolean).join(" · ") || "Complétez vos coordonnées pour qu'elles apparaissent sur le PDF"}
              </p>
              <div className="flex items-center gap-4 mt-2">
                {profile.signatureDataUrl && (
                  <div className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.signatureDataUrl} alt="Signature" className="h-10 object-contain" />
                    <p className="text-[10px] text-gray-400">Signature</p>
                  </div>
                )}
                {profile.cachetDataUrl && (
                  <div className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.cachetDataUrl} alt="Cachet" className="h-10 object-contain" />
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
                        <button type="button" onMouseDown={() => pickRecentPatient(p)} className="flex-1 text-left px-3 py-2 text-sm hover:bg-emerald-50 flex items-center justify-between">
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
                    <span className="shrink-0 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg whitespace-nowrap">
                      {ageFromDateNaissance(patientDateNaissance) || "—"}
                    </span>
                  )}
                </div>
                {!patientDateNaissance && (
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-xs text-gray-400">ou saisir directement :</span>
                    <input className="border-b border-gray-300 text-xs w-20 focus:outline-none focus:border-emerald-500" value={ageMode === "age" ? patientAge : ""} onChange={(e) => { setAgeMode("age"); setPatientAge(e.target.value); }} placeholder="45 ans" />
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
                      className={`flex-1 border rounded-lg py-2.5 text-sm font-medium transition-colors ${patientSexe === s ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
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
              <button onClick={addMed} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">+ Ajouter un médicament</button>
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
                    <p className="text-xs text-amber-600 mt-1">Cette vérification est indicative (base OpenFDA). Le prescripteur reste seul responsable.</p>
                  </div>
                )}
                {interactionResult === "aucune" && (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-xs text-emerald-700 font-medium">
                    ✓ Aucune interaction connue détectée
                  </div>
                )}
                {interactionResult === "indisponible" && (
                  <p className="text-xs text-gray-400">Vérification d&apos;interactions indisponible pour le moment.</p>
                )}
              </div>
            )}
          </div>

          {/* ── Options ──────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <button onClick={() => setOptionsOpen((v) => !v)} className="w-full flex items-center justify-between text-sm font-semibold text-gray-900">
              <span>⚙️ Options de l&apos;ordonnance</span>
              <span className="text-gray-400">{optionsOpen ? "▲" : "▼"}</span>
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
                        className={`flex-1 border rounded-lg py-2 px-3 text-xs font-medium text-left transition-colors ${ordonnanceType === opt.v ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
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
                {/* SuiviToggle — carte proéminente, ON par défaut */}
                <div className={`rounded-xl border-2 p-4 transition-colors ${suiviActif ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🛡️</span>
                      <span className="text-sm font-semibold text-gray-900">Suivi de tolérance PharmaVig</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSuiviActif(!suiviActif)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${suiviActif ? "bg-emerald-500" : "bg-gray-300"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${suiviActif ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                  {suiviActif ? (
                    <div className="space-y-2">
                      <p className="text-xs text-emerald-700 font-medium">Le patient recevra un questionnaire sécurisé :</p>
                      <div className="flex gap-3 text-xs text-emerald-700">
                        <span className="bg-white border border-emerald-200 rounded-full px-2.5 py-1">📅 J+7</span>
                        <span className="bg-white border border-emerald-200 rounded-full px-2.5 py-1">📅 J+30</span>
                        <span className="bg-white border border-emerald-200 rounded-full px-2.5 py-1">📅 J+90</span>
                      </div>
                      <p className="text-xs text-emerald-600">En cas d&apos;effet signalé → notification + déclaration CAPM pré-remplie</p>
                      <div>
                        <label className="text-xs text-emerald-800 font-medium block mb-1">📱 Téléphone patient</label>
                        <input
                          type="tel"
                          value={patientTelephone}
                          onChange={(e) => setPatientTelephone(e.target.value)}
                          placeholder="+212 6 XX XX XX XX"
                          className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Activez pour détecter automatiquement les effets indésirables après la prescription.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 text-center px-4">
            🔒 Vos ordonnances sont stockées uniquement sur cet appareil. PharmaVig ne conserve aucune donnée patient.
          </p>
        </div>
      </div>

      {/* Bouton générer — sticky */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 z-20">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate()}
            className="w-full bg-emerald-600 disabled:bg-gray-300 text-white py-3 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            {suiviActif ? "🛡️ Générer + activer le suivi patient" : "📄 Générer l'ordonnance"}
          </button>
          {!canGenerate() && (
            <p className="text-xs text-gray-400 text-center mt-1.5">Renseignez au moins le nom du patient et un médicament.</p>
          )}
        </div>
      </div>

      {profileModalOpen && (
        <ProfileModal
          initial={profile}
          onClose={() => setProfileModalOpen(false)}
          onSave={(p) => { setProfile(p); saveProfile(p); setProfileModalOpen(false); }}
        />
      )}
    </div>
  );
}

// ── Carte médicament ──────────────────────────────────────────────────────────

function MedicamentCard({ med, index, canRemove, onChange, onRemove }: {
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
    const normalized = normalizeForme(s.forme);
    onChange({
      nom: s.nom,
      dci: s.dci || med.dci,
      forme: normalized || med.forme,
      dosage: s.dosages && s.dosages.length === 1 ? s.dosages[0] : med.dosage,
      dosagesDisponibles: s.dosages || [],
    });
    setSuggestions([]);
    setShowSuggestions(false);
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400">Médicament {index + 1}</span>
        {canRemove && <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600">Retirer</button>}
      </div>

      <div className="space-y-3">
        {/* Ligne 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <label className={labelCls}>DCI / Nom commercial</label>
            <input
              className={inputCls}
              value={med.nom}
              onChange={(e) => handleNomChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Ex. Doliprane / Paracétamol"
              autoComplete="off"
            />
            {showSuggestions && med.nom.trim().length >= 2 && (
              <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searching && (
                  <li className="px-3 py-2 text-xs text-gray-400">🔄 Recherche en cours...</li>
                )}
                {!searching && suggestions.length === 0 && (
                  <li className="px-3 py-2 text-xs text-gray-400">Aucun résultat dans la base ANSM — vous pouvez saisir le médicament manuellement.</li>
                )}
                {!searching && suggestions.map((s, i) => (
                  <li key={i}>
                    <button type="button" onMouseDown={() => pickSuggestion(s)} className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50">
                      <span className="font-medium">{s.nom}</span>
                      {s.dci && <span className="text-gray-400"> — {s.dci}</span>}
                      {s.forme && <span className="text-gray-300 text-xs"> · {s.forme}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className={labelCls}>Forme</label>
            <select className={inputCls} value={med.forme} onChange={(e) => onChange({ forme: e.target.value as MedicamentRx["forme"] })}>
              <option value="">— Sélectionner —</option>
              {FORMES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {/* Ligne 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Dosage</label>
            {med.dosagesDisponibles && med.dosagesDisponibles.length > 1 ? (
              <select className={inputCls} value={med.dosage} onChange={(e) => onChange({ dosage: e.target.value })}>
                <option value="">— Sélectionner —</option>
                {med.dosagesDisponibles.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <input className={inputCls} value={med.dosage} onChange={(e) => onChange({ dosage: e.target.value })} placeholder="Ex. 500 mg" />
            )}
          </div>
          <div>
            <label className={labelCls}>Voie d&apos;administration</label>
            <select className={inputCls} value={med.voie} onChange={(e) => onChange({ voie: e.target.value as MedicamentRx["voie"] })}>
              <option value="">— Sélectionner —</option>
              {VOIES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>
        </div>

        {/* Ligne 3 — posologie / durée structurées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Posologie</label>
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
                <button type="button" onClick={() => onChange({ dureeChronique: false })} className="text-xs text-emerald-600 underline">Définir une durée</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input className={`${inputCls} w-20 shrink-0 text-center`} value={med.dureeValeur} onChange={(e) => onChange({ dureeValeur: e.target.value })} inputMode="numeric" />
                <select className={inputCls} value={med.dureeUnite} onChange={(e) => onChange({ dureeUnite: e.target.value as MedicamentRx["dureeUnite"] })}>
                  <option value="jours">jours</option>
                  <option value="semaines">semaines</option>
                  <option value="mois">mois</option>
                </select>
                <button type="button" onClick={() => onChange({ dureeChronique: true })} className="text-xs text-gray-400 hover:text-emerald-600 underline whitespace-nowrap shrink-0">Chronique</button>
              </div>
            )}
          </div>
        </div>

        {/* Ligne 4 — instructions */}
        <div>
          <label className={labelCls}>Instructions spéciales (optionnel)</label>
          <input className={inputCls} value={med.instructions} onChange={(e) => onChange({ instructions: e.target.value })} placeholder='Ex. "À prendre pendant les repas", "Éviter le soleil"...' />
        </div>

        {/* Ligne 5 — non substituable / renouvellement */}
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

// ── Modal édition profil médecin ──────────────────────────────────────────────

function ProfileModal({ initial, onClose, onSave }: { initial: DoctorProfile; onClose: () => void; onSave: (p: DoctorProfile) => void }) {
  const [form, setForm] = useState<DoctorProfile>({ ...EMPTY_PROFILE, ...initial });

  async function handleImage(field: "signatureDataUrl" | "cachetDataUrl", file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((f) => ({ ...f, [field]: dataUrl }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Mon profil — en-tête d&apos;ordonnance</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Prénom</label>
              <input className={inputCls} value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Nom</label>
              <input className={inputCls} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Spécialité (apparaît sur l&apos;ordonnance)</label>
            <input className={inputCls} value={form.specialite} onChange={(e) => setForm({ ...form, specialite: e.target.value })} placeholder="Ex. Oncologie médicale" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>N° Ordre (CNOM)</label>
              <input className={inputCls} value={form.numOrdre} onChange={(e) => setForm({ ...form, numOrdre: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Téléphone</label>
              <input className={inputCls} value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Établissement / cabinet</label>
              <input className={inputCls} value={form.etablissement} onChange={(e) => setForm({ ...form, etablissement: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Ville</label>
              <input className={inputCls} value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className={labelCls}>Signature (image, optionnel)</label>
              {form.signatureDataUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.signatureDataUrl} alt="Signature" className="h-12 object-contain border border-gray-100 rounded mb-1" />
              )}
              <input type="file" accept="image/png,image/jpeg" onChange={(e) => handleImage("signatureDataUrl", e.target.files?.[0] || null)} className="text-xs" />
            </div>
            <div>
              <label className={labelCls}>Cachet (image, optionnel)</label>
              {form.cachetDataUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.cachetDataUrl} alt="Cachet" className="h-12 object-contain border border-gray-100 rounded mb-1" />
              )}
              <input type="file" accept="image/png,image/jpeg" onChange={(e) => handleImage("cachetDataUrl", e.target.files?.[0] || null)} className="text-xs" />
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-3 bg-gray-50">
            <p className="text-xs text-gray-400 mb-2">Aperçu de l&apos;en-tête tel qu&apos;il apparaîtra sur le PDF :</p>
            <p className="font-semibold text-gray-900 text-sm">{`Dr. ${form.prenom} ${form.nom}`.trim() || "Dr. —"}</p>
            {form.specialite && <p className="text-xs text-gray-500">{form.specialite}</p>}
            <p className="text-xs text-gray-400">{[form.numOrdre && `N° Ordre : ${form.numOrdre}`, form.etablissement, form.ville, form.telephone].filter(Boolean).join(" · ")}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">Annuler</button>
          <button onClick={() => onSave(form)} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

// ── Aperçu / génération PDF ───────────────────────────────────────────────────

function OrdonnancePreview({ ordonnance, doctorName, specialite, profile, onBack, onGoToSuivi }: {
  ordonnance: SavedOrdonnance;
  doctorName: string;
  specialite?: string;
  profile: DoctorProfile;
  onBack: () => void;
  onGoToSuivi: () => void;
}) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const dateLabel = new Date(ordonnance.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const validiteLabel = `${ordonnance.validite} mois`;

  async function handleDownload() {
    if (!pdfRef.current) return;
    setDownloading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"), import("html2canvas"),
      ]);
      const canvas = await html2canvas(pdfRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20; // 2cm
      const usableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;
      pdf.addImage(img, "PNG", margin, position, usableWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(img, "PNG", margin, position, usableWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }
      pdf.save(`${ordonnance.numero}_${ordonnance.patient.nom.replace(/\s+/g, "_")}.pdf`);
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  function handleWhatsApp() {
    const msg = `Votre ordonnance du ${dateLabel} (${ordonnance.numero}) — générée via PharmaVig.ma. Merci de la présenter à votre pharmacien.`;
    window.open(buildWhatsAppLink(msg), "_blank");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildSummaryText(ordonnance));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">← Modifier</button>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">Aperçu — {ordonnance.numero}</span>
        </div>

        {/* Aperçu PDF */}
        <div ref={pdfRef} id="ordonnance-pdf" className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5 relative overflow-hidden">
          {ordonnance.type === "securisee" && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center">
              <span className="text-6xl font-black tracking-widest -rotate-12 text-red-900 select-none">SÉCURISÉE</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-300">
            <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center">
              <span className="text-white font-black text-[9px]">PV</span>
            </div>
            PharmaVig.ma
          </div>

          <div className="flex items-start justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="font-bold text-gray-900 text-lg">{doctorName || "Dr. —"}</p>
              {specialite && <p className="text-sm text-gray-500">{specialite}</p>}
              {profile.etablissement && <p className="text-xs text-gray-400 mt-0.5">{profile.etablissement}</p>}
              {(profile.ville || profile.telephone) && <p className="text-xs text-gray-400">{[profile.ville, profile.telephone && `Tél : ${profile.telephone}`].filter(Boolean).join(" — ")}</p>}
              {profile.numOrdre && <p className="text-xs text-gray-400">N° Ordre : {profile.numOrdre}</p>}
            </div>
            <div className="text-right text-sm text-gray-500 shrink-0">
              <p>{dateLabel}</p>
              <p className="text-xs text-gray-400 mt-1">N° Ord : {ordonnance.numero}</p>
              {ordonnance.type !== "simple" && (
                <p className="text-xs font-semibold text-red-600 mt-1">{ordonnance.type === "securisee" ? "Ordonnance sécurisée" : "Médicaments d'exception"}</p>
              )}
            </div>
          </div>

          {/* Patient */}
          <div className="text-sm text-gray-700 grid grid-cols-2 gap-x-4 gap-y-1 border-b border-gray-100 pb-4">
            <p><span className="text-gray-400">Patient : </span><span className="font-medium text-gray-900">{ordonnance.patient.nom}</span></p>
            {ordonnance.patient.age && <p><span className="text-gray-400">Âge : </span>{ordonnance.patient.age}</p>}
            {ordonnance.patient.sexe && <p><span className="text-gray-400">Sexe : </span>{ordonnance.patient.sexe === "M" ? "Homme" : "Femme"}</p>}
            {ordonnance.patient.poids && <p><span className="text-gray-400">Poids : </span>{ordonnance.patient.poids} kg</p>}
            {ordonnance.patient.motif && <p className="col-span-2"><span className="text-gray-400">Motif : </span>{ordonnance.patient.motif}</p>}
          </div>

          {/* Rp/ Médicaments */}
          <div>
            <p className="font-serif italic text-lg text-gray-800 mb-3">Rp/</p>
            <ol className="space-y-4">
              {ordonnance.meds.map((m, i) => (
                <li key={m.id} className="text-sm flex gap-2">
                  <span className="font-semibold text-gray-400 shrink-0">{i + 1}.</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {m.nom}{m.dosage ? ` ${m.dosage}` : ""}
                      {m.nonSubstituable && <span className="ml-2 text-xs font-bold text-red-600 uppercase">Non substituable</span>}
                    </p>
                    <p className="text-gray-600">
                      {[m.forme, m.voie && `Voie : ${VOIES_LABEL[m.voie] || m.voie}`].filter(Boolean).join(" — ")}
                    </p>
                    <p className="text-gray-600">{posologieLabel(m)} pendant {dureeLabel(m)}</p>
                    {m.instructions && <p className="text-gray-500 italic">{m.instructions}</p>}
                    {m.renouvelable && <p className="text-gray-500 text-xs">↻ Renouveler {m.renouvellements} fois</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Signature / cachet */}
          <div className="pt-12 flex items-end justify-between text-xs text-gray-400">
            <div className="text-center">
              {profile.signatureDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.signatureDataUrl} alt="Signature" className="h-14 object-contain mx-auto mb-1" />
              ) : (
                <div className="w-36 border-b border-gray-300 mb-1" />
              )}
              Signature
            </div>
            <div className="text-center">
              {profile.cachetDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.cachetDataUrl} alt="Cachet" className="h-14 object-contain mx-auto mb-1" />
              ) : (
                <div className="w-36 border-b border-gray-300 mb-1" />
              )}
              Cachet médecin
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
            Validité de l&apos;ordonnance : {validiteLabel} · Généré via PharmaVig.ma
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          <button onClick={() => window.print()} className="bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
            🖨️ Imprimer
          </button>
          <button onClick={handleDownload} disabled={downloading} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
            {downloading ? "Génération..." : "⬇️ Télécharger PDF"}
          </button>
          <button onClick={handleWhatsApp} className="bg-[#25D366] hover:brightness-95 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
            💬 Envoyer par WhatsApp
          </button>
          <button onClick={handleCopy} className="border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
            {copied ? "✓ Copié" : "📋 Copier le résumé"}
          </button>
        </div>

        <div className="mt-3">
          <Link href="/ordonnances/historique" className="block text-center text-xs text-gray-400 hover:text-gray-600 underline">
            Voir l&apos;historique des ordonnances
          </Link>
        </div>

        {/* Carte suivi — proéminente, toujours visible après génération */}
        <div className={`mt-5 rounded-xl border-2 p-5 ${ordonnance.suiviActif ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🛡️</span>
            <p className="text-base font-bold text-gray-900">Suivi de tolérance PharmaVig</p>
            {ordonnance.suiviActif && (
              <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full">ACTIVÉ</span>
            )}
          </div>
          {ordonnance.suiviActif ? (
            <div className="space-y-2">
              <p className="text-sm text-emerald-800 font-medium">Questionnaires programmés pour ce patient :</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-white border border-emerald-200 text-emerald-700 rounded-full px-3 py-1.5 font-medium">📅 J+7</span>
                <span className="text-xs bg-white border border-emerald-200 text-emerald-700 rounded-full px-3 py-1.5 font-medium">📅 J+30</span>
                <span className="text-xs bg-white border border-emerald-200 text-emerald-700 rounded-full px-3 py-1.5 font-medium">📅 J+90</span>
              </div>
              <p className="text-xs text-emerald-700 mt-1">En cas d&apos;effet signalé → vous êtes notifié + déclaration CAPM pré-remplie automatiquement.</p>
              <button
                onClick={onGoToSuivi}
                className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Envoyer le lien au patient →
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">Détectez automatiquement les effets indésirables grâce au suivi actif (check-ins J+7, J+30, J+90).</p>
              <button
                onClick={onGoToSuivi}
                className="w-full border-2 border-emerald-400 text-emerald-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-emerald-50 transition-colors"
              >
                🛡️ Activer le suivi pour ce patient →
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-5">
          🔒 Vos ordonnances sont stockées uniquement sur cet appareil. PharmaVig ne conserve aucune donnée patient.
        </p>

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

const VOIES_LABEL: Record<string, string> = {
  orale: "Orale", IV: "Intraveineuse", SC: "Sous-cutanée", IM: "Intramusculaire", topique: "Topique", inhalée: "Inhalée", autre: "Autre",
};
