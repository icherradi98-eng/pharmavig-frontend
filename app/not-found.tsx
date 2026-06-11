import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">PV</span>
            </div>
            <span className="font-bold text-gray-900 text-xl">PharmaVig</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10">
          <p className="text-7xl font-black text-emerald-600 mb-2">404</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Page introuvable</h1>
          <p className="text-gray-500 text-sm mb-8">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/medicaments"
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl text-sm transition-colors"
            >
              Référentiel médicaments
            </Link>
            <Link
              href="/declarer"
              className="text-sm text-emerald-600 hover:underline"
            >
              Déclarer un effet indésirable →
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Conformément à la loi 09-08 sur la protection des données personnelles
        </p>
      </div>
    </div>
  );
}
