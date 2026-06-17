import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#F7F3EE" }}>
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "#0F5B57" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9"/><path d="M9 12l2 2 4-4" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="font-bold text-gray-900 text-xl">MAIA DAWA</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10">
          <p className="text-7xl font-black mb-2" style={{ color: "#0F5B57" }}>404</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Page introuvable</h1>
          <p className="text-gray-500 text-sm mb-8">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="hover:opacity-90 text-white font-semibold py-3 rounded-xl text-sm transition-opacity"
              style={{ background: "#0F5B57" }}
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
              className="text-sm hover:underline" style={{ color: "#0F5B57" }}
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
