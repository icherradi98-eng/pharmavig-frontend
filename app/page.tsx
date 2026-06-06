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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PV</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg">PharmaVig</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Connexion
          </Link>
          <Link
            href="/login"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Faire une déclaration
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-8 pt-20 pb-10">
        {/* Stat choc */}
        <div className="bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-6 flex items-center gap-2">
          <span className="text-red-500 text-xs font-bold uppercase tracking-wide">Urgence santé publique</span>
          <span className="text-red-700 text-xs font-medium">95% des effets indésirables ne sont jamais déclarés au Maroc</span>
        </div>

        {/* Hero text — FR + arabe */}
        <div className="text-center max-w-3xl mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3">
            La première plateforme de{" "}
            <span className="text-emerald-600">pharmacovigilance digitale</span>{" "}
            au Maroc
          </h1>
          {/* Version arabe */}
          <p className="text-gray-400 text-lg font-medium mt-2" dir="rtl" lang="ar">
            أول منصة رقمية للتيقظ الدوائي في المغرب
          </p>
        </div>

        <p className="text-gray-500 text-base max-w-lg text-center mb-10">
          Signalez un effet indésirable en moins de 5 minutes. Chaque déclaration protège des milliers de patients.
        </p>

        {/* CTA principaux */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link
            href="/login?role=medecin"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
          >
            🩺 Je suis médecin
          </Link>
          <Link
            href="/login?role=patient"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
          >
            👤 Je suis patient
          </Link>
          <Link
            href="/dashboard/invite"
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
          >
            Continuer sans compte →
          </Link>
        </div>

        {/* Cards profils */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-20">
          <ProfileCard
            icon="🩺"
            title="Médecin"
            description="Formulaire structuré, auto-complétion, envoi direct au CAPM"
            href="/login?role=medecin"
          />
          <ProfileCard
            icon="👤"
            title="Patient"
            description="Formulaire guidé, multilingue, simple à remplir"
            href="/login?role=patient"
          />
          <ProfileCard
            icon="💊"
            title="Pharmacien"
            description="Suivi des déclarations, alertes médicaments"
            href="/login?role=pharmacien"
          />
        </div>

        {/* Comment ça marche */}
        <div className="w-full max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col items-start">
                <span className="text-3xl font-black text-emerald-100 mb-2">{step.num}</span>
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 px-8 py-4 flex items-center justify-between text-xs text-gray-400">
        <span>© 2025 PharmaVig. Tous droits réservés.</span>
        <span>Maroc · Afrique francophone</span>
      </footer>
    </div>
  );
}

function ProfileCard({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="border border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-xl p-5 text-left transition-all"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </Link>
  );
}
