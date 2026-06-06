"use client";

import { useState } from "react";

const GRAVE_CRITERIA = [
  { id: "deces", label: "Décès" },
  { id: "engage", label: "Mise en jeu du pronostic vital" },
  { id: "hospit", label: "Hospitalisation / prolongation" },
  { id: "incap", label: "Incapacité permanente" },
  { id: "cong", label: "Anomalie congénitale" },
  { id: "med_imp", label: "Intervention médicale importante" },
  { id: "non_grave", label: "Non grave" },
];

const I_LABELS = ["I0 — Exclu", "I1 — Douteux", "I2 — Plausible", "I3 — Probable", "I4 — Très probable"];
const I_BADGE = ["Exclu", "Douteux", "Plausible", "Probable", "Très probable"];
const I_EXPLAINER = [
  "Le médicament est exclu comme cause de l'effet.",
  "Lien médicament-effet peu probable. Déclaration facultative.",
  "Lien possible mais insuffisamment documenté. À surveiller.",
  "Lien probable — déclaration recommandée. Données exploitables pour la pharmacovigilance nationale.",
  "Lien très probable — déclaration obligatoire. Signal fort, qualité analytique maximale.",
];
const B_LABELS: Record<string, string> = {
  e1: "E1 — Non décrit dans la littérature",
  e2: "E2 — Cas isolés / case reports",
  e3: "E3 — Bien documenté (RCP, essais)",
};

type Answers = Record<string, string>;

function computeScore(answers: Answers, gravite: string[]) {
  const { c1 = "nr", c2 = "nr", c3 = "non_fait", s1 = "inconnu", s2 = "possible", s3 = "non", b1 = "e1" } = answers;

  let Cscore = 1;
  if (c1 === "incompatible") Cscore = 0;
  else if (c1 === "tres_compatible") Cscore = 3;
  else if (c1 === "compatible") Cscore = 2;
  if (c2 === "favorable" && Cscore > 0) Cscore = Math.min(3, Cscore + 1);
  if (c3 === "positif") Cscore = 3;
  if (c3 === "negatif" && Cscore > 1) Cscore = Cscore - 1;
  Cscore = Math.max(0, Math.min(3, Cscore));

  let Sscore = 1;
  if (s2 === "probable") Sscore = 1;
  else if (s2 === "possible") Sscore = 2;
  else if (s2 === "non") Sscore = 3;
  if (s1 === "connu" || s1 === "connu_rare") Sscore = Math.min(3, Sscore + 1);
  else if (s1 === "inconnu") Sscore = Math.max(1, Sscore - 1);
  if (s3 === "oui") Sscore = 3;
  Sscore = Math.max(1, Math.min(3, Sscore));

  let Iscore: number;
  if (Cscore === 0) {
    Iscore = 0;
  } else {
    const raw = Cscore + Sscore;
    if (raw >= 6) Iscore = 4;
    else if (raw >= 5) Iscore = 3;
    else if (raw >= 4) Iscore = 2;
    else Iscore = 1;
    if (c3 === "positif") Iscore = Math.min(4, Iscore + 1);
  }

  const isGrave = GRAVE_CRITERIA.filter((g) => g.id !== "non_grave").some((g) => gravite.includes(g.id));
  return { Cscore, Sscore, Iscore, Bscore: b1, isGrave };
}

function OptionButton({ label, sublabel, selected, onClick }: { label: string; sublabel?: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-2 text-sm rounded-lg border text-left transition-all ${selected ? "bg-blue-50 border-blue-500 text-blue-900 font-medium" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
      {label}
      {sublabel && <span className="block text-xs opacity-60 mt-0.5">{sublabel}</span>}
    </button>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-full border transition-all ${selected ? "bg-blue-50 border-blue-500 text-blue-900 font-medium" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
      {label}
    </button>
  );
}

function ScoreRow({ label, value, colorClass, explainer }: { label: string; value: string; colorClass: string; explainer?: string }) {
  const colors: Record<string, string> = {
    low: "bg-red-50 text-red-800 border border-red-200",
    mid: "bg-amber-50 text-amber-800 border border-amber-200",
    high: "bg-green-50 text-green-800 border border-green-200",
  };
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-sm text-gray-500 w-44 shrink-0">{label}</span>
      <span className={`text-xs font-medium px-3 py-1 rounded-md min-w-[120px] text-center ${colors[colorClass]}`}>{value}</span>
      {explainer && <span className="text-xs text-gray-400 flex-1">{explainer}</span>}
    </div>
  );
}

function BadgeFinal({ Iscore }: { Iscore: number }) {
  const styles = ["bg-red-100 text-red-800", "bg-amber-100 text-amber-800", "bg-gray-100 text-gray-700", "bg-blue-100 text-blue-800", "bg-green-100 text-green-800"];
  return <span className={`text-sm font-medium px-3 py-1 rounded-full ${styles[Iscore]}`}>{I_BADGE[Iscore]}</span>;
}

export type ImputScore = ReturnType<typeof computeScore>;

export default function ImputabiliteBegaud({ onScoreChange }: { onScoreChange?: (score: ImputScore) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [gravite, setGravite] = useState<string[]>([]);
  const [altCauses, setAltCauses] = useState<string[]>([]);

  const setAnswer = (q: string, v: string) => setAnswers((prev) => ({ ...prev, [q]: v }));
  const toggleGravite = (id: string) => setGravite((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAltCause = (v: string) => setAltCauses((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const goTo = (n: number) => {
    if (n === 3) { const result = computeScore(answers, gravite); onScoreChange?.(result); }
    setStep(n);
  };
  const reset = () => { setStep(0); setAnswers({}); setGravite([]); setAltCauses([]); };

  const score = step === 3 ? computeScore(answers, gravite) : null;
  const cColorClass = (c: number) => c === 0 ? "low" : c <= 1 ? "low" : c === 2 ? "mid" : "high";
  const sColorClass = (s: number) => s === 1 ? "low" : s === 2 ? "mid" : "high";
  const bColorClass = (b: string) => b === "e1" ? "low" : b === "e2" ? "mid" : "high";
  const cLabel = (c: number) => c === 0 ? "C — Exclu" : c === 1 ? "C1 — Incompatible" : c === 2 ? "C2 — Douteux" : "C3 — Plausible";
  const sLabel = (s: number) => s === 1 ? "S1 — Sémiologie faible" : s === 2 ? "S2 — Sémiologie possible" : "S3 — Compatible";

  return (
    <div className="w-full font-sans">
      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Imputabilité méthode Bégaud</span>
          <span>Étape {step + 1} sur 4</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full">
          <div className="h-1.5 bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      {/* STEP 0 — Chronologie */}
      {step === 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-full bg-blue-900 text-blue-100 flex items-center justify-center text-xs font-medium shrink-0">C</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Chronologie</p>
              <p className="text-xs text-gray-400">Relation temporelle médicament → effet</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2"><span className="font-medium text-gray-700">C1 —</span> Délai d&apos;apparition de l&apos;effet après la prise</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "tres_compatible", label: "Très compatible", sub: "ex. anaphylaxie <1h, rash <7j" },
                  { v: "compatible", label: "Compatible", sub: "délai plausible selon pharmacologie" },
                  { v: "incompatible", label: "Incompatible", sub: "délai trop court ou trop long" },
                  { v: "nr", label: "Non renseigné" },
                ].map((o) => <OptionButton key={o.v} label={o.label} sublabel={o.sub} selected={answers.c1 === o.v} onClick={() => setAnswer("c1", o.v)} />)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2"><span className="font-medium text-gray-700">C2 —</span> Évolution à l&apos;arrêt du médicament (dé-challenge)</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "favorable", label: "Régression à l'arrêt" },
                  { v: "defavorable", label: "Pas de régression / évolution défavorable" },
                  { v: "non_arrete", label: "Médicament non arrêté" },
                  { v: "nr", label: "Non évaluable" },
                ].map((o) => <OptionButton key={o.v} label={o.label} selected={answers.c2 === o.v} onClick={() => setAnswer("c2", o.v)} />)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2"><span className="font-medium text-gray-700">C3 —</span> Rechallenge (réintroduction du médicament)</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "positif", label: "Rechallenge positif", sub: "réapparition à la réintroduction" },
                  { v: "negatif", label: "Rechallenge négatif" },
                  { v: "non_fait", label: "Non réalisé / non applicable" },
                ].map((o) => <OptionButton key={o.v} label={o.label} sublabel={o.sub} selected={answers.c3 === o.v} onClick={() => setAnswer("c3", o.v)} />)}
              </div>
            </div>
          </div>
          <div className="mt-5">
            <button onClick={() => goTo(1)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">Sémiologie →</button>
          </div>
        </div>
      )}

      {/* STEP 1 — Sémiologie */}
      {step === 1 && (
        <div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-full bg-blue-900 text-blue-100 flex items-center justify-center text-xs font-medium shrink-0">S</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Sémiologie</p>
              <p className="text-xs text-gray-400">Caractérisation clinique de l&apos;effet indésirable</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2"><span className="font-medium text-gray-700">S1 —</span> L&apos;effet est-il connu pour ce médicament ? (RCP / bases de données)</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "connu", label: "Oui, décrit dans le RCP" },
                  { v: "connu_rare", label: "Connu mais rare / hors RCP marocain" },
                  { v: "inconnu", label: "Non décrit / inattendu" },
                ].map((o) => <OptionButton key={o.v} label={o.label} selected={answers.s1 === o.v} onClick={() => setAnswer("s1", o.v)} />)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2"><span className="font-medium text-gray-700">S2 —</span> Existe-t-il une explication alternative (autre cause possible) ?</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "non", label: "Non — aucune autre cause plausible" },
                  { v: "possible", label: "Cause alternative possible" },
                  { v: "probable", label: "Cause alternative probable" },
                ].map((o) => <OptionButton key={o.v} label={o.label} selected={answers.s2 === o.v} onClick={() => setAnswer("s2", o.v)} />)}
              </div>
              {(answers.s2 === "possible" || answers.s2 === "probable") && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border-l-2 border-blue-400">
                  <p className="text-xs text-gray-500 mb-2">Précisez la cause alternative</p>
                  <div className="flex flex-wrap gap-2">
                    {["Pathologie sous-jacente", "Autre médicament concomitant", "Interaction médicamenteuse", "Facteur environnemental", "Terrain allergique connu"].map((c) => (
                      <Chip key={c} label={c} selected={altCauses.includes(c)} onClick={() => toggleAltCause(c)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2"><span className="font-medium text-gray-700">S3 —</span> L&apos;effet est-il spécifique / hautement évocateur du médicament ?</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "oui", label: "Oui (ex. syndrome de Stevens-Johnson, agranulocytose)" },
                  { v: "non", label: "Non / effet non spécifique" },
                ].map((o) => <OptionButton key={o.v} label={o.label} selected={answers.s3 === o.v} onClick={() => setAnswer("s3", o.v)} />)}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={() => goTo(0)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">← Retour</button>
            <button onClick={() => goTo(2)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">Bibliographie →</button>
          </div>
        </div>
      )}

      {/* STEP 2 — Bibliographie + Gravité */}
      {step === 2 && (
        <div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-full bg-blue-900 text-blue-100 flex items-center justify-center text-xs font-medium shrink-0">B</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Bibliographie & gravité</p>
              <p className="text-xs text-gray-400">Imputabilité extrinsèque + critères CIOMS</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2"><span className="font-medium text-gray-700">B —</span> Notoriété de l&apos;association dans la littérature</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "e1", label: "E1 — Non décrit", sub: "aucune donnée publiée" },
                  { v: "e2", label: "E2 — Décrit mais rare", sub: "cas isolés, case reports" },
                  { v: "e3", label: "E3 — Bien documenté", sub: "essais cliniques, RCP, Vidal" },
                ].map((o) => <OptionButton key={o.v} label={o.label} sublabel={o.sub} selected={answers.b1 === o.v} onClick={() => setAnswer("b1", o.v)} />)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2"><span className="font-medium text-gray-700">Gravité —</span> Critères CIOMS / ICH E2A</p>
              <div className="flex flex-wrap gap-2">
                {GRAVE_CRITERIA.map((g) => <Chip key={g.id} label={g.label} selected={gravite.includes(g.id)} onClick={() => toggleGravite(g.id)} />)}
              </div>
              {GRAVE_CRITERIA.filter((g) => g.id !== "non_grave").some((g) => gravite.includes(g.id)) && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  Effet grave détecté — déclaration obligatoire sous 15 jours (loi 17-04 / ICH E2A). Délai réduit à 7 jours si fatal ou pronostic vital engagé.
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={() => goTo(1)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">← Retour</button>
            <button onClick={() => goTo(3)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">Voir le score →</button>
          </div>
        </div>
      )}

      {/* STEP 3 — Score final */}
      {step === 3 && score && (
        <div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-full bg-green-800 text-green-100 flex items-center justify-center text-xs font-medium shrink-0">✓</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Score d&apos;imputabilité calculé</p>
              <p className="text-xs text-gray-400">Méthode Bégaud — résultat automatique</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <ScoreRow label="Score chronologie" value={cLabel(score.Cscore)} colorClass={cColorClass(score.Cscore)} explainer={answers.c3 === "positif" ? "Rechallenge positif — poids chronologique maximal." : ""} />
            <ScoreRow label="Score sémiologie" value={sLabel(score.Sscore)} colorClass={sColorClass(score.Sscore)} explainer={answers.s3 === "oui" ? "Effet hautement spécifique." : ""} />
            <ScoreRow label="Imputabilité extrinsèque" value={B_LABELS[score.Bscore]} colorClass={bColorClass(score.Bscore)} explainer={score.Bscore === "e1" ? "Effet potentiellement nouveau — intérêt pour la recherche." : ""} />
            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Imputabilité intrinsèque finale</p>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-medium text-gray-900">{I_LABELS[score.Iscore]}</span>
                <BadgeFinal Iscore={score.Iscore} />
              </div>
              <p className="text-sm text-gray-500">{I_EXPLAINER[score.Iscore]}</p>
            </div>
          </div>
          {score.isGrave && score.Iscore >= 2 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              Déclaration obligatoire — effet grave avec imputabilité ≥ I2. Transmission au CAPM sous 15 jours (7j si fatal). Format E2B R3 requis.
            </div>
          )}
          {answers.s1 === "inconnu" && score.Iscore >= 2 && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              Effet inattendu hors RCP avec imputabilité significative — signal potentiellement nouveau. Valeur épidémiologique élevée.
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-5">
            <button onClick={() => goTo(2)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">← Modifier</button>
            <button onClick={reset} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">↺ Nouveau calcul</button>
          </div>
        </div>
      )}
    </div>
  );
}
