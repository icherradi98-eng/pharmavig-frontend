import Link from "next/link";

export default function ChoisirProfil() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#F7F3EE" }}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "#0F5B57" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9"/><path d="M9 12l2 2 4-4" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="font-bold text-gray-900 text-xl">MAI DAWA</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Faire une déclaration</h1>
          <p className="text-gray-500 text-sm mb-8">Choisissez votre profil pour commencer</p>

          <div className="flex flex-col gap-3">
            <Link href="/login?role=medecin&redirect=/dashboard/medecin/nouvelle-declaration"
              className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all group hover:border-[#0F5B57]"
              style={{ borderColor: "rgba(15,91,87,0.2)", background: "rgba(15,91,87,0.04)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ background: "rgba(15,91,87,0.1)", color: "#0F5B57" }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Médecin</p>
                <p className="text-xs text-gray-500">Formulaire structuré ICH E2B R3</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#0F5B57] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <Link href="/login?role=patient"
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-blue-100 bg-blue-50 hover:border-blue-400 transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Patient</p>
                <p className="text-xs text-gray-500">Formulaire guidé, français et darija</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <Link href="/login?role=pharmacien"
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-orange-100 bg-orange-50 hover:border-orange-400 transition-all group">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-700 group-hover:bg-orange-200 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.769 0-5.493-.236-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Pharmacien</p>
                <p className="text-xs text-gray-500">Suivi des déclarations et alertes</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <Link href="/dashboard/invite"
              className="text-center text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 mt-2">
              Continuer sans compte (invité)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
