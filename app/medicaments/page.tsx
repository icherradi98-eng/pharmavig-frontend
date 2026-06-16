"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  autocomplete, getRecentSearches, pushRecentSearch, slugify,
  QUICK_ACCESS_MOLECULES, type Suggestion,
} from "@/lib/drugApi";
import { fetchTerrain, type TerrainOut } from "@/lib/api";

// ── Identité MAIA DAWA ────────────────────────────────────────────────────────
const C = {
  petrol: "#0F5B57", petrolDark: "#0a3f3c", gold: "#D4AF37", goldLight: "#f5e9a8",
  mint: "#2FA88F", night: "#1F2D3D", cream: "#F7F3EE", creamDark: "#ede8e2", red: "#C0392B",
};

// ── Statut de sécurité curé (reflète les alertes réglementaires suivies) ──────
type Safety = "alert" | "signal" | "ok";
const SAFETY_COLOR: Record<Safety, string> = { alert: C.red, signal: C.gold, ok: C.mint };
const SAFETY_FLAG: Record<Safety, { t: string; bg: string; c: string } | null> = {
  alert: { t: "Alerte", bg: "#fde8e8", c: C.red },
  signal: { t: "Signal MA", bg: C.goldLight, c: "#92700a" },
  ok: null,
};
function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
const SAFETY_STATUS: Record<string, Safety> = {
  amoxicilline: "alert", pembrolizumab: "alert", nivolumab: "alert", methotrexate: "alert",
  valproate: "alert", codeine: "alert", ibuprofene: "signal",
  metformine: "ok", amlodipine: "ok", atorvastatine: "ok", paracetamol: "ok",
  omeprazole: "ok", levothyroxine: "ok",
};
function safetyOf(name: string): Safety | null {
  return SAFETY_STATUS[norm(name)] ?? null;
}

// ── Brief du jour + alertes en vigueur (dataset curé réel) ────────────────────
const BRIEF = {
  dci: "Pembrolizumab", source: "EMA", severity: "urgent" as const,
  title: "Pembrolizumab — myocardite sévère",
  text: "Surveillance cardiaque recommandée avant chaque cycle. Pronostic conditionné par la précocité du diagnostic.",
};
const ALERTS = [
  { src: "EMA", color: C.red, dci: "Méthotrexate", txt: "Neurotoxicité intrathécale — erreur de voie", date: "15 nov.", sev: "urgent" as const },
  { src: "ANSM", color: C.petrol, dci: "Valproate", txt: "Programme grossesse renforcé", date: "8 oct.", sev: "urgent" as const },
  { src: "EMA", color: "#92700a", dci: "Ciprofloxacine", txt: "Atteintes musculo-tendineuses", date: "3 sept.", sev: "important" as const },
  { src: "ANSM", color: C.petrolDark, dci: "Amoxicilline", txt: "Réactions cutanées (SJS / DRESS)", date: "20 août", sev: "important" as const },
];

function MaiaLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center" style={{ background: C.petrol }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9" />
          <path d="M9 12l2 2 4-4" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="font-black text-[15px] tracking-tight">
        <span style={{ color: C.petrol }}>MAIA</span> <span style={{ color: C.gold }}>DAWA</span>
      </span>
    </div>
  );
}

export default function MedicamentsSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [recents, setRecents] = useState<string[]>(() => getRecentSearches());
  const [signals, setSignals] = useState<TerrainOut[] | null>(null); // null = chargement
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Signaux Maroc — vraies données terrain des molécules courantes (compteurs réels)
  useEffect(() => {
    let cancelled = false;
    const candidates = [...new Set([...QUICK_ACCESS_MOLECULES, "Valproate", "Codéine"])].slice(0, 8);
    Promise.all(candidates.map((d) => fetchTerrain(d).catch(() => null)))
      .then((rows) => {
        if (cancelled) return;
        const real = rows.filter((r): r is TerrainOut => !!r && r.total > 0).sort((a, b) => b.total - a.total).slice(0, 3);
        setSignals(real);
      })
      .catch(() => { if (!cancelled) setSignals([]); });
    return () => { cancelled = true; };
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setSuggestions([]); setOpen(true); setLoading(false); return; }
    setLoading(true); setOpen(true);
    debounceRef.current = setTimeout(async () => {
      const results = await autocomplete(value);
      setSuggestions(results); setLoading(false);
    }, 300);
  }
  function goTo(name: string) {
    pushRecentSearch(name); setRecents(getRecentSearches()); setOpen(false);
    router.push(`/medicaments/${slugify(name)}`);
  }
  function handleSubmit(e: React.FormEvent) { e.preventDefault(); if (query.trim().length >= 2) goTo(query.trim()); }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream }}>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: "rgba(247,243,238,0.93)", borderBottom: `1px solid ${C.creamDark}` }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between py-3">
          <Link href="/"><MaiaLogo /></Link>
          <Link href="/login" className="text-[13px]" style={{ color: "#6b7280" }}>Espace professionnel →</Link>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── HERO clinique ── */}
        <div style={{ background: `linear-gradient(160deg, ${C.cream} 0%, #fff 60%, rgba(15,91,87,0.03) 100%)` }}>
          <div className="max-w-5xl mx-auto px-6 pt-12 pb-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2.5" style={{ color: C.night }}>
              Le référentiel médicament<br /><span style={{ color: C.petrol }}>de votre pratique</span>.
            </h1>
            <p className="text-base leading-relaxed max-w-xl mb-6" style={{ color: "#6b7280" }}>
              Indications, posologie, contre-indications, interactions — pour chaque molécule. Enrichi de la veille de sécurité et des signaux du terrain marocain.
            </p>

            <form onSubmit={handleSubmit} className="relative max-w-2xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#8a9ab0" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" /></svg>
              </span>
              <input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder="Rechercher une DCI, un nom commercial…"
                className="w-full rounded-2xl pl-12 pr-28 py-4 text-base bg-white shadow-sm focus:outline-none focus:ring-2"
                style={{ border: `1px solid ${C.creamDark}`, ["--tw-ring-color" as string]: C.petrol }}
              />
              <button type="submit" className="absolute right-2 top-2 bottom-2 text-white text-sm font-semibold px-5 rounded-xl transition-colors" style={{ background: C.petrol }}>
                Rechercher
              </button>

              {open && (
                <div className="absolute z-30 mt-2 w-full bg-white rounded-2xl shadow-lg overflow-hidden text-left" style={{ border: `1px solid ${C.creamDark}` }}>
                  {query.trim().length < 2 ? (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-wider px-4 pt-3 pb-1.5" style={{ color: "#8a9ab0" }}>Consultées par les médecins</p>
                      {QUICK_ACCESS_MOLECULES.slice(0, 5).map((m) => {
                        const s = safetyOf(m); const flag = s ? SAFETY_FLAG[s] : null;
                        return (
                          <button key={m} onMouseDown={() => goTo(m)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F3EE] transition-colors">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s ? SAFETY_COLOR[s] : C.creamDark }} />
                            <span className="text-sm font-semibold" style={{ color: C.night }}>{m}</span>
                            {flag && <span className="ml-auto text-[9.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: flag.bg, color: flag.c }}>{flag.t}</span>}
                          </button>
                        );
                      })}
                    </>
                  ) : loading ? (
                    <div className="px-4 py-3 text-sm" style={{ color: "#8a9ab0" }}>Recherche en cours…</div>
                  ) : suggestions.length === 0 ? (
                    <button onMouseDown={() => goTo(query.trim())} className="w-full text-left px-4 py-3 hover:bg-[#F7F3EE] transition-colors">
                      <p className="text-sm font-medium" style={{ color: C.night }}>« {query} » n&apos;est pas dans le référentiel Maroc</p>
                      <p className="text-xs mt-0.5" style={{ color: "#8a9ab0" }}>Ouvrir la fiche pour consulter l&apos;enrichissement clinique — disponibilité au Maroc à confirmer.</p>
                    </button>
                  ) : (
                    suggestions.map((s, i) => {
                      const st = safetyOf(s.dci); const flag = st ? SAFETY_FLAG[st] : null;
                      return (
                        <button key={`${s.dci}-${i}`} onMouseDown={() => goTo(s.dci)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F3EE] transition-colors">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: st ? SAFETY_COLOR[st] : C.creamDark }} />
                          <span className="text-sm font-semibold" style={{ color: C.night }}>{s.dci}</span>
                          {flag ? <span className="ml-auto text-[9.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: flag.bg, color: flag.c }}>{flag.t}</span>
                                : s.brand && <span className="ml-auto text-xs" style={{ color: "#8a9ab0" }}>{s.brand}</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </form>

            {/* Reprendre + courantes */}
            <div className="flex items-center gap-2 flex-wrap mt-5">
              {recents.length > 0 && (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#8a9ab0" }}>Reprendre</span>
                  {recents.slice(0, 2).map((r) => (
                    <button key={r} onClick={() => goTo(r)} className="text-[13px] font-medium bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ border: `1px solid ${C.creamDark}`, color: "#4a5568" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>{r}
                    </button>
                  ))}
                </>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#8a9ab0", marginLeft: recents.length ? 8 : 0 }}>Courantes</span>
              {QUICK_ACCESS_MOLECULES.slice(0, 4).map((m) => {
                const s = safetyOf(m);
                return (
                  <button key={m} onClick={() => goTo(m)} className="text-[13px] font-medium bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ border: `1px solid ${C.creamDark}`, color: C.night }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s ? SAFETY_COLOR[s] : C.creamDark }} />{m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── APERÇU FICHE — démonstration de la valeur clinique ── */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: C.gold }}>Ce que contient chaque fiche</p>
          <h2 className="text-2xl font-bold mb-1" style={{ color: C.night }}>Une référence clinique complète, en un écran</h2>
          <p className="text-sm mb-6 max-w-2xl" style={{ color: "#8a9ab0" }}>Tout ce dont vous avez besoin au quotidien — et la couche de sécurité MAIA DAWA en bonus.</p>

          <div className="rounded-2xl overflow-hidden bg-white" style={{ border: `1px solid ${C.creamDark}`, boxShadow: "0 16px 50px -28px rgba(15,91,87,0.4)" }}>
            <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap" style={{ background: C.night }}>
              <div>
                <p className="text-white text-xl font-bold tracking-tight">Amoxicilline</p>
                <p className="text-[12.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Bêta-lactamine · Pénicilline A · Antibiotique · voie orale</p>
                <div className="flex gap-1.5 mt-2">
                  {["Clamoxyl®", "Hiconcil®", "+ génériques"].map((b) => (
                    <span key={b} className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>{b}</span>
                  ))}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-white px-2.5 py-1.5 rounded-full self-center" style={{ background: C.red }}>⚑ 1 alerte</span>
            </div>

            <div className="grid md:grid-cols-2">
              <PvCell title="Indications" border>
                {["Infections ORL : angines, otites, sinusites", "Infections respiratoires basses", "Infections urinaires, cutanées", "Éradication d'H. pylori (en association)"].map((t) => (
                  <p key={t} className="flex gap-2 text-[13px] mb-1.5 leading-snug" style={{ color: "#374151" }}><span className="font-bold shrink-0" style={{ color: C.petrol }}>›</span>{t}</p>
                ))}
              </PvCell>
              <PvCell title="Posologie">
                {[["Adulte", "1 g × 2 à 3 / jour · selon l'indication"], ["Enfant", "25 à 50 mg/kg/jour en 2-3 prises"], ["Insuffisance rénale", "Adapter si clairance < 30 mL/min"]].map(([w, r]) => (
                  <div key={w} className="rounded-lg px-3 py-2 mb-2" style={{ background: C.cream }}>
                    <p className="text-[10.5px]" style={{ color: "#8a9ab0" }}>{w}</p>
                    <p className="text-[13px] font-semibold" style={{ color: C.night }}>{r}</p>
                  </div>
                ))}
              </PvCell>
              <PvCell title="Contre-indications" border top>
                {[["Allergie aux pénicillines", C.red], ["Allergie céphalosporines (croisée)", C.red], ["Antécédent SJS / DRESS", C.red]].map(([t]) => (
                  <span key={t} className="inline-flex text-[11.5px] font-medium px-2.5 py-1 rounded-lg mr-1.5 mb-1.5" style={{ background: "#fde8e8", color: C.red }}>{t}</span>
                ))}
              </PvCell>
              <PvCell title="Interactions" top>
                <span className="inline-flex text-[11.5px] font-medium px-2.5 py-1 rounded-lg mr-1.5 mb-1.5" style={{ background: C.goldLight, color: "#92700a" }}>Méthotrexate — majeure</span>
                <span className="inline-flex text-[11.5px] font-medium px-2.5 py-1 rounded-lg mr-1.5 mb-1.5" style={{ background: C.goldLight, color: "#92700a" }}>Allopurinol — rash ↑</span>
                <span className="inline-flex text-[11.5px] font-medium px-2.5 py-1 rounded-lg mr-1.5 mb-1.5" style={{ background: "rgba(47,168,143,0.12)", color: "#1f8a73" }}>Contraceptifs — surveillance</span>
              </PvCell>
            </div>

            <div className="px-6 py-3 flex items-center gap-2.5 text-[12px]" style={{ background: C.cream, borderTop: `1px solid ${C.creamDark}`, color: "#4a5568" }}>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(15,91,87,0.1)", color: C.petrol }}>+ MAIA DAWA</span>
              Veille de sécurité, signaux marocains et recommandations de surveillance — plus bas dans la fiche.
            </div>
          </div>
        </div>

        {/* ── DIFFÉRENCIATEUR : veille de sécurité (secondaire) ── */}
        <div className="max-w-5xl mx-auto px-6 pb-12">
          <div className="rounded-3xl p-6 md:p-7" style={{ background: C.night }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: C.gold }}>La différence MAIA DAWA</p>
            <h2 className="text-xl font-bold text-white mb-1">Ce qu&apos;une base classique ne vous donne pas</h2>
            <p className="text-[13.5px] mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>La veille réglementaire et les signaux du terrain marocain, intégrés à chaque fiche.</p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Brief du jour */}
              <Link href={`/medicaments/${slugify(BRIEF.dci)}`} className="rounded-2xl p-4 block transition-colors" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>Brief de sécurité du jour</p>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-white px-2 py-0.5 rounded-full mb-2.5" style={{ background: C.red }}>⚑ {BRIEF.source} · urgent</span>
                <p className="text-base font-bold text-white mb-1.5">{BRIEF.title}</p>
                <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{BRIEF.text}</p>
              </Link>

              {/* Signaux Maroc — données réelles */}
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Signaux émergents · Maroc <span className="inline-flex items-center gap-1" style={{ color: C.mint }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: C.mint }} /> réseau MAIA DAWA</span>
                </p>

                {signals === null ? (
                  <div className="space-y-2.5">{[0, 1, 2].map((i) => <div key={i} className="h-9 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />)}</div>
                ) : signals.length === 0 ? (
                  <div className="py-3">
                    <p className="text-[13px] text-white font-medium mb-1">Le réseau national se construit.</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>Aucun signal terrain agrégé pour l&apos;instant. Chaque déclaration fait apparaître les premières tendances marocaines ici.</p>
                  </div>
                ) : (
                  <>
                    {signals.map((s) => (
                      <Link key={s.dci} href={`/medicaments/${slugify(s.dci)}`} className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-white truncate">{s.dci}</p>
                          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{s.top_effets[0]?.terme ?? "—"}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-base font-black" style={{ color: C.gold }}>{s.total}</p>
                          <p className="text-[9.5px]" style={{ color: "rgba(255,255,255,0.4)" }}>déclaration{s.total > 1 ? "s" : ""}{s.graves > 0 ? ` · ${s.graves} grave${s.graves > 1 ? "s" : ""}` : ""}</p>
                        </div>
                      </Link>
                    ))}
                    <p className="text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.35)" }}>Compteurs réels, mis à jour à chaque déclaration.</p>
                  </>
                )}
              </div>
            </div>

            {/* Alertes — exemples illustratifs de contenu réel EMA/ANSM (flux live en cours d'intégration) */}
            <p className="text-[10px] mt-4 mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Exemples d&apos;alertes réglementaires EMA/ANSM · Sources officielles · Intégration flux live à venir
            </p>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {ALERTS.map((a) => (
                <Link key={a.dci} href={`/medicaments/${slugify(a.dci)}`} className="flex items-start gap-3 rounded-xl p-3 transition-colors" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded shrink-0 w-11 text-center" style={{ background: a.color }}>{a.src}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-white leading-snug">{a.dci} — {a.txt}</p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{a.date}</p>
                  </div>
                  <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full self-center" style={{ background: a.sev === "urgent" ? "#fde8e8" : C.goldLight, color: a.sev === "urgent" ? C.red : "#92700a" }}>{a.sev === "urgent" ? "Urgent" : "Important"}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="max-w-5xl mx-auto px-6 pb-14">
          <div className="rounded-2xl px-7 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ background: C.petrol }}>
            <div>
              <p className="text-lg font-bold text-white">Vous avez observé un effet indésirable ?</p>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>Chaque déclaration enrichit les signaux marocains du référentiel. Gratuit, 5 minutes, sans compte.</p>
            </div>
            <Link href="/dashboard/invite" className="text-sm font-bold px-5 py-2.5 rounded-xl shrink-0 text-center" style={{ background: C.gold, color: C.night }}>
              Déclarer un cas →
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}

function PvCell({ title, children, border, top }: { title: string; children: React.ReactNode; border?: boolean; top?: boolean }) {
  return (
    <div className="px-6 py-4" style={{ borderTop: top ? `1px solid ${C.creamDark}` : undefined, borderRight: border ? `1px solid ${C.creamDark}` : undefined }}>
      <p className="text-[10px] font-bold uppercase tracking-wide mb-2.5" style={{ color: "#8a9ab0" }}>{title}</p>
      {children}
    </div>
  );
}
