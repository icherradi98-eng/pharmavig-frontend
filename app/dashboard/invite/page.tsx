import Link from "next/link";

export default function InviteDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PV</span>
          </div>
          <span className="font-semibold text-gray-900">PharmaVig</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Invité</span>
        </div>
        <Link href="/login" className="text-sm text-emerald-600 font-medium hover:underline">
          Se connecter
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mode invité</h1>
          <p className="text-gray-500 mt-1">Vous pouvez déclarer un effet indésirable sans créer de compte.</p>
        </div>

        {/* Bannière compte */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-amber-500 text-xl">ℹ️</span>
          <div>
            <p className="text-sm text-amber-800 font-medium">Créez un compte pour un suivi complet</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Avec un compte, vous pouvez retrouver vos déclarations passées, recevoir des mises à jour et être recontacté par le CAPM.
            </p>
            <Link href="/login" className="text-xs text-amber-900 font-semibold underline mt-1 inline-block">
              Créer un compte gratuitement →
            </Link>
          </div>
        </div>

        <Link
          href="/dashboard/invite/declarer"
          className="flex items-center gap-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl p-5 mb-4 transition-colors"
        >
          <span className="text-3xl">📋</span>
          <div>
            <div className="font-semibold text-lg">Déclarer un effet indésirable</div>
            <div className="text-emerald-100 text-sm">Formulaire anonyme — sans création de compte</div>
          </div>
          <span className="ml-auto text-2xl">→</span>
        </Link>
      </main>
    </div>
  );
}
