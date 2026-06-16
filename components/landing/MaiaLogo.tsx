"use client";
import { C } from "./constants";

export function MaiaLogo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: C.petrol }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9"/>
          <path d="M9 12l2 2 4-4" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span style={{ color: dark ? "#fff" : C.petrol, fontWeight: 900, fontSize: 16, letterSpacing: "-0.3px" }}>MAIA</span>
          <span style={{ color: C.gold, fontWeight: 900, fontSize: 16, letterSpacing: "-0.3px" }}>DAWA</span>
        </div>
        <p style={{ color: dark ? "rgba(255,255,255,0.35)" : "#8a9ab0", fontSize: 8, letterSpacing: "0.8px", textTransform: "uppercase", marginTop: -2 }}>
          Pharmacovigilance Intelligence
        </p>
      </div>
    </div>
  );
}
