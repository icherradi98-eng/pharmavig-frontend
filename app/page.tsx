"use client";
import Link from "next/link";
import { useState } from "react";

const C = {
  petrol:     "#0F5B57",
  petrolDark: "#0a3f3c",
  petrolMid:  "#1a7a74",
  gold:       "#D4AF37",
  goldLight:  "#f5e9a8",
  mint:       "#2FA88F",
  night:      "#1F2D3D",
  cream:      "#F7F3EE",
  creamDark:  "#ede8e2",
};

function IconArrow() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>;
}
function IconCheck() {
  return <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={C.petrol} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>;
}
function IconShield() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>;
}

function MaiaLogo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: C.petrol }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9"/>
          <path d="M9 12l2 2 4-4" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span style={{ color: dark ? "#fff" : C.petrol, fontWeight: 900, fontSize: 16, letterSpacing: "-0.3px" }}>MAIA</span>
          <span style={{ color: C.gold, fontWeight: 900, fontSize: 16, letterSpacing: "-0.3px" }}>DAWA</span>
        </div>
        <p style={{ color: dark ? "rgba(255,255,255,0.35)" : "#8a9ab0", fontSize: 8, letterSpacing: "0.8px", textTransform: "uppercase", marginTop: -2 }}>
          Pharmacovigilance Intelligence
        </p>
      </div>
    </div>
  );
}

// ── HERO DASHBOARD — version grande ──────────────────────────────────────────

function HeroDashboard() {
  return (
    <div className="relative w-full select-none">
      {/* Glow */}
      <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-20 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 50%, ${C.petrol}, transparent 70%)` }} />

      <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ border: `1px solid rgba(15,91,87,0.2)` }}>
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: C.night, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"/><div className="w-2.5 h-2.5 rounded-full bg-amber-400"/><div className="w-2.5 h-2.5 rounded-full" style={{ background: C.mint }}/></div>
          <div className="flex-1 mx-3 rounded-md px-3 py-1 text-[10px]" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>maiadawa.ma/dashboard · Dr. Cherradi · Oncologie</div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.mint }} />
            <span className="text-[9px]" style={{ color: C.mint }}>En direct</span>
          </div>
        </div>

        <div className="flex" style={{ background: C.cream }}>
          {/* Sidebar */}
          <div className="w-48 shrink-0 hidden lg:flex flex-col" style={{ background: C.night }}>
            <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <MaiaLogo dark />
              <div className="mt-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: C.gold }}>Espace Médecin</div>
            </div>
            <nav className="flex-1 px-2 py-3 space-y-0.5">
              {[
                { label: "Vue d'ensemble", active: true },
                { label: "Déclarations", badge: "" },
                { label: "Alertes sécurité", badge: "3" },
                { label: "Surveillance", badge: "12" },
                { label: "Ordonnances", badge: "" },
                { label: "Molécules", badge: "" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px]"
                  style={{ background: item.active ? "rgba(212,175,55,0.12)" : "transparent", color: item.active ? C.gold : "rgba(255,255,255,0.45)", fontWeight: item.active ? 600 : 400, borderLeft: item.active ? `2px solid ${C.gold}` : "2px solid transparent" }}>
                  <span>{item.label}</span>
                  {item.badge && <span className="text-[9px] font-bold px-1.5 rounded-full" style={{ background: "#C0392B", color: "#fff" }}>{item.badge}</span>}
                </div>
              ))}
            </nav>
            <div className="px-3 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: C.petrol, color: C.gold }}>IC</div>
                <div><p className="text-[10px] font-semibold text-white">Dr. I. Cherradi</p><p className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>Oncologie · CHU Rabat</p></div>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 p-4 space-y-3">
            {/* Alert urgente */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "#fde8e8", border: "1px solid #fecaca" }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#C0392B" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 9v4m0 4h.01"/></svg>
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-red-900">EMA · Signal urgent — Pembrolizumab</span>
                <span className="text-[10px] text-red-700 ml-2">Myocardite sévère — monitoring cardiaque obligatoire avant cycle suivant</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ background: "#C0392B", color: "#fff" }}>Urgent</span>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { label: "Déclarations", val: "23", sub: "+5 ce mois", color: C.night, bg: "#fff" },
                { label: "Suivis actifs", val: "12", sub: "2 en attente", color: C.gold, bg: "#fff" },
                { label: "Alertes actives", val: "3", sub: "1 urgent", color: "#C0392B", bg: "#fff" },
                { label: "Score Bégaud", val: "2.8", sub: "Vraisemblable", color: C.petrol, bg: "#fff" },
              ].map((k) => (
                <div key={k.label} className="rounded-xl p-3" style={{ background: k.bg, border: "1px solid rgba(15,91,87,0.08)" }}>
                  <p className="text-[10px] mb-1" style={{ color: "#8a9ab0" }}>{k.label}</p>
                  <p className="text-xl font-black" style={{ color: k.color }}>{k.val}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: "#8a9ab0" }}>{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Charts + lists */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Activity chart */}
              <div className="col-span-1 rounded-xl p-3 bg-white" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
                <p className="text-[10px] font-semibold mb-2" style={{ color: C.night }}>Activité déclarations</p>
                <div className="flex items-end gap-1" style={{ height: 48 }}>
                  {[2,4,3,7,5,8,4,9,6,8,5,7].map((v, i) => (
                    <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${v*5}px`, background: i >= 9 ? C.petrol : `rgba(15,91,87,${0.15 + i*0.02})` }} />
                  ))}
                </div>
                <p className="text-[9px] mt-1.5" style={{ color: "#8a9ab0" }}>6 mois · 23 déclarations</p>
              </div>

              {/* Patients */}
              <div className="col-span-1 rounded-xl p-3 bg-white" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold" style={{ color: C.night }}>Patients en suivi</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.goldLight, color: "#92700a" }}>12 actifs</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { init: "F.Z.", drug: "Nivolumab", j: "J+14", s: "⚠ Signal", bg: C.goldLight, color: "#92400e" },
                    { init: "M.B.", drug: "Méthotrexate", j: "J+7", s: "✓ RAS", bg: "rgba(15,91,87,0.08)", color: C.petrol },
                    { init: "A.O.", drug: "Pembrolizumab", j: "J+21", s: "⏳ Attente", bg: "#f3f4f6", color: "#9ca3af" },
                    { init: "K.H.", drug: "Apixaban", j: "J+3", s: "✓ RAS", bg: "rgba(15,91,87,0.08)", color: C.petrol },
                  ].map((p) => (
                    <div key={p.init} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: "rgba(15,91,87,0.1)", color: C.petrol }}>{p.init[0]}</div>
                        <span className="text-[10px]" style={{ color: C.night }}>{p.init} {p.drug} <span style={{ color: "#8a9ab0" }}>{p.j}</span></span>
                      </div>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: p.bg, color: p.color }}>{p.s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertes */}
              <div className="col-span-1 rounded-xl p-3 bg-white" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
                <p className="text-[10px] font-semibold mb-2" style={{ color: C.night }}>Alertes récentes</p>
                <div className="space-y-1.5">
                  {[
                    { src: "EMA", drug: "Pembrolizumab", txt: "Signal myocardite", sev: "urgent" },
                    { src: "FDA", drug: "Apixaban", txt: "Interaction warfarine", sev: "important" },
                    { src: "ANSM", drug: "Méthotrexate", txt: "Mise à jour RCP", sev: "info" },
                    { src: "CAPM", drug: "Amoxicilline", txt: "Retrait de lot", sev: "urgent" },
                  ].map((a) => (
                    <div key={a.drug} className="flex items-center gap-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{
                        background: a.sev === "urgent" ? "#fde8e8" : a.sev === "important" ? C.goldLight : "rgba(47,168,143,0.1)",
                        color: a.sev === "urgent" ? "#C0392B" : a.sev === "important" ? "#92700a" : C.mint,
                      }}>{a.src}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium truncate" style={{ color: C.night }}>{a.drug}</p>
                        <p className="text-[9px] truncate" style={{ color: "#8a9ab0" }}>{a.txt}</p>
                      </div>
                      {a.sev === "urgent" && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#C0392B" }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Déclaration récente */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(15,91,87,0.07)", border: "1px solid rgba(15,91,87,0.15)" }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: C.petrol }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: C.petrol }}>Déclaration PV-MA-2026-00187 transmise au CAPM</span>
              <span className="text-[10px] ml-auto" style={{ color: C.mint }}>F.Z. · Pembrolizumab · il y a 2h</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(15,91,87,0.12)", color: C.petrol }}>PDF CIOMS ↓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RÉFÉRENTIEL SECTION ───────────────────────────────────────────────────────

const REF_DRUGS = [
  { name: "Metformine", class: "Biguanide · Antidiabétique", alerts: 0, eis: ["Acidose lactique (rare, grave)", "Nausées, diarrhée", "Carence B12"], cas: 34, signal: false },
  { name: "Pembrolizumab", class: "Anti-PD-1 · Immunothérapie", alerts: 2, eis: ["Myocardite ⚠️ (signal EMA)", "Pneumopathie inflammatoire", "Colite immune"], cas: 89, signal: true },
  { name: "Apixaban", class: "Anti-Xa · Anticoagulant", alerts: 1, eis: ["Hémorragie (interaction warfarine)", "Ecchymoses", "Anémie"], cas: 47, signal: false },
];

function ReferentielSection() {
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
      <div className="grid grid-cols-3 gap-0 divide-x" style={{ divideColor: "rgba(255,255,255,0.06)" }}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div><h3 className="font-bold text-base text-white">{drug.name}</h3><p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{drug.class}</p></div>
            {drug.alerts > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#C0392B", color: "#fff" }}>{drug.alerts} alerte{drug.alerts > 1 ? "s" : ""}</span>}
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>EI majeurs connus</p>
          {drug.eis.map((ei) => <div key={ei} className="flex items-start gap-1.5 mb-1.5"><span style={{ color: C.gold }}>›</span><span className="text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>{ei}</span></div>)}
        </div>
        <div className="p-4" style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
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
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#92700a", color: "#fff" }}>FDA</span>
                <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>Mise à jour RCP — encéphalite immune ajoutée aux EI rares.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg p-2.5" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#92700a", color: "#fff" }}>FDA</span>
              <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>Interaction apixaban–warfarine : risque hémorragique majeur.</p>
            </div>
          )}
        </div>
        <div className="p-4" style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>Données terrain MAIA DAWA</p>
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

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: "Mes données sont-elles confidentielles ?", a: "Oui. MAIA DAWA respecte la loi 09-08. Les données cliniques restent sur votre appareil. Seules les déclarations anonymisées sont transmises au CAPM." },
  { q: "La plateforme est-elle reconnue par le CAPM ?", a: "MAIA DAWA est développée selon les standards ICH E2B R3 et la méthode d'imputabilité de Bégaud utilisée par le système national de pharmacovigilance marocain." },
  { q: "L'ordonnancier stocke-t-il les données patient ?", a: "Non. Les ordonnances restent sur votre appareil uniquement (localStorage). MAIA DAWA ne conserve aucune donnée patient sur ses serveurs — conformément à la loi 09-08." },
  { q: "Peut-on utiliser MAIA DAWA sans être médecin ?", a: "Les patients peuvent signaler via un lien sécurisé envoyé par leur médecin. Les professionnels bénéficient d'un espace dédié avec toutes les fonctionnalités avancées." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y rounded-2xl overflow-hidden" style={{ border: `1px solid rgba(15,91,87,0.12)`, divideColor: C.creamDark }}>
      {FAQ_ITEMS.map((item, i) => (
        <div key={i}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors" style={{ background: open === i ? "rgba(15,91,87,0.03)" : "#fff" }}>
            <span className="font-medium text-sm pr-4" style={{ color: C.night }}>{item.q}</span>
            <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} style={{ color: C.petrol }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-40" : "max-h-0"}`}>
            <p className="px-6 pb-4 text-sm leading-relaxed" style={{ color: "#4a5568" }}>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream }}>

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-3 sticky top-0 z-50 backdrop-blur-md" style={{ background: "rgba(247,243,238,0.93)", borderBottom: `1px solid ${C.creamDark}` }}>
        <Link href="/"><MaiaLogo /></Link>
        <div className="hidden md:flex items-center gap-1">
          {[["Référentiel", "/medicaments"], ["À propos", "/about"], ["Connexion", "/login"]].map(([label, href]) => (
            <Link key={label} href={href} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ color: "#6b7280" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.petrol)} onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>{label}</Link>
          ))}
        </div>
        <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm" style={{ background: C.petrol, color: "#fff" }}
          onMouseEnter={e => (e.currentTarget.style.background = C.petrolDark)} onMouseLeave={e => (e.currentTarget.style.background = C.petrol)}>
          Commencer gratuitement
        </Link>
      </nav>

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="w-full px-6 md:px-12 pt-10 pb-8" style={{ background: `linear-gradient(160deg, ${C.cream} 0%, #fff 55%, rgba(15,91,87,0.03) 100%)` }}>
          <div className="max-w-7xl mx-auto">
            {/* Top: badge + headline + CTA */}
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 bg-white" style={{ border: `1px solid ${C.creamDark}` }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.mint }} />
                  <span className="text-xs font-medium" style={{ color: "#4a5568" }}>Plateforme en service · Maroc 🇲🇦</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-4" style={{ color: C.night }}>
                  La sécurité<br />
                  <span style={{ color: C.petrol }}>médicamenteuse</span><br />
                  <span className="text-4xl md:text-5xl font-bold" style={{ color: "#6b7280" }}>numérisée au Maroc</span>
                </h1>
                <p className="text-base leading-relaxed max-w-lg mb-5" style={{ color: "#6b7280" }}>
                  Déclaration, suivi patient ePRO, alertes personnalisées et référentiel médicament — depuis un seul outil conforme aux standards CAPM · ICH E2B · Bégaud.
                </p>
                <div className="flex flex-wrap gap-2.5 mb-5">
                  <Link href="/register" className="px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-all" style={{ background: C.petrol, color: "#fff" }}>
                    Commencer gratuitement <IconArrow />
                  </Link>
                  <Link href="/medicaments" className="px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 bg-white transition-colors" style={{ border: `1px solid ${C.creamDark}`, color: C.night }}>
                    Explorer le référentiel
                  </Link>
                </div>
                <div className="flex flex-wrap gap-4 text-xs" style={{ color: "#8a9ab0" }}>
                  {["Gratuit pour les médecins", "Données stockées localement", "Conforme loi 09-08"].map(t => (
                    <span key={t} className="flex items-center gap-1.5"><IconCheck />{t}</span>
                  ))}
                </div>
              </div>

              {/* Trust metrics — vertical right */}
              <div className="hidden lg:flex flex-col gap-2 shrink-0 pb-1">
                {[{ val: "95%", label: "EIM non signalés" }, { val: "5 min", label: "par déclaration" }, { val: "5 modules", label: "intégrés" }, { val: "Loi 17-04", label: "conforme" }].map(s => (
                  <div key={s.val} className="text-right">
                    <div className="text-xl font-black" style={{ color: C.petrol }}>{s.val}</div>
                    <div className="text-[10px]" style={{ color: "#8a9ab0" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard — pleine largeur */}
            <HeroDashboard />
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <section className="w-full py-4 px-6 md:px-12 bg-white" style={{ borderTop: `1px solid ${C.creamDark}`, borderBottom: `1px solid ${C.creamDark}` }}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            {[
              { val: "95%", label: "des EIM jamais signalés au Maroc" },
              { val: "5 min", label: "pour une déclaration complète" },
              { val: "ICH E2B R3", label: "standard international" },
              { val: "CAPM", label: "compatible officiel" },
              { val: "Bégaud", label: "méthode d'imputabilité" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-lg font-black" style={{ color: C.petrol }}>{s.val}</span>
                <span className="text-xs" style={{ color: "#8a9ab0" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROBLÈME + FEATURES côte à côte ── */}
        <section className="w-full px-6 md:px-12 py-10" style={{ background: C.night }}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
            {/* Problème */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Le problème</p>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-7xl font-black" style={{ color: C.gold }}>95%</span>
                <span className="text-2xl font-bold text-white leading-tight">des effets<br />indésirables<br />non signalés</span>
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                Au Maroc, la pharmacovigilance repose encore sur des formulaires papier et la mémoire des professionnels. MAIA DAWA intègre la déclaration directement dans la pratique clinique.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[["Formulaires papier → PDF", "Déclaration numérique en 5 min"], ["Alertes manuelles", "Alertes en temps réel"], ["Aucun suivi patient", "Suivi ePRO automatisé"], ["Données dispersées", "Référentiel centralisé"]].map(([before, after]) => (
                  <div key={before} className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-[10px] line-through mb-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{before}</p>
                    <p className="text-[11px] font-semibold" style={{ color: C.gold }}>{after}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.mint} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="5" r="2"/><circle cx="19" cy="14" r="2"/><circle cx="5" cy="14" r="2"/><line x1="12" y1="7" x2="19" y2="12"/><line x1="12" y1="7" x2="5" y2="12"/></svg>, title: "Référentiel", desc: "Base nationale DMP + OMS. Alertes EMA·FDA·ANSM·CAPM en temps réel." },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>, title: "Alertes", desc: "Uniquement les molécules que vous prescrivez. Filtrage intelligent par spécialité." },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2FA88F" strokeWidth="1.8" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>, title: "Ordonnancier", desc: "DCI autocomplete, posologies structurées, PDF A4 imprimable. 100% local." },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>, title: "Suivi ePRO", desc: "Check-ins automatiques J+7/14/21. Chaque signal → déclaration pré-remplie." },
              ].map((f) => (
                <div key={f.title} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="mb-2">{f.icon}</div>
                  <p className="font-bold text-sm text-white mb-1">{f.title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES DÉTAILLÉES 2 colonnes ── */}
        <section className="w-full px-6 md:px-12 py-10 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: C.gold }}>Une seule plateforme</p>
                <h2 className="text-3xl font-bold" style={{ color: C.night }}>Tout ce qu&apos;il vous faut, intégré</h2>
              </div>
              <Link href="/register" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors" style={{ background: C.petrol, color: "#fff" }}>
                Commencer gratuitement <IconArrow />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card large gauche */}
              <div className="row-span-2 rounded-2xl p-6 flex flex-col justify-between" style={{ background: C.cream, border: `1px solid ${C.creamDark}` }}>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4" style={{ background: "rgba(15,91,87,0.1)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.petrol} strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: C.petrol }}>Déclaration pharmacovigilance</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: C.night }}>Formulaire CIOMS pré-rempli, PDF généré automatiquement</h3>
                  <p className="text-sm mb-4" style={{ color: "#6b7280" }}>Imputabilité Bégaud calculée automatiquement. Export PDF CIOMS conforme. Transmission directe au CAPM en 1 clic.</p>
                  <ul className="space-y-2 mb-5">
                    {["Méthode Bégaud intégrée (0→4)", "8 sections CIOMS complètes", "Référence PV-MA-XXXX générée", "Historique et suivi du statut CAPM"].map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "#4a5568" }}><IconCheck />{item}</li>
                    ))}
                  </ul>
                </div>
                {/* Mini mockup déclaration */}
                <div className="bg-white rounded-xl p-3 shadow-sm" style={{ border: `1px solid rgba(15,91,87,0.1)` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold" style={{ color: C.night }}>PV-MA-2026-00187</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(15,91,87,0.1)", color: C.petrol }}>Transmis CAPM</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[["Patient", "F.Z. · 47 ans · F"], ["Médicament", "Pembrolizumab 200mg"], ["Imputabilité", "Bégaud 3 — Vraisemblable"]].map(([k, v]) => (
                      <div key={k} className="rounded-lg p-2" style={{ background: C.cream }}>
                        <p className="text-[9px] mb-0.5" style={{ color: "#8a9ab0" }}>{k}</p>
                        <p className="text-[10px] font-semibold" style={{ color: C.night }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t flex items-center gap-2" style={{ borderColor: C.creamDark }}>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: C.creamDark }}>
                      <div className="h-full rounded-full" style={{ width: "100%", background: C.petrol }} />
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: C.petrol }}>PDF CIOMS ↓</span>
                  </div>
                </div>
              </div>

              {/* 3 cards droite */}
              {[
                { color: C.gold, bg: C.goldLight, title: "Alertes de sécurité en temps réel", desc: "EMA · FDA · ANSM · CAPM filtrées selon vos molécules prescrites. Zéro bruit.", items: ["Filtrage par spécialité et molécules", "Criticité : urgent / important / info", "Lien vers source officielle"] },
                { color: C.mint, bg: "rgba(47,168,143,0.1)", title: "Surveillance patient ePRO", desc: "Check-ins automatiques. Le patient répond en 2 min via un lien sécurisé.", items: ["Protocoles J+7, J+14, J+21", "Détection signal urgent automatique", "Notification médecin immédiate"] },
                { color: C.petrol, bg: "rgba(15,91,87,0.08)", title: "Ordonnancier professionnel", desc: "DCI, posologies, contre-indications — stocké uniquement sur votre appareil.", items: ["Autocomplete DCI + alertes interactions", "PDF A4 conforme CAPM", "Historique complet local"] },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl p-5 bg-white" style={{ border: `1px solid ${C.creamDark}` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: c.bg }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2" strokeLinecap="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </div>
                  <h3 className="font-bold text-sm mb-1.5" style={{ color: C.night }}>{c.title}</h3>
                  <p className="text-xs mb-3" style={{ color: "#6b7280" }}>{c.desc}</p>
                  <ul className="space-y-1">
                    {c.items.map(item => <li key={item} className="flex items-center gap-1.5 text-xs" style={{ color: "#4a5568" }}><IconCheck />{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RÉFÉRENTIEL ── */}
        <section className="w-full px-6 md:px-12 py-10" style={{ background: C.cream }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: C.gold }}>Référentiel</p>
                <h2 className="text-3xl font-bold" style={{ color: C.night }}>Le premier référentiel marocain<br />de sécurité médicamenteuse</h2>
              </div>
              <Link href="/medicaments" className="hidden md:flex items-center gap-2 text-sm font-semibold" style={{ color: C.petrol }}>
                Explorer tout le référentiel <IconArrow />
              </Link>
            </div>
            <ReferentielSection />
          </div>
        </section>

        {/* ── WORKFLOW compact ── */}
        <section className="w-full px-6 md:px-12 py-10 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: C.gold }}>De la prescription à la déclaration</p>
              <h2 className="text-2xl font-bold" style={{ color: C.night }}>Comment MAIA DAWA améliore la pharmacovigilance</h2>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { num: "01", title: "Prescription", desc: "Ordonnancier DCI" },
                { num: "02", title: "Suivi patient", desc: "Check-in automatique" },
                { num: "03", title: "Signal détecté", desc: "EI identifié" },
                { num: "04", title: "Déclaration", desc: "Formulaire pré-rempli" },
                { num: "05", title: "Transmission", desc: "CAPM notifié", last: true },
              ].map((step, i) => (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  {i < 4 && <div className="absolute top-5 left-1/2 w-full h-px" style={{ background: `linear-gradient(to right, ${C.creamDark}, ${C.creamDark})`, zIndex: 0 }} />}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 z-10 shadow-sm relative"
                    style={{ background: step.last ? C.petrol : "#fff", border: `1px solid ${step.last ? C.petrol : C.creamDark}` }}>
                    {step.last
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg>
                      : <span className="text-xs font-black" style={{ color: C.petrol }}>{step.num}</span>}
                  </div>
                  <p className="font-semibold text-xs mb-0.5" style={{ color: C.night }}>{step.title}</p>
                  <p className="text-[10px]" style={{ color: "#8a9ab0" }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONFORMITÉ + VISION côte à côte ── */}
        <section className="w-full px-6 md:px-12 py-10" style={{ background: C.night }}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Standards internationaux</p>
              <h2 className="text-2xl font-bold text-white mb-4">Construit selon les exigences des autorités sanitaires</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Méthode de Bégaud", desc: "Score imputabilité officiel" },
                  { label: "MedDRA", desc: "Terminologie internationale" },
                  { label: "ICH E2B(R3)", desc: "Transmission données" },
                  { label: "Loi 17-04", desc: "Pharmacovigilance Maroc" },
                  { label: "Loi 09-08 / CNDP", desc: "Protection données" },
                  { label: "CIOMS", desc: "Format déclaration" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-2.5 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,91,87,0.4)", color: C.gold }}><IconShield /></div>
                    <div><p className="text-xs font-bold text-white">{c.label}</p><p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{c.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Notre vision</p>
              <h2 className="text-2xl font-bold text-white mb-4">Vers la première infrastructure de pharmacovigilance numérique d&apos;Afrique francophone</h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                Connecter professionnels de santé, patients et autorités sanitaires pour améliorer la détection précoce des risques médicamenteux — faire du Maroc un modèle pour la région.
              </p>
              <div className="grid grid-cols-3 gap-3">
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

        {/* ── FAQ + CTA côte à côte ── */}
        <section className="w-full px-6 md:px-12 py-10 bg-white">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: C.gold }}>FAQ</p>
              <h2 className="text-2xl font-bold mb-4" style={{ color: C.night }}>Questions fréquentes</h2>
              <FAQ />
            </div>
            <div className="rounded-2xl p-8 flex flex-col items-center text-center" style={{ background: C.night }}>
              <MaiaLogo dark />
              <h3 className="text-2xl font-bold text-white mt-5 mb-3">Rejoignez les professionnels<br />qui font confiance à MAIA DAWA</h3>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>Ordonnancier · Alertes · Suivi ePRO · Déclaration CAPM<br />Gratuit pour les médecins.</p>
              <div className="flex flex-col gap-2.5 w-full max-w-xs">
                <Link href="/register" className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors" style={{ background: C.gold, color: C.night }}>
                  Commencer gratuitement <IconArrow />
                </Link>
                <Link href="/dashboard/invite" className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white border transition-colors" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  Signaler sans compte
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 w-full">
                {[["23+", "Déclarations"], ["12+", "Patients suivis"], ["100%", "Conforme"]].map(([v, l]) => (
                  <div key={l} className="rounded-lg py-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <p className="font-bold text-sm" style={{ color: C.gold }}>{v}</p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{l}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>Sans engagement · Données stockées sur votre appareil · CNDP</p>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#111827", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-3"><MaiaLogo dark /></div>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>Pharmacovigilance numérique — du Maroc à l&apos;Afrique francophone.</p>
              <a href="mailto:contact@maiadawa.ma" className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>contact@maiadawa.ma</a>
            </div>
            {[
              { title: "Plateforme", links: [["Référentiel", "/medicaments"], ["Ordonnancier", "/ordonnances/nouvelle"], ["Surveillance", "/dashboard/medecin/surveillance"], ["Alertes", "/dashboard/medecin/alertes"]] },
              { title: "Déclarer", links: [["Médecin", "/login"], ["Patient", "/login"], ["Sans compte", "/dashboard/invite"], ["CAPM officiel ↗", "https://capm.ma"]] },
              { title: "Légal", links: [["Confidentialité", "/confidentialite"], ["Conditions", "/conditions"], ["Mentions légales", "/mentions-legales"], ["À propos", "/about"]] },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="font-semibold text-[10px] uppercase tracking-wider mb-3 text-white">{col.title}</h3>
                <ul className="space-y-1.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}><Link href={href} className="text-xs transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 md:px-12 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>© 2025–2026 MAIA DAWA · Maroc · Afrique francophone</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>Pharmacovigilance Intelligence for Safer Medicines</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
