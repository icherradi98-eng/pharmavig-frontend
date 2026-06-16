"use client";
import { useState, useEffect } from "react";
import { C } from "./constants";

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
    desc: "Effets indésirables, contre-indications, interactions, et alertes EMA · ANSM en temps réel — avec les données de terrain marocaines.",
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
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: "#92700a" }}>EMA</span>
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

export function ProductWalkthrough() {
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

          <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <ProductWindow active={active} />
          </div>
        </div>

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
