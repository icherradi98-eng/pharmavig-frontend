"use client";
import Link from "next/link";
import { useState } from "react";

// ── Icônes ────────────────────────────────────────────────────────────────────

function IconArrow() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

// ── Hero mockup (compact) ─────────────────────────────────────────────────────

function HeroMockup() {
  return (
    <div className="relative w-full max-w-lg select-none">
      <div className="absolute -inset-8 bg-emerald-400/10 rounded-3xl blur-2xl" />
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden text-left">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs text-gray-400 ml-2">pharmavig.ma — Tableau de bord</span>
        </div>
        <div className="p-4 space-y-3 bg-gray-50/50">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
            <span className="text-red-500 text-base mt-0.5">⚠️</span>
            <div>
              <p className="text-xs font-semibold text-red-800">Alerte EMA — Pembrolizumab</p>
              <p className="text-[11px] text-red-600 mt-0.5">Nouveau signal de myocardite sévère. Monitoring cardiaque recommandé.</p>
            </div>
            <span className="ml-auto text-[10px] font-bold uppercase text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full shrink-0">Urgent</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-800">🛰️ Suivi de tolérance — 3 actifs</p>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">2 en attente</span>
            </div>
            {[
              { i: "F.Z.", drug: "Nivolumab", s: "Signal", c: "text-amber-600 bg-amber-50" },
              { i: "M.B.", drug: "Méthotrexate", s: "RAS ✓", c: "text-emerald-600 bg-emerald-50" },
              { i: "A.O.", drug: "Pembrolizumab", s: "En attente", c: "text-gray-500 bg-gray-50" },
            ].map((p) => (
              <div key={p.i} className="flex items-center justify-between py-1">
                <span className="text-[11px] text-gray-600">{p.i} · {p.drug}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${p.c}`}>{p.s}</span>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
            <span className="text-emerald-600">✅</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-emerald-800">Déclaration transmise au CAPM</p>
              <p className="text-[11px] text-emerald-600">PV-MA-2026-00187 · F.Z. · Pembrolizumab</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-800">CAPM notifié</p>
          <p className="text-[9px] text-gray-400">à l&apos;instant</p>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard complet (section dédiée) ───────────────────────────────────────

function DashboardPreview() {
  return (
    <div className="relative w-full select-none">
      <div className="absolute -inset-4 bg-gradient-to-b from-emerald-50 to-blue-50 rounded-3xl blur-2xl opacity-60" />
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Barre titre */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/80">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1 flex-1 max-w-xs">
            <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-[11px] text-gray-400">pharmavig.ma/dashboard</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-gray-500">Dr. Cherradi</span>
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">IC</div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-44 border-r border-gray-100 bg-gray-50/50 p-3 hidden md:block">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Navigation</p>
            {[
              { icon: "📊", label: "Vue d'ensemble", active: true },
              { icon: "⚠️", label: "Alertes", badge: "3" },
              { icon: "🛰️", label: "Patients suivis", badge: "12" },
              { icon: "💊", label: "Mes molécules" },
              { icon: "📄", label: "Ordonnancier" },
              { icon: "📋", label: "Déclarations" },
            ].map((item) => (
              <div key={item.label} className={`flex items-center justify-between px-2 py-1.5 rounded-lg mb-0.5 ${item.active ? "bg-emerald-50 text-emerald-700" : "text-gray-500"}`}>
                <span className="flex items-center gap-1.5 text-[11px] font-medium">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span className="text-[9px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5">{item.badge}</span>
                )}
              </div>
            ))}
          </div>

          {/* Contenu principal */}
          <div className="flex-1 p-4 space-y-4 bg-gray-50/30">
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Déclarations", val: "23", sub: "ce mois +5", color: "text-gray-900" },
                { label: "Suivis actifs", val: "12", sub: "2 en attente", color: "text-amber-600" },
                { label: "Alertes actives", val: "3", sub: "1 urgent", color: "text-red-600" },
                { label: "Score Bégaud", val: "I2.8", sub: "Plausible", color: "text-blue-600" },
              ].map((k) => (
                <div key={k.label} className="bg-white border border-gray-200 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 mb-1">{k.label}</p>
                  <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{k.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Alertes récentes */}
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-800 mb-2">🔔 Alertes récentes</p>
                <div className="space-y-2">
                  {[
                    { src: "EMA", drug: "Pembrolizumab", txt: "Signal myocardite", sev: "urgent" },
                    { src: "FDA", drug: "Apixaban", txt: "Interaction warfarine", sev: "important" },
                    { src: "ANSM", drug: "Méthotrexate", txt: "Mise à jour RCP", sev: "info" },
                  ].map((a) => (
                    <div key={a.drug} className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        a.sev === "urgent" ? "bg-red-100 text-red-700" :
                        a.sev === "important" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      }`}>{a.src}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-gray-800 truncate">{a.drug}</p>
                        <p className="text-[10px] text-gray-400 truncate">{a.txt}</p>
                      </div>
                      {a.sev === "urgent" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suivi patients */}
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-800 mb-2">🛰️ Patients en suivi</p>
                <div className="space-y-2">
                  {[
                    { init: "F.Z.", drug: "Nivolumab", j: "J+14", s: "Signal", sc: "text-amber-600 bg-amber-50" },
                    { init: "M.B.", drug: "Méthotrexate", j: "J+7", s: "RAS", sc: "text-emerald-600 bg-emerald-50" },
                    { init: "A.O.", drug: "Pembrolizumab", j: "J+21", s: "Attente", sc: "text-gray-400 bg-gray-50" },
                    { init: "K.H.", drug: "Apixaban", j: "J+3", s: "RAS", sc: "text-emerald-600 bg-emerald-50" },
                  ].map((p) => (
                    <div key={p.init} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500">{p.init[0]}</div>
                        <div>
                          <p className="text-[11px] font-medium text-gray-800">{p.init} · {p.drug}</p>
                          <p className="text-[9px] text-gray-400">{p.j}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${p.sc}`}>{p.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Déclarations récentes + molécules surveillées */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-800 mb-2">📋 Déclarations récentes</p>
                <div className="space-y-1.5">
                  {[
                    { ref: "PV-2026-187", drug: "Pembrolizumab", s: "Transmis", sc: "bg-emerald-100 text-emerald-700" },
                    { ref: "PV-2026-183", drug: "Nivolumab", s: "En cours", sc: "bg-amber-100 text-amber-700" },
                    { ref: "PV-2026-179", drug: "Méthotrexate", s: "Traité", sc: "bg-blue-100 text-blue-700" },
                  ].map((d) => (
                    <div key={d.ref} className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium text-gray-700">{d.drug}</p>
                        <p className="text-[9px] text-gray-400">{d.ref}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${d.sc}`}>{d.s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-800 mb-2">💊 Molécules surveillées</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Pembrolizumab", "Nivolumab", "Méthotrexate", "Apixaban", "Trastuzumab", "Imatinib"].map((m) => (
                    <span key={m} className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">{m}</span>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400">Prochaine alerte estimée</p>
                  <p className="text-[11px] font-semibold text-gray-700 mt-0.5">Trastuzumab — Revue EMA · dans 3 jours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section "Pourquoi les médecins reviennent" — 4 cartes ────────────────────

function CardAlertes() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">🔔</span>
          <p className="text-sm font-bold text-gray-900">Alertes personnalisées</p>
        </div>
        <p className="text-xs text-gray-500">Uniquement les médicaments que vous prescrivez réellement</p>
      </div>
      <div className="p-4 space-y-2">
        {[
          { src: "EMA", txt: "Pembrolizumab — Signal myocardite", sev: "urgent", t: "il y a 2h" },
          { src: "FDA", txt: "Apixaban — Interaction warfarine", sev: "important", t: "hier" },
          { src: "ANSM", txt: "Méthotrexate — Mise à jour RCP", sev: "info", t: "il y a 3j" },
          { src: "CAPM", txt: "Retrait de lot — Amoxicilline 1g", sev: "urgent", t: "il y a 5j" },
        ].map((a) => (
          <div key={a.txt} className="flex items-center gap-2.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
              a.sev === "urgent" ? "bg-red-100 text-red-700" :
              a.sev === "important" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
            }`}>{a.src}</span>
            <span className="text-[11px] text-gray-700 flex-1 truncate">{a.txt}</span>
            <span className="text-[10px] text-gray-400 shrink-0">{a.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardPatients() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">🛰️</span>
          <p className="text-sm font-bold text-gray-900">Patients à suivre</p>
        </div>
        <p className="text-xs text-gray-500">Visualisez les réponses et les signaux en un coup d&apos;œil</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { val: "12", label: "suivis actifs", color: "text-gray-900" },
            { val: "2", label: "en attente", color: "text-amber-600" },
            { val: "1", label: "signal détecté", color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="text-center bg-gray-50 rounded-xl py-2">
              <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {[
            { i: "F.Z.", drug: "Nivolumab", j: "J+14", s: "⚠️ Signal", sc: "text-amber-700 bg-amber-50 border-amber-100" },
            { i: "M.B.", drug: "Méthotrexate", j: "J+7", s: "✓ RAS", sc: "text-emerald-700 bg-emerald-50 border-emerald-100" },
            { i: "A.O.", drug: "Pembrolizumab", j: "J+21", s: "⏳ Attente", sc: "text-gray-500 bg-gray-50 border-gray-100" },
          ].map((p) => (
            <div key={p.i} className={`flex items-center justify-between text-[11px] rounded-lg px-2.5 py-1.5 border ${p.sc}`}>
              <span>{p.i} · {p.drug} <span className="text-[10px] opacity-60">{p.j}</span></span>
              <span className="font-semibold">{p.s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardMolecules() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">💊</span>
          <p className="text-sm font-bold text-gray-900">Médicaments surveillés</p>
        </div>
        <p className="text-xs text-gray-500">Soyez alerté des évolutions réglementaires en temps réel</p>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {["Pembrolizumab", "Nivolumab", "Apixaban", "Trastuzumab", "Méthotrexate", "Imatinib"].map((m, i) => (
            <span key={m} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              i === 0 ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}>{m}{i === 0 && " ⚠️"}</span>
          ))}
        </div>
        <div className="space-y-1.5 border-t border-gray-100 pt-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Prochaines revues EMA</p>
          {[
            { drug: "Trastuzumab", date: "dans 3 jours", color: "text-amber-600" },
            { drug: "Imatinib", date: "dans 2 semaines", color: "text-gray-600" },
          ].map((r) => (
            <div key={r.drug} className="flex items-center justify-between text-[11px]">
              <span className="text-gray-700">{r.drug}</span>
              <span className={`font-semibold ${r.color}`}>{r.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardTableauBord() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-blue-50 to-violet-50 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">📊</span>
          <p className="text-sm font-bold text-gray-900">Tableau de bord sécurité</p>
        </div>
        <p className="text-xs text-gray-500">Alertes, suivis et déclarations depuis un seul espace</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { val: "23", label: "déclarations", icon: "📋" },
            { val: "3", label: "alertes actives", icon: "🔔" },
            { val: "I2.8", label: "Bégaud moy.", icon: "📈" },
            { val: "87%", label: "taux de suivi", icon: "✅" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
              <span className="text-sm">{s.icon}</span>
              <p className="text-base font-black text-gray-900 mt-0.5">{s.val}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
          <p className="text-[11px] text-blue-800 font-medium">📊 Votre activité ce mois</p>
          <div className="flex gap-1 mt-1.5">
            {[4, 6, 3, 8, 2, 7, 5, 9, 4, 6, 3, 5].map((v, i) => (
              <div key={i} className="flex-1 bg-blue-200 rounded-sm" style={{ height: `${v * 3}px`, alignSelf: "flex-end" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section Référentiel ───────────────────────────────────────────────────────

const REF_DRUGS = [
  {
    name: "Metformine",
    class: "Biguanide · Antidiabétique",
    alerts: 0,
    eis: ["Acidose lactique (rare, grave)", "Nausées, diarrhée", "Carence B12"],
    pv: { cas: 34, signal: false },
  },
  {
    name: "Pembrolizumab",
    class: "Anti-PD-1 · Immunothérapie",
    alerts: 2,
    eis: ["Myocardite ⚠️ (signal EMA)", "Pneumopathie inflammatoire", "Colite immune"],
    pv: { cas: 89, signal: true },
  },
  {
    name: "Apixaban",
    class: "Anti-Xa · Anticoagulant",
    alerts: 1,
    eis: ["Hémorragie (interaction warfarine)", "Ecchymoses", "Anémie"],
    pv: { cas: 47, signal: false },
  },
];

function ReferentielSection() {
  const [selected, setSelected] = useState(0);
  const drug = REF_DRUGS[selected];

  return (
    <section className="w-full px-6 md:px-10 py-20 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">Référentiel</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Le premier référentiel marocain<br />de sécurité médicamenteuse
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Consultez les effets indésirables, alertes réglementaires et données terrain pour chaque médicament que vous prescrivez.
          </p>
        </div>

        <div className="bg-gray-950 rounded-2xl overflow-hidden shadow-2xl">
          {/* Barre de recherche simulée */}
          <div className="p-5 border-b border-gray-800">
            <div className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 max-w-xl mx-auto">
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-gray-500 text-sm flex-1">Rechercher un médicament ou une DCI…</span>
              <div className="flex gap-2">
                {REF_DRUGS.map((d, i) => (
                  <button key={d.name} onClick={() => setSelected(i)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${selected === i ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"}`}>
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Résultat */}
          <div className="p-5 grid md:grid-cols-3 gap-4">
            {/* Identité */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-bold text-lg">{drug.name}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{drug.class}</p>
                </div>
                {drug.alerts > 0 && (
                  <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                    {drug.alerts} alerte{drug.alerts > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">EI majeurs connus</p>
                {drug.eis.map((ei) => (
                  <div key={ei} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5 shrink-0">›</span>
                    <span className="text-xs text-gray-300">{ei}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alertes */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3">Alertes réglementaires</p>
              {drug.alerts === 0 ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-emerald-500">✅</span>
                  <p className="text-xs text-gray-400">Aucune alerte active</p>
                </div>
              ) : drug.name === "Pembrolizumab" ? (
                <div className="space-y-2">
                  <div className="bg-red-950/50 border border-red-900 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">EMA</span>
                      <span className="text-[10px] text-red-400 font-semibold">URGENT</span>
                    </div>
                    <p className="text-[11px] text-gray-300">Signal de myocardite sévère. Monitoring cardiaque recommandé avant chaque cycle.</p>
                    <p className="text-[10px] text-gray-500 mt-1">Publié le 3 juin 2026</p>
                  </div>
                  <div className="bg-amber-950/30 border border-amber-900 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold bg-amber-700 text-white px-1.5 py-0.5 rounded">FDA</span>
                    </div>
                    <p className="text-[11px] text-gray-300">Mise à jour du RCP — Ajout de l&apos;encéphalite immune dans les EI rares.</p>
                    <p className="text-[10px] text-gray-500 mt-1">Publié le 28 mai 2026</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-950/30 border border-amber-900 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-bold bg-amber-700 text-white px-1.5 py-0.5 rounded">FDA</span>
                  </div>
                  <p className="text-[11px] text-gray-300">Interaction apixaban–warfarine : risque hémorragique majeur. Éviter l&apos;association.</p>
                  <p className="text-[10px] text-gray-500 mt-1">Publié le 15 mai 2026</p>
                </div>
              )}
            </div>

            {/* Données PharmaVig */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3">Données terrain PharmaVig</p>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl font-black text-white">{drug.pv.cas}</div>
                <div>
                  <p className="text-xs text-gray-400">cas signalés</p>
                  {drug.pv.signal && <p className="text-[10px] text-amber-400 font-semibold">⚡ Signal émergent</p>}
                </div>
              </div>
              <div className="space-y-1.5 border-t border-gray-800 pt-3">
                <p className="text-[10px] text-gray-500 mb-1.5">EI les plus rapportés</p>
                {(drug.name === "Pembrolizumab"
                  ? [["Pneumopathie", "31%"], ["Myocardite", "18%"], ["Fatigue", "12%"]]
                  : drug.name === "Apixaban"
                  ? [["Hémorragie mineure", "24%"], ["Ecchymoses", "19%"], ["Anémie", "9%"]]
                  : [["Nausées", "28%"], ["Fatigue", "19%"], ["Céphalées", "12%"]]
                ).map(([ei, pct]) => (
                  <div key={ei} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[10px] text-gray-300">{ei}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">{pct}</span>
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: pct }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href={`/medicaments/${drug.name.toLowerCase()}`}
                className="mt-3 block text-center text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Voir la fiche complète →
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link href="/medicaments" className="inline-flex items-center gap-2 text-sm text-emerald-700 font-semibold hover:underline">
            Explorer tout le référentiel <IconArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Section Données terrain ───────────────────────────────────────────────────

function DonneesTerrainSection() {
  const DRUG_DATA = [
    {
      name: "Méthotrexate",
      patients: 124,
      eis: [
        { name: "Nausées", pct: 28, color: "bg-amber-400" },
        { name: "Fatigue", pct: 19, color: "bg-orange-400" },
        { name: "Céphalées", pct: 12, color: "bg-red-400" },
        { name: "Aphtes buccaux", pct: 8, color: "bg-rose-400" },
      ],
      signal: false,
      begaud: "I2.4",
    },
    {
      name: "Pembrolizumab",
      patients: 89,
      eis: [
        { name: "Pneumopathie immune", pct: 31, color: "bg-red-500" },
        { name: "Myocardite", pct: 18, color: "bg-red-600" },
        { name: "Fatigue sévère", pct: 14, color: "bg-orange-400" },
        { name: "Colite", pct: 9, color: "bg-amber-400" },
      ],
      signal: true,
      begaud: "I3.1",
    },
    {
      name: "Apixaban",
      patients: 67,
      eis: [
        { name: "Hémorragie mineure", pct: 24, color: "bg-red-400" },
        { name: "Ecchymoses", pct: 19, color: "bg-orange-300" },
        { name: "Anémie", pct: 9, color: "bg-amber-400" },
        { name: "Nausées", pct: 6, color: "bg-yellow-400" },
      ],
      signal: false,
      begaud: "I2.0",
    },
  ];

  const [sel, setSel] = useState(0);
  const d = DRUG_DATA[sel];

  return (
    <section className="w-full px-6 md:px-10 py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">Pharmacovigilance terrain</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ce que les patients rapportent réellement
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            PharmaVig agrège les signalements de sa communauté de médecins pour construire des données de tolérance réelles — au-delà des RCP officiels.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Sélecteur */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {DRUG_DATA.map((drug, i) => (
              <button key={drug.name} onClick={() => setSel(i)}
                className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                  sel === i ? "border-emerald-600 text-emerald-700 bg-white" : "border-transparent text-gray-500 hover:text-gray-800"
                }`}>
                {drug.name}
                {drug.signal && <span className="ml-1.5 text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">Signal</span>}
              </button>
            ))}
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-8 items-center">
            {/* Stats */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-4xl font-black text-gray-900">{d.patients}</p>
                  <p className="text-xs text-gray-400 mt-0.5">patients suivis</p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div className="text-center">
                  <p className="text-4xl font-black text-blue-600">{d.begaud}</p>
                  <p className="text-xs text-gray-400 mt-0.5">score Bégaud moy.</p>
                </div>
                {d.signal && (
                  <>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
                      <p className="text-xs font-bold text-amber-700">⚡ Signal émergent</p>
                      <p className="text-[10px] text-amber-600 mt-0.5">En évaluation CAPM</p>
                    </div>
                  </>
                )}
              </div>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Effets rapportés par les patients</p>
              <div className="space-y-3">
                {d.eis.map((ei) => (
                  <div key={ei.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-700">{ei.name}</span>
                      <span className="text-sm font-bold text-gray-900">{ei.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${ei.color} rounded-full transition-all duration-500`} style={{ width: `${ei.pct * 3}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="bg-gray-950 rounded-2xl p-6 text-white">
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-3">Ce que ça change</p>
              <p className="text-lg font-bold mb-4 leading-snug">
                Les données PharmaVig vont plus loin que les RCP officiels.
              </p>
              <div className="space-y-3">
                {[
                  "Détection de signaux non documentés dans les sources réglementaires",
                  "Données spécifiques à la population marocaine",
                  "Fréquences réelles vs fréquences théoriques du RCP",
                  "Corrélation avec les profils de tolérance individuels",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <p className="text-sm text-gray-300">{t}</p>
                  </div>
                ))}
              </div>
              <Link href="/register" className="mt-5 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                Contribuer à la base de données <IconArrow />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Workflow steps ────────────────────────────────────────────────────────────

const WORKFLOW = [
  { icon: "💊", title: "Prescription", desc: "Le médecin prescrit via l'ordonnancier PharmaVig" },
  { icon: "📱", title: "Suivi patient", desc: "Le patient reçoit un check-in automatique" },
  { icon: "⚠️", title: "Signal détecté", desc: "Un effet indésirable potentiel est identifié" },
  { icon: "📋", title: "Déclaration pré-remplie", desc: "Le formulaire CAPM est prérempli automatiquement" },
  { icon: "✅", title: "Transmission CAPM", desc: "La déclaration intègre la base nationale" },
];

const CONFORMITE = [
  { label: "Méthode de Bégaud", desc: "Score d'imputabilité officiel" },
  { label: "MedDRA", desc: "Terminologie médicale internationale" },
  { label: "ICH E2B(R3)", desc: "Standard de transmission des données" },
  { label: "Pharmacovigilance hospitalière", desc: "Compatible établissements de santé" },
  { label: "Loi 09-08 / CNDP", desc: "Protection des données personnelles" },
];

const FAQ_ITEMS = [
  {
    q: "Est-ce que mes données sont confidentielles ?",
    a: "Oui. PharmaVig respecte la loi marocaine 09-08. Les données cliniques de l'ordonnancier restent sur votre appareil uniquement. Seules les déclarations d'effets indésirables, anonymisées, sont transmises au CAPM.",
  },
  {
    q: "Dois-je être professionnel de santé pour utiliser PharmaVig ?",
    a: "Non. Les patients peuvent signaler leurs effets indésirables via un lien envoyé par leur médecin, ou de façon anonyme via le formulaire public. Les professionnels bénéficient d'un espace dédié avec toutes les fonctionnalités avancées.",
  },
  {
    q: "Pourquoi revenir sur PharmaVig chaque semaine ?",
    a: "PharmaVig est un système vivant : vous recevez des alertes personnalisées sur vos molécules, visualisez les réponses de vos patients en suivi ePRO, consultez le référentiel enrichi, et suivez l'évolution de vos signaux. Ce n'est pas un formulaire — c'est un outil de pratique clinique quotidienne.",
  },
  {
    q: "L'ordonnancier stocke-t-il les données patient ?",
    a: "Non. Les ordonnances et les données patients restent stockées uniquement sur votre appareil (localStorage). PharmaVig ne conserve aucune donnée patient sur ses serveurs — conformément à la loi 09-08.",
  },
  {
    q: "La plateforme est-elle reconnue par le CAPM ?",
    a: "PharmaVig est développée en conformité avec les standards ICH E2B R3 et la méthode d'imputabilité de Bégaud utilisée par le système national de pharmacovigilance marocain.",
  },
];

// ── Page principale ───────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-xs tracking-tight">PV</span>
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">PharmaVig</span>
          <span className="hidden md:inline text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold ml-1">Maroc</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/medicaments" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Référentiel</Link>
          <Link href="/about" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">À propos</Link>
          <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Connexion</Link>
        </div>
        <Link href="/register" className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
          Commencer gratuitement
        </Link>
      </nav>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="w-full px-6 md:px-10 pt-16 pb-20 overflow-hidden" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #f8fafc 50%, #eff6ff 100%)" }}>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-gray-600 font-medium">Plateforme en service · Maroc 🇲🇦</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
                La plateforme de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  sécurité médicamenteuse
                </span>{" "}
                pour les professionnels de santé marocains
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                Prescrivez, suivez la tolérance de vos patients, recevez des alertes personnalisées et contribuez à la pharmacovigilance nationale — depuis un seul outil.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <Link href="/register" className="bg-gray-900 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2">
                  Commencer gratuitement <IconArrow />
                </Link>
                <Link href="/medicaments" className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  Explorer le référentiel médicament
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-xs text-gray-400">
                {["Gratuit pour les médecins", "Données stockées en local", "Conforme loi 09-08"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5"><IconCheck />{t}</span>
                ))}
              </div>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end w-full">
              <HeroMockup />
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section className="w-full border-y border-gray-100 bg-white py-10 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: "95%", label: "des EIM jamais signalés au Maroc" },
              { val: "5 min", label: "pour une déclaration complète" },
              { val: "5 modules", label: "intégrés dans un seul outil" },
              { val: "24h", label: "délai de traitement CAPM" },
            ].map((s) => (
              <div key={s.val} className="text-center">
                <div className="text-3xl font-black text-gray-900 mb-1">{s.val}</div>
                <div className="text-xs text-gray-500 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pourquoi les médecins reviennent ── */}
        <section className="w-full px-6 md:px-10 py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">Utilité quotidienne</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Pourquoi les médecins reviennent<br />sur PharmaVig chaque semaine
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                PharmaVig n&apos;est pas un formulaire. C&apos;est un système vivant qui s&apos;adapte à votre activité clinique.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <CardAlertes />
              <CardPatients />
              <CardMolecules />
              <CardTableauBord />
            </div>
          </div>
        </section>

        {/* ── Dashboard réaliste ── */}
        <section className="w-full px-6 md:px-10 py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">Produit</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Un tableau de bord vivant,<br />pas une liste de formulaires
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Alertes, patients en suivi, molécules surveillées, déclarations — tout s&apos;organise en un seul espace, mis à jour en temps réel.
              </p>
            </div>
            <DashboardPreview />
          </div>
        </section>

        {/* ── Problème ── */}
        <section className="w-full px-6 md:px-10 py-20 bg-gray-950 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Le problème</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              95 % des effets indésirables<br />ne sont jamais signalés
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              La pharmacovigilance ne peut pas reposer uniquement sur la mémoire des professionnels de santé.
              PharmaVig intègre la sécurité médicamenteuse directement dans la pratique clinique quotidienne.
            </p>
          </div>
        </section>

        {/* ── 4 fonctionnalités ── */}
        <section className="w-full px-6 md:px-10 py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">Une seule plateforme</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tout ce qu&apos;il vous faut, intégré</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Chaque fonctionnalité alimente les autres. Les données de prescription alimentent le suivi. Le suivi alimente les déclarations. Les déclarations alimentent les alertes.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  icon: "💊", color: "bg-blue-50 text-blue-600", border: "border-blue-100 hover:border-blue-200",
                  badge: "Référentiel", title: "Référentiel médicament intelligent",
                  items: ["Posologies et indications", "Contre-indications", "Effets indésirables connus", "Alertes réglementaires en temps réel"],
                },
                {
                  icon: "🔔", color: "bg-amber-50 text-amber-600", border: "border-amber-100 hover:border-amber-200",
                  badge: "Alertes", title: "Alertes personnalisées",
                  desc: "Recevez uniquement les alertes EMA, FDA, ANSM et CAPM concernant les médicaments que vous utilisez réellement — filtrées selon vos molécules déclarées.",
                },
                {
                  icon: "📄", color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100 hover:border-emerald-200",
                  badge: "Ordonnancier", title: "Ordonnancier professionnel",
                  desc: "Créez vos ordonnances en quelques secondes. Autocomplete DCI, posologies structurées, PDF imprimable, historique complet — stocké uniquement sur votre appareil.",
                },
                {
                  icon: "❤️", color: "bg-rose-50 text-rose-600", border: "border-rose-100 hover:border-rose-200",
                  badge: "Suivi patient", title: "Suivi de tolérance patient (ePRO)",
                  desc: "Invitez vos patients à signaler leurs symptômes après prescription. Chaque signal peut déclencher automatiquement une déclaration pré-remplie.",
                },
              ].map((card) => (
                <div key={card.title} className={`border rounded-2xl p-7 transition-colors ${card.border}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${card.color}`}>{card.icon}</div>
                    <span className={`text-xs font-bold uppercase tracking-wide ${card.color.split(" ")[1]}`}>{card.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{card.title}</h3>
                  {card.items ? (
                    <ul className="space-y-2">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-gray-600"><IconCheck />{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Référentiel interactif ── */}
        <ReferentielSection />

        {/* ── Workflow 5 étapes ── */}
        <section className="w-full px-6 md:px-10 py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">De la prescription à la déclaration</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Comment PharmaVig améliore<br />la pharmacovigilance</h2>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute top-7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {WORKFLOW.map((step, i) => (
                  <div key={step.title} className="flex flex-col items-center text-center relative">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 z-10 shadow-sm border text-xl ${
                      i === 4 ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"
                    }`}>{step.icon}</div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${i === 4 ? "text-emerald-600" : "text-gray-400"}`}>0{i + 1}</p>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{step.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Données terrain ── */}
        <DonneesTerrainSection />

        {/* ── Pour les patients ── */}
        <section className="w-full px-6 md:px-10 py-20 bg-white">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Pour les patients</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Votre traitement<br />mérite un suivi</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Les patients peuvent signaler facilement leur tolérance après une prescription. Pas besoin de compte — votre médecin vous envoie un lien sécurisé.
              </p>
              <Link href="/dashboard/invite" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                Signaler un effet indésirable <IconArrow />
              </Link>
            </div>
            <div className="flex-1 max-w-sm w-full">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-sm">💊</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Suivi J+7 — Méthotrexate</p>
                    <p className="text-[10px] text-gray-400">Envoyé par Dr. Cherradi</p>
                  </div>
                </div>
                <p className="text-xs text-gray-700 font-medium mb-3">Avez-vous ressenti des effets indésirables ?</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {["Nausées", "Fatigue", "Maux de tête", "Aucun"].map((s) => (
                    <div key={s} className={`text-[11px] border rounded-lg px-2 py-1.5 text-center cursor-pointer ${s === "Nausées" ? "bg-amber-50 border-amber-300 text-amber-700 font-semibold" : "border-gray-200 text-gray-600"}`}>{s}</div>
                  ))}
                </div>
                <div className="bg-emerald-600 text-white text-center text-xs font-semibold py-2 rounded-lg">Envoyer le rapport</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Conformité ── */}
        <section className="w-full px-6 md:px-10 py-20 bg-gray-950 text-white">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Standards internationaux</p>
            <h2 className="text-3xl font-bold text-white mb-4">Construit selon les standards<br />de la pharmacovigilance</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-12">
              Chaque fonctionnalité répond aux exigences des autorités sanitaires marocaines et internationales.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {CONFORMITE.map((c) => (
                <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-emerald-800 transition-colors">
                  <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center"><IconShield /></div>
                  <p className="text-xs font-bold text-white">{c.label}</p>
                  <p className="text-[10px] text-gray-500 leading-snug">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Vision ── */}
        <section className="w-full px-6 md:px-10 py-20 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">Notre vision</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Vers la première infrastructure de pharmacovigilance numérique d&apos;Afrique francophone
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Notre mission est de connecter professionnels de santé, patients et autorités sanitaires afin d&apos;améliorer la détection précoce des risques médicamenteux — et de faire du Maroc un modèle de pharmacovigilance numérique pour la région.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <FAQ />

        {/* ── CTA final ── */}
        <section className="w-full px-6 md:px-10 py-20 bg-gray-950">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Rejoignez les professionnels de santé<br />qui font confiance à PharmaVig
            </h2>
            <p className="text-gray-400 text-base mb-8 leading-relaxed">
              Ordonnancier, suivi patient, alertes personnalisées et déclaration pharmacovigilance — tout en un, gratuitement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="bg-emerald-500 hover:bg-emerald-400 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                Commencer gratuitement <IconArrow />
              </Link>
              <Link href="/dashboard/invite" className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                Signaler sans compte →
              </Link>
            </div>
            <p className="text-gray-600 text-xs mt-5">Sans engagement · Données stockées sur votre appareil · Conformité CNDP</p>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-[10px]">PV</span>
                </div>
                <span className="text-white font-bold text-sm">PharmaVig</span>
              </div>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">La première plateforme de surveillance médicamenteuse et pharmacovigilance numérique au Maroc.</p>
              <a href="mailto:contact@pharmavig.ma" className="text-gray-500 hover:text-white text-sm transition-colors">contact@pharmavig.ma</a>
            </div>
            <div>
              <h3 className="text-white font-semibold text-xs mb-4 uppercase tracking-wider">Plateforme</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/medicaments" className="hover:text-white transition-colors">Référentiel médicament</Link></li>
                <li><Link href="/ordonnances/nouvelle" className="hover:text-white transition-colors">Ordonnancier</Link></li>
                <li><Link href="/dashboard/medecin/surveillance" className="hover:text-white transition-colors">Suivi de tolérance</Link></li>
                <li><Link href="/dashboard/medecin/alertes" className="hover:text-white transition-colors">Alertes de sécurité</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-xs mb-4 uppercase tracking-wider">Déclarer</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login?role=medecin" className="hover:text-white transition-colors">Je suis médecin</Link></li>
                <li><Link href="/login?role=patient" className="hover:text-white transition-colors">Je suis patient</Link></li>
                <li><Link href="/dashboard/invite" className="hover:text-white transition-colors">Sans compte</Link></li>
                <li><a href="https://capm.ma" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Formulaire CAPM officiel ↗</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-xs mb-4 uppercase tracking-wider">Légal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link href="/conditions" className="hover:text-white transition-colors">Conditions d&apos;utilisation</Link></li>
                <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">À propos</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 px-6 md:px-10 py-5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© 2025–2026 PharmaVig · Maroc · Afrique francophone</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="w-full px-6 md:px-10 py-20 bg-white border-t border-gray-100">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Questions fréquentes</h2>
          <p className="text-gray-500 text-sm">Tout ce que vous devez savoir sur PharmaVig</p>
        </div>
        <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900 text-sm pr-4">{item.q}</span>
                <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-96" : "max-h-0"}`}>
                <p className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
