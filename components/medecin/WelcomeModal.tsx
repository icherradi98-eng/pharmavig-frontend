"use client";

import { useState } from "react";
import Link from "next/link";

const WELCOME_KEY = "pharmavig_medecin_welcome_seen";

const STEPS = [
  {
    icon: "📝",
    title: "Déclarer un effet indésirable",
    desc: "Formulaire guidé CIOMS avec score d'imputabilité Bégaud. Brouillon auto-sauvegardé.",
  },
  {
    icon: "🔍",
    title: "Rechercher un médicament",
    desc: "Référentiel Morocco-first : disponibilité, prix CNOPS, enrichissement clinique séparé.",
  },
  {
    icon: "📤",
    title: "Suivre & transmettre",
    desc: "Suivi de tolérance patient, historique de vos déclarations, export PDF prêt à envoyer au CAPM.",
  },
];

/**
 * Modal de bienvenue — affiché une seule fois au médecin (première visite),
 * puis mémorisé en localStorage. Non bloquant : fermable à tout moment.
 */
export function WelcomeModal({ enabled }: { enabled: boolean }) {
  // Calcul initial côté client (même pattern que DemoBanner) — pas de setState en effet.
  const [open, setOpen] = useState(
    () => enabled && typeof window !== "undefined" && localStorage.getItem(WELCOME_KEY) !== "1"
  );

  function close() {
    try { localStorage.setItem(WELCOME_KEY, "1"); } catch {}
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(15,91,87,0.25)", backdropFilter: "blur(4px)" }}
      onClick={close}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 text-center" style={{ background: "linear-gradient(135deg, var(--md-petrol), #0b3f3c)" }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--md-gold)" }}>Bienvenue sur MAIA DAWA</p>
          <h2 className="text-lg font-bold text-white mt-1">Votre espace pharmacovigilance en 3 étapes</h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base"
                style={{ background: "rgba(15,91,87,0.08)" }}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{i + 1}. {s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 flex flex-col gap-2">
          <button
            onClick={close}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: "var(--md-petrol)" }}
          >
            Commencer
          </button>
          <Link
            href="/demo"
            onClick={close}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-center border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ▶ Voir d&apos;abord une démo (données fictives)
          </Link>
        </div>
      </div>
    </div>
  );
}
