import Link from "next/link";

export default function LegalPlaceholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-emerald-700">MAI DAWA</Link>
        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-emerald-700">← Retour à l&apos;accueil</Link>
      </header>
      <main className="flex-1 px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-sm text-amber-800 leading-relaxed">
              Cette page est en cours de rédaction. MAI DAWA traite les données conformément à la
              loi 09-08 relative à la protection des personnes physiques à l&apos;égard du traitement des
              données à caractère personnel. Le contenu détaillé sera publié prochainement.
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Pour toute question, contactez-nous à{" "}
            <a href="mailto:contact@maiadawa.ma" className="text-emerald-700 underline font-medium">contact@maiadawa.ma</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
