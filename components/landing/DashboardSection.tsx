"use client";
import { C } from "./constants";
import { MaiaLogo } from "./MaiaLogo";

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
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.goldLight, color: "#92400e" }}>12 actifs</span>
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
                    { src: "EMA", drug: "Apixaban", txt: "Interaction warfarine", sev: "important" },
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

export function DashboardSection() {
  return (
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
  );
}
