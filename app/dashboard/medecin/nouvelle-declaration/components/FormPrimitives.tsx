"use client";

import { useState } from "react";

export function FieldLabel({ label, required, hint }: {
  label: string; required?: boolean; hint?: string;
}) {
  return (
    <div className="mb-1.5">
      <label className="text-sm font-medium text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
  );
}

export function Input({ value, onChange, placeholder, type = "text", disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
    />
  );
}

export function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
    />
  );
}

export function RadioGroup({ options, value, onChange }: {
  options: { val: string; label: string; desc?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => (
        <label key={o.val} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${value === o.val ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
          <input type="radio" className="accent-emerald-600 mt-0.5" checked={value === o.val} onChange={() => onChange(o.val)} />
          <div>
            <div className="text-sm font-medium text-gray-800">{o.label}</div>
            {o.desc && <div className="text-xs text-gray-500 mt-0.5">{o.desc}</div>}
          </div>
        </label>
      ))}
    </div>
  );
}

export function CheckRow({ label, checked, onChange, desc }: {
  label: string; checked: boolean; onChange: () => void; desc?: string;
}) {
  return (
    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${checked ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
      <input type="checkbox" className="accent-emerald-600 mt-0.5" checked={checked} onChange={onChange} />
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {desc && <div className="text-xs text-gray-500">{desc}</div>}
      </div>
    </label>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function Collapsible({ label, hint, children, defaultOpen = false }: {
  label: string; hint?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {hint && <span className="ml-2 text-xs text-gray-400">{hint}</span>}
        </div>
        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 py-4 space-y-4 bg-white">{children}</div>}
    </div>
  );
}

export function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
      {children}
    </div>
  );
}

export function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} hint={hint} />
      {children}
    </div>
  );
}
