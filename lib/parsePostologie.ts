/**
 * parsePostologie — Parser intelligent de posologie médicamenteuse
 *
 * Exemples supportés :
 *   "500 mg 2x/jour"         → { dose: "500", unite: "mg",    frequence: "2×/jour" }
 *   "1g matin et soir"       → { dose: "1",   unite: "g",     frequence: "2×/jour" }
 *   "50 mg/kg 1×/j"          → { dose: "50",  unite: "mg/kg", frequence: "1×/jour" }
 *   "0.5 µg toutes les 12h"  → { dose: "0.5", unite: "µg",   frequence: "2×/jour" }
 *   "175 mg/m² J1-J21"       → { dose: "175", unite: "mg/m²", frequence: "1×/cycle" }
 *   "250 mg 3 fois par jour"  → { dose: "250", unite: "mg",   frequence: "3×/jour" }
 */

export type ParsedPostologie = {
  dose: string;
  unite: string;
  frequence: string;
  /** Confiance : 0–1 */
  confidence: number;
};

// ─── Patterns unités ────────────────────────────────────────────────────────

const UNITE_PATTERNS: [RegExp, string][] = [
  [/\bmg\/kg\b/i,         "mg/kg"],
  [/\bmg\/m[²2]\b/i,      "mg/m²"],
  [/\bµg\/kg\b/i,         "µg/kg"],
  [/\bmcg\/kg\b/i,        "µg/kg"],
  [/\bµg\b/i,             "µg"],
  [/\bmcg\b/i,            "µg"],
  [/\bmg\b/i,             "mg"],
  [/\bg\b/i,              "g"],
  [/\bml\b/i,             "mL"],
  [/\bml\b/i,             "mL"],
  [/\bui\b/i,             "UI"],
  [/\biu\b/i,             "UI"],
  [/\bunités?\b/i,        "UI"],
  [/\bmmol\b/i,           "mmol"],
  [/\bméq\b/i,            "mEq"],
  [/\bmeq\b/i,            "mEq"],
  [/\bcomprimés?\b/i,     "cp"],
  [/\bgélules?\b/i,       "gél"],
  [/\bsachets?\b/i,       "sachet"],
  [/\bgouttes?\b/i,       "gouttes"],
];

// ─── Patterns fréquence → normalisation ─────────────────────────────────────

const FREQ_PATTERNS: [RegExp, string][] = [
  // Forme numérique avec × ou x
  [/4\s*[×x]\s*\/?j(our)?/i,                 "4×/jour"],
  [/3\s*[×x]\s*\/?j(our)?/i,                 "3×/jour"],
  [/2\s*[×x]\s*\/?j(our)?/i,                 "2×/jour"],
  [/1\s*[×x]\s*\/?j(our)?/i,                 "1×/jour"],
  // "n fois par jour"
  [/4\s*fois\s*(par\s*)?j(our)?/i,           "4×/jour"],
  [/trois\s*fois\s*(par\s*)?j(our)?/i,       "3×/jour"],
  [/3\s*fois\s*(par\s*)?j(our)?/i,           "3×/jour"],
  [/deux\s*fois\s*(par\s*)?j(our)?/i,        "2×/jour"],
  [/2\s*fois\s*(par\s*)?j(our)?/i,           "2×/jour"],
  [/une?\s*fois\s*(par\s*)?j(our)?/i,        "1×/jour"],
  [/1\s*fois\s*(par\s*)?j(our)?/i,           "1×/jour"],
  // Intervalles horaires
  [/toutes?\s*(les\s*)?4\s*h(eures?)?/i,     "6×/jour"],
  [/toutes?\s*(les\s*)?6\s*h(eures?)?/i,     "4×/jour"],
  [/toutes?\s*(les\s*)?8\s*h(eures?)?/i,     "3×/jour"],
  [/toutes?\s*(les\s*)?12\s*h(eures?)?/i,    "2×/jour"],
  [/toutes?\s*(les\s*)?24\s*h(eures?)?/i,    "1×/jour"],
  [/every\s*4\s*h(ours?)?/i,                 "6×/jour"],
  [/every\s*6\s*h(ours?)?/i,                 "4×/jour"],
  [/every\s*8\s*h(ours?)?/i,                 "3×/jour"],
  [/every\s*12\s*h(ours?)?/i,                "2×/jour"],
  // Moments de la journée
  [/matin\s*(et|&)\s*soir/i,                 "2×/jour"],
  [/matin.*midi.*soir/i,                     "3×/jour"],
  [/matin.*soir.*nuit/i,                     "3×/jour"],
  [/3\s*fois\s*par\s*jour/i,                 "3×/jour"],
  [/le\s*matin/i,                            "1×/jour"],
  [/au\s*coucher/i,                          "1×/jour (soir)"],
  [/le\s*soir/i,                             "1×/jour (soir)"],
  // Hebdomadaire
  [/1\s*[×x]\s*\/?sem(aine)?/i,              "1×/semaine"],
  [/une?\s*fois\s*(par\s*)?(sem(aine)?|week)/i, "1×/semaine"],
  [/hebdomadaire/i,                          "1×/semaine"],
  [/weekly/i,                                "1×/semaine"],
  // Bimensuel / mensuel
  [/2\s*[×x]\s*\/?sem(aine)?/i,              "2×/semaine"],
  [/mensuel|once\s*(a|per)\s*month/i,        "1×/mois"],
  // Cycles chimiothérapie
  [/j\s*1\s*[-–]\s*j?\s*21/i,               "1×/cycle (J1–J21)"],
  [/j\s*1\s*[-–]\s*j?\s*28/i,               "1×/cycle (J1–J28)"],
  [/j\s*1\s*j?\s*8\s*j?\s*15/i,             "J1, J8, J15 / cycle"],
  [/toutes?\s*(les\s*)?(2|deux)\s*semaines?/i, "1×/2 semaines"],
  [/toutes?\s*(les\s*)?(3|trois)\s*semaines?/i, "1×/3 semaines"],
  [/toutes?\s*(les\s*)?(4|quatre)\s*semaines?/i, "1×/4 semaines"],
  // Once daily (anglais)
  [/once\s*daily/i,                          "1×/jour"],
  [/twice\s*daily/i,                         "2×/jour"],
  [/three\s*times?\s*daily/i,                "3×/jour"],
  [/four\s*times?\s*daily/i,                 "4×/jour"],
];

// ─── Extracteur dose ─────────────────────────────────────────────────────────

const DOSE_PATTERN = /(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)?)/;

// ─── Fonction principale ──────────────────────────────────────────────────────

export function parsePostologie(input: string): ParsedPostologie | null {
  if (!input || input.trim().length < 2) return null;

  const text = input.trim();
  let confidence = 0;

  // 1. Extraire la dose
  const doseMatch = text.match(DOSE_PATTERN);
  const dose = doseMatch ? doseMatch[1].replace(",", ".").replace(/\s/g, "") : "";
  if (dose) confidence += 0.3;

  // 2. Extraire l'unité
  let unite = "";
  for (const [pattern, label] of UNITE_PATTERNS) {
    if (pattern.test(text)) { unite = label; break; }
  }
  if (unite) confidence += 0.35;

  // 3. Extraire la fréquence
  let frequence = "";
  for (const [pattern, label] of FREQ_PATTERNS) {
    if (pattern.test(text)) { frequence = label; break; }
  }
  if (frequence) confidence += 0.35;

  // Retourner null si on n'a rien extrait du tout
  if (!dose && !unite && !frequence) return null;
  // Retourner null si confidence trop faible (évite les faux positifs)
  if (confidence < 0.3) return null;

  return { dose, unite, frequence, confidence };
}

/**
 * Format lisible pour affichage : "500 mg · 2×/jour"
 */
export function formatPostologie(p: ParsedPostologie): string {
  const parts: string[] = [];
  if (p.dose && p.unite) parts.push(`${p.dose} ${p.unite}`);
  else if (p.dose)        parts.push(p.dose);
  else if (p.unite)       parts.push(p.unite);
  if (p.frequence) parts.push(p.frequence);
  return parts.join(" · ");
}
