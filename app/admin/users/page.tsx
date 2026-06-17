"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "../dashboard/page";
import { api, type AdminUser } from "@/lib/api";

const ROLE_COLORS: Record<string, string> = {
  medecin: "bg-[rgba(15,91,87,0.3)] text-[#7ed3cf]",
  patient: "bg-blue-900/40 text-blue-300",
  pharmacien: "bg-orange-900/40 text-orange-300",
};

export default function AdminUsers() {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_user") : null;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("");

  useEffect(() => {
    if (!token) return;
    api.adminListUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = filterRole ? users.filter((u) => u.role === filterRole) : users;

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminNav active="Utilisateurs" />

      <main className="flex-1 px-8 py-8 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} compte(s) enregistré(s)</p>
        </div>

        {/* Filtre */}
        <div className="flex gap-3 mb-6">
          {[["", "Tous"], ["medecin", "Médecins"], ["patient", "Patients"], ["pharmacien", "Pharmaciens"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilterRole(val)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterRole === val ? "text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
              style={filterRole === val ? { background: "#0F5B57" } : undefined}>
              {label}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading && <div className="py-16 text-center text-gray-500 text-sm">Chargement...</div>}

          {!loading && filtered.map((u) => {
            const date = new Date(u.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
            const roleColor = ROLE_COLORS[u.role] || "bg-gray-800 text-gray-400";
            return (
              <div key={u.id} className="flex items-center gap-5 px-5 py-4 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors">
                <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-300 shrink-0">
                  {u.prenom?.[0]}{u.nom?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{u.prenom} {u.nom}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColor}`}>{u.role}</span>
                    {!u.is_active && <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full">Suspendu</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {u.email}{u.specialite ? ` · ${u.specialite}` : ""}{u.ville ? ` · ${u.ville}` : ""}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[#7ed3cf] font-bold text-lg">{u.declaration_count}</div>
                  <div className="text-gray-600 text-xs">déclarations</div>
                </div>
                <div className="text-xs text-gray-600 shrink-0 w-24 text-right">
                  Inscrit le<br />{date}
                </div>
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center text-gray-500 text-sm">Aucun utilisateur</div>
          )}
        </div>
      </main>
    </div>
  );
}
