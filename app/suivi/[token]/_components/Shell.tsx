"use client";
import type { Lang } from "../_constants";

export function Shell({ lang, setLang, dir, children }: {
  lang: Lang;
  setLang: (l: Lang) => void;
  dir: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" dir={dir} style={{ background: "#F7F3EE" }}>
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#0F5B57" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9"/><path d="M9 12l2 2 4-4" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">MAIA DAWA</span>
        </div>
        <div className="flex bg-gray-100 rounded-full p-0.5 text-xs font-medium">
          <button onClick={() => setLang("fr")} className={`px-3 py-1 rounded-full transition-colors ${lang === "fr" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>Français</button>
          <button onClick={() => setLang("darija")} className={`px-3 py-1 rounded-full transition-colors ${lang === "darija" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>الدارجة</button>
        </div>
      </div>
      <div className="flex-1 max-w-md w-full mx-auto">{children}</div>
      <div className="max-w-md w-full mx-auto px-6 pb-5">
        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          🔒 Ce lien est personnel et temporaire — aucun compte patient n&apos;est créé.<br/>
          Vos réponses sont transmises uniquement à votre médecin.
        </p>
      </div>
    </div>
  );
}

export function CenterScreen({ dir, children }: { dir: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center" dir={dir} style={{ background: "#F7F3EE" }}>
      {children}
    </div>
  );
}
