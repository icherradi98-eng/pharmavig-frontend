"use client";

/**
 * /interactions — Vérificateur d'interactions médicamenteuses
 * Source : base locale MAIA DAWA (données ANSM/EMA publiques).
 * Pas d'appel externe (OpenFDA retiré — source US non pertinente pour le Maroc).
 */

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  searchLocalInteraction,
  INTERACTIONS_TABLE,
  type NiveauInteraction,
  type InteractionLocale,
} from "@/lib/interactionsLocales";

// ─── Couleurs par niveau ──────────────────────────────────────────────────────

const NIVEAU_CONFIG: Record<NiveauInteraction, {
  label: string;
  badge: string;
  banner: string;
  border: string;
  icon: string;
}> = {
  CI: {
    label: "Contre-indication absolue",
    badge: "bg-red-600 text-white",
    banner: "bg-red-50 border-red-300",
    border: "border-red-300",
    icon: "🚫",
  },
  majeur: {
    label: "Interaction majeure",
    badge: "bg-orange-500 text-white",
    banner: "bg-orange-50 border-orange-300",
    border: "border-orange-300",
    icon: "⚠️",
  },
  modéré: {
    label: "Interaction modérée",
    badge: "bg-amber-400 text-amber-900",
    banner: "bg-amber-50 border-amber-200",
    border: "border-amber-200",
    icon: "⚡",
  },
  mineur: {
    label: "Interaction mineure",
    badge: "bg-blue-100 text-blue-800",
    banner: "bg-blue-50 border-blue-200",
    border: "border-blue-200",
    icon: "ℹ️",
  },
};

// ─── Types résultat ───────────────────────────────────────────────────────────

type ResultSource = "locale" | "none";

type CheckResult =
  | { source: ResultSource; found: true; data: InteractionLocale }
  | { source: ResultSource; found: false };


// ─── Composants ──────────────────────────────────────────────────────────────

function DrugInput({
  label,
  value,
  onChange,
  suggestions,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex-1">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onFocus={() => setOpen(true)}
        placeholder="Ex : ibuprofène, warfarine, metformine…"
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
        style={{ "--tw-ring-color": "#0F5B57" } as React.CSSProperties}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && value.length >= 2 && (
        <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {suggestions
            .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 8)
            .map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={() => { onChange(s); setOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {s}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

function ResultCard({ result, drug1, drug2 }: { result: CheckResult; drug1: string; drug2: string }) {
  const router = useRouter();

  function declarerInteraction() {
    const prefill = {
      medicamentDCI: drug1.trim(),
      medicamentConcomitantNom: drug2.trim(),
    };
    sessionStorage.setItem("pharmavig_prefill_declaration", JSON.stringify(prefill));
    router.push("/dashboard/medecin/nouvelle-declaration");
  }

  if (!result.found) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-semibold text-emerald-800 text-base mb-1">
          Aucune interaction répertoriée
        </p>
        <p className="text-sm text-emerald-700">
          Cette combinaison ne figure pas dans la base MAIA DAWA.
          Cela ne garantit pas l&apos;absence d&apos;interaction — consultez le RCP marocain officiel et un pharmacologue clinicien.
        </p>
        <p className="text-xs text-emerald-500 mt-2">
          Source : Base locale MAIA DAWA (données ANSM/EMA publiques)
        </p>
      </div>
    );
  }

  const { data } = result;
  const cfg = NIVEAU_CONFIG[data.niveau];

  return (
    <div className={`border-2 rounded-2xl overflow-hidden ${cfg.border}`}>
      {/* Header */}
      <div className={`flex items-center gap-3 px-5 py-4 ${cfg.banner}`}>
        <span className="text-2xl">{cfg.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
              {cfg.label}
            </span>
            <span className="text-xs text-gray-500">Source : Base MAIA DAWA</span>
          </div>
          <p className="font-bold text-gray-900 mt-1 text-sm">
            {data.dci1.charAt(0).toUpperCase() + data.dci1.slice(1)} ×{" "}
            {data.dci2.charAt(0).toUpperCase() + data.dci2.slice(1)}
          </p>
        </div>
      </div>

      {/* Détails */}
      <div className="bg-white px-5 py-5 space-y-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mécanisme</p>
          <p className="text-sm text-gray-800">{data.mecanisme}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Conséquence clinique</p>
          <p className="text-sm font-semibold text-gray-900">{data.consequence}</p>
        </div>
        <div className={`rounded-xl p-4 ${cfg.banner}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">Conduite à tenir</p>
          <p className="text-sm font-semibold">{data.conduite}</p>
        </div>


        {/* CTA Déclarer — uniquement pour CI et majeur */}
        {(data.niveau === "CI" || data.niveau === "majeur") && (
          <div className={`rounded-xl p-4 border ${cfg.banner} flex items-center justify-between gap-4`}>
            <div>
              <p className="text-xs font-bold text-gray-700 mb-0.5">
                {data.niveau === "CI" ? "🚫 Contre-indication absolue détectée" : "⚠️ Interaction majeure détectée"}
              </p>
              <p className="text-xs text-gray-600">
                Un cas clinique lié à cette association doit être déclaré au CAPM.
              </p>
            </div>
            <button
              onClick={declarerInteraction}
              className="shrink-0 px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors"
              style={{ background: data.niveau === "CI" ? "#dc2626" : "#ea580c" }}
            >
              ⚡ Déclarer ce cas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

function InteractionsContent() {
  const searchParams = useSearchParams();
  const [drug1, setDrug1] = useState(() => searchParams.get("drug1") ?? "");
  const [drug2, setDrug2] = useState(() => searchParams.get("drug2") ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  // Auto-déclencher la vérification si les deux médicaments sont pré-remplis depuis l'URL
  useEffect(() => {
    const d1 = searchParams.get("drug1");
    const d2 = searchParams.get("drug2");
    if (d1 && d2) {
      // Déclencher après le premier rendu
      setTimeout(() => {
        const btn = document.getElementById("btn-verifier");
        btn?.click();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Liste des DCI connues pour l'autocomplete
  const knownDCIs = Array.from(
    new Set(INTERACTIONS_TABLE.flatMap((i) => [i.dci1, i.dci2]))
  ).sort();

  async function handleCheck() {
    if (!drug1.trim() || !drug2.trim()) return;
    setLoading(true);
    setResult(null);

    const local = searchLocalInteraction(drug1, drug2);
    if (local) {
      setResult({ source: "locale", found: true, data: local });
    } else {
      setResult({ source: "locale", found: false });
    }

    setLoading(false);
  }

  function handleSwap() {
    setDrug1(drug2);
    setDrug2(drug1);
    setResult(null);
  }

  return (
    <div className="min-h-screen" style={{ background: "#F7F3EE" }}>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/medecin" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <div className="flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L4 7v7c0 5.5 4.3 10.7 10 12 5.7-1.3 10-6.5 10-12V7L14 2z" fill="#0F5B57"/>
              <path d="M9 14h10M14 9v10" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-bold text-sm" style={{ color: "#0F5B57" }}>MAIA DAWA</span>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Base MAIA DAWA · {INTERACTIONS_TABLE.length} paires cliniques
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* Titre */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#0F5B57" }}>
            Vérificateur d&apos;interactions médicamenteuses
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Entrez deux médicaments pour vérifier leur interaction.
            Base locale MAIA DAWA : {INTERACTIONS_TABLE.length} paires cliniquement significatives.
          </p>
        </div>

        {/* Formulaire de recherche */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex gap-3 items-end">
            <DrugInput
              label="Médicament 1"
              value={drug1}
              onChange={(v) => { setDrug1(v); setResult(null); }}
              suggestions={knownDCIs}
            />

            {/* Bouton inverser */}
            <button
              type="button"
              onClick={handleSwap}
              title="Inverser les deux médicaments"
              className="shrink-0 w-10 h-10 mb-0.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors"
            >
              ⇄
            </button>

            <DrugInput
              label="Médicament 2"
              value={drug2}
              onChange={(v) => { setDrug2(v); setResult(null); }}
              suggestions={knownDCIs}
            />
          </div>

          <button
            id="btn-verifier"
            onClick={handleCheck}
            disabled={loading || !drug1.trim() || !drug2.trim()}
            className="mt-4 w-full py-3 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "#0F5B57" }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Vérification en cours…
              </>
            ) : (
              "🔍 Vérifier l’interaction"
            )}
          </button>

        </div>

        {/* Résultat */}
        {result && <ResultCard result={result} drug1={drug1} drug2={drug2} />}

        {/* Disclaimer */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-700">⚕️ Avertissement</p>
          <p>
            Cet outil est une aide à la décision médicale, non un substitut au jugement clinique.
            L&apos;absence d&apos;interaction dans cette base ne garantit pas l&apos;innocuité de l&apos;association.
            En cas de doute, consultez un pharmacologue clinicien, le RCP marocain officiel, ou le CAPM.
          </p>
          <p>Sources : Base MAIA DAWA — données issues de sources publiques officielles (ANSM, EMA, RCP). Aucun scraping de sources propriétaires.</p>
        </div>

        {/* Exemples rapides */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 text-center">
            Exemples cliniques fréquents
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["warfarine", "aspirine"],
              ["metformine", "iode radioactif"],
              ["clopidogrel", "omeprazole"],
              ["sildenafil", "nitrate"],
              ["lithium", "ibuprofene"],
              ["allopurinol", "azathioprine"],
            ].map(([d1, d2]) => (
              <button
                key={`${d1}-${d2}`}
                onClick={() => { setDrug1(d1); setDrug2(d2); setResult(null); }}
                className="text-left text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white hover:border-teal-400 hover:bg-teal-50 transition-colors"
              >
                <span className="font-semibold text-gray-700 capitalize">{d1}</span>
                <span className="text-gray-400"> × </span>
                <span className="font-semibold text-gray-700 capitalize">{d2}</span>
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

// Suspense wrapper — requis par Next.js App Router pour useSearchParams en production
export default function InteractionsPage() {
  return (
    <Suspense>
      <InteractionsContent />
    </Suspense>
  );
}
