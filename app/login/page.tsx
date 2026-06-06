"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

const ROLES = [
  {
    id: "medecin",
    label: "Médecin",
    icon: "🩺",
    color: "emerald",
    description: "Professionnel de santé",
  },
  {
    id: "patient",
    label: "Patient",
    icon: "👤",
    color: "blue",
    description: "Particulier / citoyen",
  },
  {
    id: "pharmacien",
    label: "Pharmacien",
    icon: "💊",
    color: "violet",
    description: "Pharmacien d'officine",
  },
] as const;

type Role = (typeof ROLES)[number]["id"];

const roleColors: Record<Role, string> = {
  medecin: "border-emerald-500 bg-emerald-50 text-emerald-700",
  patient: "border-blue-500 bg-blue-50 text-blue-700",
  pharmacien: "border-violet-500 bg-violet-50 text-violet-700",
};

const btnColors: Record<Role, string> = {
  medecin: "bg-emerald-600 hover:bg-emerald-700",
  patient: "bg-blue-600 hover:bg-blue-700",
  pharmacien: "bg-violet-600 hover:bg-violet-700",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRole = (searchParams.get("role") as Role) || "medecin";
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Auth à brancher plus tard — on redirige directement pour l'instant
    router.push(`/dashboard/${selectedRole}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">PV</span>
            </div>
            <span className="font-semibold text-gray-900 text-xl">PharmaVig</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Connexion</h1>
          <p className="text-gray-500 text-sm mb-6">Choisissez votre profil et connectez-vous</p>

          {/* Sélecteur de rôle */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  selectedRole === role.id
                    ? roleColors[role.id]
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{role.icon}</span>
                <span>{role.label}</span>
              </button>
            ))}
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className={`w-full text-white py-2.5 rounded-lg text-sm font-semibold transition-colors mt-2 ${btnColors[selectedRole]}`}
            >
              Se connecter en tant que {ROLES.find((r) => r.id === selectedRole)?.label}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3 items-center">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-emerald-600 font-medium hover:underline">
                S&apos;inscrire
              </Link>
            </p>
            <Link
              href={`/dashboard/invite`}
              className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
            >
              Continuer sans compte (invité)
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          En vous connectant, vous acceptez notre politique de confidentialité conforme à la loi 09-08
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
