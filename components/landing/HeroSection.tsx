"use client";
import Link from "next/link";
import { C } from "./constants";
import { MaiaLogo } from "./MaiaLogo";
import { IconArrow, IconCheck } from "./icons";

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

export function HeroSection() {
  return (
    <section className="w-full px-6 md:px-12 pt-12 pb-10" style={{ background: `linear-gradient(160deg, ${C.cream} 0%, #fff 55%, rgba(15,91,87,0.03) 100%)` }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 bg-white" style={{ border: `1px solid ${C.creamDark}` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.mint }} />
              <span className="text-xs font-medium" style={{ color: "#4a5568" }}>Aperçu MVP · Maroc 🇲🇦</span>
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
              <Link href="/demo" className="px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 bg-white transition-colors" style={{ border: `1px solid ${C.creamDark}`, color: C.petrol }}>
                ▶ Tester avec des données fictives
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-xs" style={{ color: "#8a9ab0" }}>
              {["Gratuit pour les médecins", "Données stockées localement", "Aligné CIOMS · Bégaud"].map(t => (
                <span key={t} className="flex items-center gap-1.5"><IconCheck />{t}</span>
              ))}
            </div>
            <p className="text-[11px] mt-3 max-w-lg" style={{ color: "#8a9ab0" }}>
              Statut : MVP. Pas encore destiné à un usage avec de vraies données patient sans validation préalable. Mise en conformité loi 09-08 (CNDP) en cours.
            </p>
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
  );
}
