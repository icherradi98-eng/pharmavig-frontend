"use client";

import { type FormData } from "@/lib/declaration/types";
import { SectionTitle } from "./FormPrimitives";
import ImputabiliteBegaud, { type ImputScore } from "../ImputabiliteBegaud";

function autoFillBegaud(
  medicamentDateDebut: string,
  eiDateDebut: string,
  eiEvolution: string
): Record<string, string> | null {
  if (!medicamentDateDebut || !eiDateDebut) return null;
  const tStart = new Date(medicamentDateDebut).getTime();
  const tEI    = new Date(eiDateDebut).getTime();
  if (isNaN(tStart) || isNaN(tEI)) return null;
  const diffDays = Math.round((tEI - tStart) / (1000 * 60 * 60 * 24));
  let c1: string;
  if (diffDays < 0)         c1 = "incompatible";
  else if (diffDays <= 7)   c1 = "tres_compatible";
  else if (diffDays <= 30)  c1 = "compatible";
  else if (diffDays <= 365) c1 = "nr";
  else                      c1 = "incompatible";
  let c2: string;
  const ev = (eiEvolution || "").toLowerCase();
  if (ev.includes("résolu") || ev.includes("résolution") || ev.includes("guéri") || ev.includes("amélioration") || ev.includes("amélio") || ev.includes("décès") || ev.includes("deces") || ev.includes("fatal")) {
    c2 = "favorable";
  } else {
    c2 = "inconnu";
  }
  return { c1, c2 };
}

type Props = {
  form: FormData;
  imputScore: ImputScore | null;
  begaudOpen: boolean;
  begaudInitial: Record<string, string> | undefined;
  setBegaudOpen: (v: boolean) => void;
  setBegaudInitial: (v: Record<string, string>) => void;
  setImputScore: (score: ImputScore) => void;
};

export function Section5Imputabilite({ form, imputScore, begaudOpen, begaudInitial, setBegaudOpen, setBegaudInitial, setImputScore }: Props) {
  const c1Label: Record<string, string> = {
    tres_compatible: "Très compatible (0–7 j)",
    compatible:      "Compatible (8–30 j)",
    nr:              "Douteux (> 30 j)",
    incompatible:    "Incompatible",
  };
  const c2Label: Record<string, string> = {
    favorable: "Favorable",
    inconnu:   "Inconnu / non évalué",
  };

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Imputabilité médicamenteuse"
        subtitle="Méthode française (BÉGAUD) — évaluation du lien de causalité entre le médicament et l'EIM."
      />

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setBegaudOpen(!begaudOpen)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">🔬</span>
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 text-sm">Questionnaire Bégaud</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Optionnel</span>
                {imputScore && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-[#0F5B57]" style={{ background: "rgba(15,91,87,0.1)" }}>
                    ✅ Score I{imputScore.Iscore} enregistré
                  </span>
                )}
                {begaudInitial && !imputScore && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    ✦ Pré-rempli automatiquement
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {imputScore
                  ? `Imputabilité ${["I0 — Exclu", "I1 — Douteux", "I2 — Plausible", "I3 — Probable", "I4 — Très probable"][imputScore.Iscore]}`
                  : "Evaluez le lien de causalité médicament → EIM (recommandé pour cas sérieux)"}
              </p>
            </div>
          </div>
          <span className="text-gray-400 text-lg">{begaudOpen ? "▲" : "▼"}</span>
        </button>

        {!begaudOpen && !imputScore && (() => {
          const suggestion = autoFillBegaud(form.medicamentDateDebut, form.eiDateDebut, form.eiEvolution);
          if (!suggestion) return null;
          return (
            <div className="mx-5 mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2">✦ Pré-calcul automatique disponible depuis les dates saisies</p>
              <div className="flex gap-4 text-xs text-blue-800 mb-3">
                <span><strong>Chronologie C :</strong> {c1Label[suggestion.c1] ?? suggestion.c1}</span>
                <span><strong>Évolution C2 :</strong> {c2Label[suggestion.c2] ?? suggestion.c2}</span>
              </div>
              <button
                type="button"
                onClick={() => { setBegaudInitial(suggestion); setBegaudOpen(true); }}
                className="text-xs font-semibold bg-blue-700 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Ouvrir le questionnaire pré-rempli →
              </button>
            </div>
          );
        })()}

        {begaudOpen && (
          <div className="border-t border-gray-100 px-5 pt-4 pb-5">
            {!begaudInitial && (() => {
              const suggestion = autoFillBegaud(form.medicamentDateDebut, form.eiDateDebut, form.eiEvolution);
              if (!suggestion) return null;
              return (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-blue-700">✦ Chronologie calculée depuis les dates — <strong>C1 suggéré</strong></p>
                  <button type="button" onClick={() => setBegaudInitial(suggestion)} className="text-xs font-semibold text-blue-700 border border-blue-300 bg-white px-3 py-1 rounded-lg hover:bg-blue-50">
                    Appliquer la suggestion
                  </button>
                </div>
              );
            })()}
            <ImputabiliteBegaud
              key={JSON.stringify(begaudInitial)}
              onScoreChange={(score) => setImputScore(score)}
              initialAnswers={begaudInitial}
            />
          </div>
        )}
      </div>

      {!imputScore && (
        <p className="text-xs text-center text-gray-400">
          L&apos;imputabilité est recommandée pour les cas sérieux mais n&apos;est pas obligatoire pour soumettre la déclaration.
        </p>
      )}
    </div>
  );
}
