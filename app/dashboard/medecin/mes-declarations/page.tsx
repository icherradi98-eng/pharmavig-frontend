"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MedecinLayout, { PageHeader, useUnreadAlertsCount } from "@/components/medecin/MedecinLayout";
import { api, type ReportOut } from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  brouillon:     { label: "Brouillon",        color: "bg-gray-100 text-gray-600" },
  soumis:        { label: "Soumis",           color: "bg-blue-100 text-blue-700" },
  transmis_capm: { label: "Transmis CAPM",    color: "bg-emerald-100 text-emerald-700" },
  traite:        { label: "Traité",           color: "bg-violet-100 text-violet-700" },
};

const PAGE_SIZE = 10;

export default function MesDeclarations() {
  const unread = useUnreadAlertsCount(0);
  const [declarations, setDeclarations] = useState<ReportOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listReports()
      .then(setDeclarations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const [search, setSearch] = useState("");
  const [graviteFilter, setGraviteFilter] = useState<"" | "grave" | "non_grave">("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "gravite" | "drug">("date");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ReportOut | null>(null);

  const filtered = useMemo(() => {
    let list = declarations.filter((d) => {
      if (search) {
        const q = search.toLowerCase();
        const dci = (d.drug_dci || "").toLowerCase();
        const nom = (d.drug_nom_commercial || "").toLowerCase();
        if (!dci.includes(q) && !nom.includes(q)) return false;
      }
      if (graviteFilter === "grave" && !d.gravite_serieux) return false;
      if (graviteFilter === "non_grave" && d.gravite_serieux) return false;
      if (statusFilter && d.status !== statusFilter) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "gravite") return Number(b.gravite_serieux) - Number(a.gravite_serieux);
      if (sortBy === "drug") return (a.drug_dci || "").localeCompare(b.drug_dci || "");
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [declarations, search, graviteFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <MedecinLayout unreadAlerts={unread}>
      <PageHeader title="Mes déclarations" subtitle={`${declarations.length} déclaration${declarations.length > 1 ? "s" : ""} soumise${declarations.length > 1 ? "s" : ""} au total`} />

      <div className="px-5 md:px-8 py-6 space-y-5">
        <div className="flex items-center justify-end">
          <Link href="/dashboard/medecin/nouvelle-declaration"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
            + Nouvelle déclaration
          </Link>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400 text-sm">Chargement...</div>
        )}

        {!loading && error && (
          <div className="text-center py-16 border-2 border-dashed border-red-200 rounded-2xl bg-white">
            <p className="text-red-500 font-medium">Impossible de charger vos déclarations.</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && declarations.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">Vous n&apos;avez pas encore soumis de déclaration</p>
            <Link href="/dashboard/medecin/nouvelle-declaration"
              className="inline-block mt-4 bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700">
              Faire une déclaration →
            </Link>
          </div>
        ) : !loading && !error ? (
          <>
            {/* Filtres */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-center">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un médicament..."
                className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select value={graviteFilter} onChange={(e) => setGraviteFilter(e.target.value as "" | "grave" | "non_grave")}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600">
                <option value="">Toute gravité</option>
                <option value="grave">Grave</option>
                <option value="non_grave">Non grave</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600">
                <option value="">Tout statut</option>
                <option value="soumis">Soumis</option>
                <option value="transmis_capm">Transmis CAPM</option>
                <option value="traite">Traité</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "date" | "gravite" | "drug")}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600">
                <option value="date">Trier par date</option>
                <option value="gravite">Trier par gravité</option>
                <option value="drug">Trier par médicament</option>
              </select>
            </div>

            {/* Table desktop */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Référence CAPM</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Médicament suspect</th>
                    <th className="px-4 py-3 font-medium">Gravité</th>
                    <th className="px-4 py-3 font-medium">Imputabilité (Bégaud)</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((d) => {
                    const st = STATUS_LABELS[d.status] || { label: d.status, color: "bg-gray-100 text-gray-600" };
                    const date = new Date(d.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
                    return (
                      <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => setSelected(d)}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.capm_reference || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{date}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{d.drug_dci || d.drug_nom_commercial || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.gravite_serieux ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {d.gravite_serieux ? "Grave" : "Non grave"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{d.imput_conclusion || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/dashboard/medecin/mes-declarations/${d.id}`} onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-emerald-600 px-1.5" title="Voir le détail">👁️</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <div className="md:hidden flex flex-col gap-3">
              {paged.map((d) => {
                const st = STATUS_LABELS[d.status] || { label: d.status, color: "bg-gray-100 text-gray-600" };
                const date = new Date(d.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
                return (
                  <button key={d.id} onClick={() => setSelected(d)} className="text-left bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{d.drug_dci || d.drug_nom_commercial || "—"}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.gravite_serieux ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {d.gravite_serieux ? "Grave" : "Non grave"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>📅 {date}</span>
                      <span className={`px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">Aucune déclaration ne correspond à vos filtres.</div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setPage(Math.max(1, currentPage - 1))}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40">←</button>
                <span className="text-sm text-gray-500">Page {currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40">→</button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Modal détail */}
      {selected && <DeclarationModal declaration={selected} onClose={() => setSelected(null)} />}
    </MedecinLayout>
  );
}

function DeclarationModal({ declaration, onClose }: { declaration: ReportOut; onClose: () => void }) {
  const st = STATUS_LABELS[declaration.status] || { label: declaration.status, color: "bg-gray-100 text-gray-600" };
  const date = new Date(declaration.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <p className="font-mono text-xs text-gray-400">{declaration.capm_reference || "Référence non attribuée"}</p>
            <h2 className="font-bold text-gray-900 text-lg">{declaration.drug_dci || declaration.drug_nom_commercial || "Médicament non précisé"}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4 text-sm">
          <ModalRow label="Date de déclaration" value={date} />
          <ModalRow label="Gravité" value={
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${declaration.gravite_serieux ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
              {declaration.gravite_serieux ? "Grave (critères ICH E2A)" : "Non grave"}
            </span>
          } />
          <ModalRow label="Score d'imputabilité (Bégaud)" value={declaration.imput_conclusion || "—"} />
          <ModalRow label="Statut" value={<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>} />
          <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            Aperçu synthétique — le détail complet (7 sections ICH E2B R3) est disponible sur la page de détail de la déclaration.
          </p>
        </div>
        <div className="border-t border-gray-100 px-6 py-4 flex flex-wrap gap-2">
          <Link href={`/dashboard/medecin/mes-declarations/${declaration.id}`}
            className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg">
            Voir le détail complet
          </Link>
        </div>
      </div>
    </div>
  );
}

function ModalRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  );
}
