"use client";

import { useState } from "react";

const TYPE_LABELS: Record<string, string> = {
  spontanee: "Déclaration spontanée",
  observationnelle: "Étude observationnelle",
  litterature: "Rapport de littérature",
};

export function TypeDeclarationInline({ value, onChange }: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = TYPE_LABELS[value] || "Déclaration spontanée";
  return (
    <div>
      <p className="font-medium text-gray-800 text-xs">{current}</p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-[10px] text-gray-400 underline underline-offset-2 mt-0.5 hover:text-gray-600"
      >
        {open ? "Fermer" : "Modifier (cas rare)"}
      </button>
      {open && (
        <div className="mt-2 space-y-1">
          {Object.entries(TYPE_LABELS).map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
              <input
                type="radio"
                name="typeDeclarationInline"
                value={val}
                checked={value === val}
                onChange={() => { onChange(val); setOpen(false); }}
                className="accent-teal-700"
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
