"use client";
import Link from "next/link";
import { useState } from "react";
import { C } from "./constants";
import { IconArrow } from "./icons";

const REF_DRUGS = [
  { name: "Metformine", class: "Biguanide · Antidiabétique", alerts: 0, eis: ["Acidose lactique (rare, grave)", "Nausées, diarrhée", "Carence B12"], cas: 34, signal: false },
  { name: "Pembrolizumab", class: "Anti-PD-1 · Immunothérapie", alerts: 2, eis: ["Myocardite ⚠️ (signal EMA)", "Pneumopathie inflammatoire", "Colite immune"], cas: 89, signal: true },
  { name: "Apixaban", class: "Anti-Xa · Anticoagulant", alerts: 1, eis: ["Hémorragie (interaction warfarine)", "Ecchymoses", "Anémie"], cas: 47, signal: false },
];

function ReferentielWidget() {
  const [sel, setSel] = useState(1);
  const drug = REF_DRUGS[sel];
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: C.night }}>
      <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <svg className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span className="text-[11px] flex-1" style={{ color: "rgba(255,255,255,0.25)" }}>Rechercher un médicament, une DCI…</span>
        <div className="flex gap-1.5">
          {REF_DRUGS.map((d, i) => (
            <button key={d.name} onClick={() => setSel(i)} className="text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-colors"
              style={{ background: sel === i ? C.petrol : "rgba(255,255,255,0.06)", color: sel === i ? "#fff" : "rgba(255,255,255,0.4)" }}>
              {d.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-white/10">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div><h3 className="font-bold text-base text-white">{drug.name}</h3><p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{drug.class}</p></div>
            {drug.alerts > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#C0392B", color: "#fff" }}>{drug.alerts} alerte{drug.alerts > 1 ? "s" : ""}</span>}
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>EI majeurs connus</p>
          {drug.eis.map((ei) => <div key={ei} className="flex items-start gap-1.5 mb-1.5"><span style={{ color: C.gold }}>›</span><span className="text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>{ei}</span></div>)}
        </div>
        <div className="p-4">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>Alertes réglementaires</p>
          {drug.alerts === 0 ? (
            <div className="flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.mint} strokeWidth="2.5" strokeLinecap="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg><p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Aucune alerte active</p></div>
          ) : drug.name === "Pembrolizumab" ? (
            <div className="space-y-2">
              <div className="rounded-lg p-2.5" style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)" }}>
                <div className="flex items-center gap-1.5 mb-1"><span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#C0392B", color: "#fff" }}>EMA</span><span className="text-[9px] font-bold" style={{ color: "#ff8a80" }}>URGENT</span></div>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>Signal myocardite sévère. Monitoring cardiaque avant chaque cycle.</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#92700a", color: "#fff" }}>EMA</span>
                <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>Mise à jour RCP — encéphalite immune ajoutée aux EI rares.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg p-2.5" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#92700a", color: "#fff" }}>EMA</span>
              <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>Interaction apixaban–warfarine : risque hémorragique majeur.</p>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>Données terrain MAI DAWA</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl font-black text-white">{drug.cas}</div>
            <div><p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>cas signalés</p>{drug.signal && <p className="text-[9px] font-bold" style={{ color: C.gold }}>⚡ Signal émergent</p>}</div>
          </div>
          {(drug.name === "Pembrolizumab" ? [["Pneumopathie", 31], ["Myocardite", 18], ["Fatigue", 12]] : drug.name === "Apixaban" ? [["Hémorragie", 24], ["Ecchymoses", 19], ["Anémie", 9]] : [["Nausées", 28], ["Fatigue", 19], ["Céphalées", 12]]).map(([ei, pct]) => (
            <div key={String(ei)} className="mb-1.5">
              <div className="flex justify-between mb-0.5"><span className="text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>{ei}</span><span className="text-[10px] font-bold" style={{ color: C.gold }}>{pct}%</span></div>
              <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}><div className="h-full rounded-full" style={{ width: `${Number(pct) * 3}%`, background: C.petrol }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReferentielSection() {
  return (
    <section className="w-full px-6 md:px-12 py-12" style={{ background: C.cream }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: C.gold }}>Référentiel</p>
            <h2 className="text-3xl font-bold" style={{ color: C.night }}>Le premier référentiel marocain<br className="hidden md:block" /> de sécurité médicamenteuse</h2>
          </div>
          <Link href="/medicaments" className="hidden md:flex items-center gap-2 text-sm font-semibold" style={{ color: C.petrol }}>
            Explorer tout le référentiel <IconArrow />
          </Link>
        </div>
        <ReferentielWidget />
      </div>
    </section>
  );
}
