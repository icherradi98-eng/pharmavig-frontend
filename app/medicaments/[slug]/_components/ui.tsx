// Primitives d'affichage de la fiche médicament (réutilisables).

export function SkeletonHeader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
        <div className="flex gap-2"><div className="h-6 w-24 bg-gray-100 rounded-full" /><div className="h-6 w-32 bg-gray-100 rounded-full" /></div>
      </div>
    </div>
  );
}

export function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="font-semibold text-gray-900 border-l-4 border-petrol pl-3 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 pl-3.5 mb-3">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-3"}>{children}</div>
    </div>
  );
}

export function DataRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="text-gray-400 shrink-0 w-36">{label}</dt>
      <dd className="text-gray-800 font-medium">{value}</dd>
    </div>
  );
}

export function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100"}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-amber-700" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

export function BdpmExternalLinks({ className }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className ?? ""}`}>
      <a href="https://dmp.sante.gov.ma" target="_blank" rel="noreferrer"
        className="text-sm text-petrol font-medium border border-petrol/20 bg-petrol/5 px-4 py-2 rounded-lg hover:bg-petrol/10">
        DMP Maroc (RCP officiel) →
      </a>
      <a href="https://capm.ma" target="_blank" rel="noreferrer"
        className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
        CAPM →
      </a>
    </div>
  );
}
