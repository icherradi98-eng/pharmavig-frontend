"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

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

const NAV_LINKS = [
  ["Référentiel", "/medicaments"],
  ["Démo", "/demo"],
  ["Contact", "/contact"],
  ["Connexion", "/login"],
] as const;

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: "rgba(247,243,238,0.93)", borderBottom: `1px solid ${C.creamDark}` }}>
      <div className="flex items-center justify-between px-6 md:px-12 py-3">
        <Link href="/" onClick={() => setMenuOpen(false)}><MaiaLogo /></Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(([label, href]) => (
            <Link key={label} href={href} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ color: "#6b7280" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.petrol)} onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm" style={{ background: C.petrol, color: "#fff" }}>
            Commencer
          </Link>
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-1.5 transition-colors"
            style={{ background: menuOpen ? C.creamDark : "transparent" }}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span className="block w-5 h-0.5 rounded-full transition-all" style={{ background: C.night, transform: menuOpen ? "translateY(4px) rotate(45deg)" : "none" }} />
            <span className="block w-5 h-0.5 rounded-full transition-all" style={{ background: C.night, opacity: menuOpen ? 0 : 1 }} />
            <span className="block w-5 h-0.5 rounded-full transition-all" style={{ background: C.night, transform: menuOpen ? "translateY(-4px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-1" style={{ borderTop: `1px solid ${C.creamDark}` }}>
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ color: C.night }}
              onMouseEnter={e => { e.currentTarget.style.background = C.creamDark; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              {label}
              <svg className="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          ))}
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="mt-2 w-full text-center py-3 rounded-xl text-sm font-bold"
            style={{ background: C.petrol, color: "#fff" }}
          >
            Commencer gratuitement →
          </Link>
        </div>
      )}
    </nav>
  );
}

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

// ── HERO DASHBOARD ────────────────────────────────────────────────────────────

function HeroDashboard() {
  return (
    <div className="relative w-full select-none">
      <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-20 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 50%, ${C.petrol}, transparent 70%)` }} />

      <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ border: `1px solid rgba(15,91,87,0.2)` }}>
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: C.night, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"/><div className="w-2.5 h-2.5 rounded-full bg-amber-400"/><div className="w-2.5 h-2.5 rounded-full" style={{ background: C.mint }}/></div>
          <div className="flex-1 mx-3 rounded-md px-3 py-1 text-[10px]" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>maiadawa.ma/dashboard · Dr. Bennani · Oncologie</div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.mint }} />
            <span className="text-[9px]" style={{ color: C.mint }}>En direct</span>
          </div>
        </div>

        <div className="flex" style={{ background: C.cream }}>
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
                { label: "Suivi patients", badge: "12" },
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
                <div><p className="text-[10px] font-semibold text-white">Dr. A. Bennani</p><p className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>Oncologie · CHU Rabat</p></div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-3">
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

            <div className="grid grid-cols-4 gap-2.5">
              {[
                { label: "Déclarations", val: "23", sub: "+5 ce mois", color: C.night, bg: "#fff" },
                { label: "Suivis actifs", val: "12", sub: "2 en attente", color: C.gold, bg: "#fff" },
                { label: "Alertes actives", val: "3", sub: "1 urgent", color: "#C0392B", bg: "#fff" },
                { label: "Score Bégaud", val: "I3", sub: "Vraisemblable", color: C.petrol, bg: "#fff" },
              ].map((k) => (
                <div key={k.label} className="rounded-xl p-3" style={{ background: k.bg, border: "1px solid rgba(15,91,87,0.08)" }}>
                  <p className="text-[10px] mb-1" style={{ color: "#8a9ab0" }}>{k.label}</p>
                  <p className="text-xl font-black" style={{ color: k.color }}>{k.val}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: "#8a9ab0" }}>{k.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-1 rounded-xl p-3 bg-white" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
                <p className="text-[10px] font-semibold mb-2" style={{ color: C.night }}>Activité déclarations</p>
                <div className="flex items-end gap-1" style={{ height: 48 }}>
                  {[2,4,3,7,5,8,4,9,6,8,5,7].map((v, i) => (
                    <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${v*5}px`, background: i >= 9 ? C.petrol : `rgba(15,91,87,${0.15 + i*0.02})` }} />
                  ))}
                </div>
                <p className="text-[9px] mt-1.5" style={{ color: "#8a9ab0" }}>6 mois · 23 déclarations</p>
              </div>

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

              <div className="col-span-1 rounded-xl p-3 bg-white" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
                <p className="text-[10px] font-semibold mb-2" style={{ color: C.night }}>Alertes récentes</p>
                <div className="space-y-1.5">
                  {[
                    { src: "EMA", drug: "Pembrolizumab", txt: "Signal myocardite", sev: "urgent" },
                    { src: "FDA", drug: "Apixaban", txt: "Interaction warfarine", sev: "important" },
                    { src: "ANSM", drug: "Méthotrexate", txt: "Mise à jour RCP", sev: "info" },
                    { src: "ANSM", drug: "Amoxicilline", txt: "Retrait de lot", sev: "urgent" },
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

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(15,91,87,0.07)", border: "1px solid rgba(15,91,87,0.15)" }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: C.petrol }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: C.petrol }}>Déclaration PV-MA-2026-00187 · format CIOMS</span>
              <span className="text-[10px] ml-auto" style={{ color: C.mint }}>F.Z. · Pembrolizumab · il y a 2h</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(15,91,87,0.12)", color: C.petrol }}>PDF CIOMS ↓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HERO — Déclaration en action (visuel d'ouverture) ──────────────────────────

function HeroDeclaration() {
  return (
    <div className="relative w-full select-none">
      <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-20 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 50%, ${C.petrol}, transparent 70%)` }} />

      <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ border: `1px solid rgba(15,91,87,0.2)` }}>
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: C.night, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"/><div className="w-2.5 h-2.5 rounded-full bg-amber-400"/><div className="w-2.5 h-2.5 rounded-full" style={{ background: C.mint }}/></div>
          <div className="flex-1 mx-3 rounded-md px-3 py-1 text-[10px]" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>maiadawa.ma/declaration · Nouvelle déclaration</div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(212,175,55,0.15)", color: C.gold }}>Gratuit</span>
        </div>

        <div className="flex" style={{ background: C.cream }}>
          <div className="w-48 shrink-0 hidden lg:flex flex-col" style={{ background: C.night }}>
            <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <MaiaLogo dark />
              <div className="mt-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: C.gold }}>Espace Médecin</div>
            </div>
            <nav className="flex-1 px-2 py-3 space-y-0.5">
              {[
                { label: "Vue d'ensemble", active: false },
                { label: "Déclarations", active: true },
                { label: "Alertes sécurité", active: false },
                { label: "Suivi patients", active: false },
                { label: "Ordonnances", active: false },
                { label: "Molécules", active: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px]"
                  style={{ background: item.active ? "rgba(212,175,55,0.12)" : "transparent", color: item.active ? C.gold : "rgba(255,255,255,0.45)", fontWeight: item.active ? 600 : 400, borderLeft: item.active ? `2px solid ${C.gold}` : "2px solid transparent" }}>
                  <span>{item.label}</span>
                </div>
              ))}
            </nav>
            <div className="px-3 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: C.petrol, color: C.gold }}>IC</div>
                <div><p className="text-[10px] font-semibold text-white">Dr. A. Bennani</p><p className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>Oncologie · CHU Rabat</p></div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: C.night }}>Nouvelle déclaration de pharmacovigilance</p>
                <p className="text-[10px]" style={{ color: "#8a9ab0" }}>PV-MA-2026-00187 · 8 sections · format CIOMS</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px]" style={{ color: "#8a9ab0" }}>Étape 5 / 8</span>
                <div className="w-20 h-1.5 rounded-full" style={{ background: C.creamDark }}><div className="h-full rounded-full" style={{ width: "62%", background: C.petrol }} /></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl p-3 bg-white" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
                <p className="text-[9px] font-bold uppercase tracking-wide mb-2" style={{ color: "#8a9ab0" }}>Patient (anonymisé)</p>
                <div className="grid grid-cols-3 gap-2">
                  {[["Âge", "47 ans"], ["Sexe", "F"], ["Poids", "62 kg"]].map(([k,v]) => (
                    <div key={k}><p className="text-[8.5px]" style={{ color: "#8a9ab0" }}>{k}</p><p className="text-[10px] font-semibold" style={{ color: C.night }}>{v}</p></div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-3 bg-white" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
                <p className="text-[9px] font-bold uppercase tracking-wide mb-2" style={{ color: "#8a9ab0" }}>Médicament suspect</p>
                <p className="text-[11px] font-semibold" style={{ color: C.night }}>Pembrolizumab 200 mg</p>
                <p className="text-[9px]" style={{ color: "#8a9ab0" }}>IV · 1× / 3 semaines · depuis le 02/05</p>
              </div>
            </div>

            <div className="rounded-xl p-3 bg-white" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
              <div className="flex items-center justify-between rounded-lg px-3 py-2 mb-2" style={{ border: `1px solid ${C.creamDark}` }}>
                <span className="text-[11px]" style={{ color: "#8a9ab0" }}>Effet indésirable observé</span>
                <span className="text-[11px] font-bold" style={{ color: C.night }}>Myocardite</span>
              </div>
              <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5" style={{ background: "rgba(15,91,87,0.07)" }}>
                <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ background: C.petrol }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M4.5 12.75l6 6 9-13.5"/></svg>
                </span>
                <span className="font-mono text-[10px]" style={{ color: C.petrol }}>MedDRA PT · Myocardite #10028606 — codage automatique</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl p-3 bg-white" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
                <p className="text-[9px] font-bold uppercase tracking-wide mb-2" style={{ color: "#8a9ab0" }}>Imputabilité — Bégaud</p>
                <div className="flex gap-1 mb-1.5">{[1,1,1,0].map((on,i) => <span key={i} className="flex-1 h-2 rounded" style={{ background: on ? C.gold : C.creamDark }} />)}</div>
                <div className="flex items-center justify-between"><span className="text-[9px]" style={{ color: "#8a9ab0" }}>Score intrinsèque</span><span className="text-[10px] font-bold" style={{ color: C.petrol }}>I3 — Vraisemblable</span></div>
              </div>
              <div className="rounded-xl p-3 bg-white" style={{ border: "1px solid rgba(15,91,87,0.08)" }}>
                <p className="text-[9px] font-bold uppercase tracking-wide mb-2" style={{ color: "#8a9ab0" }}>Gravité (ICH E2B)</p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#fde8e8", color: "#C0392B" }}>Hospitalisation</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.goldLight, color: "#92700a" }}>CTCAE Grade 3</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(15,91,87,0.07)", border: "1px solid rgba(15,91,87,0.15)" }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: C.petrol }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: C.petrol }}>Prête à transmettre · format CIOMS</span>
              <span className="text-[10px] ml-auto font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(15,91,87,0.12)", color: C.petrol }}>PDF CIOMS ↓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── WALKTHROUGH PRODUIT (4 modules, sticky scroll) ─────────────────────────────

type ModuleId = "decl" | "ref" | "ord" | "suivi";

const MODULES: {
  id: ModuleId; idx: string; url: string; name: string; free?: boolean;
  desc: string; meta: string[];
}[] = [
  {
    id: "decl", idx: "01 / 04", url: "maiadawa.ma/declaration", name: "Déclaration", free: true,
    desc: "Formulaire CIOMS structuré, codage MedDRA automatique, gradation CTCAE, imputabilité de Bégaud calculée, export au format CIOMS.",
    meta: ["MedDRA", "CTCAE", "Bégaud", "CIOMS · ICH E2B(R3)"],
  },
  {
    id: "ref", idx: "02 / 04", url: "maiadawa.ma/referentiel", name: "Référentiel",
    desc: "Effets indésirables, contre-indications, interactions, et alertes EMA · FDA · ANSM en temps réel — avec les données de terrain marocaines.",
    meta: ["Alertes officielles", "Interactions", "Données vie réelle"],
  },
  {
    id: "ord", idx: "03 / 04", url: "maiadawa.ma/ordonnance", name: "Ordonnancier",
    desc: "DCI en autocomplete, posologies structurées, contrôle d'interactions, export PDF A4. Les données patient restent sur votre appareil.",
    meta: ["PDF A4", "100% local · loi 09-08"],
  },
  {
    id: "suivi", idx: "04 / 04", url: "maiadawa.ma/suivi", name: "Suivi patient",
    desc: "Questionnaires ePRO automatiques (J+7, J+14, J+21). Une réponse à risque est codée en signal — et pré-remplit la déclaration.",
    meta: ["ePRO", "Détection de signal", "Lien sécurisé"],
  },
];

function ScreenDeclaration() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-bold" style={{ color: C.night }}>Déclaration de pharmacovigilance</p><p className="text-[11px]" style={{ color: "#8a9ab0" }}>PV-MA-2026-00187 · 8 sections CIOMS</p></div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ background: "rgba(15,91,87,0.1)", color: C.petrol }}>Format CIOMS</span>
      </div>
      <div className="rounded-xl p-3.5 bg-white" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
        <div className="grid grid-cols-3 gap-2.5">
          {[["Patient", "F.Z. · 47 ans · F"], ["Médicament", "Pembrolizumab 200mg"], ["Date EI", "02 / 06 / 2026"]].map(([k, v]) => (
            <div key={k} className="rounded-lg p-2.5" style={{ background: C.cream }}><p className="text-[9px] mb-0.5" style={{ color: "#8a9ab0" }}>{k}</p><p className="text-[11px] font-semibold" style={{ color: C.night }}>{v}</p></div>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-3.5 bg-white" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 mb-2" style={{ border: `1px solid ${C.creamDark}` }}>
          <span className="text-xs" style={{ color: "#8a9ab0" }}>Effet indésirable observé</span><span className="text-xs font-bold" style={{ color: C.night }}>Myocardite</span>
        </div>
        <div className="rounded-md px-2.5 py-1.5 font-mono text-[10.5px]" style={{ background: "rgba(15,91,87,0.07)", color: C.petrol }}>MedDRA PT · Myocardite #10028606 — SOC Affections cardiaques · CTCAE Grade 3</div>
      </div>
      <div className="rounded-xl p-3.5 bg-white" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "#8a9ab0" }}>Imputabilité — méthode de Bégaud</p>
        <div className="flex gap-1 mb-2">{[1,1,1,0].map((on, i) => <span key={i} className="flex-1 h-2 rounded" style={{ background: on ? C.gold : C.creamDark }} />)}</div>
        <div className="flex items-center justify-between text-[11px]"><span style={{ color: "#8a9ab0" }}>Score intrinsèque</span><span className="font-bold" style={{ color: C.petrol }}>I3 — Vraisemblable</span></div>
        <div className="mt-2.5 flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full" style={{ background: C.creamDark }}><div className="h-full rounded-full" style={{ width: "100%", background: C.petrol }} /></div><span className="text-[10px] font-bold whitespace-nowrap" style={{ color: C.petrol }}>PDF CIOMS ↓</span></div>
      </div>
    </div>
  );
}

function ScreenReferentiel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-bold" style={{ color: C.night }}>Référentiel de sécurité</p><p className="text-[11px]" style={{ color: "#8a9ab0" }}>Pembrolizumab · Anti-PD-1 · Immunothérapie</p></div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ background: "#fde8e8", color: "#C0392B" }}>2 alertes</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 bg-white text-xs" style={{ border: `1px solid ${C.creamDark}`, color: "#8a9ab0" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round"/></svg>
        Rechercher un médicament, une DCI…
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl p-3 bg-white" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "#8a9ab0" }}>EI majeurs connus</p>
          {["Myocardite (signal EMA)", "Pneumopathie inflammatoire", "Colite immune"].map((ei) => (
            <div key={ei} className="flex items-start gap-1.5 mb-1.5"><span className="font-bold" style={{ color: C.gold }}>›</span><span className="text-[11px]" style={{ color: "#4a5568" }}>{ei}</span></div>
          ))}
        </div>
        <div className="rounded-xl p-3 bg-white" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "#8a9ab0" }}>Alertes réglementaires</p>
          <div className="rounded-lg p-2 mb-1.5" style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.25)" }}>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: "#C0392B" }}>EMA · URGENT</span>
            <p className="text-[10px] mt-1" style={{ color: "#4a5568" }}>Monitoring cardiaque avant chaque cycle.</p>
          </div>
          <div className="rounded-lg p-2" style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)" }}>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: "#92700a" }}>FDA</span>
            <p className="text-[10px] mt-1" style={{ color: "#4a5568" }}>RCP — encéphalite immune ajoutée.</p>
          </div>
        </div>
      </div>
      <p className="text-[10.5px] flex items-center gap-1.5" style={{ color: "#8a9ab0" }}>
        <span style={{ color: C.gold }}>›</span> Données de terrain et interactions détaillées dans le référentiel complet.
      </p>
    </div>
  );
}

function ScreenOrdonnancier() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-bold" style={{ color: C.night }}>Nouvelle ordonnance</p><p className="text-[11px]" style={{ color: "#8a9ab0" }}>Dr. A. Bennani · Oncologie</p></div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ background: "rgba(15,91,87,0.1)", color: C.petrol }}>100% local</span>
      </div>
      <div className="rounded-xl p-3.5 bg-white" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 mb-2.5" style={{ border: `1px solid ${C.creamDark}` }}>
          <span className="text-xs" style={{ color: "#8a9ab0" }}>DCI</span><span className="text-xs font-bold" style={{ color: C.night }}>Pembrolizumab</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[["Dosage", "200 mg"], ["Fréquence", "1× / 3 sem."], ["Durée", "4 cycles"]].map(([k, v]) => (
            <div key={k} className="rounded-lg p-2.5" style={{ background: C.cream }}><p className="text-[9px] mb-0.5" style={{ color: "#8a9ab0" }}>{k}</p><p className="text-[11px] font-semibold" style={{ color: C.night }}>{v}</p></div>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-3 flex items-center gap-2.5" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)" }}>
        <span className="text-base">⚠️</span>
        <p className="text-[11px]" style={{ color: "#92700a" }}><strong>Contrôle d&apos;interaction</strong> — aucune interaction majeure détectée avec le traitement en cours.</p>
      </div>
      <div className="rounded-xl p-3.5 bg-white flex items-center justify-between" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
        <span className="text-xs font-bold" style={{ color: C.night }}>Ordonnance prête</span>
        <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: C.petrol }}>Imprimer PDF A4 ↓</span>
      </div>
    </div>
  );
}

function ScreenSuivi() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-bold" style={{ color: C.night }}>Suivi patient · ePRO</p><p className="text-[11px]" style={{ color: "#8a9ab0" }}>12 patients actifs · 1 signal</p></div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ background: C.goldLight, color: "#92700a" }}>J+14</span>
      </div>
      <div className="rounded-xl p-3.5 bg-white" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
        {[
          { i: "F", t: "F.Z. · Pembrolizumab", j: "J+14", s: "⚠ Signal", bg: "#fde8e8", col: "#C0392B" },
          { i: "M", t: "M.B. · Méthotrexate", j: "J+7", s: "✓ RAS", bg: "rgba(15,91,87,0.08)", col: C.petrol },
          { i: "A", t: "A.O. · Pembrolizumab", j: "J+21", s: "⏳ Attente", bg: "#f3f4f6", col: "#9ca3af" },
        ].map((p, idx) => (
          <div key={p.i} className="flex items-center justify-between py-2" style={{ borderBottom: idx < 2 ? `1px solid ${C.cream}` : "none" }}>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(15,91,87,0.1)", color: C.petrol }}>{p.i}</span>
              <span style={{ color: C.night }}>{p.t} <span style={{ color: "#8a9ab0" }}>{p.j}</span></span>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: p.bg, color: p.col }}>{p.s}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-3.5 bg-white" style={{ border: "1px solid rgba(15,91,87,0.1)" }}>
        <p className="text-[11px] mb-2" style={{ color: "#4a5568" }}>Réponse de F.Z. — check-in J+14 :</p>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] px-2.5 py-1.5 rounded-full font-bold" style={{ background: "#fde8e8", color: "#C0392B", border: "1px solid #fecaca" }}>Essoufflement</span>
          <span className="text-[11px] px-2.5 py-1.5 rounded-full text-white" style={{ background: C.petrol }}>Fatigue</span>
          <span className="text-[11px] px-2.5 py-1.5 rounded-full" style={{ background: C.cream, border: `1px solid ${C.creamDark}` }}>Nausées</span>
        </div>
        <div className="rounded-md px-2.5 py-1.5 font-mono text-[10.5px] mt-2.5" style={{ background: "rgba(15,91,87,0.07)", color: C.petrol }}>→ Signal codé · pré-remplit une déclaration CIOMS</div>
      </div>
    </div>
  );
}

function ProductWindow({ active }: { active: ModuleId }) {
  const mod = MODULES.find((m) => m.id === active)!;
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 24px 70px -30px rgba(15,91,87,0.5)", border: "1px solid rgba(15,91,87,0.12)" }}>
      <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ background: C.night }}>
        <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="w-2.5 h-2.5 rounded-full" style={{ background: C.mint }} /></div>
        <div className="flex-1 mx-2 rounded-md px-3 py-1 text-[10px]" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>{mod.url}</div>
        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.mint }} /><span className="text-[9px]" style={{ color: C.mint }}>En direct</span></div>
      </div>
      <div className="p-4 grid" style={{ background: C.cream }}>
        {(["decl", "ref", "ord", "suivi"] as ModuleId[]).map((id) => (
          <div
            key={id}
            aria-hidden={active !== id}
            style={{
              gridArea: "1 / 1",
              opacity: active === id ? 1 : 0,
              pointerEvents: active === id ? "auto" : "none",
              transition: "opacity .45s ease",
            }}
          >
            {id === "decl" && <ScreenDeclaration />}
            {id === "ref" && <ScreenReferentiel />}
            {id === "ord" && <ScreenOrdonnancier />}
            {id === "suivi" && <ScreenSuivi />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductWalkthrough() {
  const [active, setActive] = useState<ModuleId>("decl");

  useEffect(() => {
    const els = MODULES
      .map((m) => document.getElementById(`mod-${m.id}`))
      .filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.getAttribute("data-mod") as ModuleId);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="w-full px-6 md:px-12 py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.gold }}>La plateforme</p>
          <h2 className="text-3xl font-bold max-w-2xl" style={{ color: C.night }}>Quatre modules qui partagent les mêmes données</h2>
          <p className="text-base mt-3 max-w-xl" style={{ color: "#6b7280" }}>
            La déclaration est gratuite et reste le point d&apos;entrée. Les autres modules s&apos;ajoutent quand vous en avez besoin.
          </p>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-12 items-start">
          {/* Légendes (cibles de scroll) */}
          <div>
            {MODULES.map((m) => {
              const on = active === m.id;
              return (
                <div
                  key={m.id}
                  id={`mod-${m.id}`}
                  data-mod={m.id}
                  className="lg:min-h-[78vh] flex flex-col justify-center py-7 lg:py-0 pl-5 transition-all duration-500"
                  style={{ borderLeft: `2px solid ${on ? C.gold : C.creamDark}`, opacity: on ? 1 : 0.45 }}
                >
                  <p className="text-xs font-semibold tracking-wide mb-2.5" style={{ color: "#8a9ab0" }}>{m.idx}</p>
                  <h3 className="text-2xl font-bold mb-1.5 flex items-center gap-2.5" style={{ color: C.night }}>
                    {m.name}
                    {m.free && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(15,91,87,0.1)", color: C.petrol }}>Gratuit</span>}
                  </h3>
                  <p className="text-sm leading-relaxed max-w-sm" style={{ color: "#6b7280" }}>{m.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {m.meta.map((x) => (
                      <span key={x} className="text-[10.5px] font-semibold px-2.5 py-1 rounded-lg bg-white" style={{ border: `1px solid ${C.creamDark}`, color: "#4a5568" }}>{x}</span>
                    ))}
                  </div>
                  <div className="lg:hidden mt-5">
                    <ProductWindow active={m.id} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Écran produit fixe (desktop) */}
          <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <ProductWindow active={active} />
          </div>
        </div>

        {/* Liaison — énoncée une seule fois */}
        <div className="mt-8 rounded-2xl px-7 py-5 flex items-center gap-4" style={{ background: C.cream, border: `1px solid ${C.creamDark}` }}>
          <span className="text-xl" style={{ color: C.gold }}>↪</span>
          <p className="text-sm leading-relaxed" style={{ color: "#4a5568" }}>
            <strong style={{ color: C.night }}>Les modules ne sont pas cloisonnés.</strong> Un signal de suivi devient une déclaration pré-remplie ; une déclaration enrichit le référentiel ; le référentiel signale les risques au moment de prescrire.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── RÉFÉRENTIEL SECTION (interactif) ──────────────────────────────────────────

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
        <div className="p-4">
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
  { q: "Mes données sont-elles confidentielles ?", a: "Oui. MAIA DAWA respecte la loi 09-08. Les données cliniques restent sur votre appareil. Vous gardez le contrôle de la transmission de vos déclarations." },
  { q: "La plateforme suit-elle les standards de pharmacovigilance ?", a: "MAIA DAWA est développée selon les standards internationaux ICH E2B R3, le format CIOMS et la méthode d'imputabilité de Bégaud." },
  { q: "L'ordonnancier stocke-t-il les données patient ?", a: "Non. Les ordonnances restent sur votre appareil uniquement (localStorage). MAIA DAWA ne conserve aucune donnée patient sur ses serveurs — conformément à la loi 09-08." },
  { q: "Peut-on utiliser MAIA DAWA sans être médecin ?", a: "Les patients peuvent signaler via un lien sécurisé envoyé par leur médecin. Les professionnels bénéficient d'un espace dédié avec toutes les fonctionnalités avancées." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y rounded-2xl overflow-hidden" style={{ border: `1px solid rgba(15,91,87,0.12)` }}>
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

      <Navbar />

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="w-full px-6 md:px-12 pt-12 pb-10" style={{ background: `linear-gradient(160deg, ${C.cream} 0%, #fff 55%, rgba(15,91,87,0.03) 100%)` }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 bg-white" style={{ border: `1px solid ${C.creamDark}` }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.mint }} />
                  <span className="text-xs font-medium" style={{ color: "#4a5568" }}>Plateforme en service · Maroc 🇲🇦</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black leading-[1.08] tracking-tight mb-4" style={{ color: C.night }}>
                  Déclarez un effet indésirable<br />
                  en 5 minutes. <span style={{ color: C.petrol }}>Gratuitement.</span>
                </h1>
                <p className="text-base leading-relaxed max-w-lg mb-6" style={{ color: "#6b7280" }}>
                  La déclaration est gratuite et le restera. Autour d&apos;elle : référentiel de sécurité, ordonnancier et suivi patient — conformes aux standards ICH E2B · CIOMS · Bégaud.
                </p>
                <div className="flex flex-wrap gap-2.5 mb-5">
                  <Link href="/dashboard/invite" className="px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-all" style={{ background: C.petrol, color: "#fff" }}>
                    Déclarer un effet indésirable <IconArrow />
                  </Link>
                  <Link href="/register" className="px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 bg-white transition-colors" style={{ border: `1px solid ${C.creamDark}`, color: C.night }}>
                    Créer un compte gratuit
                  </Link>
                </div>
                <div className="flex flex-wrap gap-4 text-xs" style={{ color: "#8a9ab0" }}>
                  {["Gratuit pour les médecins", "Données stockées localement", "Conforme loi 09-08"].map(t => (
                    <span key={t} className="flex items-center gap-1.5"><IconCheck />{t}</span>
                  ))}
                </div>
              </div>

              <div className="hidden lg:flex flex-col gap-3 shrink-0 pb-1">
                {[{ val: "5 min", label: "par déclaration complète" }, { val: "CIOMS", label: "format de déclaration" }, { val: "Bégaud", label: "imputabilité intégrée" }].map(s => (
                  <div key={s.val} className="text-right">
                    <div className="text-2xl font-black" style={{ color: C.petrol }}>{s.val}</div>
                    <div className="text-[11px]" style={{ color: "#8a9ab0" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <HeroDeclaration />
          </div>
        </section>

        {/* ── BANDE PROBLÈME (calme, factuelle) ── */}
        <section className="w-full px-6 md:px-12 py-7" style={{ background: C.night }}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
            <span className="text-4xl font-black shrink-0" style={{ color: C.gold }}>95%</span>
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
              Au Maroc, près de <strong className="text-white">95% des effets indésirables ne sont jamais signalés</strong> — le plus souvent par manque d&apos;outil intégré, pas par manque de volonté. MAIA DAWA place la déclaration là où elle doit être : dans le flux clinique.
            </p>
          </div>
        </section>

        {/* ── WALKTHROUGH PRODUIT ── */}
        <ProductWalkthrough />

        {/* ── RÉFÉRENTIEL (interactif) ── */}
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
            <ReferentielSection />
          </div>
        </section>

        {/* ── POSTE DE PILOTAGE (dashboard, en récompense) ── */}
        <section className="w-full px-6 md:px-12 py-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.gold }}>Au quotidien</p>
              <h2 className="text-3xl font-bold" style={{ color: C.night }}>Votre poste de pilotage</h2>
              <p className="text-base mt-3" style={{ color: "#6b7280" }}>
                Déclarations, suivis patients, alertes et imputabilité — réunis dans une vue d&apos;ensemble, dès que vous en avez besoin.
              </p>
            </div>
            <HeroDashboard />
          </div>
        </section>

        {/* ── CONFORMITÉ + TRAJECTOIRE (calme) ── */}
        <section className="w-full px-6 md:px-12 py-12" style={{ background: C.night }}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Standards</p>
              <h2 className="text-2xl font-bold text-white mb-5">Construit sur les exigences de la pharmacovigilance</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Méthode de Bégaud", desc: "Imputabilité officielle" },
                  { label: "MedDRA", desc: "Terminologie internationale" },
                  { label: "ICH E2B(R3)", desc: "Transmission des données" },
                  { label: "CIOMS", desc: "Format de déclaration" },
                  { label: "Loi 17-04", desc: "Pharmacovigilance Maroc" },
                  { label: "Loi 09-08 / CNDP", desc: "Protection des données" },
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

        {/* ── FAQ + CTA ── */}
        <section className="w-full px-6 md:px-12 py-12 bg-white">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: C.gold }}>FAQ</p>
              <h2 className="text-2xl font-bold mb-4" style={{ color: C.night }}>Questions fréquentes</h2>
              <FAQ />
            </div>
            <div className="rounded-2xl p-8 flex flex-col items-center text-center" style={{ background: C.night }}>
              <MaiaLogo dark />
              <h3 className="text-2xl font-bold text-white mt-5 mb-3">Commencez en quelques minutes</h3>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>Déclaration · Référentiel · Ordonnancier · Suivi<br />Gratuit pour les médecins.</p>
              <div className="flex flex-col gap-2.5 w-full max-w-xs">
                <Link href="/register" className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors" style={{ background: C.gold, color: C.night }}>
                  Commencer gratuitement <IconArrow />
                </Link>
                <Link href="/dashboard/invite" className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white border transition-colors" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  Déclarer sans compte
                </Link>
              </div>
              <p className="text-[10px] mt-5" style={{ color: "rgba(255,255,255,0.2)" }}>Sans engagement · Données stockées sur votre appareil · CNDP</p>
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
              { title: "Plateforme", links: [["Référentiel", "/medicaments"], ["Interactions", "/interactions"], ["Ordonnancier", "/ordonnances/nouvelle"], ["Suivi patients", "/dashboard/medecin/suivi"], ["Alertes", "/dashboard/medecin/alertes"]] },
              { title: "Déclarer", links: [["Médecin", "/login"], ["Patient", "/login"], ["Sans compte", "/dashboard/invite"]] },
              { title: "Entreprise", links: [["Contact & Partenariats", "/contact"], ["Confidentialité", "/confidentialite"], ["Conditions", "/conditions"], ["À propos", "/about"]] },
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
