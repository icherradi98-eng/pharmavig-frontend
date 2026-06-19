"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";

const C = {
  petrol: "#0F5B57", gold: "#D4AF37", night: "#1F2D3D",
  cream: "#F7F3EE", creamDark: "#ede8e2",
};

const SPECIALITES = [
  "Médecine générale", "Cardiologie", "Oncologie", "Neurologie", "Pneumologie",
  "Gastro-entérologie", "Endocrinologie", "Rhumatologie", "Dermatologie", "Pédiatrie",
  "Gynécologie-obstétrique", "Chirurgie", "Urgences", "Réanimation", "Psychiatrie",
  "Ophtalmologie", "ORL", "Urologie", "Hématologie", "Infectiologie", "Autre",
];

function MaiaLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: C.petrol }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9" />
          <path d="M9 12l2 2 4-4" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="font-black text-lg tracking-tight">
        <span style={{ color: C.petrol }}>MAI</span>{" "}
        <span style={{ color: C.gold }}>DAWA</span>
      </span>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: C.night }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors";
const inputStyle = { borderColor: C.creamDark, ["--tw-ring-color" as string]: C.petrol };

function RegisterForm() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState(searchParams.get("role") || "");

  const [form, setForm] = useState({
    email: "", password: "", confirmPassword: "",
    nom: "", prenom: "", specialite: "", num_ordre: "", etablissement: "", ville: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const pwdRules = [
    { ok: form.password.length >= 8, label: "Au moins 8 caractères" },
    { ok: /\d/.test(form.password),  label: "Au moins un chiffre" },
    { ok: /[a-zA-Z]/.test(form.password), label: "Au moins une lettre" },
  ];
  const pwdValid = pwdRules.every((r) => r.ok);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pwdValid) { setError("Le mot de passe ne respecte pas les règles de sécurité"); return; }
    if (form.password !== form.confirmPassword) { setError("Les mots de passe ne correspondent pas"); return; }
    setError("");
    setLoading(true);
    try {
      await register({ ...form, role, confirmPassword: undefined });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream }}>

      {/* Navbar minimale */}
      <nav className="sticky top-0 z-40 backdrop-blur-md" style={{ background: "rgba(247,243,238,0.93)", borderBottom: `1px solid ${C.creamDark}` }}>
        <div className="max-w-lg mx-auto px-6 flex items-center justify-between py-3">
          <Link href="/"><MaiaLogo /></Link>
          <Link href="/login" className="text-[13px]" style={{ color: "#6b7280" }}>
            Déjà un compte ? <span className="font-semibold" style={{ color: C.petrol }}>Se connecter</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">

          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: C.night }}>Créer un compte</h1>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Gratuit · Sans engagement · Déclaration en 5 minutes</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: `1px solid ${C.creamDark}` }}>

            {/* Sélecteur de rôle */}
            {!role && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3" style={{ color: C.night }}>Je suis :</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "medecin", icon: "🩺", label: "Médecin", sub: "Professionnel de santé" },
                    { id: "patient", icon: "👤", label: "Patient", sub: "Déclarer un effet" },
                  ].map((r) => (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:shadow-sm"
                      style={{ borderColor: C.creamDark }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.petrol)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.creamDark)}
                    >
                      <span className="text-2xl">{r.icon}</span>
                      <span className="text-sm font-bold" style={{ color: C.night }}>{r.label}</span>
                      <span className="text-xs text-center" style={{ color: "#8a9ab0" }}>{r.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {role && (
              <div className="flex items-center gap-2 mb-5 rounded-xl px-3 py-2.5" style={{ background: "rgba(15,91,87,0.06)", border: `1px solid rgba(15,91,87,0.15)` }}>
                <span className="text-lg">{role === "medecin" ? "🩺" : "👤"}</span>
                <span className="text-sm font-semibold" style={{ color: C.petrol }}>
                  {role === "medecin" ? "Médecin" : "Patient"}
                </span>
                <button type="button" onClick={() => setRole("")} className="ml-auto text-xs underline" style={{ color: "#8a9ab0" }}>
                  Changer
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-xl px-4 py-2.5 text-sm mb-4" style={{ background: "#fde8e8", color: "#C0392B", border: "1px solid #fecaca" }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={`space-y-4 ${!role ? "hidden" : ""}`}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom">
                  <input value={form.prenom} onChange={(e) => set("prenom", e.target.value)}
                    placeholder="Prénom" className={inputCls} style={inputStyle} />
                </Field>
                <Field label="Nom">
                  <input value={form.nom} onChange={(e) => set("nom", e.target.value)}
                    placeholder="Nom" className={inputCls} style={inputStyle} />
                </Field>
              </div>

              <Field label="Email" required>
                <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="votre@email.com" className={inputCls} style={inputStyle} />
              </Field>

              {role === "medecin" && (
                <>
                  <Field label="Spécialité" required>
                    <select value={form.specialite} onChange={(e) => set("specialite", e.target.value)} required
                      className={`${inputCls} bg-white`} style={inputStyle}>
                      <option value="">Choisir une spécialité</option>
                      {SPECIALITES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="N° Ordre">
                      <input value={form.num_ordre} onChange={(e) => set("num_ordre", e.target.value)}
                        placeholder="MA-XXXXX" className={inputCls} style={inputStyle} />
                    </Field>
                    <Field label="Ville">
                      <input value={form.ville} onChange={(e) => set("ville", e.target.value)}
                        placeholder="Casablanca" className={inputCls} style={inputStyle} />
                    </Field>
                  </div>
                  <Field label="Établissement">
                    <input value={form.etablissement} onChange={(e) => set("etablissement", e.target.value)}
                      placeholder="CHU, clinique, cabinet…" className={inputCls} style={inputStyle} />
                  </Field>
                </>
              )}

              <div className="border-t pt-4 space-y-3" style={{ borderColor: C.creamDark }}>
                <Field label="Mot de passe" required>
                  <input type="password" required value={form.password} onChange={(e) => set("password", e.target.value)}
                    placeholder="Minimum 8 caractères"
                    className={`${inputCls} ${form.password && !pwdValid ? "border-red-300" : ""}`}
                    style={inputStyle} />
                  {form.password.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {pwdRules.map((r) => (
                        <li key={r.label} className="flex items-center gap-1.5 text-xs" style={{ color: r.ok ? C.petrol : "#9ca3af" }}>
                          <span>{r.ok ? "✓" : "○"}</span>{r.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </Field>
                <Field label="Confirmer le mot de passe" required>
                  <input type="password" required value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)}
                    placeholder="••••••••" className={inputCls} style={inputStyle} />
                </Field>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60 mt-2"
                style={{ background: loading ? "#6b7280" : C.petrol }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#0a3f3c"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = C.petrol; }}
              >
                {loading ? "Création du compte…" : "Créer mon compte"}
              </button>
            </form>
          </div>

          <p className="text-[11px] text-center mt-4" style={{ color: "#8a9ab0" }}>
            MVP · Mise en conformité loi 09-08 (CNDP) en cours
          </p>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
