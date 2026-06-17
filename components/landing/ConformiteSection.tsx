"use client";
import { C } from "./constants";
import { IconShield } from "./icons";

export function ConformiteSection() {
  return (
    <section className="w-full px-6 md:px-12 py-12" style={{ background: C.night }}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Standards</p>
          <h2 className="text-2xl font-bold text-white mb-5">Construit sur les exigences de la pharmacovigilance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "Méthode de Bégaud", desc: "Imputabilité officielle" },
              { label: "MedDRA", desc: "Terminologie internationale" },
              { label: "ICH E2B(R3)", desc: "Transmission des données" },
              { label: "CIOMS", desc: "Format de déclaration" },
              { label: "Loi 17-04", desc: "Cadre pharmacovigilance Maroc" },
              { label: "Loi 09-08 / CNDP", desc: "Mise en conformité en cours" },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-2.5 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,91,87,0.4)", color: C.gold }}><IconShield /></div>
                <div><p className="text-xs font-bold text-white">{c.label}</p><p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{c.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Trajectoire</p>
          <h2 className="text-2xl font-bold text-white mb-4">Déployé au Maroc. Conçu pour l&apos;Afrique francophone.</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
            Connecter professionnels de santé, patients et autorités sanitaires pour améliorer la détection précoce des risques médicamenteux.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[{ val: "Maroc", sub: "Phase 1 · 2026" }, { val: "Afrique", sub: "Francophone · 2027" }, { val: "MENA", sub: "Expansion · 2028" }].map(s => (
              <div key={s.val} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="font-bold text-sm text-white">{s.val}</p>
                <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
