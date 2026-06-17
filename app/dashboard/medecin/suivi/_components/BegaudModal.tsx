import { type PrescriptionOut } from "@/lib/api";
import ImputabiliteBegaud, { type ImputScore } from "../../nouvelle-declaration/ImputabiliteBegaud";
import { useModalClose } from "@/lib/useModalClose";

export function BegaudModal({
  rx,
  score,
  onScoreChange,
  onClose,
  onDeclare,
}: {
  rx: PrescriptionOut;
  score: ImputScore | null;
  onScoreChange: (score: ImputScore) => void;
  onClose: () => void;
  onDeclare: (score: ImputScore) => void;
}) {
  const dialogRef = useModalClose(onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,91,87,0.25)", backdropFilter: "blur(4px)" }}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Calcul d'imputabilité Bégaud" className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto outline-none">
        {/* En-tête modal */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <p className="font-bold text-gray-900 text-sm">
              🔬 Imputabilité Bégaud — {rx.patient_initiales}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {rx.drug_dci}{rx.drug_dose ? ` ${rx.drug_dose}` : ""}
              {rx.indication ? ` · ${rx.indication}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Corps : calculateur Bégaud */}
        <div className="px-6 py-4">
          <ImputabiliteBegaud
            onScoreChange={onScoreChange}
          />
        </div>

        {/* Pied : score + CTA */}
        {score && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-4 rounded-b-2xl">
            <div className="flex gap-3">
              {(["Cscore", "Sscore", "Iscore"] as const).map((k) => (
                <div key={k} className="text-center bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
                  <div className="text-lg font-bold text-violet-700">
                    {k === "Iscore" ? `I${score[k]}` : score[k]}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase">{k.replace("score", "")}</div>
                </div>
              ))}
              {score.isGrave && (
                <div className="text-center bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <div className="text-lg font-bold text-red-600">G</div>
                  <div className="text-[10px] text-gray-400 uppercase">Grave</div>
                </div>
              )}
            </div>
            <button
              onClick={() => onDeclare(score)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-colors"
              style={{ background: "#0F5B57" }}
            >
              ⚡ Déclarer avec ce score
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
