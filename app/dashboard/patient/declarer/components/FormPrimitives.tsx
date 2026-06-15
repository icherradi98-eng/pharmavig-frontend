"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AGE_RANGES, INDICATION_SUGGESTIONS } from "../constants";

export function Label({ fr, dar, required }: { fr: string; dar: string; required?: boolean }) {
  return (
    <div className="mb-2">
      <span className="font-medium text-gray-900 text-sm">{fr}{required && <span className="text-red-500 ml-1">★</span>}</span>
      <div className="text-xs text-petrol mt-0.5" dir="rtl">{dar}</div>
    </div>
  );
}

export function RadioGroup({ options, value, onChange }: {
  options: { val: string; fr: string; dar: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => (
        <label key={o.val} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${value === o.val ? "border-petrol bg-petrol/5" : "border-gray-200 hover:border-gray-300"}`}>
          <input type="radio" className="accent-emerald-600" checked={value === o.val} onChange={() => onChange(o.val)} />
          <div>
            <div className="text-sm text-gray-800">{o.fr}</div>
            <div className="text-xs text-gray-500" dir="rtl">{o.dar}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

export function CheckboxItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${checked ? "border-petrol/40 bg-petrol/5 text-petrol" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>
      <input type="checkbox" className="accent-emerald-600" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

export function InfoBox({ text, textDar }: { text: string; textDar?: string }) {
  return (
    <div className="bg-petrol/5 border border-petrol/10 rounded-xl p-3 mb-4 text-xs text-petrol">
      <p>💡 {text}</p>
      {textDar && <p className="mt-1 text-petrol" dir="rtl">🇲🇦 {textDar}</p>}
    </div>
  );
}

export function Collapsible({ label, labelDar, children }: {
  label: string; labelDar?: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {labelDar && <span className="text-xs text-gray-400 mr-2" dir="rtl"> — {labelDar}</span>}
        </div>
        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 py-4 space-y-4 bg-white">{children}</div>}
    </div>
  );
}

export function AgePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {AGE_RANGES.map((r) => (
          <button key={r.val} type="button" onClick={() => onChange(r.val)}
            className={`snap-center shrink-0 flex flex-col items-center justify-center px-5 py-4 rounded-2xl border-2 transition-all min-w-[120px] ${
              value === r.val
                ? "border-petrol bg-petrol/5 shadow-md scale-105"
                : "border-gray-200 bg-white text-gray-600 hover:border-petrol/30"
            }`}>
            <span className={`text-base font-bold ${value === r.val ? "text-petrol" : "text-gray-700"}`}>{r.fr}</span>
            <span className="text-xs mt-1 text-gray-400" dir="rtl">{r.dar}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center mt-1">← Faites défiler / سحب لليمين أو اليسار →</p>
      {value && value !== "nr" && (
        <div className="mt-2 text-center">
          <span className="inline-block bg-petrol/10 text-petrol text-sm font-semibold px-4 py-1.5 rounded-full">
            ✓ {AGE_RANGES.find((r) => r.val === value)?.fr}
          </span>
        </div>
      )}
    </div>
  );
}

export function IndicationSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const search = useCallback((q: string) => {
    onChangeRef.current(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => {
      const ql = q.toLowerCase();
      const matches = INDICATION_SUGGESTIONS.filter((s) => s.toLowerCase().includes(ql)).slice(0, 5);
      setSuggestions(matches);
      setOpen(matches.length > 0);
    }, 200);
  }, []); // stable — onChange via ref

  return (
    <div className="relative">
      <input type="text" value={value} onChange={(e) => search(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Ex : tension, infection, douleur... / وصّف علاش كتاخود الدوا"
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-petrol"
      />
      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button key={s} type="button" onMouseDown={() => { onChangeRef.current(s); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-petrol/5 hover:text-petrol transition-colors border-b border-gray-50 last:border-0">
              {s}
            </button>
          ))}
          <p className="px-4 py-2 text-xs text-gray-400 bg-gray-50">💡 Suggestion automatique — vous pouvez écrire librement</p>
        </div>
      )}
    </div>
  );
}
