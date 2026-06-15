"use client";

import { useState } from "react";
import { type RxTemplate } from "@/lib/templates";

export function TemplatePicker({ templates, onApply, onClose }: {
  templates: RxTemplate[];
  onApply: (t: RxTemplate) => void;
  onClose: () => void;
}) {
  const persos = templates.filter((t) => t.scope === "perso");
  const specs = templates.filter((t) => t.scope === "specialite");
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ color: "var(--md-night)" }}>Modèles d&apos;ordonnance</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <TemplateGroup title="Mes modèles" list={persos} onApply={onApply} />
        <TemplateGroup title="Modèles par spécialité" list={specs} onApply={onApply} />
        {templates.length === 0 && (
          <p className="text-sm" style={{ color: "var(--md-text-muted)" }}>Aucun modèle pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}

function TemplateGroup({ title, list, onApply }: {
  title: string;
  list: RxTemplate[];
  onApply: (t: RxTemplate) => void;
}) {
  if (list.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--md-text-muted)" }}>{title}</p>
      <div className="space-y-2">
        {list.map((t) => (
          <button
            key={t.id}
            onClick={() => onApply(t)}
            className="w-full text-left rounded-xl px-4 py-3 flex items-center justify-between gap-3 hover:bg-petrol/5 transition-colors"
            style={{ border: "1px solid var(--md-cream-dark)" }}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--md-night)" }}>{t.nom}</p>
              <p className="text-xs truncate" style={{ color: "var(--md-text-muted)" }}>
                {t.meds.map((m) => m.nom).filter(Boolean).join(", ")}
                {t.specialite ? ` · ${t.specialite}` : ""}
              </p>
            </div>
            <span className="text-xs font-semibold shrink-0 text-petrol">Appliquer →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SaveTemplateModal({ onSave, onClose }: {
  onSave: (nom: string) => void;
  onClose: () => void;
}) {
  const [nom, setNom] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <h3 className="font-bold mb-1" style={{ color: "var(--md-night)" }}>Enregistrer comme modèle</h3>
        <p className="text-xs mb-4" style={{ color: "var(--md-text-muted)" }}>
          Les médicaments actuels seront sauvegardés (sans aucune donnée patient).
        </p>
        <input
          autoFocus
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du modèle — ex. Diabète type 2"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-petrol mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={() => onSave(nom)}
            disabled={!nom.trim()}
            className="flex-1 bg-petrol disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-petrol-dark"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
