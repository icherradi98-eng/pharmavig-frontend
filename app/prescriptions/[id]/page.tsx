"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, type PrescriptionDetail, type CheckInOut } from "@/lib/api";
import {
  formatDate, daysSince, getPatientStatus, STATUS_CONFIG, writeSignalPrefill,
} from "@/app/dashboard/medecin/suivi/_components/helpers";

const CHECKIN_STATUS: Record<string, { label: string; cls: string }> = {
  repondu:       { label: "Répondu",      cls: "bg-petrol/10 text-petrol border border-petrol/30" },
  pending:       { label: "En attente",   cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  rappel_envoye: { label: "Rappel envoyé", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  expire:        { label: "Expiré",       cls: "bg-gray-100 text-gray-500 border border-gray-200" },
};

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<PrescriptionDetail | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getPrescription(id)
      .then(setDetail)
      .catch((e) => { setDetail(null); setError(e instanceof Error ? e.message : "Erreur de chargement."); });
  }, [id]);

  const checkins = useMemo(
    () => (detail?.checkins ?? []).slice().sort((a, b) => a.day_offset - b.day_offset),
    [detail]
  );
  const status = detail ? getPatientStatus(detail, checkins) : "en_attente";
  const alertSignal = useMemo(() => {
    const alerts = checkins.filter((c) => c.status === "repondu" && (c.severity === "urgent" || c.has_symptoms));
    return alerts.sort((a, b) => {
      const sev = (b.severity === "urgent" ? 1 : 0) - (a.severity === "urgent" ? 1 : 0);
      if (sev !== 0) return sev;
      return new Date(b.responded_at ?? 0).getTime() - new Date(a.responded_at ?? 0).getTime();
    })[0];
  }, [checkins]);

  function copyLink() {
    if (!detail) return;
    navigator.clipboard?.writeText(`${window.location.origin}/suivi/${detail.access_token}`)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  }
  function declare() {
    if (!detail || !alertSignal) return;
    writeSignalPrefill(detail, alertSignal);
    router.push("/dashboard/medecin/nouvelle-declaration");
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <span className="font-bold text-lg text-petrol">MAI DAWA — Suivi patient</span>
        <Link href="/dashboard/medecin/suivi" className="text-sm font-medium text-gray-600 hover:text-petrol">← Tous les patients</Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 md:px-8 py-8">
        {detail === undefined && (
          <div className="text-center py-20 text-gray-400 text-sm">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-petrol rounded-full animate-spin mx-auto mb-3" />
            Chargement de la fiche patient…
          </div>
        )}

        {detail === null && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <p className="text-night font-semibold">Fiche indisponible</p>
            <p className="text-sm text-gray-500 mt-1">{error || "Connectez-vous en tant que médecin pour accéder à cette fiche."}</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/login?redirect=/dashboard/medecin/suivi" className="text-sm font-semibold text-petrol border border-petrol/20 bg-petrol/5 px-4 py-2 rounded-lg hover:bg-petrol/10">Se connecter</Link>
              <Link href="/dashboard/medecin/suivi" className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">Retour au suivi</Link>
            </div>
          </div>
        )}

        {detail && (
          <>
            {/* Carte patient */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0 text-white"
                  style={{ background: status === "alerte" ? "#ef4444" : status === "en_attente" ? "#f59e0b" : status === "repondu" ? "#2FA88F" : "#9ca3af" }}>
                  {detail.patient_initiales?.slice(0, 2).toUpperCase() ?? "??"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-night">{detail.patient_initiales}</h1>
                    {detail.patient_age && <span className="text-sm text-gray-400">{detail.patient_age} ans</span>}
                    {detail.patient_sexe && <span className="text-sm text-gray-400">· {detail.patient_sexe}</span>}
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CONFIG[status].badge}`}>
                      {STATUS_CONFIG[status].icon} {STATUS_CONFIG[status].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    {detail.drug_dci}{detail.drug_dose ? ` ${detail.drug_dose}` : ""}{detail.drug_frequence ? ` · ${detail.drug_frequence}` : ""}
                  </p>
                  {detail.indication && <p className="text-xs text-gray-500 mt-0.5">Indication : {detail.indication}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">
                    Début {formatDate(detail.date_debut)} ({daysSince(detail.date_debut)} j) · {detail.monitoring_ended ? "Suivi terminé" : "Suivi actif"}
                    {detail.monitoring_ended && detail.monitoring_end_reason ? ` (${detail.monitoring_end_reason})` : ""}
                  </p>
                  {(detail.contact_email || detail.contact_tel) && (
                    <p className="text-xs text-gray-400 mt-0.5">Contact : {[detail.contact_email, detail.contact_tel].filter(Boolean).join(" · ")}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                {!detail.monitoring_ended && (
                  <button onClick={copyLink} className="text-sm font-semibold px-4 py-2 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors">
                    {copied ? "✓ Lien copié" : "🔗 Copier le lien questionnaire"}
                  </button>
                )}
                {alertSignal && (
                  <button onClick={declare} className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors" style={{ background: "#0F5B57" }}>
                    Déclarer un effet (pré-rempli) ⚡
                  </button>
                )}
              </div>
            </div>

            {/* Timeline des check-ins */}
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3 px-1">Calendrier de suivi</p>
            {checkins.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-400">
                Aucun check-in programmé pour cette prescription.
              </div>
            ) : (
              <ol className="space-y-3">
                {checkins.map((c) => <CheckinCard key={c.id} c={c} />)}
              </ol>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function CheckinCard({ c }: { c: CheckInOut }) {
  const st = CHECKIN_STATUS[c.status] ?? CHECKIN_STATUS.pending;
  const isAlert = c.status === "repondu" && (c.severity === "urgent" || c.has_symptoms);
  return (
    <li className="bg-white rounded-xl border p-4" style={{ borderColor: isAlert ? "#f3c6c2" : "#e5e7eb" }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-night text-sm">J+{c.day_offset}</span>
          <span className="text-xs text-gray-400">prévu {formatDate(c.scheduled_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          {c.severity === "urgent" && <span className="text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">Urgent</span>}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
        </div>
      </div>

      {c.status === "repondu" && (
        <div className="mt-2.5 text-sm text-gray-700">
          {c.has_symptoms ? (
            <>
              {(c.symptoms?.length || c.symptoms_other) && (
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {(c.symptoms ?? []).map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">{s}</span>
                  ))}
                  {c.symptoms_other && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200">{c.symptoms_other}</span>}
                </div>
              )}
              {c.stopped_treatment && <p className="text-xs text-red-600 font-semibold">⚠️ Traitement arrêté{c.stop_reason ? ` — ${c.stop_reason}` : ""}</p>}
              {c.photo_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={c.photo_url} alt="Photo jointe" className="mt-2 h-24 w-auto rounded-lg border border-gray-200 object-contain" />
              )}
            </>
          ) : (
            <p className="text-petrol text-sm">✓ Aucun symptôme signalé</p>
          )}
          {c.responded_at && <p className="text-[11px] text-gray-400 mt-1.5">Répondu le {formatDate(c.responded_at)}</p>}
        </div>
      )}
    </li>
  );
}
