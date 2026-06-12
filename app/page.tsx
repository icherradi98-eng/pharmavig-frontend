"use client";
import Link from "next/link";
import { useState } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  petrol:     "#0F5B57",
  petrolDark: "#0a3f3c",
  gold:       "#D4AF37",
  goldLight:  "#f5e9a8",
  mint:       "#2FA88F",
  night:      "#1F2D3D",
  cream:      "#F7F3EE",
  creamDark:  "#ede8e2",
};

// ── Icônes SVG ────────────────────────────────────────────────────────────────

function IconArrow() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function IconCheck({ color = C.petrol }: { color?: string }) {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
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

// ── Logo MAIA DAWA ────────────────────────────────────────────────────────────

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
        <p style={{ color: dark ? "rgba(255,255,255,0.45)" : "#8a9ab0", fontSize: 9, letterSpacing: "0.6px", textTransform: "uppercase", marginTop: -2 }}>
          Pharmacovigilance Intelligence
        </p>
      </div>
    </div>
  );
}

// ── Hero Mockup ───────────────────────────────────────────────────────────────

function HeroMockup() {
  return (
    <div className="relative w-full max-w-lg select-none">
      <div className="absolute -inset-8 rounded-3xl blur-2xl opacity-30" style={{ background: `radial-gradient(ellipse, ${C.petrol}, transparent)` }} />
      <div className="relative bg-white border rounded-2xl shadow-2xl overflow-hidden text-left" style={{ borderColor: "rgba(15,91,87,0.15)" }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: C.night, borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.mint }} />
          </div>
          <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>maiadawa.ma — Tableau de bord</span>
        </div>
        <div className="p-4 space-y-3" style={{ background: C.cream }}>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-800">Alerte EMA — Pembrolizumab</p>
              <p className="text-[11px] text-red-600 mt-0.5">Signal de myocardite sévère. Monitoring cardiaque recommandé.</p>
            </div>
            <span className="ml-auto text-[10px] font-bold uppercase text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full shrink-0">URGENT</span>
          </div>
          <div className="bg-white border rounded-xl p-3" style={{ borderColor: "rgba(15,91,87,0.12)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: C.night }}>Suivi de tolérance — 3 actifs</p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: C.goldLight, color: "#92700a" }}>2 en attente</span>
            </div>
            {[
              { i: "F.Z.", drug: "Nivolumab", s: "Signal", bg: "#fef3c7", color: "#92400e" },
              { i: "M.B.", drug: "Méthotrexate", s: "RAS ✓", bg: "rgba(15,91,87,0.08)", color: C.petrol },
              { i: "A.O.", drug: "Pembrolizumab", s: "En attente", bg: "#f3f4f6", color: "#6b7280" },
            ].map((p) => (
              <div key={p.i} className="flex items-center justify-between py-1">
                <span className="text-[11px]" style={{ color: C.night }}>{p.i} · {p.drug}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: p.bg, color: p.color }}>{p.s}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "rgba(15,91,87,0.08)", border: `1px solid rgba(15,91,87,0.2)` }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: C.petrol }}>
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ color: C.petrol }}>Déclaration transmise au CAPM</p>
              <p className="text-[11px]" style={{ color: C.mint }}>PV-MA-2026-00187 · F.Z. · Pembrolizumab</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 bg-white border rounded-xl shadow-lg px-3 py-2 flex items-center gap-2" style={{ borderColor: "rgba(15,91,87,0.15)" }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: C.gold }}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={C.night} strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-bold" style={{ color: C.night }}>CAPM notifié</p>
          <p className="text-[9px]" style={{ color: "#8a9ab0" }}>à l&apos;instant</p>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Preview ─────────────────────────────────────────────────────────

function DashboardPreview() {
  return (
    <div className="relative w-full select-none">
      <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-40" style={{ background: `linear-gradient(135deg, ${C.cream}, rgba(15,91,87,0.08))` }} />
      <div className="relative bg-white border rounded-2xl shadow-2xl overflow-hidden" style={{ borderColor: "rgba(15,91,87,0.12)" }}>
        <div className="flex items-center gap-3 px-5 py-3.5 border-b" style={{ background: C.night, borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.mint }} />
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-1 flex-1 max-w-xs" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>maiadawa.ma/dashboard</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>Dr. Cherradi</span>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: C.petrol, color: C.gold }}>IC</div>
          </div>
        </div>

        <div className="flex">
          <div className="w-44 border-r hidden md:block" style={{ background: C.night, borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-4 mb-2 px-4" style={{ color: "rgba(255,255,255,0.25)" }}>Navigation</p>
            {[
              { label: "Vue d'ensemble", active: true },
              { label: "Alertes", badge: "3" },
              { label: "Patients suivis", badge: "12" },
              { label: "Mes molécules" },
              { label: "Ordonnancier" },
              { label: "Déclarations" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between px-3 py-1.5 rounded-lg mx-2 mb-0.5"
                style={{ background: item.active ? "rgba(212,175,55,0.12)" : "transparent", color: item.active ? C.gold : "rgba(255,255,255,0.45)", borderLeft: item.active ? `2px solid ${C.gold}` : "2px solid transparent" }}>
                <span className="text-[11px] font-medium">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold rounded-full px-1.5 py-0.5" style={{ background: "#C0392B", color: "#fff" }}>{item.badge}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex-1 p-4 space-y-4" style={{ background: C.cream }}>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Déclarations", val: "23", sub: "+5 ce mois", color: C.night },
                { label: "Suivis actifs", val: "12", sub: "2 en attente", color: "#D4AF37" },
                { label: "Alertes actives", val: "3", sub: "1 urgent", color: "#C0392B" },
                { label: "Score Bégaud", val: "2.8", sub: "Plausible", color: C.petrol },
              ].map((k) => (
                <div key={k.label} className="bg-white rounded-xl p-3" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
                  <p className="text-[10px] mb-1" style={{ color: "#8a9ab0" }}>{k.label}</p>
                  <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#8a9ab0" }}>{k.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: C.night }}>Alertes récentes</p>
                <div className="space-y-2">
                  {[
                    { src: "EMA", drug: "Pembrolizumab", txt: "Signal myocardite", sev: "urgent" },
                    { src: "FDA", drug: "Apixaban", txt: "Interaction warfarine", sev: "important" },
                    { src: "ANSM", drug: "Méthotrexate", txt: "Mise à jour RCP", sev: "info" },
                  ].map((a) => (
                    <div key={a.drug} className="flex items-center gap-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{
                        background: a.sev === "urgent" ? "#fde8e8" : a.sev === "important" ? C.goldLight : "rgba(47,168,143,0.1)",
                        color: a.sev === "urgent" ? "#C0392B" : a.sev === "important" ? "#92700a" : C.mint,
                      }}>{a.src}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium truncate" style={{ color: C.night }}>{a.drug}</p>
                        <p className="text-[10px] truncate" style={{ color: "#8a9ab0" }}>{a.txt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-3" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: C.night }}>Patients en suivi</p>
                <div className="space-y-2">
                  {[
                    { init: "F.Z.", drug: "Nivolumab", j: "J+14", s: "Signal", bg: C.goldLight, color: "#92400e" },
                    { init: "M.B.", drug: "Méthotrexate", j: "J+7", s: "RAS", bg: "rgba(15,91,87,0.08)", color: C.petrol },
                    { init: "A.O.", drug: "Pembrolizumab", j: "J+21", s: "Attente", bg: "#f3f4f6", color: "#9ca3af" },
                    { init: "K.H.", drug: "Apixaban", j: "J+3", s: "RAS", bg: "rgba(15,91,87,0.08)", color: C.petrol },
                  ].map((p) => (
                    <div key={p.init} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: "rgba(15,91,87,0.1)", color: C.petrol }}>{p.init[0]}</div>
                        <div>
                          <p className="text-[11px] font-medium" style={{ color: C.night }}>{p.init} · {p.drug}</p>
                          <p className="text-[9px]" style={{ color: "#8a9ab0" }}>{p.j}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: p.bg, color: p.color }}>{p.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature Cards ─────────────────────────────────────────────────────────────

function CardAlertes() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
      <div className="px-5 py-4 border-b" style={{ background: "rgba(192,57,43,0.04)", borderColor: "rgba(192,57,43,0.1)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#fde8e8" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          </div>
          <p className="text-sm font-bold" style={{ color: C.night }}>Alertes personnalisées</p>
        </div>
        <p className="text-xs" style={{ color: "#8a9ab0" }}>Uniquement les médicaments que vous prescrivez réellement</p>
      </div>
      <div className="p-4 space-y-2">
        {[
          { src: "EMA", txt: "Pembrolizumab — Signal myocardite", sev: "urgent", t: "il y a 2h" },
          { src: "FDA", txt: "Apixaban — Interaction warfarine", sev: "important", t: "hier" },
          { src: "ANSM", txt: "Méthotrexate — Mise à jour RCP", sev: "info", t: "il y a 3j" },
          { src: "CAPM", txt: "Retrait de lot — Amoxicilline 1g", sev: "urgent", t: "il y a 5j" },
        ].map((a) => (
          <div key={a.txt} className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{
              background: a.sev === "urgent" ? "#fde8e8" : a.sev === "important" ? C.goldLight : "rgba(47,168,143,0.1)",
              color: a.sev === "urgent" ? "#C0392B" : a.sev === "important" ? "#92700a" : C.mint,
            }}>{a.src}</span>
            <span className="text-[11px] flex-1 truncate" style={{ color: "#4a5568" }}>{a.txt}</span>
            <span className="text-[10px] shrink-0" style={{ color: "#8a9ab0" }}>{a.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardPatients() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
      <div className="px-5 py-4 border-b" style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.2)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.goldLight }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92700a" strokeWidth="2" strokeLinecap="round"><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <p className="text-sm font-bold" style={{ color: C.night }}>Patients à suivre</p>
        </div>
        <p className="text-xs" style={{ color: "#8a9ab0" }}>Visualisez les réponses et les signaux en un coup d&apos;œil</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { val: "12", label: "suivis actifs", color: C.night },
            { val: "2", label: "en attente", color: C.gold },
            { val: "1", label: "signal détecté", color: "#C0392B" },
          ].map((s) => (
            <div key={s.label} className="text-center rounded-xl py-2" style={{ background: C.cream }}>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.val}</p>
              <p className="text-[10px] leading-tight" style={{ color: "#8a9ab0" }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {[
            { i: "F.Z.", drug: "Nivolumab", j: "J+14", s: "Signal", bg: C.goldLight, color: "#92400e" },
            { i: "M.B.", drug: "Méthotrexate", j: "J+7", s: "RAS ✓", bg: "rgba(15,91,87,0.08)", color: C.petrol },
            { i: "A.O.", drug: "Pembrolizumab", j: "J+21", s: "Attente", bg: "#f3f4f6", color: "#9ca3af" },
          ].map((p) => (
            <div key={p.i} className="flex items-center justify-between text-[11px] rounded-lg px-2.5 py-1.5 border" style={{ background: p.bg, borderColor: "transparent", color: p.color }}>
              <span style={{ color: C.night }}>{p.i} · {p.drug} <span style={{ color: "#8a9ab0", fontSize: 10 }}>{p.j}</span></span>
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
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
      <div className="px-5 py-4 border-b" style={{ background: "rgba(15,91,87,0.04)", borderColor: "rgba(15,91,87,0.12)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(15,91,87,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.petrol} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="2"/><circle cx="19" cy="14" r="2"/><circle cx="5" cy="14" r="2"/><line x1="12" y1="7" x2="19" y2="12"/><line x1="12" y1="7" x2="5" y2="12"/><line x1="5" y1="16" x2="19" y2="16"/></svg>
          </div>
          <p className="text-sm font-bold" style={{ color: C.night }}>Médicaments surveillés</p>
        </div>
        <p className="text-xs" style={{ color: "#8a9ab0" }}>Soyez alerté des évolutions réglementaires en temps réel</p>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {["Pembrolizumab", "Nivolumab", "Apixaban", "Trastuzumab", "Méthotrexate", "Imatinib"].map((m, i) => (
            <span key={m} className="text-[11px] font-semibold px-2 py-0.5 rounded-full border" style={
              i === 0 ? { background: "#fde8e8", color: "#C0392B", borderColor: "#fecaca" }
              : { background: "rgba(15,91,87,0.07)", color: C.petrol, borderColor: "rgba(15,91,87,0.15)" }
            }>{m}{i === 0 && " ⚠️"}</span>
          ))}
        </div>
        <div className="space-y-1.5 border-t pt-3" style={{ borderColor: C.creamDark }}>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "#8a9ab0" }}>Prochaines revues EMA</p>
          {[
            { drug: "Trastuzumab", date: "dans 3 jours", color: C.gold },
            { drug: "Imatinib", date: "dans 2 semaines", color: "#4a5568" },
          ].map((r) => (
            <div key={r.drug} className="flex items-center justify-between text-[11px]">
              <span style={{ color: C.night }}>{r.drug}</span>
              <span className="font-semibold" style={{ color: r.color }}>{r.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardTableauBord() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
      <div className="px-5 py-4 border-b" style={{ background: "rgba(47,168,143,0.06)", borderColor: "rgba(47,168,143,0.15)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(47,168,143,0.12)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.mint} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
          </div>
          <p className="text-sm font-bold" style={{ color: C.night }}>Tableau de bord sécurité</p>
        </div>
        <p className="text-xs" style={{ color: "#8a9ab0" }}>Alertes, suivis et déclarations depuis un seul espace</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { val: "23", label: "déclarations", color: C.night },
            { val: "3", label: "alertes actives", color: "#C0392B" },
            { val: "2.8", label: "Bégaud moy.", color: C.petrol },
            { val: "87%", label: "taux de suivi", color: C.mint },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: C.cream }}>
              <p className="text-base font-black mt-0.5" style={{ color: s.color }}>{s.val}</p>
              <p className="text-[10px]" style={{ color: "#8a9ab0" }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl px-3 py-2" style={{ background: "rgba(15,91,87,0.06)", border: `1px solid rgba(15,91,87,0.12)` }}>
          <p className="text-[11px] font-medium mb-1.5" style={{ color: C.petrol }}>Votre activité ce mois</p>
          <div className="flex gap-1 items-end" style={{ height: 28 }}>
            {[4, 6, 3, 8, 2, 7, 5, 9, 4, 6, 3, 5].map((v, i) => (
              <div key={i} className="flex-1 rounded-sm" style={{ height: `${v * 3}px`, background: i >= 9 ? C.petrol : "rgba(15,91,87,0.2)" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Référentiel Section ───────────────────────────────────────────────────────

const REF_DRUGS = [
  {
    name: "Metformine", class: "Biguanide · Antidiabétique", alerts: 0,
    eis: ["Acidose lactique (rare, grave)", "Nausées, diarrhée", "Carence B12"],
    pv: { cas: 34, signal: false },
  },
  {
    name: "Pembrolizumab", class: "Anti-PD-1 · Immunothérapie", alerts: 2,
    eis: ["Myocardite ⚠️ (signal EMA)", "Pneumopathie inflammatoire", "Colite immune"],
    pv: { cas: 89, signal: true },
  },
  {
    name: "Apixaban", class: "Anti-Xa · Anticoagulant", alerts: 1,
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
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Référentiel</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: C.night }}>Le premier référentiel marocain<br />de sécurité médicamenteuse</h2>
          <p className="max-w-xl mx-auto" style={{ color: "#6b7280" }}>Consultez les effets indésirables, alertes réglementaires et données terrain pour chaque médicament que vous prescrivez.</p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: C.night }}>
          <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 max-w-xl mx-auto" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <svg className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-sm flex-1" style={{ color: "rgba(255,255,255,0.3)" }}>Rechercher un médicament ou une DCI…</span>
              <div className="flex gap-2">
                {REF_DRUGS.map((d, i) => (
                  <button key={d.name} onClick={() => setSelected(i)}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                    style={{ background: selected === i ? C.petrol : "transparent", color: selected === i ? "#fff" : "rgba(255,255,255,0.4)" }}>
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-5 grid md:grid-cols-3 gap-4">
            {[
              <div key="id" className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-white">{drug.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{drug.class}</p>
                  </div>
                  {drug.alerts > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#C0392B", color: "#fff" }}>{drug.alerts} alerte{drug.alerts > 1 ? "s" : ""}</span>}
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>EI majeurs connus</p>
                  {drug.eis.map((ei) => (
                    <div key={ei} className="flex items-start gap-1.5">
                      <span style={{ color: C.gold }} className="mt-0.5 shrink-0">›</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{ei}</span>
                    </div>
                  ))}
                </div>
              </div>,
              <div key="alerts" className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Alertes réglementaires</p>
                {drug.alerts === 0 ? (
                  <div className="flex items-center gap-2 mt-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.mint} strokeWidth="2.5" strokeLinecap="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Aucune alerte active</p>
                  </div>
                ) : drug.name === "Pembrolizumab" ? (
                  <div className="space-y-2">
                    <div className="rounded-lg p-2.5" style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)" }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#C0392B", color: "#fff" }}>EMA</span>
                        <span className="text-[10px] font-semibold" style={{ color: "#ff8a80" }}>URGENT</span>
                      </div>
                      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>Signal de myocardite sévère. Monitoring cardiaque recommandé avant chaque cycle.</p>
                    </div>
                    <div className="rounded-lg p-2.5" style={{ background: "rgba(212,175,55,0.1)", border: `1px solid rgba(212,175,55,0.2)` }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#92700a", color: "#fff" }}>FDA</span>
                      </div>
                      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>Mise à jour RCP — Ajout encéphalite immune dans les EI rares.</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg p-2.5" style={{ background: "rgba(212,175,55,0.1)", border: `1px solid rgba(212,175,55,0.2)` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#92700a", color: "#fff" }}>FDA</span>
                    </div>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>Interaction apixaban–warfarine : risque hémorragique majeur. Éviter l&apos;association.</p>
                  </div>
                )}
              </div>,
              <div key="data" className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Données terrain MAIA DAWA</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-2xl font-black text-white">{drug.pv.cas}</div>
                  <div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>cas signalés</p>
                    {drug.pv.signal && <p className="text-[10px] font-semibold" style={{ color: C.gold }}>⚡ Signal émergent</p>}
                  </div>
                </div>
                <div className="space-y-1.5 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  {(drug.name === "Pembrolizumab"
                    ? [["Pneumopathie", "31%"], ["Myocardite", "18%"], ["Fatigue", "12%"]]
                    : drug.name === "Apixaban"
                    ? [["Hémorragie mineure", "24%"], ["Ecchymoses", "19%"], ["Anémie", "9%"]]
                    : [["Nausées", "28%"], ["Fatigue", "19%"], ["Céphalées", "12%"]]
                  ).map(([ei, pct]) => (
                    <div key={ei} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>{ei}</span>
                          <span className="text-[10px] font-semibold" style={{ color: C.gold }}>{pct}</span>
                        </div>
                        <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div className="h-full rounded-full" style={{ width: pct, background: C.petrol }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ]}
          </div>
        </div>
        <div className="text-center mt-5">
          <Link href="/medicaments" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: C.petrol }}>
            Explorer tout le référentiel <IconArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Données terrain ───────────────────────────────────────────────────────────

function DonneesTerrainSection() {
  const DRUG_DATA = [
    { name: "Méthotrexate", patients: 124, eis: [{ name: "Nausées", pct: 28 }, { name: "Fatigue", pct: 19 }, { name: "Céphalées", pct: 12 }, { name: "Aphtes buccaux", pct: 8 }], signal: false, begaud: "2.4" },
    { name: "Pembrolizumab", patients: 89, eis: [{ name: "Pneumopathie immune", pct: 31 }, { name: "Myocardite", pct: 18 }, { name: "Fatigue sévère", pct: 14 }, { name: "Colite", pct: 9 }], signal: true, begaud: "3.1" },
    { name: "Apixaban", patients: 67, eis: [{ name: "Hémorragie mineure", pct: 24 }, { name: "Ecchymoses", pct: 19 }, { name: "Anémie", pct: 9 }, { name: "Nausées", pct: 6 }], signal: false, begaud: "2.0" },
  ];
  const [sel, setSel] = useState(0);
  const d = DRUG_DATA[sel];
  return (
    <section className="w-full px-6 md:px-10 py-20" style={{ background: C.cream }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Pharmacovigilance terrain</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: C.night }}>Ce que les patients rapportent réellement</h2>
          <p className="max-w-xl mx-auto" style={{ color: "#6b7280" }}>MAIA DAWA agrège les signalements pour construire des données de tolérance réelles — au-delà des RCP officiels.</p>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
          <div className="flex border-b" style={{ borderColor: C.creamDark, background: C.cream }}>
            {DRUG_DATA.map((drug, i) => (
              <button key={drug.name} onClick={() => setSel(i)}
                className="flex-1 px-4 py-3.5 text-sm font-semibold transition-colors border-b-2"
                style={{ borderColor: sel === i ? C.petrol : "transparent", color: sel === i ? C.petrol : "#8a9ab0", background: sel === i ? "#fff" : "transparent" }}>
                {drug.name}
                {drug.signal && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: C.gold, color: C.night }}>Signal</span>}
              </button>
            ))}
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-4xl font-black" style={{ color: C.night }}>{d.patients}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8a9ab0" }}>patients suivis</p>
                </div>
                <div className="w-px h-12" style={{ background: C.creamDark }} />
                <div className="text-center">
                  <p className="text-4xl font-black" style={{ color: C.petrol }}>{d.begaud}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8a9ab0" }}>score Bégaud moy.</p>
                </div>
                {d.signal && (
                  <>
                    <div className="w-px h-12" style={{ background: C.creamDark }} />
                    <div className="rounded-xl px-3 py-2 text-center" style={{ background: C.goldLight, border: `1px solid rgba(212,175,55,0.3)` }}>
                      <p className="text-xs font-bold" style={{ color: "#92700a" }}>⚡ Signal émergent</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#92700a" }}>En évaluation CAPM</p>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8a9ab0" }}>Effets rapportés par les patients</p>
              <div className="space-y-3">
                {d.eis.map((ei) => (
                  <div key={ei.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm" style={{ color: C.night }}>{ei.name}</span>
                      <span className="text-sm font-bold" style={{ color: C.petrol }}>{ei.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: C.creamDark }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ei.pct * 3}%`, background: C.petrol }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-6 text-white" style={{ background: C.night }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Ce que ça change</p>
              <p className="text-lg font-bold mb-4 leading-snug text-white">Les données MAIA DAWA vont plus loin que les RCP officiels.</p>
              <div className="space-y-3">
                {["Détection de signaux non documentés dans les sources réglementaires", "Données spécifiques à la population marocaine", "Fréquences réelles vs fréquences théoriques du RCP", "Corrélation avec les profils de tolérance individuels"].map((t) => (
                  <div key={t} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{t}</p>
                  </div>
                ))}
              </div>
              <Link href="/register" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors" style={{ background: C.petrol, color: "#fff" }}>
                Contribuer à la base de données <IconArrow />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: "Est-ce que mes données sont confidentielles ?", a: "Oui. MAIA DAWA respecte la loi marocaine 09-08. Les données cliniques de l'ordonnancier restent sur votre appareil uniquement. Seules les déclarations d'effets indésirables, anonymisées, sont transmises au CAPM." },
  { q: "Dois-je être professionnel de santé pour utiliser MAIA DAWA ?", a: "Non. Les patients peuvent signaler leurs effets indésirables via un lien envoyé par leur médecin, ou de façon anonyme via le formulaire public. Les professionnels bénéficient d'un espace dédié avec toutes les fonctionnalités avancées." },
  { q: "La plateforme est-elle reconnue par le CAPM ?", a: "MAIA DAWA est développée en conformité avec les standards ICH E2B R3 et la méthode d'imputabilité de Bégaud utilisée par le système national de pharmacovigilance marocain." },
  { q: "L'ordonnancier stocke-t-il les données patient ?", a: "Non. Les ordonnances et les données patients restent stockées uniquement sur votre appareil (localStorage). MAIA DAWA ne conserve aucune donnée patient sur ses serveurs — conformément à la loi 09-08." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="w-full px-6 md:px-10 py-20 bg-white border-t" style={{ borderColor: C.creamDark }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2" style={{ color: C.night }}>Questions fréquentes</h2>
          <p className="text-sm" style={{ color: "#8a9ab0" }}>Tout ce que vous devez savoir sur MAIA DAWA</p>
        </div>
        <div className="flex flex-col divide-y rounded-2xl overflow-hidden" style={{ border: `1px solid rgba(15,91,87,0.12)`, borderColor: "rgba(15,91,87,0.12)", divideColor: C.creamDark }}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors"
                style={{ background: open === i ? "rgba(15,91,87,0.03)" : "#fff" }}>
                <span className="font-medium text-sm pr-4" style={{ color: C.night }}>{item.q}</span>
                <svg className={`w-5 h-5 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} style={{ color: C.petrol }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-96" : "max-h-0"}`}>
                <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "#4a5568" }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream }}>

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 sticky top-0 z-50 backdrop-blur-md"
        style={{ background: "rgba(247,243,238,0.92)", borderBottom: `1px solid ${C.creamDark}` }}>
        <Link href="/"><MaiaLogo /></Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/medicaments" className="text-sm font-medium transition-colors" style={{ color: "#6b7280" }}
            onMouseEnter={e => (e.currentTarget.style.color = C.petrol)} onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>Référentiel</Link>
          <Link href="/about" className="text-sm font-medium transition-colors" style={{ color: "#6b7280" }}
            onMouseEnter={e => (e.currentTarget.style.color = C.petrol)} onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>À propos</Link>
          <Link href="/login" className="text-sm font-medium transition-colors" style={{ color: "#6b7280" }}
            onMouseEnter={e => (e.currentTarget.style.color = C.petrol)} onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>Connexion</Link>
        </div>
        <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
          style={{ background: C.petrol, color: "#fff" }}
          onMouseEnter={e => (e.currentTarget.style.background = C.petrolDark)}
          onMouseLeave={e => (e.currentTarget.style.background = C.petrol)}>
          Commencer gratuitement
        </Link>
      </nav>

      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="w-full px-6 md:px-10 pt-16 pb-20 overflow-hidden" style={{ background: `linear-gradient(145deg, ${C.cream} 0%, #fff 60%, rgba(15,91,87,0.03) 100%)` }}>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 shadow-sm bg-white" style={{ border: `1px solid ${C.creamDark}` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.mint }} />
                <span className="text-xs font-medium" style={{ color: "#4a5568" }}>Plateforme en service · Maroc 🇲🇦</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold leading-[1.1] tracking-tight mb-5" style={{ color: C.night }}>
                La plateforme de{" "}
                <span style={{ color: C.petrol }}>sécurité médicamenteuse</span>{" "}
                pour les professionnels de santé marocains
              </h1>
              <p className="text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8" style={{ color: "#6b7280" }}>
                Prescrivez, suivez la tolérance de vos patients, recevez des alertes personnalisées et contribuez à la pharmacovigilance nationale — depuis un seul outil.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <Link href="/register" className="px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                  style={{ background: C.petrol, color: "#fff" }}>
                  Commencer gratuitement <IconArrow />
                </Link>
                <Link href="/medicaments" className="bg-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  style={{ border: `1px solid ${C.creamDark}`, color: C.night }}>
                  Explorer le référentiel médicament
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-xs" style={{ color: "#8a9ab0" }}>
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

        {/* ── Stats bar ─────────────────────────────────────────────────────── */}
        <section className="w-full py-10 px-6 bg-white" style={{ borderTop: `1px solid ${C.creamDark}`, borderBottom: `1px solid ${C.creamDark}` }}>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: "95%", label: "des EIM jamais signalés au Maroc" },
              { val: "5 min", label: "pour une déclaration complète" },
              { val: "5 modules", label: "intégrés dans un seul outil" },
              { val: "24h", label: "délai de traitement CAPM" },
            ].map((s) => (
              <div key={s.val} className="text-center">
                <div className="text-3xl font-black mb-1" style={{ color: C.petrol }}>{s.val}</div>
                <div className="text-xs leading-snug" style={{ color: "#8a9ab0" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pourquoi les médecins reviennent ──────────────────────────────── */}
        <section className="w-full px-6 md:px-10 py-20" style={{ background: C.cream }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Utilité quotidienne</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: C.night }}>Pourquoi les médecins reviennent<br />sur MAIA DAWA chaque semaine</h2>
              <p className="max-w-xl mx-auto" style={{ color: "#6b7280" }}>MAIA DAWA n&apos;est pas un formulaire. C&apos;est un système vivant qui s&apos;adapte à votre activité clinique.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <CardAlertes /><CardPatients /><CardMolecules /><CardTableauBord />
            </div>
          </div>
        </section>

        {/* ── Dashboard réaliste ────────────────────────────────────────────── */}
        <section className="w-full px-6 md:px-10 py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Produit</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: C.night }}>Un tableau de bord vivant,<br />pas une liste de formulaires</h2>
              <p className="max-w-xl mx-auto" style={{ color: "#6b7280" }}>Alertes, patients en suivi, molécules surveillées, déclarations — tout s&apos;organise en un seul espace.</p>
            </div>
            <DashboardPreview />
          </div>
        </section>

        {/* ── Problème ──────────────────────────────────────────────────────── */}
        <section className="w-full px-6 md:px-10 py-20 text-white" style={{ background: C.night }}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: C.gold }}>Le problème</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              95 % des effets indésirables<br />ne sont jamais signalés
            </h2>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              La pharmacovigilance ne peut pas reposer uniquement sur la mémoire des professionnels de santé. MAIA DAWA intègre la sécurité médicamenteuse directement dans la pratique clinique quotidienne.
            </p>
          </div>
        </section>

        {/* ── 4 fonctionnalités ─────────────────────────────────────────────── */}
        <section className="w-full px-6 md:px-10 py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Une seule plateforme</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: C.night }}>Tout ce qu&apos;il vous faut, intégré</h2>
              <p className="max-w-xl mx-auto" style={{ color: "#6b7280" }}>Chaque fonctionnalité alimente les autres. Les données de prescription alimentent le suivi. Le suivi alimente les déclarations.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.petrol} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="5" r="2"/><circle cx="19" cy="14" r="2"/><circle cx="5" cy="14" r="2"/><line x1="12" y1="7" x2="19" y2="12"/><line x1="12" y1="7" x2="5" y2="12"/></svg>, bg: "rgba(15,91,87,0.07)", badge: "Référentiel", badgeColor: C.petrol, title: "Référentiel médicament intelligent", items: ["Posologies et indications", "Contre-indications", "Effets indésirables connus", "Alertes réglementaires en temps réel"] },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92700a" strokeWidth="1.8" strokeLinecap="round"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>, bg: C.goldLight, badge: "Alertes", badgeColor: "#92700a", title: "Alertes personnalisées", desc: "Recevez uniquement les alertes EMA, FDA, ANSM et CAPM concernant les médicaments que vous utilisez réellement." },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.mint} strokeWidth="1.8" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>, bg: "rgba(47,168,143,0.1)", badge: "Ordonnancier", badgeColor: C.mint, title: "Ordonnancier professionnel", desc: "Créez vos ordonnances en quelques secondes. Autocomplete DCI, posologies structurées, PDF imprimable." },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>, bg: "#fde8e8", badge: "Suivi patient", badgeColor: "#C0392B", title: "Suivi de tolérance patient (ePRO)", desc: "Invitez vos patients à signaler leurs symptômes après prescription. Chaque signal peut déclencher une déclaration pré-remplie." },
              ].map((card) => (
                <div key={card.title} className="rounded-2xl p-7 transition-all hover:shadow-md bg-white" style={{ border: `1px solid ${C.creamDark}` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>{card.icon}</div>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: card.badgeColor }}>{card.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: C.night }}>{card.title}</h3>
                  {card.items ? (
                    <ul className="space-y-2">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "#4a5568" }}><IconCheck />{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{card.desc}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Référentiel interactif ─────────────────────────────────────────── */}
        <ReferentielSection />

        {/* ── Workflow 5 étapes ─────────────────────────────────────────────── */}
        <section className="w-full px-6 md:px-10 py-20" style={{ background: C.cream }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>De la prescription à la déclaration</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: C.night }}>Comment MAIA DAWA améliore<br />la pharmacovigilance</h2>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute top-7 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${C.creamDark}, transparent)` }} />
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {[
                  { num: "01", title: "Prescription", desc: "Le médecin prescrit via l'ordonnancier MAIA DAWA" },
                  { num: "02", title: "Suivi patient", desc: "Le patient reçoit un check-in automatique" },
                  { num: "03", title: "Signal détecté", desc: "Un effet indésirable potentiel est identifié" },
                  { num: "04", title: "Déclaration", desc: "Le formulaire CAPM est prérempli automatiquement" },
                  { num: "05", title: "Transmission", desc: "La déclaration intègre la base nationale", last: true },
                ].map((step) => (
                  <div key={step.title} className="flex flex-col items-center text-center relative">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 z-10 shadow-sm"
                      style={{ background: step.last ? C.petrol : "#fff", border: `1px solid ${step.last ? C.petrol : C.creamDark}` }}>
                      {step.last
                        ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg>
                        : <span className="text-sm font-black" style={{ color: C.petrol }}>{step.num}</span>}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: step.last ? C.gold : "#8a9ab0" }}>{step.num}</p>
                    <h3 className="font-semibold text-sm mb-1.5" style={{ color: C.night }}>{step.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "#8a9ab0" }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Données terrain ───────────────────────────────────────────────── */}
        <DonneesTerrainSection />

        {/* ── Pour les patients ─────────────────────────────────────────────── */}
        <section className="w-full px-6 md:px-10 py-20 bg-white">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.mint }}>Pour les patients</p>
              <h2 className="text-3xl font-bold mb-4" style={{ color: C.night }}>Votre traitement<br />mérite un suivi</h2>
              <p className="leading-relaxed mb-6" style={{ color: "#6b7280" }}>Les patients peuvent signaler facilement leur tolérance après une prescription. Pas besoin de compte — votre médecin vous envoie un lien sécurisé.</p>
              <Link href="/dashboard/invite" className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                style={{ background: C.mint }}>
                Signaler un effet indésirable <IconArrow />
              </Link>
            </div>
            <div className="flex-1 max-w-sm w-full">
              <div className="bg-white rounded-2xl shadow-lg p-5" style={{ border: `1px solid rgba(15,91,87,0.12)` }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(15,91,87,0.1)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.petrol} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="2"/><circle cx="19" cy="14" r="2"/><circle cx="5" cy="14" r="2"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: C.night }}>Suivi J+7 — Méthotrexate</p>
                    <p className="text-[10px]" style={{ color: "#8a9ab0" }}>Envoyé par Dr. Cherradi</p>
                  </div>
                </div>
                <p className="text-xs font-medium mb-3" style={{ color: C.night }}>Avez-vous ressenti des effets indésirables ?</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {["Nausées", "Fatigue", "Maux de tête", "Aucun"].map((s) => (
                    <div key={s} className="text-[11px] rounded-lg px-2 py-1.5 text-center cursor-pointer border transition-all"
                      style={s === "Nausées" ? { background: C.goldLight, borderColor: C.gold, color: "#92700a", fontWeight: 600 } : { borderColor: C.creamDark, color: "#4a5568" }}>
                      {s}
                    </div>
                  ))}
                </div>
                <div className="text-center text-xs font-semibold py-2 rounded-lg text-white" style={{ background: C.petrol }}>Envoyer le rapport</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Conformité ────────────────────────────────────────────────────── */}
        <section className="w-full px-6 md:px-10 py-20 text-white" style={{ background: C.night }}>
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Standards internationaux</p>
            <h2 className="text-3xl font-bold text-white mb-4">Construit selon les standards<br />de la pharmacovigilance</h2>
            <p className="max-w-xl mx-auto mb-12" style={{ color: "rgba(255,255,255,0.45)" }}>Chaque fonctionnalité répond aux exigences des autorités sanitaires marocaines et internationales.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Méthode de Bégaud", desc: "Score d'imputabilité officiel" },
                { label: "MedDRA", desc: "Terminologie médicale internationale" },
                { label: "ICH E2B(R3)", desc: "Standard de transmission des données" },
                { label: "Loi 17-04", desc: "Pharmacovigilance marocaine" },
                { label: "Loi 09-08 / CNDP", desc: "Protection des données personnelles" },
              ].map((c) => (
                <div key={c.label} className="rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(15,91,87,0.4)" }}>
                    <IconShield />
                  </div>
                  <p className="text-xs font-bold text-white">{c.label}</p>
                  <p className="text-[10px] leading-snug" style={{ color: "rgba(255,255,255,0.35)" }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Vision ────────────────────────────────────────────────────────── */}
        <section className="w-full px-6 md:px-10 py-20 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Notre vision</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight" style={{ color: C.night }}>
              Vers la première infrastructure de pharmacovigilance numérique d&apos;Afrique francophone
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: "#6b7280" }}>
              Notre mission est de connecter professionnels de santé, patients et autorités sanitaires afin d&apos;améliorer la détection précoce des risques médicamenteux — et de faire du Maroc un modèle de pharmacovigilance numérique pour la région.
            </p>
          </div>
        </section>

        <FAQ />

        {/* ── CTA final ─────────────────────────────────────────────────────── */}
        <section className="w-full px-6 md:px-10 py-20" style={{ background: C.night }}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6"><MaiaLogo dark /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Rejoignez les professionnels de santé<br />qui font confiance à MAIA DAWA
            </h2>
            <p className="text-base mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Ordonnancier, suivi patient, alertes personnalisées et déclaration pharmacovigilance — tout en un, gratuitement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="px-7 py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                style={{ background: C.gold, color: C.night }}>
                Commencer gratuitement <IconArrow />
              </Link>
              <Link href="/dashboard/invite" className="px-7 py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 text-white"
                style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                Signaler sans compte →
              </Link>
            </div>
            <p className="text-xs mt-5" style={{ color: "rgba(255,255,255,0.25)" }}>Sans engagement · Données stockées sur votre appareil · Conformité CNDP</p>
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#111827", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="mb-4"><MaiaLogo dark /></div>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>La première plateforme de pharmacovigilance numérique au Maroc — du Maroc à l&apos;Afrique.</p>
              <a href="mailto:contact@maiadawa.ma" className="text-sm transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>contact@maiadawa.ma</a>
            </div>
            <div>
              <h3 className="font-semibold text-xs mb-4 uppercase tracking-wider text-white">Plateforme</h3>
              <ul className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                <li><Link href="/medicaments" className="hover:text-white transition-colors">Référentiel médicament</Link></li>
                <li><Link href="/ordonnances/nouvelle" className="hover:text-white transition-colors">Ordonnancier</Link></li>
                <li><Link href="/dashboard/medecin/surveillance" className="hover:text-white transition-colors">Suivi de tolérance</Link></li>
                <li><Link href="/dashboard/medecin/alertes" className="hover:text-white transition-colors">Alertes de sécurité</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xs mb-4 uppercase tracking-wider text-white">Déclarer</h3>
              <ul className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                <li><Link href="/login" className="hover:text-white transition-colors">Je suis médecin</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Je suis patient</Link></li>
                <li><Link href="/dashboard/invite" className="hover:text-white transition-colors">Sans compte</Link></li>
                <li><a href="https://capm.ma" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Formulaire CAPM officiel ↗</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xs mb-4 uppercase tracking-wider text-white">Légal</h3>
              <ul className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                <li><Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link href="/conditions" className="hover:text-white transition-colors">Conditions d&apos;utilisation</Link></li>
                <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">À propos</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="px-6 md:px-10 py-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>© 2025–2026 MAIA DAWA · Maroc · Afrique francophone</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Pharmacovigilance Intelligence for Safer Medicines</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
