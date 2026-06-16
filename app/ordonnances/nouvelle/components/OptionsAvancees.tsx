import { type OrdonnanceType } from "@/lib/ordonnancier";
import { inputCls, labelCls } from "./styles";

export function OptionsAvancees({
  open,
  setOpen,
  ordonnanceType,
  setOrdonnanceType,
  validite,
  setValidite,
}: {
  open: boolean;
  setOpen: (fn: (v: boolean) => boolean) => void;
  ordonnanceType: OrdonnanceType;
  setOrdonnanceType: (t: OrdonnanceType) => void;
  validite: string;
  setValidite: (v: string) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-sm font-medium text-gray-500 hover:text-gray-700">
        <span>⚙️ Options avancées</span>
        <span className="text-gray-400 text-xs">{open ? "▲ Réduire" : "▼ Type, validité, renouvellement..."}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelCls}>Type d&apos;ordonnance</label>
            <div className="flex flex-col sm:flex-row gap-2">
              {([
                { v: "simple", l: "Ordonnance simple" },
                { v: "securisee", l: "Ordonnance sécurisée (stupéfiants)" },
                { v: "exception", l: "Médicaments d'exception" },
              ] as const).map((opt) => (
                <button key={opt.v} type="button" onClick={() => setOrdonnanceType(opt.v)}
                  className={`flex-1 border rounded-lg py-2 px-3 text-xs font-medium text-left transition-colors ${ordonnanceType === opt.v ? "bg-petrol/10 border-petrol text-petrol" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Validité</label>
              <select className={inputCls} value={validite} onChange={(e) => setValidite(e.target.value)}>
                <option value="1">1 mois</option>
                <option value="3">3 mois</option>
                <option value="6">6 mois</option>
                <option value="12">12 mois</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>N° d&apos;ordonnance</label>
              <div className={`${inputCls} bg-gray-50 text-gray-400`}>Généré à la création</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
