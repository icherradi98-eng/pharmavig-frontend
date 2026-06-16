import { type PrescriptionOut, type CheckInOut } from "@/lib/api";

export function SignalsList({
  signals,
  prescriptions,
  checkinMap,
  onMarkSeen,
  onDeclare,
}: {
  signals: CheckInOut[];
  prescriptions: PrescriptionOut[];
  checkinMap: Record<string, CheckInOut[]>;
  onMarkSeen: (sigId: string) => void;
  onDeclare: (rx: PrescriptionOut, sig: CheckInOut) => void;
}) {
  if (signals.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <h2 className="text-sm font-bold text-gray-800">
          {signals.length} signal{signals.length > 1 ? "s" : ""} patient{signals.length > 1 ? "s" : ""} en attente
        </h2>
      </div>
      <div className="space-y-2">
        {signals.map((sig) => {
          // Retrouver la prescription parente
          const rx = prescriptions.find((p) =>
            (checkinMap[p.id] ?? []).some((c) => c.id === sig.id)
          );
          const urgent = sig.severity === "urgent";
          return (
            <div key={sig.id}
              className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${urgent ? "border-red-300 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {urgent && (
                    <span className="text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">
                      Urgent
                    </span>
                  )}
                  <span className="font-semibold text-gray-900 text-sm">
                    {rx ? `${rx.patient_initiales} — ${rx.drug_dci}` : "Patient"}
                  </span>
                  <span className="text-xs text-gray-500">
                    J{sig.day_offset} · {sig.responded_at ? new Date(sig.responded_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {(sig.symptoms && sig.symptoms.length) ? sig.symptoms.join(", ") : (sig.symptoms_other || "Symptômes signalés")}
                </p>
                {sig.stopped_treatment && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    ⚠️ Traitement arrêté{sig.stop_reason ? ` — ${sig.stop_reason}` : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onMarkSeen(sig.id)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline whitespace-nowrap"
                >
                  Marquer vu
                </button>
                {rx && (
                  <button
                    onClick={() => onDeclare(rx, sig)}
                    className="text-xs font-semibold px-3 py-2 rounded-lg text-white whitespace-nowrap transition-colors"
                    style={{ background: "#0F5B57" }}
                  >
                    Évaluer et déclarer ⚡
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
