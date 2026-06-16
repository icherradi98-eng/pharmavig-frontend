"use client";
import Link from "next/link";
import { useState } from "react";
import { C, NAV_LINKS } from "./constants";
import { MaiaLogo } from "./MaiaLogo";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: "rgba(247,243,238,0.93)", borderBottom: `1px solid ${C.creamDark}` }}>
      <div className="flex items-center justify-between px-6 md:px-12 py-3">
        <Link href="/" onClick={() => setMenuOpen(false)}><MaiaLogo /></Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(([label, href]) => (
            <Link key={label} href={href} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ color: "#6b7280" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.petrol)} onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm" style={{ background: C.petrol, color: "#fff" }}>
            Commencer
          </Link>
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-1.5 transition-colors"
            style={{ background: menuOpen ? C.creamDark : "transparent" }}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span className="block w-5 h-0.5 rounded-full transition-all" style={{ background: C.night, transform: menuOpen ? "translateY(4px) rotate(45deg)" : "none" }} />
            <span className="block w-5 h-0.5 rounded-full transition-all" style={{ background: C.night, opacity: menuOpen ? 0 : 1 }} />
            <span className="block w-5 h-0.5 rounded-full transition-all" style={{ background: C.night, transform: menuOpen ? "translateY(-4px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-1" style={{ borderTop: `1px solid ${C.creamDark}` }}>
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ color: C.night }}
              onMouseEnter={e => { e.currentTarget.style.background = C.creamDark; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              {label}
              <svg className="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          ))}
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="mt-2 w-full text-center py-3 rounded-xl text-sm font-bold"
            style={{ background: C.petrol, color: "#fff" }}
          >
            Commencer gratuitement →
          </Link>
        </div>
      )}
    </nav>
  );
}
