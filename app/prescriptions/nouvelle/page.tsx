"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, type PrescriptionOut, type ProtocolType } from "@/lib/api";
import { autocomplete, type Suggestion } from "@/lib/drugApi";

const STANDARD_DAYS = [3, 7, 14, 30, 60, 90];
const INTENSIVE_DAYS = [1, 3, 7, 10, 14, 21, 30, 45, 60, 90];
const CUSTOM_CANDIDATE_DAYS = [1, 2, 3, 5, 7, 10, 14, 21, 28, 30, 45, 60, 75, 90, 120];

const HIGH_RISK_KEYWORDS = [
  "mab", "nib", "platine", "platin", "pembrolizumab", "nivolumab", "ipilimumab",
  "atezolizumab", "durvalumab", "trastuzumab", "rituximab", "bevacizumab",
  "chimiotherapie", "chimiothérapie", "methotrexate", "méthotrexate",
  "cisplatine", "carboplatine", "oxaliplatine", "doxorubicine", "cyclophosphamide",
];

function isHighRisk(dci: string): boolean {
  const d = dci.toLowerCase();
  return HIGH_RISK_KEYWORDS.some((k) => d.includes(k));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

// Pré-remplissage depuis l'ordonnancier ("Activer le suivi" sur une ordonnance générée) — lu une seule fois.
const RX_PREFILL_KEY = "pharmavig_ordo_to_suivi";

type RxPrefill = {
  initiales?: string; age?: string; sexe?: string;
  dci?: string; dose?: string; frequence?: string; indication?: string; dateDebut?: string;
};

function readRxPrefill(): RxPrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RX_PREFILL_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(RX_PREFILL_KEY);
    return JSON.parse(raw) as RxPrefill;
  } catch {
    return null;
  }
}

export default function NouvellePrescription() {
  const { user } = useAuth();

  // Pré-remplissage éventuel (lu une seule fois au montage, via lazy init — jamais dans un effect)
  const [rxPrefill] = useState<RxPrefill | null>(() => readRxPrefill());

  // Patient
  const [initiales, setInitiales] = useState(() => rxPrefill?.initiales || "");
  const [age, setAge] = useState(() => rxPrefill?.age || "");
  const [sexe, setSexe] = useState(() => rxPrefill?.sexe || "");

  // Médicament — autocomplete DCI
  const [dci, setDci] = useState(() => rxPrefill?.dci || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [dose, setDose] = useState(() => rxPrefill?.dose || "");
  const [frequence, setFrequence] = useState(() => rxPrefill?.frequence || "");
  const [duree, setDuree] = useState("");
  const [indication, setIndication] = useState(() => rxPrefill?.indication || "");
  const [dateDebut, setDateDebut] = useState(() => rxPrefill?.dateDebut || todayISO());

  // Suivi
  const [monitoringOn, setMonitoringOn] = useState(true);
  const [protocolType, setProtocolType] = useState<ProtocolType>("standard");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [contactMethod, setContactMethod] = useState<"email" | "sms" | "both">("email");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTel, setContactTel] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<PrescriptionOut | null>(null);

  function handleDciChange(v: string) {
    setDci(v);
    // Suggestion automatique du protocole intensif pour les molécules à haut risque
    if (v && isHighRisk(v)) setProtocolType((p) => (p === "custom" ? p : "intensif"));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await autocomplete(v);
      setSuggestions(res);
      setShowSuggestions(true);
    }, 300);
  }

  function toggleCustomDay(d: number) {
    setCustomDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort((a, b) => a - b)));
  }

  function protocolDays(): number[] {
    if (protocolType === "standard") return STANDARD_DAYS;
    if (protocolType === "intensif") return INTENSIVE_DAYS;
    return customDays;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!initiales.trim() || !dci.trim() || !dateDebut) {
      setError("Merci de renseigner au minimum les initiales du patient, le médicament et la date de début.");
      return;
    }
    if (monitoringOn && protocolType === "custom" && customDays.length === 0) {
      setError("Sélectionnez au moins une date de check-in pour le protocole personnalisé.");
      return;
    }
    if (monitoringOn && (contactMethod === "email" || contactMethod === "both") && !contactEmail.trim()) {
      setError("Merci de renseigner l'email du patient pour activer le suivi par email.");
      return;
    }
    if (monitoringOn && (contactMethod === "sms" || contactMethod === "both") && !contactTel.trim()) {
      setError("Merci de renseigner le numéro de téléphone du patient pour activer le suivi par SMS/WhatsApp.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient_initiales: initiales.trim().toUpperCase(),
        patient_age: age || undefined,
        patient_sexe: sexe || undefined,
        drug_dci: dci.trim(),
        drug_dose: dose || undefined,
        drug_frequence: frequence || undefined,
        drug_duree: duree || undefined,
        indication: indication || undefined,
        date_debut: dateDebut,
        monitoring_active: monitoringOn,
        protocol_type: monitoringOn ? protocolType : undefined,
        protocol_days: monitoringOn ? protocolDays() : undefined,
        contact_method: monitoringOn ? contactMethod : undefined,
        contact_email: monitoringOn && (contactMethod === "email" || contactMethod === "both") ? contactEmail.trim() : undefined,
        contact_tel: monitoringOn && (contactMethod === "sms" || contactMethod === "both") ? contactTel.trim() : undefined,
      };
      const result = await api.createPrescription(payload);
      setCreated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de la prescription");
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return <PrescriptionSuccess prescription={created} doctorName={`${user?.prenom || ""} ${user?.nom || ""}`.trim()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/medecin" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
          <span className="font-semibold text-gray-900">Nouvelle prescription</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">🩺 Nouvelle prescription &amp; suivi pharmacovigilance</h1>
          <p className="text-gray-500 text-sm mt-1">
            Activez un protocole de surveillance active : votre patient recevra des check-ins automatiques,
            et vous serez alerté immédiatement en cas de signal.
          </p>
        </div>

        {rxPrefill && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg px-4 py-3 mb-5">
            📄 Champs pré-remplis depuis votre ordonnance. Vérifiez les informations puis activez le suivi.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient */}
          <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 text-sm">🧑 Patient (anonymisé)</h2>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Initiales" hint="Ex : A.B.">
                <input value={initiales} onChange={(e) => setInitiales(e.target.value)} placeholder="A.B." className={inputCls} maxLength={10} />
              </Field>
              <Field label="Âge">
                <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ex : 54" className={inputCls} />
              </Field>
              <Field label="Sexe">
                <select value={sexe} onChange={(e) => setSexe(e.target.value)} className={inputCls}>
                  <option value="">—</option>
                  <option value="F">Féminin</option>
                  <option value="M">Masculin</option>
                </select>
              </Field>
            </div>
            <p className="text-xs text-gray-400">
              Le nom complet du patient n&apos;est jamais demandé ni stocké — seules les initiales sont conservées.
            </p>
          </section>

          {/* Médicament */}
          <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 text-sm">💊 Médicament prescrit</h2>
            <div className="relative">
              <Field label="DCI">
                <input
                  value={dci}
                  onChange={(e) => handleDciChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Ex : pembrolizumab, métformine..."
                  className={inputCls}
                  autoComplete="off"
                />
              </Field>
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onMouseDown={() => { setDci(s.dci); setShowSuggestions(false); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-800">{s.dci}</span>
                        {s.brand && <span className="text-xs text-gray-400">{s.brand}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {dci && isHighRisk(dci) && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚡ Cette molécule appartient à une classe à haut risque (immunothérapie / chimiothérapie / biothérapie) —
                le protocole de suivi intensif est suggéré par défaut.
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Dose"><input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="Ex : 200 mg" className={inputCls} /></Field>
              <Field label="Fréquence"><input value={frequence} onChange={(e) => setFrequence(e.target.value)} placeholder="Ex : 1x / 3 semaines" className={inputCls} /></Field>
              <Field label="Durée"><input value={duree} onChange={(e) => setDuree(e.target.value)} placeholder="Ex : 6 mois" className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Indication thérapeutique"><input value={indication} onChange={(e) => setIndication(e.target.value)} placeholder="Ex : carcinome bronchique" className={inputCls} /></Field>
              <Field label="Date de début"><input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className={inputCls} /></Field>
            </div>
          </section>

          {/* Suivi pharmacovigilance */}
          <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">🛰️ Suivi pharmacovigilance actif</h2>
                <p className="text-xs text-gray-400 mt-0.5">Le patient recevra des check-ins automatiques par SMS/email.</p>
              </div>
              <button
                type="button"
                onClick={() => setMonitoringOn((v) => !v)}
                className={`relative w-12 h-7 rounded-full transition-colors ${monitoringOn ? "bg-emerald-600" : "bg-gray-300"}`}
                aria-pressed={monitoringOn}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${monitoringOn ? "translate-x-5" : ""}`} />
              </button>
            </div>

            {monitoringOn && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Protocole de suivi</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {([
                      { val: "standard", label: "Standard", desc: "J3 · J7 · J14 · J30 · J60 · J90" },
                      { val: "intensif", label: "Intensif", desc: "Immunothérapie / chimio / biothérapies — 10 check-ins" },
                      { val: "custom", label: "Personnalisé", desc: "Choisissez vos propres dates" },
                    ] as { val: ProtocolType; label: string; desc: string }[]).map((p) => (
                      <button
                        type="button"
                        key={p.val}
                        onClick={() => setProtocolType(p.val)}
                        className={`text-left border rounded-xl px-3 py-2.5 transition-colors ${protocolType === p.val ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className="text-sm font-semibold text-gray-900">{p.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {protocolType === "standard" && (
                  <ProtocolPreview days={STANDARD_DAYS} />
                )}
                {protocolType === "intensif" && (
                  <ProtocolPreview days={INTENSIVE_DAYS} />
                )}
                {protocolType === "custom" && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Sélectionnez les jours de check-in (J+X depuis le début du traitement) :</p>
                    <div className="flex flex-wrap gap-2">
                      {CUSTOM_CANDIDATE_DAYS.map((d) => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => toggleCustomDay(d)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${customDays.includes(d) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-300 hover:border-emerald-400"}`}
                        >
                          J+{d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de contact du patient</label>
                  <div className="flex gap-2 mb-3">
                    {([
                      { val: "email", label: "📧 Email" },
                      { val: "sms", label: "📱 SMS / WhatsApp" },
                      { val: "both", label: "Les deux" },
                    ] as { val: "email" | "sms" | "both"; label: string }[]).map((m) => (
                      <button
                        type="button"
                        key={m.val}
                        onClick={() => setContactMethod(m.val)}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${contactMethod === m.val ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-300 hover:border-emerald-400"}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(contactMethod === "email" || contactMethod === "both") && (
                      <Field label="Email du patient">
                        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="patient@email.com" className={inputCls} />
                      </Field>
                    )}
                    {(contactMethod === "sms" || contactMethod === "both") && (
                      <Field label="Téléphone (SMS / WhatsApp)">
                        <input value={contactTel} onChange={(e) => setContactTel(e.target.value)} placeholder="+212 6XX XXX XXX" className={inputCls} />
                      </Field>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    🔒 Les coordonnées patient sont chiffrées et ne sont jamais associées à leur identité civile dans notre base de données.
                  </p>
                </div>
              </>
            )}
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? "Création..." : "Créer la prescription" + (monitoringOn ? " et activer le suivi" : "")}
          </button>
        </form>
      </main>
    </div>
  );
}

function ProtocolPreview({ days }: { days: number[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {days.map((d) => (
        <span key={d} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
          J+{d}
        </span>
      ))}
    </div>
  );
}

function PrescriptionSuccess({ prescription, doctorName }: { prescription: PrescriptionOut; doctorName: string }) {
  const router = useRouter();
  const checkinUrl = typeof window !== "undefined" ? `${window.location.origin}/suivi/${prescription.access_token}` : "";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkinUrl)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center mb-5">
          <div className="text-4xl mb-3">✅</div>
          <h1 className="text-xl font-bold text-gray-900">Prescription créée</h1>
          <p className="text-gray-500 text-sm mt-1">
            {prescription.monitoring_active
              ? `Le suivi pharmacovigilance (protocole ${prescription.protocol_type}) est activé pour le patient ${prescription.patient_initiales}.`
              : `Prescription enregistrée pour le patient ${prescription.patient_initiales} (suivi non activé).`}
          </p>
        </div>

        <div id="prescription-pdf" className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">PV</span>
            </div>
            <div>
              <div className="font-bold text-gray-900">PharmaVig Maroc</div>
              <div className="text-xs text-gray-400">Ordonnance de suivi pharmacovigilance</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Row label="Médecin" value={doctorName || "—"} />
            <Row label="Date" value={new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} />
            <Row label="Patient" value={`${prescription.patient_initiales}${prescription.patient_age ? `, ${prescription.patient_age} ans` : ""}`} />
            <Row label="Médicament" value={`${prescription.drug_dci}${prescription.drug_dose ? ` — ${prescription.drug_dose}` : ""}`} />
            <Row label="Fréquence" value={prescription.drug_frequence || "—"} />
            <Row label="Durée" value={prescription.drug_duree || "—"} />
            <Row label="Indication" value={prescription.indication || "—"} />
            <Row label="Début du traitement" value={new Date(prescription.date_debut).toLocaleDateString("fr-FR")} />
            <Row label="Suivi pharmacovigilance" value={prescription.monitoring_active ? `Oui — protocole ${prescription.protocol_type}` : "Non"} />
          </div>

          {prescription.monitoring_active && (
            <div className="border-t border-gray-100 pt-4 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR code de suivi patient" className="w-28 h-28 rounded-lg border border-gray-200" />
              <div>
                <p className="text-sm font-medium text-gray-800">Lien de suivi du patient</p>
                <p className="text-xs text-gray-400 mt-1 break-all">{checkinUrl}</p>
                <p className="text-xs text-gray-400 mt-1">À scanner ou transmettre au patient pour démarrer le suivi.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            🖨️ Générer / imprimer le PDF
          </button>
          <button
            onClick={() => router.push("/dashboard/medecin/surveillance")}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Voir la surveillance active →
          </button>
        </div>

        <style jsx global>{`
          @media print {
            body * { visibility: hidden; }
            #prescription-pdf, #prescription-pdf * { visibility: visible; }
            #prescription-pdf { position: absolute; top: 0; left: 0; width: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  );
}
