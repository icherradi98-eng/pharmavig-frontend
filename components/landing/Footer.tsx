"use client";
import Link from "next/link";
import { MaiaLogo } from "./MaiaLogo";

export function Footer() {
  return (
    <footer style={{ background: "#111827", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-3"><MaiaLogo dark /></div>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>Pharmacovigilance numérique — du Maroc à l&apos;Afrique francophone.</p>
            <a href="mailto:contact@maiadawa.ma" className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>contact@maiadawa.ma</a>
          </div>
          {[
            { title: "Plateforme", links: [["Référentiel", "/medicaments"], ["Interactions", "/interactions"], ["Ordonnancier", "/ordonnances/nouvelle"], ["Suivi patients", "/dashboard/medecin/suivi"], ["Alertes", "/dashboard/medecin/alertes"]] },
            { title: "Déclarer", links: [["Médecin", "/login"], ["Patient", "/login"], ["Sans compte", "/dashboard/invite"]] },
            { title: "Entreprise", links: [["Contact & Partenariats", "/contact"], ["Confidentialité", "/confidentialite"], ["Conditions", "/conditions"], ["À propos", "/about"]] },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="font-semibold text-[10px] uppercase tracking-wider mb-3 text-white">{col.title}</h3>
              <ul className="space-y-1.5">
                {col.links.map(([label, href]) => (
                  <li key={label}><Link href={href} className="text-xs transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 md:px-12 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>© 2025–2026 MAIA DAWA · Maroc · Afrique francophone</p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>Pharmacovigilance Intelligence for Safer Medicines</p>
        </div>
      </div>
    </footer>
  );
}
