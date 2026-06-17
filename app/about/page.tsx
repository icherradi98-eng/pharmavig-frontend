import Link from "next/link";

const PARTNERS = [
  { name: "CAPM", full: "Centre Anti-Poison et de Pharmacovigilance du Maroc" },
  { name: "Min. Santé", full: "Ministère de la Santé — Royaume du Maroc" },
  { name: "UM6SS", full: "Université Mohammed VI des Sciences de la Santé" },
  { name: "OMS / WHO", full: "Organisation Mondiale de la Santé" },
];

const FAQ_LINKS = [
  { href: "/declarer?role=medecin", label: "Je suis médecin" },
  { href: "/declarer?role=patient", label: "Je suis patient" },
  { href: "/declarer?role=pharmacien", label: "Je suis pharmacien" },
  { href: "/dashboard/invite", label: "Continuer sans compte" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "#0F5B57" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9"/>
              <path d="M9 12l2 2 4-4" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <Link href="/" className="font-bold text-gray-900 text-lg tracking-tight">MAIA DAWA</Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/about" className="text-sm font-semibold" style={{ color: "#0F5B57" }}>À propos</Link>
          <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Connexion</Link>
          <Link href="/declarer" className="text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm" style={{ background: "#0F5B57" }}>
            Faire une déclaration
          </Link>
        </div>
      </nav>

      <main className="flex-1">

        {/* Hero */}
        <section className="w-full px-8 py-20 text-center" style={{ background: "linear-gradient(135deg, #F7F3EE 0%, #fff 50%, #F7F3EE 100%)" }}>
          <div className="max-w-3xl mx-auto">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide" style={{ background: "rgba(15,91,87,0.08)", color: "#0F5B57" }}>À propos de MAIA DAWA</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
              La pharmacovigilance sauve des vies.<br />
              <span style={{ color: "#0F5B57" }}>Encore faut-il la pratiquer.</span>
            </h1>
            <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
              MAIA DAWA est la première plateforme digitale de pharmacovigilance au Maroc, conçue pour transformer la déclaration des effets indésirables médicamenteux en un acte simple, accessible et systématique.
            </p>
          </div>
        </section>

        {/* Section 1 — Contexte */}
        <section className="w-full px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Un problème de santé publique documenté</h2>
            <p className="text-gray-600 leading-relaxed mb-12 max-w-3xl">
              La sous-déclaration des effets indésirables médicamenteux (EIM) est un phénomène mondial, particulièrement critique dans les pays à ressources limitées. Au Maroc, comme dans la majorité des pays d&apos;Afrique francophone, les systèmes de pharmacovigilance existent mais restent sous-utilisés — freinés par des procédures administratives complexes, un manque d&apos;accessibilité des outils de déclaration, et une méconnaissance des obligations légales.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { val: "95%", desc: "des EIM ne sont jamais déclarés au Maroc", color: "border-red-200 bg-red-50", valColor: "text-red-600" },
                { val: "< 5%", desc: "des professionnels de santé déclarent régulièrement", color: "border-amber-200 bg-amber-50", valColor: "text-amber-600" },
                { val: "30 000+", desc: "décès évitables par an en Afrique liés aux EIM", color: "border-orange-200 bg-orange-50", valColor: "text-orange-600" },
              ].map((s) => (
                <div key={s.val} className={`border-2 rounded-2xl p-6 text-center ${s.color}`}>
                  <div className={`text-4xl font-black mb-2 ${s.valColor}`}>{s.val}</div>
                  <div className="text-sm text-gray-600 leading-snug">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2 — Mission */}
        <section id="mission" className="w-full px-8 py-16 bg-gray-50 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Rendre la pharmacovigilance accessible à tous</h2>
            <p className="text-gray-600 mb-10 max-w-2xl">
              MAIA DAWA a été développée pour lever les barrières structurelles à la déclaration des effets indésirables. Notre mission repose sur trois piliers fondamentaux :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🎯",
                  title: "Accessibilité",
                  text: "Un formulaire de déclaration disponible 24h/24, sur tous les appareils, en français et en darija — conçu pour les professionnels de santé comme pour les patients.",
                },
                {
                  icon: "⚡",
                  title: "Efficacité",
                  text: "Une déclaration complète en moins de 5 minutes, avec auto-complétion des médicaments, reconnaissance de la DCI et documentation structurée au format CIOMS.",
                },
                {
                  icon: "📊",
                  title: "Traçabilité",
                  text: "Chaque déclaration est horodatée, archivée et transmise selon les standards internationaux ICH E2B R3. Les professionnels disposent d'un tableau de bord en temps réel.",
                },
              ].map((p) => (
                <div key={p.title} className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="text-3xl mb-4">{p.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3 — Approche */}
        <section className="w-full px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Une solution construite avec et pour le terrain</h2>
            <p className="text-gray-600 mb-10 max-w-2xl">
              MAIA DAWA n&apos;est pas un outil générique adapté au contexte marocain. C&apos;est une solution conçue depuis le terrain, par des professionnels de santé exerçant dans des centres hospitaliers universitaires marocains, au plus près des réalités cliniques locales.
            </p>
            <div className="flex flex-col gap-5">
              {[
                {
                  titre: "Conformité réglementaire totale",
                  texte: "Formulaires conformes aux standards ICH E2B R3 et à la méthode d'imputabilité de Bégaud, utilisée par le système national de pharmacovigilance marocain.",
                },
                {
                  titre: "Interface adaptée au contexte LMIC",
                  texte: "Contrairement aux solutions européennes ou américaines, MAIA DAWA intègre les spécificités des systèmes de santé à ressources limitées : multilinguisme, accès mobile prioritaire, formulaires simplifiés pour les patients non médicaux.",
                },
                {
                  titre: "Documentation au format CIOMS",
                  texte: "Chaque déclaration est structurée au format CIOMS et selon la méthode de Bégaud, prête pour le système national de pharmacovigilance — sans ressaisie manuelle.",
                },
              ].map((item) => (
                <div key={item.titre} className="flex gap-4 items-start border-l-4 border-[#0F5B57] pl-5 py-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-base" style={{ color: "#0F5B57" }}>→</span>
                      <h3 className="font-bold text-gray-900">{item.titre}</h3>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.texte}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4 — Vision */}
        <section className="w-full px-8 py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Du Maroc à l&apos;Afrique francophone</h2>
            <p className="text-gray-600 mb-4 max-w-3xl leading-relaxed">
              La sous-déclaration des EIM n&apos;est pas un problème marocain — c&apos;est un problème africain. Avec 54 pays, plus d&apos;1,4 milliard d&apos;habitants et des systèmes de santé en pleine structuration, l&apos;Afrique francophone représente le territoire où l&apos;impact d&apos;une pharmacovigilance digitale accessible serait le plus significatif.
            </p>
            <p className="text-gray-600 mb-12 max-w-3xl leading-relaxed">
              MAIA DAWA est déployée au Maroc en phase pilote. Notre feuille de route prévoit une extension progressive aux pays d&apos;Afrique francophone — Tunisie, Sénégal, Côte d&apos;Ivoire, Cameroun — en adaptant les formulaires aux autorités nationales de chaque pays.
            </p>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 hidden md:block" style={{ background: "rgba(15,91,87,0.2)" }} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { year: "2024", label: "Conception", active: false },
                  { year: "2025", label: "Déploiement Maroc", active: true },
                  { year: "2026", label: "Maghreb", active: false },
                  { year: "2027+", label: "Afrique subsaharienne", active: false },
                ].map((t) => (
                  <div key={t.year} className="flex flex-col items-center text-center relative">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 mb-3`}
                      style={t.active ? { background: "#0F5B57", borderColor: "#0F5B57" } : { background: "#fff", borderColor: "rgba(15,91,87,0.3)" }}>
                      {t.active && <div className="w-3 h-3 bg-white rounded-full" />}
                    </div>
                    <div className={`text-sm font-bold mb-1`} style={{ color: t.active ? "#0F5B57" : "#374151" }}>{t.year}</div>
                    <div className="text-xs text-gray-500">{t.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 — Conformité */}
        <section className="w-full px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-10">Vos données, protégées par la loi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🔒",
                  title: "Loi 09-08",
                  text: "MAIA DAWA s'appuie sur le cadre de la loi marocaine 09-08 relative à la protection des données personnelles. Mise en conformité en cours.",
                },
                {
                  icon: "🛡️",
                  title: "Données médicales chiffrées",
                  text: "Toutes les données de santé transmises via MAIA DAWA sont chiffrées en transit (TLS 1.3) et au repos. Aucune donnée n'est partagée avec des tiers à des fins commerciales.",
                },
                {
                  icon: "📋",
                  title: "Anonymisation des données",
                  text: "La déclaration sans compte est possible. Les données cliniques déclarées sont dissociées de l'identité de l'utilisateur dans nos bases.",
                },
              ].map((p) => (
                <div key={p.title} className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                  <div className="text-3xl mb-4">{p.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 — Partenaires */}
        <section className="w-full px-8 py-14 bg-gray-50 border-t border-gray-100">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">Développé en collaboration avec</p>
          <div className="flex flex-wrap justify-center items-center gap-8 max-w-3xl mx-auto">
            {PARTNERS.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-1 group" title={p.full}>
                <div className="w-24 h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-xs font-bold text-gray-600">{p.name}</span>
                </div>
                <span className="text-xs text-gray-400 text-center max-w-[130px] leading-tight">{p.full.split("—")[0].trim()}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6 italic">Partenariats en cours de finalisation</p>
        </section>

        {/* Section 7 — CTA */}
        <section className="w-full px-8 py-16 text-center" style={{ background: "linear-gradient(135deg, #0F5B57 0%, #1F2D3D 100%)" }}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Contribuez à la pharmacovigilance</h2>
            <p className="text-white/70 text-base mb-8 leading-relaxed">
              Chaque déclaration d&apos;effet indésirable contribue à un système de santé plus sûr. Rejoignez les professionnels de santé qui utilisent MAIA DAWA.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/declarer"
                className="inline-block bg-white font-semibold px-8 py-3 rounded-full shadow-md transition-colors" style={{ color: "#0F5B57" }}>
                Faire une déclaration →
              </Link>
              <Link href="mailto:contact@maiadawa.ma"
                className="inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors">
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#0F5B57" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9"/>
                    <path d="M9 12l2 2 4-4" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-white font-bold text-base">MAIA DAWA</span>
              </div>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">La pharmacovigilance digitale au Maroc.</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">À propos</Link></li>
                <li><Link href="/about#mission" className="text-gray-400 hover:text-white transition-colors">Notre mission</Link></li>
                <li><a href="mailto:contact@maiadawa.ma" className="text-gray-400 hover:text-white transition-colors">contact@maiadawa.ma</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Déclarer</h3>
              <ul className="space-y-2 text-sm">
                {FAQ_LINKS.map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-gray-400 hover:text-white transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Ressources</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-600 cursor-default">Comment ça marche <span className="text-xs text-gray-700">(bientôt)</span></span></li>
                <li><span className="text-gray-600 cursor-default">FAQ <span className="text-xs text-gray-700">(bientôt)</span></span></li>
                <li><span className="text-gray-600 cursor-default">Guide de déclaration (PDF) <span className="text-xs text-gray-700">(bientôt)</span></span></li>
                <li><a href="https://capm.ma" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">Formulaire CAPM officiel ↗</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Légal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/confidentialite" className="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</Link></li>
                <li><Link href="/conditions" className="text-gray-400 hover:text-white transition-colors">Conditions d&apos;utilisation</Link></li>
                <li><Link href="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">Mentions légales</Link></li>
                <li><span className="text-gray-600 cursor-default">Loi 09-08 <span className="text-xs text-gray-700">(bientôt)</span></span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 px-8 py-5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">© 2025 MAIA DAWA. Tous droits réservés. · Maroc · Afrique francophone</p>
            <div className="flex items-center gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="mailto:contact@maiadawa.ma" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
