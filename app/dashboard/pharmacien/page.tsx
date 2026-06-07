import Link from "next/link";

export default function PharmacienDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PV</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">PharmaVig</span>
            <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Pharmacien</span>
          </div>
        </div>
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">Déconnexion</Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bonjour 👋</h1>
          <p className="text-gray-500 mt-1">Tableau de bord — Interface Pharmacien</p>
        </div>

        <div className="bg-violet-50 border border-violet-200 rounded-xl p-6 mb-6 text-center">
          <div className="text-4xl mb-3">🚧</div>
          <h2 className="font-semibold text-violet-900 text-lg mb-1">Interface en cours de développement</h2>
          <p className="text-violet-700 text-sm">
            L&apos;interface pharmacien sera disponible dans la prochaine version.
            Les fonctionnalités incluront : déclaration d&apos;EIM, suivi des alertes, et tableau de bord analytique.
          </p>
        </div>

        <Link
          href="/declarer"
          className="flex items-center gap-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl p-5 mb-4 transition-colors"
        >
          <span className="text-3xl">📋</span>
          <div>
            <div className="font-semibold text-lg">Nouvelle déclaration d&apos;EIM</div>
            <div className="text-violet-100 text-sm">Signaler un effet indésirable observé en officine — en attendant l&apos;interface dédiée pharmacien, utilisez le formulaire de déclaration</div>
          </div>
          <span className="ml-auto text-2xl">→</span>
        </Link>

        <div className="grid grid-cols-1 gap-3">
          {[
            { href: "/dashboard/pharmacien/mes-declarations", icon: "📁", label: "Mes déclarations", desc: "Historique et suivi" },
            { href: "/dashboard/pharmacien/alertes", icon: "🔔", label: "Alertes médicaments", desc: "Retraits et mises en garde" },
            { href: "/dashboard/pharmacien/profil", icon: "👤", label: "Mon profil", desc: "Paramètres et officine" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 bg-white border border-gray-200 hover:border-violet-300 rounded-xl p-4 transition-all"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </div>
              <span className="ml-auto text-gray-300">→</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
