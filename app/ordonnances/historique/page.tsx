"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type SavedOrdonnance, readHistory, deleteFromHistory, posologieLabel,
} from "@/lib/ordonnancier";

const PREFILL_KEY = "pharmavig_prefill_declaration";
const RENEW_KEY = "pharmavig_ordo_renouvellement";

const TYPE_LABELS: Record<string, string> = {
  simple: "Simple",
  securisee: "Sécurisée",
  exception: "Exception",
};

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }); } catch { return d; }
}

function medsSummary(o: SavedOrdonnance) {
  return o.meds.map((m) => `${m.nom}${m.dosage ? ` ${m.dosage}` : ""}`).join(", ");
}

function csvEscape(v: string) {
  if (v.includes(",") || v.includes("\"") || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export default function HistoriqueOrdonnances() {
  const router = useRouter();
  const [history, setHistory] = useState<SavedOrdonnance[]>(() => readHistory());
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return history;
    const q = search.trim().toLowerCase();
    return history.filter((o) =>
      o.patient.nom.toLowerCase().includes(q) ||
      o.numero.toLowerCase().includes(q) ||
      o.meds.some((m) => m.nom.toLowerCase().includes(q) || (m.dci || "").toLowerCase().includes(q))
    );
  }, [history, search]);

  function handleDelete(id: string) {
    deleteFromHistory(id);
    setHistory(readHistory());
    setConfirmDeleteId(null);
  }

  // Renouveler : on reprend tout (même patient, mêmes médicaments) — juste la date est rafraîchie côté formulaire.
  function handleRenew(o: SavedOrdonnance) {
    sessionStorage.setItem(RENEW_KEY, JSON.stringify({ mode: "renew", ordonnance: o }));
    router.push("/ordonnances/nouvelle");
  }

  // Dupliquer : on reprend uniquement les médicaments / le type d'ordonnance (ex. même protocole pour un autre patient) — le champ patient reste à saisir.
  function handleDuplicate(o: SavedOrdonnance) {
    const sansPatient: SavedOrdonnance = { ...o, patient: { nom: "" } };
    sessionStorage.setItem(RENEW_KEY, JSON.stringify({ mode: "duplicate", ordonnance: sansPatient }));
    router.push("/ordonnances/nouvelle");
  }

  function handleSignalerEIM(o: SavedOrdonnance) {
    const initiales = o.patient.nom
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase())
      .filter(Boolean)
      .join(".");
    const firstMed = o.meds[0];
    const prefill: Record<string, unknown> = {
      patientAge: o.patient.age || "",
      patientSexe: o.patient.sexe === "M" ? "Homme" : o.patient.sexe === "F" ? "Femme" : "",
      medicamentDCI: firstMed?.dci || firstMed?.nom || "",
      medicamentPosologie: firstMed?.dosage || "",
      medicamentFrequence: firstMed ? posologieLabel(firstMed) : "",
      medicamentIndication: o.patient.motif || "",
      medicamentDateDebut: o.date,
      eiDescription: `Effet indésirable suspecté chez le patient ${initiales}, suite à la prescription de ${o.meds.map((m) => m.nom).join(", ")} (ordonnance ${o.numero} du ${formatDate(o.date)}).`,
    };
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify(prefill));
    router.push("/dashboard/medecin/nouvelle-declaration");
  }

  function exportCsv() {
    const rows = [
      ["N° ordonnance", "Date", "Patient", "Âge", "Sexe", "Médicaments", "Type", "Validité (mois)"],
      ...filtered.map((o) => [
        o.numero, o.date, o.patient.nom, o.patient.age || "", o.patient.sexe || "",
        medsSummary(o), TYPE_LABELS[o.type] || o.type, o.validite,
      ]),
    ];
    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pharmavig_ordonnances_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Historique des ordonnances</h1>
            <p className="text-sm text-gray-500 mt-0.5">{history.length} ordonnance{history.length > 1 ? "s" : ""} — stockées uniquement sur cet appareil.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/ordonnances/nouvelle" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
              + Nouvelle ordonnance
            </Link>
            <button onClick={exportCsv} disabled={filtered.length === 0} className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40">
              ⬇️ Export CSV
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            className="w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Rechercher par patient, médicament, n° d'ordonnance..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-gray-400 text-sm">
            {history.length === 0 ? (
              <>Aucune ordonnance générée pour le moment.<br />Créez votre première ordonnance pour qu&apos;elle apparaisse ici.</>
            ) : (
              "Aucun résultat pour cette recherche."
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100 bg-gray-50/50">
                    <th className="py-2.5 px-4">N° Ord</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Patient</th>
                    <th className="py-2.5 px-4">Médicaments</th>
                    <th className="py-2.5 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 align-top">
                      <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{o.numero}</td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatDate(o.date)}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {o.patient.nom}
                        {o.patient.age && <span className="text-gray-400 text-xs"> · {o.patient.age}</span>}
                        {o.type !== "simple" && (
                          <span className="block text-[10px] uppercase text-red-500 font-semibold">{TYPE_LABELS[o.type]}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs">{medsSummary(o)}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-end gap-1.5 text-xs">
                          <button onClick={() => handleRenew(o)} className="text-emerald-600 hover:text-emerald-700 font-medium underline">
                            ↻ Renouveler
                          </button>
                          <button onClick={() => handleDuplicate(o)} className="text-gray-500 hover:text-gray-700 underline">
                            ⧉ Dupliquer (autre patient)
                          </button>
                          <button onClick={() => handleSignalerEIM(o)} className="text-amber-600 hover:text-amber-700 font-medium underline">
                            ⚠️ Signaler un EIM
                          </button>
                          {confirmDeleteId === o.id ? (
                            <span className="inline-flex items-center gap-2">
                              <button onClick={() => handleDelete(o.id)} className="text-red-600 font-semibold underline">
                                Confirmer
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-gray-500 hover:text-gray-700 underline">
                                Annuler
                              </button>
                            </span>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(o.id)} className="text-red-400 hover:text-red-600 underline">
                              Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          🔒 Vos ordonnances sont stockées uniquement sur cet appareil. MAIA DAWA ne conserve aucune donnée patient.
        </p>
      </div>
    </div>
  );
}
