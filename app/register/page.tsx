"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";

const SPECIALITES = [
  "Médecine générale", "Cardiologie", "Oncologie", "Neurologie", "Pneumologie",
  "Gastro-entérologie", "Endocrinologie", "Rhumatologie", "Dermatologie", "Pédiatrie",
  "Gynécologie-obstétrique", "Chirurgie", "Urgences", "Réanimation", "Psychiatrie",
  "Ophtalmologie", "ORL", "Urologie", "Hématologie", "Infectiologie", "Autre",
];

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
    if (!pwdValid) {
      setError("Le mot de passe ne respecte pas les règles de sécurité");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
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

  const roleLabels: Record<string, string> = {
    medecin: "Médecin 🩺", patient: "Patient 👤", pharmacien: "Pharmacien 💊",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">PV</span>
            </div>
            <span className="font-semibold text-gray-900 text-xl">PharmaVig</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">Créer un compte</h1>
            <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 underline">
              Déjà un compte ?
            </Link>
          </div>

          {/* Sélecteur de rôle */}
          {!role && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Je suis :</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRole("medecin")}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                  <span className="text-2xl">🩺</span>
                  <span className="text-sm font-semibold text-gray-700">Médecin</span>
                  <span className="text-xs text-gray-400 text-center">Professionnel de santé</span>
                </button>
                <button type="button" onClick={() => setRole("patient")}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                  <span className="text-2xl">👤</span>
                  <span className="text-sm font-semibold text-gray-700">Patient</span>
                  <span className="text-xs text-gray-400 text-center">Déclarer un effet indésirable</span>
                </button>
              </div>
            </div>
          )}

          {role && (
            <div className="flex items-center gap-2 mb-5 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <span className="text-lg">{role === "medecin" ? "🩺" : "👤"}</span>
              <span className="text-sm font-medium text-emerald-800">{roleLabels[role] || role}</span>
              <button type="button" onClick={() => setRole("")} className="ml-auto text-xs text-emerald-600 underline hover:text-emerald-800">
                Changer
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700 mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-4 ${!role ? "hidden" : ""}`}>
            {/* Champs communs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Prénom</label>
                <input value={form.prenom} onChange={(e) => set("prenom", e.target.value)}
                  placeholder="Prénom" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nom</label>
                <input value={form.nom} onChange={(e) => set("nom", e.target.value)}
                  placeholder="Nom" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
              <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="votre@email.com" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            {/* Champs médecin */}
            {role === "medecin" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Spécialité <span className="text-red-500">*</span></label>
                  <select value={form.specialite} onChange={(e) => set("specialite", e.target.value)} required
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option value="">Choisir une spécialité</option>
                    {SPECIALITES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">N° Ordre</label>
                    <input value={form.num_ordre} onChange={(e) => set("num_ordre", e.target.value)}
                      placeholder="MA-XXXXX" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ville</label>
                    <input value={form.ville} onChange={(e) => set("ville", e.target.value)}
                      placeholder="Casablanca" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Établissement</label>
                  <input value={form.etablissement} onChange={(e) => set("etablissement", e.target.value)}
                    placeholder="CHU, clinique, cabinet..." className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </>
            )}

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Mot de passe <span className="text-red-500">*</span></label>
                <input type="password" required value={form.password} onChange={(e) => set("password", e.target.value)}
                  placeholder="Minimum 8 caractères" className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${form.password && !pwdValid ? "border-red-300" : "border-gray-300"}`} />
                {form.password.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {pwdRules.map((r) => (
                      <li key={r.label} className={`flex items-center gap-1.5 text-xs ${r.ok ? "text-emerald-600" : "text-gray-400"}`}>
                        <span>{r.ok ? "✓" : "○"}</span>
                        {r.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Confirmer le mot de passe <span className="text-red-500">*</span></label>
                <input type="password" required value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)}
                  placeholder="••••••••" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 mt-2">
              {loading ? "Création du compte..." : "Créer mon compte"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
