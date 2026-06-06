import Link from "next/link";

const STEPS = [
  {
    num: "01",
    title: "Choisissez votre profil",
    desc: "Médecin, patient ou pharmacien — chaque interface est adaptée à votre rôle.",
  },
  {
    num: "02",
    title: "Remplissez le formulaire",
    desc: "Guidé pas à pas, avec auto-complétion et reconnaissance du médicament.",
  },
  {
    num: "03",
    title: "Envoi automatique au CAPM",
    desc: "Votre déclaration est transmise instantanément au centre de pharmacovigilance.",
  },
];

const STATS = [
  { value: "95%", label: "des EIM non déclarés au Maroc" },
  { value: "30 000+", label: "décès évitables par an en Afrique" },
  { value: "5 min", label: "pour faire une déclaration" },
  { value: "24h", label: "délai de traitement CAPM" },
];

const PARTNERS = [
  { name: "CAPM", full: "Centre Anti-Poison et de Pharmacovigilance du Maroc" },
  { name: "Min. Santé", full: "Ministère de la Santé — Royaume du Maroc" },
  { name: "UM6SS", full: "Université Mohammed VI des Sciences de la Santé" },
];

// SVG icons
function DoctorIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

function PatientIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function PharmacistIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.769 0-5.493-.236-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-sm tracking-tight">PV</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">PharmaVig</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#about" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
            À propos
          </Link>
          <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
            Connexion
          </Link>
          <Link
            href="/login"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Faire une déclaration
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero avec gradient */}
        <section className="w-full flex flex-col items-center px-8 pt-20 pb-16" style={{background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #f0fdf4 100%)"}}>
          {/* Stat choc */}
          <div className="bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-8 flex items-center gap-2">
            <span className="text-red-500 text-xs font-bold uppercase tracking-wide">Urgence santé publique</span>
            <span className="text-red-700 text-xs font-medium">95% des effets indésirables ne sont jamais déclarés au Maroc</span>
          </div>

          {/* Hero text */}
          <div className="text-center max-w-3xl mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3">
              La première plateforme de{" "}
              <span className="text-emerald-600">pharmacovigilance digitale</span>{" "}
              au Maroc
            </h1>
            <p className="text-gray-400 text-lg font-medium mt-2" dir="rtl" lang="ar">
              أول منصة رقمية للتيقظ الدوائي في المغرب
            </p>
          </div>

          <p className="text-gray-500 text-base max-w-lg text-center mb-10">
            Signalez un effet indésirable en moins de 5 minutes. Chaque déclaration protège des milliers de patients.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/login?role=medecin" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm">
              Je suis médecin
            </Link>
            <Link href="/login?role=patient" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm">
              Je suis patient
            </Link>
            <Link href="/dashboard/invite" className="border border-gray-300 hover:border-gray-400 text-gray-700 bg-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2">
              Continuer sans compte →
            </Link>
          </div>
        </section>

        {/* Chiffres clés */}
        <section className="w-full bg-white border-y border-gray-100 py-12 px-8">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.value} className="text-center">
                <div className="text-3xl font-black text-emerald-600 mb-1">{s.value}</div>
                <div className="text-xs text-gray-500 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Cards profils */}
        <section className="w-full px-8 py-16 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-10">Choisissez votre profil</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl mx-auto">
            <ProfileCard
              icon={<DoctorIcon />}
              iconBg="bg-emerald-100 text-emerald-700"
              cardBg="bg-emerald-50/60 hover:bg-emerald-50 border-emerald-100"
              title="Médecin"
              description="Formulaire structuré ICH E2B R3, imputabilité Bégaud, envoi direct au CAPM"
              href="/login?role=medecin"
            />
            <ProfileCard
              icon={<PatientIcon />}
              iconBg="bg-blue-100 text-blue-700"
              cardBg="bg-blue-50/60 hover:bg-blue-50 border-blue-100"
              title="Patient"
              description="Formulaire guidé, multilingue français et darija, simple à remplir"
              href="/login?role=patient"
            />
            <ProfileCard
              icon={<PharmacistIcon />}
              iconBg="bg-orange-100 text-orange-700"
              cardBg="bg-orange-50/60 hover:bg-orange-50 border-orange-100"
              title="Pharmacien"
              description="Suivi des déclarations, alertes médicaments, historique complet"
              href="/login?role=pharmacien"
            />
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="w-full px-8 py-16 bg-white">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-12">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col items-start">
                <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center mb-4">
                  <span className="text-white font-black text-sm">{step.num}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Partenaires */}
        <section id="about" className="w-full px-8 py-14 bg-gray-50 border-t border-gray-100">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            Développé en collaboration avec
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 max-w-3xl mx-auto">
            {PARTNERS.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-1 group" title={p.full}>
                <div className="w-20 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-xs font-bold text-gray-600">{p.name}</span>
                </div>
                <span className="text-xs text-gray-400 text-center max-w-[120px] leading-tight">{p.full.split("—")[0].trim()}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6 italic">Partenariats en cours de finalisation</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md flex items-center justify-center">
              <span className="text-white font-black text-xs">PV</span>
            </div>
            <span className="text-xs text-gray-500">© 2025 PharmaVig. Tous droits réservés.</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <Link href="/contact" className="hover:text-gray-700 transition-colors">Contact</Link>
            <Link href="/confidentialite" className="hover:text-gray-700 transition-colors">Politique de confidentialité</Link>
            <Link href="/mentions-legales" className="hover:text-gray-700 transition-colors">Mentions légales</Link>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProfileCard({
  icon,
  iconBg,
  cardBg,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  iconBg: string;
  cardBg: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`border rounded-2xl p-6 text-left transition-all flex flex-col gap-4 ${cardBg}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 mb-1 text-base">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 mt-auto">
        Accéder <ArrowRight />
      </div>
    </Link>
  );
}
