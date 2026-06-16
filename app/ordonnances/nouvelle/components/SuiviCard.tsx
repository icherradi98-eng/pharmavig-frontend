export function SuiviCard({
  suiviActif,
  setSuiviActif,
  patientTelephone,
  setPatientTelephone,
}: {
  suiviActif: boolean;
  setSuiviActif: (v: boolean) => void;
  patientTelephone: string;
  setPatientTelephone: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl p-5 transition-colors" style={{ border: suiviActif ? "2px solid var(--md-petrol)" : "2px solid var(--md-cream-dark)", background: suiviActif ? "rgba(15,91,87,0.04)" : "#fff" }}>
      {/* Header + toggle */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: suiviActif ? "var(--md-petrol)" : "#e5e7eb" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={suiviActif ? "#fff" : "#9ca3af"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: "var(--md-night)" }}>Suivi de tolérance</p>
            <p className="text-xs font-medium" style={{ color: suiviActif ? "var(--md-petrol)" : "var(--md-text-muted)" }}>
              {suiviActif ? "Activé — le patient sera surveillé automatiquement" : "Désactivé"}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => setSuiviActif(!suiviActif)} className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors" style={{ background: suiviActif ? "var(--md-petrol)" : "#d1d5db" }}>
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${suiviActif ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      {/* La boucle — proposition de valeur visuelle */}
      <div className="rounded-xl px-3 py-3 mb-4" style={{ background: suiviActif ? "#fff" : "#f9fafb", border: `1px solid ${suiviActif ? "rgba(15,91,87,0.15)" : "#e5e7eb"}` }}>
        <div className="flex items-center justify-between gap-1">
          {[
            { l: "Prescription", on: true },
            { l: "Suivi", on: suiviActif },
            { l: "Signal", on: suiviActif },
            { l: "Déclaration", on: suiviActif },
            { l: "National", on: suiviActif },
          ].map((step, i, arr) => (
            <div key={step.l} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: step.on ? "var(--md-gold)" : "#d1d5db" }} />
                <span className="text-[9.5px] font-semibold whitespace-nowrap" style={{ color: step.on ? "var(--md-petrol)" : "var(--md-text-muted)" }}>{step.l}</span>
              </div>
              {i < arr.length - 1 && <span className="flex-1 h-px mx-1" style={{ background: step.on ? "var(--md-gold)" : "#e5e7eb" }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Stat choc */}
      <div className="rounded-xl px-4 py-3 mb-4" style={{ background: suiviActif ? "rgba(212,175,55,0.1)" : "#f9fafb", border: `1px solid ${suiviActif ? "rgba(212,175,55,0.3)" : "#e5e7eb"}` }}>
        <p className="text-sm leading-relaxed" style={{ color: suiviActif ? "var(--md-night)" : "var(--md-text-muted)" }}>
          <span className="font-bold">95 % des effets indésirables ne sont jamais signalés.</span>{" "}
          Le suivi les détecte précocement — et transforme chaque cas en connaissance nationale.
        </p>
      </div>

      {suiviActif ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--md-petrol)" }}>Questionnaires automatiques</p>
            <div className="grid grid-cols-3 gap-2">
              {[{ label: "J+7", desc: "Tolérance initiale" }, { label: "J+30", desc: "Bilan intermédiaire" }, { label: "J+90", desc: "Suivi long terme" }].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-3 text-center" style={{ border: "1px solid rgba(15,91,87,0.15)" }}>
                  <p className="text-sm font-bold" style={{ color: "var(--md-petrol)" }}>{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--md-text-muted)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--md-petrol)" }}>
              Téléphone patient <span className="font-normal" style={{ color: "var(--md-text-muted)" }}>(pour recevoir le lien de suivi)</span>
            </label>
            <input type="tel" value={patientTelephone} onChange={(e) => setPatientTelephone(e.target.value)} placeholder="+212 6 XX XX XX XX" className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-petrol bg-white" style={{ border: "1px solid rgba(15,91,87,0.3)" }} />
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setSuiviActif(true)} className="w-full border-2 border-dashed rounded-xl py-3 text-sm transition-colors hover:bg-petrol/5" style={{ borderColor: "#d1d5db", color: "var(--md-text-muted)" }}>
          Activer le suivi pharmacovigilance →
        </button>
      )}
    </div>
  );
}
