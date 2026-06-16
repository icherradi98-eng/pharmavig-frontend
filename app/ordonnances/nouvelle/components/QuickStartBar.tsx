import { type RxTemplate, QUICK_DIAGNOSES } from "@/lib/templates";
import { type SavedOrdonnance } from "@/lib/ordonnancier";

export function QuickStartBar({
  favTemplates,
  recentOrdos,
  onApplyTemplate,
  onReuseOrdo,
  onApplyDiagnostic,
  onOpenPicker,
}: {
  favTemplates: RxTemplate[];
  recentOrdos: SavedOrdonnance[];
  onApplyTemplate: (t: RxTemplate) => void;
  onReuseOrdo: (o: SavedOrdonnance) => void;
  onApplyDiagnostic: (diag: string) => void;
  onOpenPicker: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 mb-5" style={{ border: "1px solid var(--md-cream-dark)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gold">Démarrage rapide</p>
        <button onClick={onOpenPicker} className="text-xs font-semibold text-petrol hover:text-petrol-dark">Tous les modèles →</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {favTemplates.map((t) => (
          <button key={t.id} onClick={() => onApplyTemplate(t)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors" style={{ background: "rgba(212,175,55,0.12)", color: "#92700a", border: "1px solid rgba(212,175,55,0.4)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z"/></svg>
            {t.nom}
          </button>
        ))}
        {recentOrdos.map((o) => (
          <button key={o.id} onClick={() => onReuseOrdo(o)} className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-white hover:border-petrol transition-colors" style={{ border: "1px solid var(--md-cream-dark)", color: "var(--md-text-secondary)" }} title="Réutiliser les médicaments">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>
            {o.patient.nom} · {o.meds[0]?.nom ?? "—"}
          </button>
        ))}
        {favTemplates.length === 0 && recentOrdos.length === 0 && (
          <p className="text-xs" style={{ color: "var(--md-text-muted)" }}>Vos modèles favoris et ordonnances récentes apparaîtront ici.</p>
        )}
      </div>
      <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--md-cream-dark)" }}>
        <p className="text-[11px] mb-2" style={{ color: "var(--md-text-muted)" }}>Diagnostic rapide — charge un modèle</p>
        <div className="flex gap-2 flex-wrap">
          {QUICK_DIAGNOSES.map((d) => (
            <button key={d} onClick={() => onApplyDiagnostic(d)} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white hover:border-petrol hover:text-petrol transition-colors" style={{ border: "1px solid var(--md-cream-dark)", color: "var(--md-text-secondary)" }}>
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
