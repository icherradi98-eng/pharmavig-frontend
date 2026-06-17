import Link from "next/link";

const C = {
  petrol: "#0F5B57", petrolDark: "#0a3f3c", gold: "#D4AF37",
  night: "#1F2D3D", cream: "#F7F3EE", creamDark: "#ede8e2",
};

function MaiaLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: C.petrol }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9" />
          <path d="M9 12l2 2 4-4" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="font-black text-[15px] tracking-tight">
        <span style={{ color: C.petrol }}>MAIA</span>{" "}
        <span style={{ color: C.gold }}>DAWA</span>
      </span>
    </div>
  );
}

export default function InviteDashboard() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-md" style={{ background: "rgba(247,243,238,0.93)", borderBottom: `1px solid ${C.creamDark}` }}>
        <div className="max-w-2xl mx-auto px-6 flex items-center justify-between py-3">
          <Link href="/"><MaiaLogo /></Link>
          <Link href="/login" className="text-[13px] font-medium" style={{ color: C.petrol }}>
            Espace professionnel →
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">

        {/* En-tête */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 bg-white" style={{ border: `1px solid ${C.creamDark}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2FA88F" }} />
            <span className="text-xs font-medium" style={{ color: "#4a5568" }}>Déclaration anonyme — sans compte</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2" style={{ color: C.night }}>
            Déclarez un effet indésirable
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
            Aucun compte nécessaire. Votre déclaration est transmise de façon anonyme et contribue à la sécurité médicamenteuse au Maroc.
          </p>
        </div>

        {/* Bannière compte */}
        <div className="rounded-2xl p-4 mb-8 flex items-start gap-3" style={{ background: "rgba(212,175,55,0.08)", border: `1px solid rgba(212,175,55,0.25)` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <div>
            <p className="text-sm font-semibold" style={{ color: C.night }}>Créez un compte pour un suivi complet</p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#6b7280" }}>
              Retrouvez vos déclarations passées, recevez des mises à jour et téléchargez le PDF CIOMS officiel.
            </p>
            <Link href="/register" className="text-xs font-bold underline mt-1.5 inline-block" style={{ color: C.petrol }}>
              Créer un compte gratuitement →
            </Link>
          </div>
        </div>

        {/* Choix du profil */}
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8a9ab0" }}>Vous êtes…</p>

        <div className="space-y-3">
          <Link
            href="/dashboard/invite/declarer"
            className="flex items-center gap-5 rounded-2xl p-5 transition-all group"
            style={{ background: C.night, border: `1px solid rgba(255,255,255,0.06)` }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl" style={{ background: "rgba(255,255,255,0.07)" }}>
              🧑‍🤝‍🧑
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-base">Patient ou proche</p>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Formulaire simplifié — sans jargon médical, en quelques minutes
              </p>
            </div>
            <span className="text-lg shrink-0 transition-transform group-hover:translate-x-1" style={{ color: C.gold }}>→</span>
          </Link>

          <Link
            href="/dashboard/invite/declarer-medecin"
            className="flex items-center gap-5 rounded-2xl p-5 transition-all group bg-white"
            style={{ border: `1px solid ${C.creamDark}` }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl" style={{ background: "rgba(15,91,87,0.08)" }}>
              🩺
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base" style={{ color: C.night }}>Professionnel de santé</p>
              <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
                Formulaire CIOMS complet — imputabilité Bégaud, MedDRA, export PDF
              </p>
            </div>
            <span className="text-lg shrink-0 transition-transform group-hover:translate-x-1" style={{ color: C.petrol }}>→</span>
          </Link>
        </div>

        <p className="text-xs mt-6 text-center" style={{ color: "#8a9ab0" }}>
          Déclaration anonyme dans les deux cas · Données transmises au réseau MAIA DAWA
        </p>
      </main>
    </div>
  );
}
