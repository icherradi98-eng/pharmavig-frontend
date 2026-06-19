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

// ── Logo ──────────────────────────────────────────────────────────────────────

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
          <span style={{ color: dark ? "#fff" : C.petrol, fontWeight: 900, fontSize: 16, letterSpacing: "-0.3px" }}>MAI</span>
          <span style={{ color: C.gold, fontWeight: 900, fontSize: 16, letterSpacing: "-0.3px" }}>DAWA</span>
        </div>
        <p style={{ color: dark ? "rgba(255,255,255,0.35)" : "#8a9ab0", fontSize: 8, letterSpacing: "0.8px", textTransform: "uppercase", marginTop: -2 }}>
          Pharmacovigilance Intelligence
        </p>
      </div>
    </div>
  );
}

// ── Types de partenariat ──────────────────────────────────────────────────────

type PartnerType = "medecin" | "clinique" | "institution" | "pharma" | "autre";

const PARTNERS: { id: PartnerType; label: string; icon: React.ReactNode; color: string; bg: string; title: string; desc: string; cta: string }[] = [
  {
    id: "medecin", label: "Médecin", color: C.petrol, bg: "rgba(15,91,87,0.07)",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    title: "Tester MAI DAWA", desc: "Rejoignez notre programme pilote et découvrez comment MAI DAWA simplifie la déclaration, le suivi patient et la pharmacovigilance au quotidien.", cta: "Rejoindre le programme pilote",
  },
  {
    id: "clinique", label: "Clinique / Hôpital", color: C.mint, bg: "rgba(47,168,143,0.08)",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
    title: "Organiser une démonstration", desc: "Nous venons présenter MAI DAWA à votre équipe. Formation incluse, déploiement rapide, compatible avec vos processus existants.", cta: "Planifier une démo",
  },
  {
    id: "institution", label: "Institution publique", color: C.gold, bg: "rgba(212,175,55,0.08)",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7M4 7l8-4 8 4M12 3v4"/></svg>,
    title: "Partenariat institutionnel", desc: "Ministère de la Santé, AMMPS, universités — construisons ensemble l'infrastructure numérique de la pharmacovigilance marocaine.", cta: "Explorer un partenariat",
  },
  {
    id: "pharma", label: "Industrie pharmaceutique", color: "#7c3aed", bg: "rgba(124,58,237,0.07)",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>,
    title: "Solutions pour l'industrie", desc: "Données de pharmacovigilance terrain, rapports PSUR, détection de signaux, conformité ICH E2B R3 — des outils conçus pour vos équipes safety.", cta: "Découvrir nos solutions",
  },
  {
    id: "autre", label: "Autre partenaire", color: C.night, bg: "rgba(31,45,61,0.06)",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    title: "Parlons de votre projet", desc: "ONG, fondations, chercheurs, investisseurs — si vous croyez en une pharmacovigilance numérique pour l'Afrique, nous voulons vous rencontrer.", cta: "Prendre contact",
  },
];

// ── Formulaires par type ──────────────────────────────────────────────────────

function FormField({ label, type = "text", placeholder, required = false }: { label: string; type?: string; placeholder: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: C.night }}>
        {label}{required && <span className="ml-0.5" style={{ color: "#C0392B" }}>*</span>}
      </label>
      {type === "textarea" ? (
        <textarea name={label} required={required} rows={3} placeholder={placeholder} className="w-full rounded-xl px-3 py-2.5 text-sm resize-none transition-all outline-none"
          style={{ border: `1px solid ${C.creamDark}`, background: C.cream, color: C.night }}
          onFocus={e => (e.currentTarget.style.border = `1px solid ${C.petrol}`)}
          onBlur={e => (e.currentTarget.style.border = `1px solid ${C.creamDark}`)} />
      ) : (
        <input name={label} required={required} type={type} placeholder={placeholder} className="w-full rounded-xl px-3 py-2.5 text-sm transition-all outline-none"
          style={{ border: `1px solid ${C.creamDark}`, background: C.cream, color: C.night }}
          onFocus={e => (e.currentTarget.style.border = `1px solid ${C.petrol}`)}
          onBlur={e => (e.currentTarget.style.border = `1px solid ${C.creamDark}`)} />
      )}
    </div>
  );
}

function FormSelect({ label, options, required = false }: { label: string; options: string[]; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: C.night }}>
        {label}{required && <span className="ml-0.5" style={{ color: "#C0392B" }}>*</span>}
      </label>
      <select name={label} required={required} className="w-full rounded-xl px-3 py-2.5 text-sm transition-all outline-none appearance-none"
        style={{ border: `1px solid ${C.creamDark}`, background: C.cream, color: C.night }}
        onFocus={e => (e.currentTarget.style.border = `1px solid ${C.petrol}`)}
        onBlur={e => (e.currentTarget.style.border = `1px solid ${C.creamDark}`)}>
        <option value="">Choisir…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const SPECIALITES = ["Médecine générale", "Cardiologie", "Oncologie", "Neurologie", "Pneumologie", "Gastro-entérologie", "Endocrinologie", "Rhumatologie", "Dermatologie", "Pédiatrie", "Gynécologie-obstétrique", "Chirurgie", "Urgences", "Réanimation", "Psychiatrie", "Hématologie", "Infectiologie", "Autre"];
const MEDECINS_OPTIONS = ["1–5", "6–15", "16–30", "31–50", "50+"];
const PHARMA_DOMAINES = ["Drug Safety / Pharmacovigilance", "Affaires réglementaires", "Medical Affairs", "Market Access", "Recherche clinique", "Direction générale", "Autre"];
const PARTENARIAT_TYPES = ["Investissement", "ONG / Fondation", "Recherche académique", "Media / Presse", "Technologie / Data", "Autre"];

function PartnerForm({ type, cta, color }: { type: PartnerType; cta: string; color: string }) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(15,91,87,0.1)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.petrol} strokeWidth="2.5" strokeLinecap="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg>
        </div>
        <h4 className="font-bold text-base mb-1" style={{ color: C.night }}>Votre messagerie s&apos;ouvre…</h4>
        <p className="text-sm" style={{ color: "#6b7280" }}>
          Finalisez l&apos;envoi depuis votre client mail. Si rien ne s&apos;ouvre, écrivez-nous à{" "}
          <a href="mailto:contact@maiadawa.ma" className="underline" style={{ color: C.petrol }}>contact@maiadawa.ma</a>.
        </p>
        <button onClick={() => setSent(false)} className="mt-4 text-xs underline" style={{ color: C.petrol }}>Remplir un autre message</button>
      </div>
    );
  }

  return (
    <form onSubmit={e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const lines: string[] = [];
      fd.forEach((v, k) => { if (String(v).trim()) lines.push(`${k}: ${v}`); });
      const subject = `Contact MAI DAWA — ${type}`;
      window.location.href = `mailto:contact@maiadawa.ma?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
      setSent(true);
    }} className="space-y-3">
      {type === "medecin" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Prénom & Nom" placeholder="Dr. Fatima Zahra…" required />
            <FormField label="Email professionnel" type="email" placeholder="fz@clinique.ma" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Téléphone" type="tel" placeholder="+212 6…" />
            <FormSelect label="Spécialité" options={SPECIALITES} required />
          </div>
          <FormField label="Ville d'exercice" placeholder="Rabat, Casablanca…" />
          <FormField label="Message (optionnel)" type="textarea" placeholder="Votre contexte, vos attentes…" />
        </>
      )}

      {type === "clinique" && (
        <>
          <FormField label="Nom de l'établissement" placeholder="Clinique Al Shifa, CHU Ibn Sina…" required />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nom & Prénom du contact" placeholder="Dr. Ahmed…" required />
            <FormField label="Fonction" placeholder="Directeur médical, DSI…" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email" type="email" placeholder="contact@etablissement.ma" required />
            <FormSelect label="Nombre de médecins" options={MEDECINS_OPTIONS} />
          </div>
          <FormField label="Message" type="textarea" placeholder="Décrivez votre contexte et vos objectifs…" />
        </>
      )}

      {type === "institution" && (
        <>
          <FormField label="Organisation" placeholder="Ministère de la Santé, Université…" required />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nom & Prénom" placeholder="Votre nom…" required />
            <FormField label="Fonction / Direction" placeholder="Directeur, Chef de service…" required />
          </div>
          <FormField label="Email institutionnel" type="email" placeholder="contact@organisation.ma" required />
          <FormField label="Objet de la demande" type="textarea" placeholder="Décrivez le cadre et les objectifs du partenariat envisagé…" required />
        </>
      )}

      {type === "pharma" && (
        <>
          <FormField label="Société pharmaceutique" placeholder="Nom de la société…" required />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nom & Prénom" placeholder="Votre nom…" required />
            <FormField label="Fonction" placeholder="Medical Director, VP Safety…" required />
          </div>
          <FormField label="Email professionnel" type="email" placeholder="contact@pharma.com" required />
          <FormSelect label="Domaine d'intérêt" options={PHARMA_DOMAINES} required />
          <FormField label="Message" type="textarea" placeholder="Décrivez vos besoins en pharmacovigilance…" />
        </>
      )}

      {type === "autre" && (
        <>
          <FormField label="Organisation / Société" placeholder="Nom de votre organisation…" required />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nom & Prénom" placeholder="Votre nom…" required />
            <FormField label="Email" type="email" placeholder="contact@org.com" required />
          </div>
          <FormSelect label="Type de partenariat" options={PARTENARIAT_TYPES} required />
          <FormField label="Décrivez votre projet" type="textarea" placeholder="Comment envisagez-vous une collaboration avec MAI DAWA ?" required />
        </>
      )}

      <button type="submit" className="w-full py-3 rounded-xl font-bold text-sm transition-all"
        style={{ background: color, color: color === C.gold ? C.night : "#fff" }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
        {cta} →
      </button>
      <p className="text-center text-[10px]" style={{ color: "#8a9ab0" }}>
        Réponse sous 24h ouvrées · Données protégées (loi 09-08)
      </p>
    </form>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: "Comment tester MAI DAWA ?", a: "Sélectionnez le profil 'Médecin' dans la section Partenariats, remplissez le formulaire et notre équipe vous contacte sous 24h pour organiser un accès pilote personnalisé." },
  { q: "Qui peut rejoindre le programme pilote ?", a: "Tout médecin exerçant au Maroc, quelle que soit sa spécialité. Nous recrutons en priorité des oncologues, cardiologues et médecins généralistes pour la phase pilote 2026." },
  { q: "MAI DAWA est-il disponible dans tout le Maroc ?", a: "La plateforme est accessible depuis n'importe quel navigateur, partout au Maroc. Nous proposons des formations en présentiel à Casablanca, Rabat et Fès — et en visioconférence pour les autres villes." },
  { q: "Comment organiser une démonstration pour mon établissement ?", a: "Remplissez le formulaire 'Clinique / Hôpital'. Notre équipe vous propose un créneau de démonstration (30 min) adapté à votre calendrier, en présentiel ou en visio." },
  { q: "Comment devenir partenaire institutionnel ?", a: "Institutions publiques, universités, agences réglementaires — nous sommes ouverts à tout type de collaboration. Contactez-nous via le formulaire 'Institution Publique' avec une description de votre projet." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y rounded-2xl overflow-hidden bg-white" style={{ border: `1px solid rgba(15,91,87,0.12)` }}>
      {FAQ_ITEMS.map((item, i) => (
        <div key={i}>
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
            style={{ background: open === i ? "rgba(15,91,87,0.03)" : "#fff" }}>
            <span className="font-medium text-sm pr-4" style={{ color: C.night }}>{item.q}</span>
            <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
              style={{ color: C.petrol }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
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

export default function ContactPage() {
  const [activePartner, setActivePartner] = useState<PartnerType>("medecin");
  const active = PARTNERS.find(p => p.id === activePartner)!;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream }}>

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-3 sticky top-0 z-50 backdrop-blur-md"
        style={{ background: "rgba(247,243,238,0.93)", borderBottom: `1px solid ${C.creamDark}` }}>
        <Link href="/"><MaiaLogo /></Link>
        <div className="hidden md:flex items-center gap-1">
          {[["Accueil", "/"], ["Référentiel", "/medicaments"], ["Connexion", "/login"]].map(([label, href]) => (
            <Link key={label} href={href} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ color: "#6b7280" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.petrol)} onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>{label}</Link>
          ))}
        </div>
        <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all" style={{ background: C.petrol, color: "#fff" }}>
          Commencer gratuitement
        </Link>
      </nav>

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="w-full px-6 md:px-12 py-14" style={{ background: `linear-gradient(160deg, ${C.night} 0%, #0a2a27 100%)` }}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5" style={{ background: "rgba(212,175,55,0.12)", border: `1px solid rgba(212,175,55,0.25)` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.gold }} />
                <span className="text-xs font-semibold" style={{ color: C.gold }}>Partenariats & Collaboration</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight text-white mb-5">
                Collaborons pour<br />améliorer la{" "}
                <span style={{ color: C.gold }}>sécurité<br />médicamenteuse</span>
              </h1>
              <p className="text-base leading-relaxed mb-7" style={{ color: "rgba(255,255,255,0.55)" }}>
                Que vous soyez médecin, établissement de santé, institution publique ou partenaire industriel, notre équipe est à votre disposition pour construire ensemble l&apos;avenir de la pharmacovigilance.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#partenariats" className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all" style={{ background: C.gold, color: C.night }}>
                  Prendre contact →
                </a>
                <a href="#contact-direct" className="px-5 py-2.5 rounded-xl font-semibold text-sm border text-white transition-all" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
                  Contact direct
                </a>
              </div>
            </div>

            {/* Chiffres clés */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: "30 000+", label: "médecins au Maroc", sub: "Cible programme pilote", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                { val: "200+", label: "cliniques privées", sub: "Partenaires potentiels", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> },
                { val: "5 CHU", label: "universitaires au Maroc", sub: "Partenariats institutionnels", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round"><path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7M4 7l8-4 8 4M12 3v4"/></svg> },
                { val: "24h", label: "délai de réponse", sub: "Garanti ouvrés", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              ].map((s) => (
                <div key={s.val} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: "rgba(212,175,55,0.12)" }}>
                    {s.icon}
                  </div>
                  <p className="text-2xl font-black text-white mb-0.5">{s.val}</p>
                  <p className="text-xs font-semibold text-white mb-0.5">{s.label}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PARTENARIATS ── */}
        <section id="partenariats" className="w-full px-6 md:px-12 py-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.gold }}>Partenariats</p>
              <h2 className="text-3xl font-bold mb-2" style={{ color: C.night }}>Quel est votre profil ?</h2>
              <p className="text-sm" style={{ color: "#8a9ab0" }}>Sélectionnez votre profil pour accéder au formulaire adapté à votre situation.</p>
            </div>

            {/* Sélecteur de profil */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-8">
              {PARTNERS.map((p) => (
                <button key={p.id} onClick={() => setActivePartner(p.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all text-center"
                  style={{
                    background: activePartner === p.id ? p.bg : C.cream,
                    border: `2px solid ${activePartner === p.id ? p.color : C.creamDark}`,
                    transform: activePartner === p.id ? "translateY(-2px)" : "none",
                    boxShadow: activePartner === p.id ? `0 4px 16px rgba(0,0,0,0.08)` : "none",
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: activePartner === p.id ? p.bg : "#fff", color: p.color, border: `1px solid ${activePartner === p.id ? p.color : C.creamDark}` }}>
                    {p.icon}
                  </div>
                  <span className="text-xs font-semibold leading-tight" style={{ color: activePartner === p.id ? p.color : "#6b7280" }}>{p.label}</span>
                </button>
              ))}
            </div>

            {/* Panneau actif */}
            <div className="grid lg:grid-cols-2 gap-6 rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.creamDark}` }}>
              {/* Infos à gauche */}
              <div className="p-8" style={{ background: active.bg }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-5" style={{ background: "rgba(255,255,255,0.6)" }}>
                  <div style={{ color: active.color }}>{active.icon}</div>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: active.color }}>{active.label}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: C.night }}>{active.title}</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "#4a5568" }}>{active.desc}</p>

                {/* Bénéfices selon le type */}
                {activePartner === "medecin" && (
                  <div className="space-y-2.5">
                    {[
                      ["Accès complet gratuit pendant la phase pilote", C.petrol],
                      ["Formation personnalisée (1h en visio ou présentiel)", C.petrol],
                      ["Support dédié 7j/7 pendant 3 mois", C.petrol],
                      ["Contribution à la pharmacovigilance nationale", C.gold],
                      ["Accès prioritaire aux nouvelles fonctionnalités", C.gold],
                    ].map(([item, color]) => (
                      <div key={item} className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2" style={{ border: `1px solid rgba(15,91,87,0.08)` }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg>
                        <span className="text-xs" style={{ color: C.night }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activePartner === "clinique" && (
                  <div className="space-y-2.5">
                    {["Démo personnalisée (30 min) pour votre équipe", "Déploiement rapide — sans infrastructure requise", "Formation de vos médecins incluse", "Tarification adaptée à la taille de votre établissement", "SLA et support institutionnel dédié"].map(item => (
                      <div key={item} className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2" style={{ border: `1px solid rgba(47,168,143,0.1)` }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.mint} strokeWidth="2.5" strokeLinecap="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg>
                        <span className="text-xs" style={{ color: C.night }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activePartner === "institution" && (
                  <div className="space-y-2.5">
                    {["Conforme aux standards ICH E2B R3 et au format CIOMS", "API disponible pour intégration aux systèmes existants", "Données agrégées anonymisées pour la surveillance nationale", "Cadre de confidentialité aligné sur la loi 09-08 (validation CNDP en cours)", "Réunion de présentation à votre direction"].map(item => (
                      <div key={item} className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2" style={{ border: `1px solid rgba(212,175,55,0.15)` }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg>
                        <span className="text-xs" style={{ color: C.night }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activePartner === "pharma" && (
                  <div className="space-y-2.5">
                    {["Dashboard safety Maroc en temps réel", "Rapports PSUR automatisés (ICH E2B R3)", "Détection de signaux terrain sur votre portefeuille", "Données anonymisées sur la population marocaine", "NDA disponible — données strictement confidentielles"].map(item => (
                      <div key={item} className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2" style={{ border: `1px solid rgba(124,58,237,0.08)` }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg>
                        <span className="text-xs" style={{ color: C.night }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activePartner === "autre" && (
                  <div className="space-y-2.5">
                    {["Nous sommes ouverts à tout type de collaboration", "Réponse sous 24h à toutes les demandes", "Réunion de présentation disponible sur demande", "Accord de confidentialité possible (NDA)", "Vision Afrique : Sénégal, Côte d'Ivoire, Tunisie"].map(item => (
                      <div key={item} className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2" style={{ border: `1px solid rgba(31,45,61,0.08)` }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.night} strokeWidth="2.5" strokeLinecap="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg>
                        <span className="text-xs" style={{ color: C.night }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formulaire à droite */}
              <div className="p-8 bg-white">
                <h4 className="font-bold text-base mb-5" style={{ color: C.night }}>
                  {active.cta}
                </h4>
                <PartnerForm type={activePartner} cta={active.cta} color={active.color} />
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT DIRECT + FAQ ── */}
        <section id="contact-direct" className="w-full px-6 md:px-12 py-12" style={{ background: C.cream }}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">

            {/* Contact direct */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.gold }}>Contact direct</p>
              <h2 className="text-2xl font-bold mb-6" style={{ color: C.night }}>Nous joindre directement</h2>

              <div className="space-y-3 mb-8">
                {[
                  {
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.petrol} strokeWidth="1.8" strokeLinecap="round"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
                    label: "Email", value: "contact@maiadawa.ma", href: "mailto:contact@maiadawa.ma", copy: true,
                  },
                  {
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.petrol} strokeWidth="1.8" strokeLinecap="round"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>,
                    label: "Téléphone", value: "Bientôt disponible", href: "", copy: false,
                  },
                  {
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.petrol} strokeWidth="1.8" strokeLinecap="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
                    label: "Adresse", value: "Rabat, Maroc", href: "", copy: false,
                  },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-4 p-4 rounded-2xl bg-white" style={{ border: `1px solid rgba(15,91,87,0.1)` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(15,91,87,0.08)" }}>
                      {c.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#8a9ab0" }}>{c.label}</p>
                      {c.href ? (
                        <a href={c.href} className="text-sm font-semibold transition-colors" style={{ color: C.night }}
                          onMouseEnter={e => (e.currentTarget.style.color = C.petrol)} onMouseLeave={e => (e.currentTarget.style.color = C.night)}>
                          {c.value}
                        </a>
                      ) : (
                        <span className="text-sm font-semibold" style={{ color: C.night }}>{c.value}</span>
                      )}
                    </div>
                    {c.copy && (
                      <button className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors" style={{ background: "rgba(15,91,87,0.08)", color: C.petrol }}
                        onClick={() => navigator.clipboard?.writeText(c.value)}>
                        Copier
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Disponibilités */}
              <div className="rounded-2xl p-5 bg-white" style={{ border: `1px solid rgba(15,91,87,0.1)` }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Disponibilités</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { jour: "Lun – Ven", heure: "9h – 18h", dispo: true },
                    { jour: "Samedi", heure: "9h – 13h", dispo: true },
                    { jour: "Dimanche", heure: "Fermé", dispo: false },
                    { jour: "Réponse email", heure: "< 24h ouvrées", dispo: true },
                  ].map(d => (
                    <div key={d.jour} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: C.cream }}>
                      <span className="text-xs font-medium" style={{ color: C.night }}>{d.jour}</span>
                      <span className="text-xs font-semibold" style={{ color: d.dispo ? C.petrol : "#9ca3af" }}>{d.heure}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.gold }}>FAQ</p>
              <h2 className="text-2xl font-bold mb-6" style={{ color: C.night }}>Questions fréquentes</h2>
              <FAQ />
            </div>
          </div>
        </section>

        {/* ── SECTION FINALE ── */}
        <section className="w-full px-6 md:px-12 py-14" style={{ background: C.night }}>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>Notre engagement</p>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                Construisons ensemble<br />l&apos;avenir de la<br />
                <span style={{ color: C.gold }}>pharmacovigilance</span><br />
                au Maroc et en Afrique.
              </h2>
              <p className="text-sm leading-relaxed max-w-lg" style={{ color: "rgba(255,255,255,0.45)" }}>
                MAI DAWA est une initiative portée par des professionnels de santé, pour les professionnels de santé. Chaque partenariat renforce la sécurité médicamenteuse pour des millions de patients.
              </p>
            </div>

            <div className="flex flex-col gap-3 shrink-0 w-full max-w-xs">
              <a href="#partenariats" className="w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all"
                style={{ background: C.gold, color: C.night }}>
                Demander une démonstration →
              </a>
              <a href="mailto:contact@maiadawa.ma" className="w-full py-3 rounded-xl font-semibold text-sm text-center border text-white transition-all"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}>
                Écrire à notre équipe
              </a>
              <p className="text-center text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                Réponse sous 24h ouvrées
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer minimal ── */}
      <footer className="px-6 md:px-12 py-5" style={{ background: "#111827", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <MaiaLogo dark />
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>© 2025–2026 MAI DAWA · Pharmacovigilance Intelligence for Safer Medicines</p>
          <div className="flex gap-4">
            {[["Accueil", "/"], ["Référentiel", "/medicaments"], ["Confidentialité", "/confidentialite"]].map(([label, href]) => (
              <Link key={label} href={href} className="text-[11px] transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
