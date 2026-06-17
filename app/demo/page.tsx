"use client";

/**
 * /demo — Mode démonstration MAIA DAWA
 * Cas clinique complet pré-rempli : chimiothérapie + éruption cutanée grade 3 + concomitant AINS.
 * Soumission simulée. PDF avec watermark DÉMONSTRATION.
 * Aucune authentification requise.
 */

import { useState } from "react";
import Link from "next/link";
import { generateDeclarationPDF } from "@/lib/generateDeclarationPDF";

// ─── Cas clinique de démonstration ────────────────────────────────────────────

const DEMO_PV = "PV-MA-2025-DEMO01";

const DEMO_FORM = {
  typeDeclaration: "spontanee",

  // Déclarant (fictif)
  declarantNom: "Lahlou",
  declarantPrenom: "Nadia",
  declarantSpecialite: "Oncologie",
  declarantNumOrdre: "MA-78432",
  declarantEtablissement: "Institut National d'Oncologie – Rabat",
  declarantVille: "Rabat",
  declarantEmail: "n.lahlou@ino.ma",
  declarantTel: "+212 537 68 00 00",

  // Patient
  patientAge: "52",
  patientSexe: "Féminin",
  patientPoids: "62",
  patientTaille: "165",
  patientGrossesse: "Non",
  patientAllaitement: "Non",
  patientAntecedents: "Cancer du sein HER2+ — chimiothérapie cycle 3/6",
  patientAllergies: "Pénicillines",

  // Médicament suspect
  medicamentDCI: "PACLITAXEL",
  medicamentNomCommercial: "Taxol 300 mg/50 mL",
  medicamentForme: "Solution pour perfusion IV",
  medicamentVoie: "Intraveineuse",
  medicamentPosologie: "175",
  medicamentFrequence: "Toutes les 3 semaines",
  medicamentIndication: "Cancer du sein métastatique HER2+, 3e cycle de chimiothérapie",
  medicamentDateDebut: "2025-01-15",
  medicamentDateFin: "",
  medicamentLot: "BX2024-1748",
  medicamentLaboratoire: "Bristol-Myers Squibb",

  // Concomitants
  aucunConcomitant: false,
  medicamentsConcomitants: [
    {
      id: 1,
      nom: "Ibuprofène",
      posologieDose: "400",
      posologieUnite: "mg",
      posologieFrequence: "3×/jour",
      indication: "Douleurs articulaires post-chimio",
      arretAvantEI: false,
      suspectSecondaire: true,
    },
    {
      id: 2,
      nom: "Ondansétron",
      posologieDose: "8",
      posologieUnite: "mg",
      posologieFrequence: "2×/jour",
      indication: "Prévention des nausées chimio-induites",
      arretAvantEI: false,
      suspectSecondaire: false,
    },
  ],

  // Effet indésirable
  eiMeddraTerm: "Rash maculo-papuleux",
  eiMeddraCode: "10037868",
  eiDescription:
    "Apparition de lésions érythémateuses maculo-papuleuses diffuses touchant le tronc, les membres supérieurs et le visage, 72h après la 3e perfusion de Paclitaxel. Prurit intense (EVA 7/10). Grading CTCAE v5 : Grade 3 (> 30% de la surface corporelle, geste quotidien limité).",
  eiDateDebut: "2025-03-18",
  eiDateFin: "",
  eiEvolution: "En cours — amélioration",

  // Gravité
  graviteHospitalisation: false,
  graviteVieDanger: false,
  graviteDeces: false,
  graviteIncapacite: false,
  graviteAnomalieCongenitale: false,
  graviteMedicalementSignificatif: true,
  graviteNonSerieux: false,

  // Imputabilité
  imputChronologie: "Vraisemblable (C3)",
  imputSemiologie: "Compatible (S2)",
  imputBibliographie: "Notoriété connue (B2)",
  imputDelaiApparition: "72 heures",
  imputEvolutionArret: "Amélioration après introduction de dermocorticoïdes sans arrêt du traitement",
  imputReadministration: "Non réalisée — chimiothérapie maintenue sous surveillance",
  imputConclusion: "Vraisemblable (I3 — C3/S2/B2)",

  // Finalisation
  commentaires:
    "Avis dermatologique obtenu le 20/03/2025. Dermocorticoïdes classe III appliqués. Reprise du cycle 4 prévue après résolution. Ibuprofène suspecté comme co-facteur aggravant.",
  consentement: true,
  notifAccuseReception: true,
  notifSuiviStatut: true,
  notifEmail: "n.lahlou@ino.ma",
};

// ─── Composants UI locaux ─────────────────────────────────────────────────────

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${color}`}>
      {children}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-1.5 border-b border-gray-100 last:border-0 text-sm">
      <span className="text-gray-400 w-44 shrink-0 text-xs">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 bg-gray-50 border-b border-gray-100">
        <span>{icon}</span>
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function GraviteCheck({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm py-1 ${checked ? "text-amber-700 font-semibold" : "text-gray-400"}`}>
      <span className={`text-base ${checked ? "text-amber-500" : "text-gray-300"}`}>{checked ? "☑" : "☐"}</span>
      {label}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  async function handleDownloadPDF() {
    setPdfLoading(true);
    try {
      await generateDeclarationPDF(DEMO_FORM as unknown as Record<string, unknown>, {
        pvNumber: DEMO_PV,
        isDemo: true,
        declarantNom: DEMO_FORM.declarantNom,
        declarantPrenom: DEMO_FORM.declarantPrenom,
        declarantSpecialite: DEMO_FORM.declarantSpecialite,
        declarantEmail: DEMO_FORM.declarantEmail,
        declarantTel: DEMO_FORM.declarantTel,
        declarantNumOrdre: DEMO_FORM.declarantNumOrdre,
        declarantEtablissement: DEMO_FORM.declarantEtablissement,
        declarantVille: DEMO_FORM.declarantVille,
      });
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#F7F3EE" }}>

      {/* ── Bannière démonstration ── */}
      <div className="bg-amber-500 text-white text-center py-2 text-xs font-semibold tracking-wide">
        ⚡ MODE DÉMONSTRATION — Données fictives à des fins pédagogiques uniquement — Aucune donnée n&apos;est enregistrée
      </div>

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Accueil</Link>
          {/* Logo MAIA DAWA */}
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L4 7v7c0 5.5 4.3 10.7 10 12 5.7-1.3 10-6.5 10-12V7L14 2z" fill="#0F5B57"/>
              <path d="M9 14h10M14 9v10" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div>
              <span className="font-bold text-sm" style={{ color: "#0F5B57" }}>MAIA DAWA</span>
              <span className="ml-2 text-[10px] text-gray-400 uppercase tracking-widest">Démo</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge color="bg-amber-100 text-amber-700">🧪 Cas clinique fictif</Badge>
          <Link
            href="/register"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors"
            style={{ background: "#0F5B57" }}
          >
            Créer un compte →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Accroche ── */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#0F5B57" }}>
            Cas clinique de démonstration
          </h1>
          <p className="text-gray-600 text-sm max-w-xl mx-auto">
            Chimiothérapie (Paclitaxel) + éruption cutanée grade 3 + concomitant AINS.
            Explorez comment MAIA DAWA structure et soumet une déclaration complète en moins de 5 minutes.
          </p>
        </div>

        {/* ── Parcours guidé : ce que vous allez voir ── */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Ce que vous allez voir</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { n: "1", t: "Cas clinique structuré", d: "Patient, médicament suspect, concomitants, effet — au format pharmacovigilance." },
              { n: "2", t: "Imputabilité automatique", d: "Score de Bégaud (C/S/B) calculé et conclusion I3." },
              { n: "3", t: "Déclaration CIOMS + PDF", d: "Génération prête à transmettre, en quelques secondes." },
            ].map((s) => (
              <div key={s.n} className="flex gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white" style={{ background: "#0F5B57" }}>{s.n}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.t}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Résumé visuel du cas ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "💊", label: "Médicament", value: "PACLITAXEL", sub: "Cancer du sein HER2+" },
            { icon: "⚠️", label: "Effet indésirable", value: "Éruption grade 3", sub: "CTCAE v5 · MedDRA #10037868" },
            { icon: "📋", label: "Concomitant suspect", value: "Ibuprofène 400 mg", sub: "Co-facteur aggravant" },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{item.label}</p>
              <p className="font-bold text-gray-900 text-sm">{item.value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Formulaire pré-rempli (lecture + édition simulée) ── */}
        <Card title="1. Déclarant" icon="👨‍⚕️">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <InfoRow label="Nom & Prénom" value={`Dr ${DEMO_FORM.declarantPrenom} ${DEMO_FORM.declarantNom}`} />
            <InfoRow label="Spécialité" value={DEMO_FORM.declarantSpecialite} />
            <InfoRow label="N° d'ordre" value={DEMO_FORM.declarantNumOrdre} />
            <InfoRow label="Établissement" value={DEMO_FORM.declarantEtablissement} />
            <InfoRow label="Email" value={DEMO_FORM.declarantEmail} />
            <InfoRow label="Téléphone" value={DEMO_FORM.declarantTel} />
          </div>
        </Card>

        <Card title="2. Patient" icon="🧑">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <InfoRow label="Âge" value={`${DEMO_FORM.patientAge} ans`} />
            <InfoRow label="Sexe" value={DEMO_FORM.patientSexe} />
            <InfoRow label="Poids / Taille" value={`${DEMO_FORM.patientPoids} kg / ${DEMO_FORM.patientTaille} cm`} />
            <InfoRow label="Grossesse" value={DEMO_FORM.patientGrossesse} />
            <InfoRow label="Allergies" value={DEMO_FORM.patientAllergies} />
          </div>
          <InfoRow label="Antécédents" value={DEMO_FORM.patientAntecedents} />
        </Card>

        <Card title="3. Médicament suspect" icon="💊">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <InfoRow label="DCI" value={DEMO_FORM.medicamentDCI} />
            <InfoRow label="Nom commercial" value={DEMO_FORM.medicamentNomCommercial} />
            <InfoRow label="Forme / Voie" value={`${DEMO_FORM.medicamentForme} / ${DEMO_FORM.medicamentVoie}`} />
            <InfoRow label="Posologie" value={`${DEMO_FORM.medicamentPosologie} mg/m² — ${DEMO_FORM.medicamentFrequence}`} />
            <InfoRow label="Indication" value={DEMO_FORM.medicamentIndication} />
            <InfoRow label="N° lot" value={DEMO_FORM.medicamentLot} />
            <InfoRow label="Date début" value={DEMO_FORM.medicamentDateDebut} />
            <InfoRow label="Laboratoire" value={DEMO_FORM.medicamentLaboratoire} />
          </div>
        </Card>

        <Card title="4. Médicaments concomitants" icon="📋">
          <div className="space-y-4">
            {DEMO_FORM.medicamentsConcomitants.map((c, i) => (
              <div key={c.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm text-gray-900">{i + 1}. {c.nom}</span>
                  {c.suspectSecondaire && <Badge color="bg-red-100 text-red-700">Suspect secondaire</Badge>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 text-sm">
                  <InfoRow label="Posologie" value={`${c.posologieDose} ${c.posologieUnite} — ${c.posologieFrequence}`} />
                  <InfoRow label="Indication" value={c.indication} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="5. Effet indésirable médicamenteux" icon="⚠️">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-3">
            <InfoRow label="Terme MedDRA" value={`${DEMO_FORM.eiMeddraTerm} (code #${DEMO_FORM.eiMeddraCode})`} />
            <InfoRow label="Date de début" value={DEMO_FORM.eiDateDebut} />
            <InfoRow label="Évolution" value={DEMO_FORM.eiEvolution} />
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 mb-4">
            {DEMO_FORM.eiDescription}
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gravité</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <GraviteCheck label="Décès" checked={DEMO_FORM.graviteDeces} />
            <GraviteCheck label="Mise en danger de vie immédiate" checked={DEMO_FORM.graviteVieDanger} />
            <GraviteCheck label="Hospitalisation" checked={DEMO_FORM.graviteHospitalisation} />
            <GraviteCheck label="Incapacité persistante" checked={DEMO_FORM.graviteIncapacite} />
            <GraviteCheck label="Anomalie congénitale" checked={DEMO_FORM.graviteAnomalieCongenitale} />
            <GraviteCheck label="Médicalement significatif" checked={DEMO_FORM.graviteMedicalementSignificatif} />
            <GraviteCheck label="Non sérieux" checked={DEMO_FORM.graviteNonSerieux} />
          </div>
        </Card>

        <Card title="6. Imputabilité médicamenteuse — Méthode Bégaud" icon="🔬">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: "Chronologie (C)", value: DEMO_FORM.imputChronologie, color: "bg-blue-50 text-blue-700" },
              { label: "Sémiologie (S)", value: DEMO_FORM.imputSemiologie, color: "bg-violet-50 text-violet-700" },
              { label: "Bibliographie (B)", value: DEMO_FORM.imputBibliographie, color: "bg-amber-50 text-amber-700" },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl p-4 ${item.color}`}>
                <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-1">{item.label}</p>
                <p className="font-bold text-sm">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4 text-white text-sm font-bold text-center" style={{ background: "#0F5B57" }}>
            Conclusion : {DEMO_FORM.imputConclusion}
          </div>
          <div className="mt-3 space-y-1">
            <InfoRow label="Délai d'apparition" value={DEMO_FORM.imputDelaiApparition} />
            <InfoRow label="Évolution à l'arrêt" value={DEMO_FORM.imputEvolutionArret} />
            <InfoRow label="Ré-administration" value={DEMO_FORM.imputReadministration} />
          </div>
        </Card>

        <Card title="7. Commentaires & finalisation" icon="📤">
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 mb-4">
            {DEMO_FORM.commentaires}
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <span>✅</span>
            <span>Déclarant certifie l&apos;exactitude des informations et autorise la transmission de la déclaration</span>
          </div>
        </Card>

        {/* ── Action : soumettre (simulé) ── */}
        {!submitted ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-500 mb-4">
              En conditions réelles, cette déclaration serait générée au format CIOMS.<br/>
              Ici, la soumission est <strong>simulée</strong> — aucune donnée n&apos;est enregistrée.
            </p>
            <button
              onClick={() => setSubmitted(true)}
              className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-colors"
              style={{ background: "#0F5B57" }}
            >
              ✅ Simuler la soumission
            </button>
          </div>
        ) : (
          <div className="bg-white border border-emerald-200 rounded-2xl p-8">
            {/* Confirmation */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#F7F3EE" }}>
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-lg font-bold mb-1" style={{ color: "#0F5B57" }}>
                Déclaration générée au format CIOMS
              </h2>
              <p className="text-sm text-gray-500">Simulation réussie — voici la déclaration générée au format CIOMS.</p>
            </div>

            {/* Référence */}
            <div className="rounded-xl px-5 py-4 text-center mb-5 border" style={{ background: "#F7F3EE", borderColor: "#D4AF37" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#0F5B57" }}>Référence de déclaration</p>
              <p className="text-xl font-mono font-bold" style={{ color: "#0F5B57" }}>{DEMO_PV}</p>
              <p className="text-xs text-gray-400 mt-1">DÉMONSTRATION — non valable pour soumission réelle</p>
            </div>

            {/* Délai réglementaire */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2 text-sm">
              <span>⚡</span>
              <div>
                <span className="font-bold text-amber-800">Médicalement significatif</span>
                <span className="text-amber-700"> — délai de notification réglementaire : </span>
                <span className="font-bold text-amber-800">30 jours calendaires</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60"
                style={{ background: "#0F5B57" }}
              >
                {pdfLoading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Génération PDF…</>
                  : <>📄 Télécharger le PDF de démonstration</>
                }
              </button>
              <Link
                href="/register"
                className="w-full text-center px-6 py-3 rounded-xl text-sm font-semibold border transition-colors"
                style={{ borderColor: "#D4AF37", color: "#0F5B57", background: "#fffdf7" }}
              >
                Créer mon compte pour déclarer en conditions réelles →
              </Link>
              <Link
                href="/medicaments"
                className="w-full text-center px-6 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                🔍 Explorer le référentiel médicament Morocco-first
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                ← Revenir au formulaire de démonstration
              </button>
            </div>
          </div>
        )}

        {/* ── CTA bas de page ── */}
        <div className="text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            MAIA DAWA — Pharmacovigilance Intelligence · Conçu pour le Maroc · Format CIOMS · MVP démo (données fictives)
          </p>
          <div className="flex justify-center flex-wrap gap-4 text-sm">
            <Link href="/" className="text-gray-400 hover:text-gray-600 underline">Accueil</Link>
            <Link href="/medicaments" className="text-gray-400 hover:text-gray-600 underline">Référentiel médicament</Link>
            <Link href="/contact" className="text-gray-400 hover:text-gray-600 underline">Contact</Link>
            <Link href="/register" className="font-semibold underline" style={{ color: "#0F5B57" }}>Créer un compte</Link>
          </div>
        </div>

      </main>
    </div>
  );
}
