"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = Record<string, string>;

export type ImputScore = {
  Cscore: number;
  Sscore: number;
  Iscore: number;
  Bscore: string;
  isGrave: boolean;
};

// ─── Calcul du score Bégaud ───────────────────────────────────────────────────

function computeScore(answers: Answers, gravite: string[]): ImputScore {
  const { c1 = "nr", c2 = "nr", c3 = "non_fait", s1 = "inconnu", s2 = "possible", s3 = "non", b1 = "e1" } = answers;

  // Score chronologique C (0–3)
  let Cscore = 1;
  if (c1 === "incompatible") Cscore = 0;
  else if (c1 === "tres_compatible") Cscore = 3;
  else if (c1 === "compatible") Cscore = 2;
  if (c2 === "favorable" && Cscore > 0) Cscore = Math.min(3, Cscore + 1);
  if (c3 === "positif") Cscore = 3;
  if (c3 === "negatif" && Cscore > 1) Cscore = Cscore - 1;
  Cscore = Math.max(0, Math.min(3, Cscore));

  // Score sémiologique S (1–3)
  let Sscore = 1;
  if (s2 === "probable") Sscore = 1;
  else if (s2 === "possible") Sscore = 2;
  else if (s2 === "non") Sscore = 3;
  if (s1 === "connu" || s1 === "connu_rare") Sscore = Math.min(3, Sscore + 1);
  else if (s1 === "inconnu") Sscore = Math.max(1, Sscore - 1);
  if (s3 === "oui") Sscore = 3;
  Sscore = Math.max(1, Math.min(3, Sscore));

  // Score intrinsèque I (0–4)
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

  const GRAVE_IDS = ["deces", "engage", "hospit", "incap", "cong", "med_imp"];
  const isGrave = GRAVE_IDS.some((id) => gravite.includes(id));

  return { Cscore, Sscore, Iscore, Bscore: b1, isGrave };
}

// ─── Helpers visuel ───────────────────────────────────────────────────────────

const I_LABELS = ["Exclu", "Douteux", "Plausible", "Probable", "Très probable"];
const I_COLORS = [
  "bg-red-100 text-red-800 border-red-200",
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-gray-100 text-gray-700 border-gray-200",
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
];
const I_EXPLAINERS = [
  "Le médicament est exclu comme cause de l'effet.",
  "Lien peu probable. Déclaration facultative mais utile.",
  "Lien possible, insuffisamment documenté. À surveiller.",
  "Lien probable — déclaration recommandée.",
  "Lien très probable — déclaration obligatoire. Signal fort.",
];
const C_LABELS = ["C0 — Exclu", "C1 — Douteux", "C2 — Compatible", "C3 — Plausible"];
const S_LABELS = ["—", "S1 — Faible", "S2 — Possible", "S3 — Élevée"];
const B_LABELS: Record<string, string> = {
  e1: "B1 — Non publié",
  e2: "B2 — Cas isolés",
  e3: "B3 — Bien documenté",
};

const GRAVITE_ITEMS = [
  { id: "deces", label: "Décès" },
  { id: "engage", label: "Pronostic vital engagé" },
  { id: "hospit", label: "Hospitalisation / prolongation" },
  { id: "incap", label: "Incapacité permanente" },
  { id: "cong", label: "Anomalie congénitale" },
  { id: "med_imp", label: "Intervention médicale importante" },
  { id: "non_grave", label: "Non grave" },
];

// Détermine quelles questions sont débloquées selon les réponses déjà données
function getUnlockedQuestions(answers: Answers): string[] {
  const unlocked = ["c1"];
  if (answers.c1) {
    unlocked.push("c2");
    if (answers.c2) {
      unlocked.push("c3");
      if (answers.c3) {
        unlocked.push("s1");
        if (answers.s1) {
          unlocked.push("s2");
          if (answers.s2) {
            unlocked.push("s3");
            if (answers.s3) {
              unlocked.push("b1");
              if (answers.b1) {
                unlocked.push("gravite");
              }
            }
          }
        }
      }
    }
  }
  return unlocked;
}

// ─── Composants atomiques ─────────────────────────────────────────────────────

function QuestionBlock({ questionId, label, hint, expertCode, children, answered, fresh }: {
  questionId: string;
  label: string;
  hint?: string;
  expertCode?: string;
  children: React.ReactNode;
  answered: boolean;
  fresh: boolean; // vient d'être débloquée → animation d'entrée
}) {
  return (
    <div
      className={`transition-all duration-300 ${fresh && !answered ? "animate-pulse-once" : ""}`}
      id={`q-${questionId}`}
    >
      <div className={`rounded-2xl border p-5 transition-all ${answered ? "bg-gray-50 border-gray-100 opacity-80" : "bg-white border-blue-200 shadow-sm"}`}>
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-all ${answered ? "bg-emerald-100 text-emerald-700" : "bg-blue-900 text-blue-100"}`}>
            {answered ? "✓" : "·"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-semibold ${answered ? "text-gray-500" : "text-gray-900"}`}>{label}</p>
              {expertCode && (
                <span className="text-[10px] font-mono bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">{expertCode}</span>
              )}
            </div>
            {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function OptionBtn({ label, sublabel, selected, onClick }: {
  label: string; sublabel?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 min-w-[140px] px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${
        selected
          ? "bg-blue-600 border-blue-600 text-white font-semibold shadow-sm"
          : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
      }`}
    >
      {label}
      {sublabel && <span className={`block text-xs mt-0.5 ${selected ? "opacity-80" : "text-gray-400"}`}>{sublabel}</span>}
    </button>
  );
}

function ChipBtn({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
        selected ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-amber-400"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Score live ───────────────────────────────────────────────────────────────

function LiveScore({ score, complete, expertMode }: { score: ImputScore; complete: boolean; expertMode: boolean }) {
  const iStyle = I_COLORS[score.Iscore];
  const cPct = (score.Cscore / 3) * 100;
  const sPct = ((score.Sscore - 1) / 2) * 100;

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-500 ${complete ? "bg-white border-blue-200 shadow-md" : "bg-gray-50 border-gray-200 opacity-70"}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Score d&apos;imputabilité</p>
          <p className="text-xs text-gray-400">Méthode Bégaud — {complete ? "calcul final" : "en cours…"}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full border text-sm font-bold transition-all ${iStyle}`}>
          I{score.Iscore} — {I_LABELS[score.Iscore]}
        </div>
      </div>

      {/* Barres de score */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Chronologie</span>
            <span className="font-semibold">{expertMode ? C_LABELS[score.Cscore] : ["Exclu", "Douteux", "Compatible", "Très compatible"][score.Cscore]}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-2 rounded-full transition-all duration-500 ${score.Cscore === 0 ? "bg-red-400" : score.Cscore === 1 ? "bg-amber-400" : score.Cscore === 2 ? "bg-blue-400" : "bg-emerald-500"}`} style={{ width: `${cPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Sémiologie</span>
            <span className="font-semibold">{expertMode ? S_LABELS[score.Sscore] : ["—", "Faible", "Possible", "Élevée"][score.Sscore]}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-2 rounded-full transition-all duration-500 ${score.Sscore === 1 ? "bg-amber-400" : score.Sscore === 2 ? "bg-blue-400" : "bg-emerald-500"}`} style={{ width: `${sPct}%` }} />
          </div>
        </div>
        {expertMode && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Bibliographie</span>
              <span className="font-semibold">{B_LABELS[score.Bscore]}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-2 rounded-full transition-all duration-500 ${score.Bscore === "e1" ? "bg-red-400" : score.Bscore === "e2" ? "bg-amber-400" : "bg-emerald-500"}`}
                style={{ width: score.Bscore === "e1" ? "33%" : score.Bscore === "e2" ? "66%" : "100%" }} />
            </div>
          </div>
        )}
      </div>

      {/* Explainer */}
      {complete && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
          {I_EXPLAINERS[score.Iscore]}
        </p>
      )}

      {/* Alertes */}
      {complete && score.isGrave && score.Iscore >= 2 && (
        <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
          ⚡ Déclaration obligatoire — effet grave I≥2. Délai réglementaire : 15j (7j si fatal).
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ImputabiliteBegaud({
  onScoreChange,
  initialAnswers,
}: {
  onScoreChange?: (score: ImputScore) => void;
  initialAnswers?: Answers;
}) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers ?? {});
  const [gravite, setGravite] = useState<string[]>([]);
  const [altCauses, setAltCauses] = useState<string[]>([]);
  const [expertMode, setExpertMode] = useState(false);
  const [prevUnlocked, setPrevUnlocked] = useState<string[]>(
    initialAnswers ? getUnlockedQuestions(initialAnswers) : ["c1"]
  );

  const setAnswer = (q: string, v: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [q]: v };
      // Réinitialise les questions suivantes si on change une réponse antérieure
      const order = ["c1", "c2", "c3", "s1", "s2", "s3", "b1"];
      const idx = order.indexOf(q);
      if (idx >= 0) {
        for (let i = idx + 1; i < order.length; i++) delete next[order[i]];
      }
      return next;
    });
  };

  const toggleGravite = (id: string) => {
    // "non_grave" est exclusif des autres critères graves
    setGravite((prev) => {
      if (id === "non_grave") return prev.includes("non_grave") ? [] : ["non_grave"];
      const withoutNonGrave = prev.filter((x) => x !== "non_grave");
      return withoutNonGrave.includes(id) ? withoutNonGrave.filter((x) => x !== id) : [...withoutNonGrave, id];
    });
  };

  const unlocked = getUnlockedQuestions(answers);
  const isComplete = unlocked.includes("gravite") && gravite.length > 0;
  const score = computeScore(answers, gravite);

  // Scroll vers la nouvelle question débloquée
  useEffect(() => {
    const newQ = unlocked.find((q) => !prevUnlocked.includes(q));
    if (newQ && newQ !== "gravite") {
      setTimeout(() => {
        const el = document.getElementById(`q-${newQ}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
    setPrevUnlocked(unlocked);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked.join(",")]);

  // Notifie le parent à chaque changement
  useEffect(() => {
    if (isComplete) onScoreChange?.(score);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, answers, gravite]);

  return (
    <div className="w-full font-sans space-y-4">

      {/* En-tête + mode expert */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">Imputabilité méthode Bégaud</p>
          <p className="text-xs text-gray-400">Répondez aux questions — le score se calcule en temps réel</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {["c1", "c2", "c3", "s1", "s2", "s3", "b1", "gravite"].map((q) => (
              <div key={q} className={`w-2 h-2 rounded-full transition-all ${
                answers[q] || (q === "gravite" && gravite.length > 0)
                  ? "bg-blue-600"
                  : unlocked.includes(q)
                  ? "bg-blue-200"
                  : "bg-gray-200"
              }`} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setExpertMode((m) => !m)}
            className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${expertMode ? "bg-blue-900 text-blue-100 border-blue-700" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
          >
            ⚗ Expert
          </button>
          <button
            type="button"
            onClick={() => { setAnswers({}); setGravite([]); setAltCauses([]); }}
            className="text-[10px] text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg border border-gray-200 hover:border-red-200 transition-all"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Score live — toujours visible en haut */}
      <LiveScore score={score} complete={isComplete} expertMode={expertMode} />

      {/* ── Q1 : Délai d'apparition (C1) ── */}
      {unlocked.includes("c1") && (
        <QuestionBlock
          questionId="c1" answered={!!answers.c1} fresh={!prevUnlocked.includes("c1")}
          label="L'effet est-il apparu dans un délai compatible avec la prise du médicament ?"
          hint="Chronologie entre la première prise et le début de l'effet"
          expertCode={expertMode ? "C1 — Délai d'apparition" : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { v: "tres_compatible", label: "Oui, clairement", sub: "ex. réaction < 1h, éruption < 7j" },
              { v: "compatible", label: "Probablement", sub: "délai plausible" },
              { v: "incompatible", label: "Non compatible", sub: "trop court ou trop long" },
              { v: "nr", label: "Ne sais pas" },
            ].map((o) => <OptionBtn key={o.v} label={o.label} sublabel={o.sub} selected={answers.c1 === o.v} onClick={() => setAnswer("c1", o.v)} />)}
          </div>
          {answers.c1 === "incompatible" && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
              ⚠️ Délai incompatible → chronologie exclue (C0). L&apos;imputabilité sera I0.
            </p>
          )}
        </QuestionBlock>
      )}

      {/* ── Q2 : Évolution à l'arrêt (C2) ── */}
      {unlocked.includes("c2") && (
        <QuestionBlock
          questionId="c2" answered={!!answers.c2} fresh={!prevUnlocked.includes("c2")}
          label="L'effet a-t-il régressé à l'arrêt du médicament ?"
          expertCode={expertMode ? "C2 — Évolution à l'arrêt" : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { v: "favorable", label: "Oui — régression", sub: "renforce le lien" },
              { v: "defavorable", label: "Non — pas de régression" },
              { v: "non_arrete", label: "Médicament non arrêté" },
              { v: "nr", label: "Non évaluable" },
            ].map((o) => <OptionBtn key={o.v} label={o.label} sublabel={o.sub} selected={answers.c2 === o.v} onClick={() => setAnswer("c2", o.v)} />)}
          </div>
        </QuestionBlock>
      )}

      {/* ── Q3 : Réintroduction (C3) ── */}
      {unlocked.includes("c3") && (
        <QuestionBlock
          questionId="c3" answered={!!answers.c3} fresh={!prevUnlocked.includes("c3")}
          label="Le médicament a-t-il été réintroduit après l'arrêt ?"
          hint="La ré-administration est le critère chronologique le plus fort"
          expertCode={expertMode ? "C3 — Ré-administration (rechallenge)" : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { v: "positif", label: "Oui — effet réapparu", sub: "rechallenge + : critère majeur" },
              { v: "negatif", label: "Oui — sans effet", sub: "rechallenge −" },
              { v: "non_fait", label: "Non réintroduit" },
            ].map((o) => <OptionBtn key={o.v} label={o.label} sublabel={o.sub} selected={answers.c3 === o.v} onClick={() => setAnswer("c3", o.v)} />)}
          </div>
          {answers.c3 === "positif" && (
            <p className="mt-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
              ✓ Rechallenge positif — poids chronologique maximal (C3). Iscore +1.
            </p>
          )}
        </QuestionBlock>
      )}

      {/* ── Q4 : Effet connu dans le RCP (S1) ── */}
      {unlocked.includes("s1") && (
        <QuestionBlock
          questionId="s1" answered={!!answers.s1} fresh={!prevUnlocked.includes("s1")}
          label="Cet effet est-il connu avec ce médicament ?"
          expertCode={expertMode ? "S1 — Sémiologie connue (RCP)" : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { v: "connu", label: "Oui — dans le RCP" },
              { v: "connu_rare", label: "Rare / hors RCP marocain" },
              { v: "inconnu", label: "Non décrit — effet inattendu" },
            ].map((o) => <OptionBtn key={o.v} label={o.label} selected={answers.s1 === o.v} onClick={() => setAnswer("s1", o.v)} />)}
          </div>
          {answers.s1 === "inconnu" && (
            <p className="mt-2 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
              Signal potentiellement nouveau — valeur épidémiologique élevée pour la pharmacovigilance nationale.
            </p>
          )}
        </QuestionBlock>
      )}

      {/* ── Q5 : Cause alternative (S2) ── */}
      {unlocked.includes("s2") && (
        <QuestionBlock
          questionId="s2" answered={!!answers.s2} fresh={!prevUnlocked.includes("s2")}
          label="Existe-t-il une autre cause probable pour cet effet ?"
          expertCode={expertMode ? "S2 — Cause alternative (bilan étiologique)" : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { v: "non", label: "Non — aucune autre cause évidente" },
              { v: "possible", label: "Une autre cause est possible" },
              { v: "probable", label: "Autre cause plus probable" },
            ].map((o) => <OptionBtn key={o.v} label={o.label} selected={answers.s2 === o.v} onClick={() => setAnswer("s2", o.v)} />)}
          </div>
          {(answers.s2 === "possible" || answers.s2 === "probable") && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border-l-2 border-blue-300">
              <p className="text-xs text-gray-500 mb-2">Quelle autre cause envisagez-vous ?</p>
              <div className="flex flex-wrap gap-1.5">
                {["Pathologie sous-jacente", "Autre médicament concomitant", "Interaction médicamenteuse", "Facteur environnemental", "Terrain allergique connu"].map((c) => (
                  <ChipBtn key={c} label={c} selected={altCauses.includes(c)} onClick={() => setAltCauses((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])} />
                ))}
              </div>
            </div>
          )}
        </QuestionBlock>
      )}

      {/* ── Q6 : Spécificité de l'effet (S3) ── */}
      {unlocked.includes("s3") && (
        <QuestionBlock
          questionId="s3" answered={!!answers.s3} fresh={!prevUnlocked.includes("s3")}
          label="L'effet est-il très caractéristique de ce médicament ?"
          hint="Hautement évocateur = quasi-pathognomonique"
          expertCode={expertMode ? "S3 — Spécificité sémiologique" : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { v: "oui", label: "Oui — hautement évocateur", sub: "ex. Stevens-Johnson, agranulocytose" },
              { v: "non", label: "Non — effet non spécifique" },
            ].map((o) => <OptionBtn key={o.v} label={o.label} sublabel={o.sub} selected={answers.s3 === o.v} onClick={() => setAnswer("s3", o.v)} />)}
          </div>
        </QuestionBlock>
      )}

      {/* ── Q7 : Bibliographie (B) ── */}
      {unlocked.includes("b1") && (
        <QuestionBlock
          questionId="b1" answered={!!answers.b1} fresh={!prevUnlocked.includes("b1")}
          label="Cet effet a-t-il déjà été publié avec ce médicament ?"
          hint="Imputabilité extrinsèque — données de la littérature"
          expertCode={expertMode ? "B — Imputabilité extrinsèque" : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { v: "e1", label: "Non — aucune donnée publiée", sub: "effet potentiellement nouveau" },
              { v: "e2", label: "Cas isolés", sub: "case reports, données limitées" },
              { v: "e3", label: "Bien documenté", sub: "RCP, essais cliniques, bases safety" },
            ].map((o) => <OptionBtn key={o.v} label={o.label} sublabel={o.sub} selected={answers.b1 === o.v} onClick={() => setAnswer("b1", o.v)} />)}
          </div>
        </QuestionBlock>
      )}

      {/* ── Gravité ── */}
      {unlocked.includes("gravite") && (
        <QuestionBlock
          questionId="gravite" answered={gravite.length > 0} fresh={!prevUnlocked.includes("gravite")}
          label="Gravité de l'effet — cochez tout ce qui s'applique"
          hint="Détermine le délai réglementaire de transmission de la déclaration"
        >
          <div className="flex flex-wrap gap-2">
            {GRAVITE_ITEMS.map((g) => (
              <ChipBtn
                key={g.id}
                label={g.label}
                selected={gravite.includes(g.id)}
                onClick={() => toggleGravite(g.id)}
              />
            ))}
          </div>
          {gravite.some((id) => ["deces", "engage", "hospit", "incap", "cong", "med_imp"].includes(id)) && (
            <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              ⚡ Effet grave — déclaration obligatoire sous 15 jours (loi 17-04 / ICH E2A).
              {gravite.some((id) => ["deces", "engage"].includes(id)) && " Délai réduit à 7 jours (fatal / pronostic vital)."}
            </div>
          )}
        </QuestionBlock>
      )}

      {/* Score final si complet */}
      {isComplete && (
        <div className="rounded-2xl bg-blue-900 text-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-0.5">Imputabilité intrinsèque finale</p>
              <p className="text-xl font-black">I{score.Iscore} — {I_LABELS[score.Iscore]}</p>
            </div>
            <div className="text-right text-xs opacity-60 space-y-0.5">
              <p>C = {score.Cscore}/3</p>
              <p>S = {score.Sscore}/3</p>
              <p>B = {B_LABELS[score.Bscore].split("—")[0].trim()}</p>
            </div>
          </div>
          <p className="text-sm opacity-80">{I_EXPLAINERS[score.Iscore]}</p>
        </div>
      )}
    </div>
  );
}
