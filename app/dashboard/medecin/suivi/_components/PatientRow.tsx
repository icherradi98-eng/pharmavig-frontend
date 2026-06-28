"use client";

import { useState } from "react";
import Link from "next/link";
import { type PrescriptionOut, type CheckInOut } from "@/lib/api";
import { formatDate, daysSince, daysUntil, type PatientStatus, STATUS_CONFIG } from "./helpers";

export function PatientRow({
  rx,
  checkins,
  status,
  onBegaud,
  onDeclareAlert,
}: {
  rx: PrescriptionOut;
  checkins: CheckInOut[];
  status: PatientStatus;
  onBegaud: () => void;
  onDeclareAlert: (signal: CheckInOut) => void;
}) {
  const cfg = STATUS_CONFIG[status];
  const [copied, setCopied] = useState(false);

  const lastReplied = [...checkins]
    .filter((c) => c.status === "repondu" && c.responded_at)
    .sort((a, b) => new Date(b.responded_at!).getTime() - new Date(a.responded_at!).getTime())[0];

  const nextPending = [...checkins]
    .filter((c) => c.status === "pending" || c.status === "rappel_envoye")
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())[0];

  const alertCheckins = checkins.filter(
    (c) => c.status === "repondu" && (c.severity === "urgent" || c.has_symptoms)
  );
  // Signal le plus pertinent pour pré-remplir une déclaration (urgent d'abord, puis le plus récent)
  const declarableSignal = [...alertCheckins].sort((a, b) => {
    const sev = (b.severity === "urgent" ? 1 : 0) - (a.severity === "urgent" ? 1 : 0);
    if (sev !== 0) return sev;
    return new Date(b.responded_at ?? 0).getTime() - new Date(a.responded_at ?? 0).getTime();
  })[0];

  const daysSinceStart = daysSince(rx.date_debut);

  function copyPatientLink() {
    const link = `${window.location.origin}/suivi/${rx.access_token}`;
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div className={`bg-white rounded-xl overflow-hidden ${cfg.row} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="px-5 py-4 flex items-center gap-4">

        {/* Avatar initiales */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white"
          style={{ background: status === "alerte" ? "#ef4444" : status === "en_attente" ? "#f59e0b" : status === "repondu" ? "#2FA88F" : "#9ca3af" }}>
          {rx.patient_initiales?.slice(0, 2).toUpperCase() ?? "??"}
        </div>

        {/* Infos patient */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-semibold text-gray-900 text-sm">{rx.patient_initiales}</span>
            {rx.patient_age && <span className="text-xs text-gray-400">{rx.patient_age} ans</span>}
            {rx.patient_sexe && <span className="text-xs text-gray-400">· {rx.patient_sexe}</span>}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {cfg.icon} {cfg.label}
            </span>
            {alertCheckins.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                ⚠️ {alertCheckins.length} signal{alertCheckins.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="font-medium text-gray-700">{rx.drug_dci}{rx.drug_dose ? ` ${rx.drug_dose}` : ""}</span>
            <span>·</span>
            <span>Début {formatDate(rx.date_debut)} ({daysSinceStart} j)</span>
            {nextPending && (
              <>
                <span>·</span>
                <span className="text-amber-600 font-medium">
                  Prochain check-in J+{nextPending.day_offset} ({
                    daysUntil(nextPending.scheduled_date) >= 0
                      ? `dans ${daysUntil(nextPending.scheduled_date)} j`
                      : `en retard de ${Math.abs(daysUntil(nextPending.scheduled_date))} j`
                  })
                </span>
              </>
            )}
            {lastReplied && !nextPending && (
              <>
                <span>·</span>
                <span className="text-petrol">Dernière réponse {formatDate(lastReplied.responded_at)}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Renvoyer le questionnaire au patient (copie du lien) */}
          {nextPending && (
            <button
              onClick={copyPatientLink}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
              title="Copier le lien du questionnaire à envoyer au patient"
            >
              {copied ? "✓ Lien copié" : "🔗 Lien patient"}
            </button>
          )}
          {/* Imputabilité Bégaud */}
          <button
            onClick={onBegaud}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-violet-300 text-violet-700 hover:bg-violet-50 transition-colors"
            title="Calculer l'imputabilité Bégaud pour ce patient"
          >
            🔬 Bégaud
          </button>
          {/* Lien vers détail prescription */}
          <Link
            href={`/prescriptions/${rx.id}`}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Voir fiche →
          </Link>
          {/* Déclarer si alerte — PRÉ-REMPLI depuis le signal patient */}
          {status === "alerte" && declarableSignal && (
            <button
              onClick={() => onDeclareAlert(declarableSignal)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors"
              style={{ background: "#0F5B57" }}
              title="Ouvrir une déclaration pré-remplie à partir de ce signal"
            >
              Déclarer ⚡
            </button>
          )}
        </div>
      </div>

      {/* Ligne de symptômes si alerte */}
      {alertCheckins.length > 0 && (
        <div className="bg-red-50 border-t border-red-100 px-5 py-2.5">
          <p className="text-xs text-red-700">
            <span className="font-semibold">Symptômes signalés :</span>{" "}
            {alertCheckins
              .flatMap((c) => [...(c.symptoms ?? []), c.symptoms_other].filter(Boolean) as string[])
              .join(", ") || "Voir détail dans la fiche"}
            {alertCheckins.some((c) => c.stopped_treatment) && (
              <span className="ml-2 font-bold">· Traitement arrêté</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
