"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MedecinLayout, { PageHeader, SectionCard, useUnreadAlertsCount } from "@/components/medecin/MedecinLayout";
import { useAuth } from "@/context/AuthContext";
import { api, type PrescriptionOut, type CheckInOut, type ProtocolType } from "@/lib/api";

const PREFILL_KEY = "pharmavig_prefill_declaration";

const PROTOCOL_LABELS: Record<ProtocolType, string> = {
  standard: "Standard",
  intensif: "Intensif",
  custom: "Personnalisé",
};

// Mappage symptôme → SOC MedDRA (miroir simplifié de la table backend SYMPTOM_TO_SOC)
const SYMPTOM_TO_SOC: Record<string, string> = {
  "Boutons": "Peau et tissu sous-cutané",
  "Rougeurs": "Peau et tissu sous-cutané",
  "Démangeaisons": "Peau et tissu sous-cutané",
  "Gonflement": "Peau et tissu sous-cutané",
  "Essoufflement": "Respiratoire",
  "Toux": "Respiratoire",
  "Douleur thoracique": "Cardiac disorders",
  "Palpitations": "Cardiac disorders",
  "Nausées": "Gastro-intestinal",
  "Vomissements": "Gastro-intestinal",
  "Diarrhée": "Gastro-intestinal",
  "Douleur abdominale": "Gastro-intestinal",
  "Douleurs musculaires": "Musculosquelettique",
  "Faiblesse": "Musculosquelettique",
  "Maux de tête": "Système nerveux",
  "Vertiges": "Système nerveux",
  "Confusion": "Psychiatrie",
  "Fatigue": "Général",
  "Fièvre": "Général",
  "Perte d'appétit": "Général",
};

function formatDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return d;
  }
}

function daysBetween(a: string, b: Date) {
  const start = new Date(a);
  const diff = Math.round((b.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function lastCheckin(checkins: CheckInOut[]): CheckInOut | null {
  const responded = checkins.filter((c) => c.status === "repondu" && c.responded_at);
  if (!responded.length) return null;
  return responded.sort((a, b) => new Date(b.responded_at!).getTime() - new Date(a.responded_at!).getTime())[0];
}

function nextCheckin(checkins: CheckInOut[]): CheckInOut | null {
  const pending = checkins.filter((c) => c.status === "pending" || c.status === "rappel_envoye");
  if (!pending.length) return null;
  return pending.sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())[0];
}

export default function SurveillanceActive() {
  const unread = useUnreadAlertsCount(0);
  const { user } = useAuth();
  const router = useRouter();

  const [prescriptions, setPrescriptions] = useState<PrescriptionOut[]>([]);
  const [details, setDetails] = useState<Record<string, CheckInOut[]>>({});
  const [signals, setSignals] = useState<CheckInOut[]>([]);
  const [signalRx, setSignalRx] = useState<Record<string, PrescriptionOut>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.listPrescriptions(), api.listActiveSignals()])
      .then(async ([rx, sig]) => {
        if (cancelled) return;
        setPrescriptions(rx);
        setSignals(sig);

        // Charger les check-ins de chaque prescription pour la colonne "dernier / prochain check-in"
        const detailEntries = await Promise.all(
          rx.map(async (p) => {
            try {
              const d = await api.getPrescription(p.id);
              return [p.id, d.checkins] as [string, CheckInOut[]];
            } catch {
              return [p.id, [] as CheckInOut[]] as [string, CheckInOut[]];
            }
          })
        );
        if (cancelled) return;
        const map: Record<string, CheckInOut[]> = {};
        detailEntries.forEach(([id, checkins]) => { map[id] = checkins; });
        setDetails(map);

        // Associer chaque signal à sa prescription (pour affichage + pré-remplissage)
        const rxMap: Record<string, PrescriptionOut> = {};
        rx.forEach((p) => { rxMap[p.id] = p; });
        const sigRxMap: Record<string, PrescriptionOut> = {};
        sig.forEach((s) => {
          const owner = rx.find((p) => (map[p.id] || []).some((c) => c.id === s.id));
          if (owner) sigRxMap[s.id] = owner;
        });
        setSignalRx(sigRxMap);
      })
      .catch((e) => setError(e.message))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const active = useMemo(() => prescriptions.filter((p) => p.monitoring_active && !p.monitoring_ended), [prescriptions]);

  function buildPrefill(prescription: PrescriptionOut, checkin: CheckInOut) {
    const symptoms = checkin.symptoms || [];
    const dateDebut = prescription.date_debut;
    const checkinDate = checkin.responded_at ? new Date(checkin.responded_at) : new Date();
    const delaiJours = dateDebut ? daysBetween(dateDebut, checkinDate) : null;

    let imputChronologie = "";
    if (delaiJours !== null) {
      imputChronologie = delaiJours <= 7 ? "Très compatible" : "Compatible";
    }

    const symptomsList = symptoms.length ? symptoms.join(", ") : (checkin.symptoms_other || "des symptômes non précisés");
    const eiDescription = `Le patient signale : ${symptomsList}${checkin.symptoms_other ? ` (${checkin.symptoms_other})` : ""}, apparaissant à J${checkin.day_offset ?? "?"} du traitement par ${prescription.drug_dci}.${delaiJours !== null ? ` (soit environ ${delaiJours} jour${delaiJours > 1 ? "s" : ""} après le début du traitement)` : ""}`;

    let eiMeddraSoc = "";
    for (const s of symptoms) {
      if (SYMPTOM_TO_SOC[s]) { eiMeddraSoc = SYMPTOM_TO_SOC[s]; break; }
    }

    const prefill: Record<string, unknown> = {
      declarantNom: user?.nom || "",
      declarantPrenom: user?.prenom || "",
      declarantSpecialite: user?.specialite || "",
      declarantEmail: user?.email || "",

      patientAge: prescription.patient_age || "",
      patientSexe: prescription.patient_sexe || "",

      medicamentDCI: prescription.drug_dci || "",
      medicamentPosologie: prescription.drug_dose || "",
      medicamentFrequence: prescription.drug_frequence || "",
      medicamentIndication: prescription.indication || "",
      medicamentDateDebut: prescription.date_debut || "",

      eiDescription,
      eiMeddraSoc,
      eiDateDebut: checkin.responded_at ? checkin.responded_at.slice(0, 10) : "",

      imputChronologie,
      imputDelaiApparition: delaiJours !== null ? `${delaiJours} jour${delaiJours > 1 ? "s" : ""}` : "",
    };

    sessionStorage.setItem(PREFILL_KEY, JSON.stringify(prefill));
    router.push("/dashboard/medecin/nouvelle-declaration");
  }

  return (
    <MedecinLayout unreadAlerts={unread}>
      <PageHeader
        title="Surveillance active des patients"
        subtitle="Suivez automatiquement vos patients après prescription et soyez alerté au moindre signal."
      />

      <div className="px-5 md:px-8 py-6 space-y-6">
        <div className="flex items-center justify-end">
          <Link href="/prescriptions/nouvelle"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
            + Nouvelle prescription suivie
          </Link>
        </div>

        {loading && <div className="text-center py-16 text-gray-400 text-sm">Chargement...</div>}

        {!loading && error && (
          <div className="text-center py-16 border-2 border-dashed border-red-200 rounded-2xl bg-white text-red-500 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Signaux patients actifs */}
            <SectionCard title={`🔔 Signaux patients actifs ${signals.length ? `(${signals.length})` : ""}`}>
              {signals.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">Aucun signal pour le moment — vos patients sous surveillance n&apos;ont rien signalé d&apos;inhabituel.</p>
              ) : (
                <div className="space-y-3">
                  {signals.map((s) => {
                    const rx = signalRx[s.id];
                    const urgent = s.severity === "urgent";
                    return (
                      <div key={s.id} className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 ${urgent ? "border-red-300 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {urgent && <span className="text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">Urgent</span>}
                            <span className="font-semibold text-gray-900 text-sm">
                              {rx ? `${rx.patient_initiales} — ${rx.drug_dci}` : "Patient"}
                            </span>
                            <span className="text-xs text-gray-500">J{s.day_offset} · {formatDate(s.responded_at)}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {(s.symptoms && s.symptoms.length) ? s.symptoms.join(", ") : (s.symptoms_other || "Symptômes signalés")}
                          </p>
                          {s.stopped_treatment && (
                            <p className="text-xs text-red-600 font-medium mt-1">⚠️ Le patient a arrêté le traitement{s.stop_reason ? ` — ${s.stop_reason}` : ""}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => api.markCheckinSeen(s.id).then(() => setSignals((prev) => prev.filter((x) => x.id !== s.id)))}
                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                          >
                            Marquer comme vu
                          </button>
                          {rx && (
                            <button
                              onClick={() => buildPrefill(rx, s)}
                              className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap"
                            >
                              Évaluer et déclarer →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Patients sous surveillance */}
            <SectionCard title={`Mes patients sous surveillance active ${active.length ? `(${active.length})` : ""}`}>
              {active.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">
                  Aucun patient sous surveillance pour le moment. Activez le suivi lors de la création d&apos;une prescription pour commencer.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="py-2 pr-4">Patient</th>
                        <th className="py-2 pr-4">Médicament</th>
                        <th className="py-2 pr-4">Début traitement</th>
                        <th className="py-2 pr-4">Protocole</th>
                        <th className="py-2 pr-4">Dernier check-in</th>
                        <th className="py-2 pr-4">Prochain check-in</th>
                        <th className="py-2 pr-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {active.map((p) => {
                        const checkins = details[p.id] || [];
                        const last = lastCheckin(checkins);
                        const next = nextCheckin(checkins);
                        return (
                          <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="py-3 pr-4 font-medium text-gray-900">{p.patient_initiales}</td>
                            <td className="py-3 pr-4 text-gray-700">{p.drug_dci}</td>
                            <td className="py-3 pr-4 text-gray-500">{formatDate(p.date_debut)}</td>
                            <td className="py-3 pr-4">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {p.protocol_type ? PROTOCOL_LABELS[p.protocol_type] : "—"}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              {last ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="text-gray-500 text-xs">{formatDate(last.responded_at)}</span>
                                  {last.has_symptoms ? (
                                    <span className="text-amber-600 text-xs font-medium">⚠️ Signal</span>
                                  ) : (
                                    <span className="text-emerald-600 text-xs font-medium">✅ RAS</span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xs">Aucun encore</span>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-gray-500 text-xs">
                              {next ? formatDate(next.scheduled_date) : "—"}
                            </td>
                            <td className="py-3 pr-4 text-right text-xs text-gray-300">
                              {p.access_token && (
                                <span title="Lien de suivi patient">🔗</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </>
        )}
      </div>
    </MedecinLayout>
  );
}
