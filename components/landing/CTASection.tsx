"use client";
import Link from "next/link";
import { useState } from "react";
import { C } from "./constants";
import { MaiaLogo } from "./MaiaLogo";
import { IconArrow } from "./icons";

const FAQ_ITEMS = [
  { q: "Mes données sont-elles confidentielles ?", a: "Oui. MAIA DAWA respecte la loi 09-08. Les données cliniques restent sur votre appareil. Vous gardez le contrôle de la transmission de vos déclarations." },
  { q: "La plateforme suit-elle les standards de pharmacovigilance ?", a: "MAIA DAWA est développée selon les standards internationaux ICH E2B R3, le format CIOMS et la méthode d'imputabilité de Bégaud." },
  { q: "L'ordonnancier stocke-t-il les données patient ?", a: "Non. Les ordonnances restent sur votre appareil uniquement (localStorage). MAIA DAWA ne conserve aucune donnée patient sur ses serveurs — conformément à la loi 09-08." },
  { q: "Peut-on utiliser MAIA DAWA sans être médecin ?", a: "Les patients peuvent signaler via un lien sécurisé envoyé par leur médecin. Les professionnels bénéficient d'un espace dédié avec toutes les fonctionnalités avancées." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y rounded-2xl overflow-hidden" style={{ border: `1px solid rgba(15,91,87,0.12)` }}>
      {FAQ_ITEMS.map((item, i) => (
        <div key={i}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors" style={{ background: open === i ? "rgba(15,91,87,0.03)" : "#fff" }}>
            <span className="font-medium text-sm pr-4" style={{ color: C.night }}>{item.q}</span>
            <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} style={{ color: C.petrol }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-40" : "max-h-0"}`}>
            <p className="px-6 pb-4 text-sm leading-relaxed" style={{ color: "#4a5568" }}>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CTASection() {
  return (
    <section className="w-full px-6 md:px-12 py-12 bg-white">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: C.gold }}>FAQ</p>
          <h2 className="text-2xl font-bold mb-4" style={{ color: C.night }}>Questions fréquentes</h2>
          <FAQ />
        </div>
        <div className="rounded-2xl p-8 flex flex-col items-center text-center" style={{ background: C.night }}>
          <MaiaLogo dark />
          <h3 className="text-2xl font-bold text-white mt-5 mb-3">Commencez en quelques minutes</h3>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>Déclaration · Référentiel · Ordonnancier · Suivi<br />Gratuit pour les médecins.</p>
          <div className="flex flex-col gap-2.5 w-full max-w-xs">
            <Link href="/register" className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors" style={{ background: C.gold, color: C.night }}>
              Commencer gratuitement <IconArrow />
            </Link>
            <Link href="/dashboard/invite" className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white border transition-colors" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              Déclarer sans compte
            </Link>
          </div>
          <p className="text-[10px] mt-5" style={{ color: "rgba(255,255,255,0.2)" }}>Sans engagement · Données stockées sur votre appareil · CNDP</p>
        </div>
      </div>
    </section>
  );
}
