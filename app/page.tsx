"use client";
import Link from "next/link";
import { useState } from "react";

// ── Icônes SVG légères ────────────────────────────────────────────────────────

function IconPill() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0 3.866-3.358 7-7.5 7s-7.5-3.134-7.5-7 3.358-7 7.5-7 7.5 3.134 7.5 7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25l-7.5 7.5" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
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

// ── Mockup UI (hero droite) ───────────────────────────────────────────────────

function HeroMockup() {
  return (
    <div className="relative w-full max-w-lg select-none">
      {/* Halo */}
      <div className="absolute -inset-8 bg-emerald-400/10 rounded-3xl blur-2xl" />

      {/* Fenêtre principale */}
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden text-left">
        {/* Barre titre */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs text-gray-400 ml-2">pharmavig.ma — Tableau de bord médecin</span>
        </div>

        {/* Contenu */}
        <div className="p-4 space-y-3 bg-gray-50/50">

          {/* Alerte urgente */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
            <span className="text-red-500 text-base mt-0.5">⚠️</span>
            <div>
              <p className="text-xs font-semibold text-red-800">Alerte EMA — Pembrolizumab</p>
              <p className="text-[11px] text-red-600 mt-0.5">Nouveau signal de myocardite sévère. Monitoring cardiaque recommandé.</p>
            </div>
            <span className="ml-auto text-[10px] font-bold uppercase text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full shrink-0">Urgent</span>
          </div>

          {/* Ordonnance */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-800">📄 Ordonnance ORD-2026-042</p>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Générée</span>
            </div>
            <p className="text-[11px] text-gray-500">Patient : M.B. · 58 ans</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-[11px] text-gray-700">
                <span className="text-emerald-500">Rp/</span> Méthotrexate 15 mg — 1x/semaine
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-700">
                <span className="text-emerald-500">Rp/</span> Acide folique 5 mg — 6x/semaine
              </div>
            </div>
          </div>

          {/* Suivi patient */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-gray-800 mb-2">🛰️ Suivi de tolérance — 3 patients actifs</p>
            <div className="space-y-1.5">
              {[
                { initiales: "F.Z.", drug: "Nivolumab", status: "Signal", color: "text-amber-600 bg-amber-50" },
                { initiales: "M.B.", drug: "Méthotrexate", status: "RAS ✓", color: "text-emerald-600 bg-emerald-50" },
                { initiales: "A.O.", drug: "Pembrolizumab", status: "En attente", color: "text-gray-500 bg-gray-50" },
              ].map((p) => (
                <div key={p.initiales} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">{p.initiales[0]}</div>
                    <span className="text-[11px] text-gray-600">{p.initiales} · {p.drug}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${p.color}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Déclaration pré-remplie */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
            <span className="text-emerald-600 text-base">✅</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-emerald-800">Déclaration pré-remplie — Signal F.Z.</p>
              <p className="text-[11px] text-emerald-600">Transmise au CAPM · PV-MA-2026-00187</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badge flottant */}
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

// ── Workflow steps ────────────────────────────────────────────────────────────

const WORKFLOW = [
  { num: "01", icon: "💊", title: "Prescription", desc: "Le médecin prescrit un médicament via l'ordonnancier PharmaVig" },
  { num: "02", icon: "📱", title: "Suivi patient", desc: "Le patient reçoit un check-in automatique pour signaler sa tolérance" },
  { num: "03", icon: "⚠️", title: "Signal détecté", desc: "Un effet indésirable potentiel est automatiquement identifié" },
  { num: "04", icon: "📋", title: "Déclaration pré-remplie", desc: "Le formulaire CAPM est pré-rempli avec les données du patient et du médicament" },
  { num: "05", icon: "✅", title: "Transmission CAPM", desc: "La déclaration est envoyée et intégrée dans la base nationale de pharmacovigilance" },
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
    a: "Oui. PharmaVig respecte la loi marocaine 09-08 relative à la protection des données personnelles. Les données cliniques de l'ordonnancier restent sur votre appareil uniquement. Seules les déclarations d'effets indésirables, anonymisées, sont transmises au CAPM.",
  },
  {
    q: "Dois-je être professionnel de santé pour utiliser PharmaVig ?",
    a: "Non. Les patients peuvent signaler directement leurs effets indésirables via un lien de suivi envoyé par leur médecin, ou de façon anonyme via le formulaire public. Les professionnels de santé bénéficient d'un espace dédié avec toutes les fonctionnalités avancées.",
  },
  {
    q: "Que devient ma déclaration après envoi ?",
    a: "Elle est transmise automatiquement et de façon sécurisée au CAPM. Les équipes de pharmacovigilance évaluent le lien de causalité et, si nécessaire, déclenchent des mesures de sécurité. Vous recevez un numéro de référence PV-MA dès l'envoi.",
  },
  {
    q: "La plateforme est-elle reconnue par le CAPM ?",
    a: "PharmaVig est développée en conformité avec les standards ICH E2B R3 et la méthode d'imputabilité de Bégaud utilisée par le système national de pharmacovigilance marocain.",
  },
  {
    q: "L'ordonnancier stocke-t-il les données patient ?",
    a: "Non. Les ordonnances et les données patients de l'ordonnancier sont stockées uniquement sur votre appareil (localStorage). PharmaVig ne conserve aucune donnée patient sur ses serveurs — conformément à la loi 09-08.",
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

            {/* Gauche */}
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
                Prescrivez, suivez la tolérance de vos patients, recevez des alertes de sécurité personnalisées et contribuez à la pharmacovigilance nationale depuis un seul outil.
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

            {/* Droite — mockup */}
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

        {/* ── Tout en un — 4 cartes ── */}
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
                  icon: <IconPill />,
                  color: "bg-blue-50 text-blue-600",
                  border: "border-blue-100 hover:border-blue-200",
                  badge: "Référentiel",
                  title: "Référentiel médicament intelligent",
                  items: ["Posologies et indications", "Contre-indications", "Effets indésirables connus", "Alertes réglementaires en temps réel"],
                },
                {
                  icon: <IconBell />,
                  color: "bg-amber-50 text-amber-600",
                  border: "border-amber-100 hover:border-amber-200",
                  badge: "Alertes",
                  title: "Alertes personnalisées",
                  desc: "Recevez uniquement les alertes EMA, FDA, ANSM et CAPM concernant les médicaments que vous utilisez réellement — filtrées selon vos molécules déclarées.",
                },
                {
                  icon: <IconDoc />,
                  color: "bg-emerald-50 text-emerald-600",
                  border: "border-emerald-100 hover:border-emerald-200",
                  badge: "Ordonnancier",
                  title: "Ordonnancier professionnel",
                  desc: "Créez vos ordonnances en quelques secondes. Autocomplete DCI, posologies structurées, PDF imprimable, historique complet — et tout reste sur votre appareil.",
                },
                {
                  icon: <IconHeart />,
                  color: "bg-rose-50 text-rose-600",
                  border: "border-rose-100 hover:border-rose-200",
                  badge: "Suivi patient",
                  title: "Suivi de tolérance patient (ePRO)",
                  desc: "Invitez vos patients à signaler leurs symptômes après prescription via email ou SMS. Chaque signal est analysé et peut déclencher automatiquement une déclaration pré-remplie.",
                },
              ].map((card) => (
                <div key={card.title} className={`border rounded-2xl p-7 transition-colors ${card.border}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                      {card.icon}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wide ${card.color.split(" ")[1]}`}>{card.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{card.title}</h3>
                  {card.items ? (
                    <ul className="space-y-2">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                          <IconCheck />{item}
                        </li>
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

        {/* ── Workflow ── */}
        <section className="w-full px-6 md:px-10 py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">De la prescription à la déclaration</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Comment PharmaVig améliore<br />la pharmacovigilance</h2>
            </div>

            {/* Ligne horizontale + steps */}
            <div className="relative">
              {/* Ligne de connexion (desktop) */}
              <div className="hidden md:block absolute top-7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {WORKFLOW.map((step, i) => (
                  <div key={step.num} className="flex flex-col items-center text-center relative">
                    {/* Cercle numéroté */}
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center mb-4 z-10 shadow-sm border ${
                      i === 4 ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-gray-200 text-gray-700"
                    }`}>
                      <span className="text-xl leading-none">{step.icon}</span>
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${i === 4 ? "text-emerald-600" : "text-gray-400"}`}>{step.num}</p>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{step.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Pour les patients ── */}
        <section className="w-full px-6 md:px-10 py-20 bg-white">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Pour les patients</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Votre traitement<br />mérite un suivi</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Les patients peuvent signaler facilement leur tolérance après une prescription et contribuer à améliorer la sécurité des médicaments pour tous. Pas besoin de compte — votre médecin vous envoie un lien sécurisé.
              </p>
              <Link href="/dashboard/invite" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                Signaler un effet indésirable <IconArrow />
              </Link>
            </div>

            {/* Mini-preview questionnaire patient */}
            <div className="flex-1 max-w-sm w-full">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">💊</span>
                  </div>
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
              Chaque fonctionnalité est conçue pour répondre aux exigences réglementaires des autorités sanitaires marocaines et internationales.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {CONFORMITE.map((c) => (
                <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-emerald-800 transition-colors">
                  <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center">
                    <IconShield />
                  </div>
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
              Ordonnancier, suivi patient, alertes de sécurité et déclaration pharmacovigilance — tout en un, gratuitement.
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
            <div className="flex items-center gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors" aria-label="X/Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
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
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
              >
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
