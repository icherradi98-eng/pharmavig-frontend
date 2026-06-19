"use client";
import { C } from "./constants";

export function ProblemBandSection() {
  return (
    <section className="w-full px-6 md:px-12 py-7" style={{ background: C.night }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <span className="text-4xl font-black shrink-0" style={{ color: C.gold }}>95%</span>
        <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          Au Maroc, près de <strong className="text-white">95% des effets indésirables ne sont jamais signalés</strong> — le plus souvent par manque d&apos;outil intégré, pas par manque de volonté. MAI DAWA place la déclaration là où elle doit être : dans le flux clinique.
        </p>
      </div>
    </section>
  );
}
