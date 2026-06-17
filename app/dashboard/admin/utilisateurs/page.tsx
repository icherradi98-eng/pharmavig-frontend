"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type AdminUser } from "@/lib/api";

const C = {
  petrol: "#0F5B57", gold: "#D4AF37", night: "#1F2D3D",
  cream: "#F7F3EE", creamDark: "#ede8e2",
};

const ROLE_LABELS: Record<string, string> = {
  medecin: "Médecin", patient: "Patient", pharmacien: "Pharmacien", admin: "Admin",
};

export default function AdminUtilisateurs() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.adminListUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.email.toLowerCase().includes(q)
      || (u.nom ?? "").toLowerCase().includes(q)
      || (u.prenom ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>

      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin" className="text-sm text-gray-400 hover:text-gray-600">← Tableau de bord</Link>
            <span className="text-gray-200">|</span>
            <span className="font-bold text-sm" style={{ color: C.night }}>Utilisateurs</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
            <h2 className="text-sm font-bold text-gray-900">Comptes utilisateurs</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un nom, email…"
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:outline-none w-56"
            />
            <span className="text-xs text-gray-400 ml-auto">{filtered.length} utilisateur{filtered.length > 1 ? "s" : ""}</span>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">Chargement…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Nom</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Rôle</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Spécialité</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Établissement</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Déclarations</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Créé le</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Actif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">Aucun utilisateur.</td></tr>
                  )}
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {u.prenom || u.nom ? `${u.prenom ?? ""} ${u.nom ?? ""}`.trim() : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(15,91,87,0.08)", color: C.petrol }}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.specialite || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{u.etablissement || "—"}</td>
                      <td className="px-4 py-3 text-center font-bold" style={{ color: u.declaration_count > 0 ? C.petrol : "#d1d5db" }}>
                        {u.declaration_count}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(u.created_at).toLocaleDateString("fr-MA")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`w-2 h-2 rounded-full inline-block ${u.is_active ? "bg-[#7ed3cf]" : "bg-gray-300"}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
