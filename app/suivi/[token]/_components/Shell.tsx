"use client";
import type { Lang } from "../_constants";

export function Shell({ lang, setLang, dir, children }: {
  lang: Lang;
  setLang: (l: Lang) => void;
  dir: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={dir}>
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">PV</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">MAIA DAWA</span>
        </div>
        <div className="flex bg-gray-100 rounded-full p-0.5 text-xs font-medium">
          <button onClick={() => setLang("fr")} className={`px-3 py-1 rounded-full transition-colors ${lang === "fr" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>Français</button>
          <button onClick={() => setLang("darija")} className={`px-3 py-1 rounded-full transition-colors ${lang === "darija" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>الدارجة</button>
        </div>
      </div>
      <div className="flex-1 max-w-md w-full mx-auto">{children}</div>
    </div>
  );
}

export function CenterScreen({ dir, children }: { dir: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={dir}>
      {children}
    </div>
  );
}
