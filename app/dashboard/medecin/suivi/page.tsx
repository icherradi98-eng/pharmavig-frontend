"use client";

/**
 * /dashboard/medecin/suivi — Patients en suivi actif
 * Vue triée par urgence : Alerte → En attente → Répondu → Terminé
 * Données : api.listPrescriptions() + api.listActiveSignals()
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MedecinLayout, { PageHeader, SectionCard } from "@/components/medecin/MedecinLayout";
import { useAuth } from "@/context/AuthContext";
import { api, type PrescriptionOut, type CheckInOut } from "@/lib/api";
import { type ImputScore } from "../nouvelle-declaration/ImputabiliteBegaud";
import {
  getPatientStatus, STATUS_CONFIG, writeSignalPrefill,
  type SortKey, type FilterKey,
} from "./_components/helpers";
import { PatientRow } from "./_components/PatientRow";
import { SignalsList } from "./_components/SignalsList";
import { BegaudModal } from "./_components/BegaudModal";

export default function SuiviActifPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [prescriptions, setPrescriptions] = useState<PrescriptionOut[]>([]);
  const [checkinMap, setCheckinMap] = useState<Record<string, CheckInOut[]>>({});
  const [signals, setSignals] = useState<CheckInOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("urgence");
  const [filter, setFilter] = useState<FilterKey>("tous");
  const [search, setSearch] = useState("");

  // S5.2 — Modal Bégaud : prescription sélectionnée pour le calcul d'imputabilité
  const [begaudRx, setBegaudRx] = useState<PrescriptionOut | null>(null);
  const [begaudScore, setBegaudScore] = useState<ImputScore | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "medecin") { router.replace(`/dashboard/${user.role}`); return; }

    let cancelled = false;
    Promise.all([api.listPrescriptions(), api.listActiveSignals()])
      .then(async ([rxList, sig]) => {
        if (cancelled) return;
        setPrescriptions(rxList);
        setSignals(sig);
        // Charger les checkins en parallèle
        const entries = await Promise.all(
          rxList.map(async (rx) => {
            try {
              const d = await api.getPrescription(rx.id);
              return [rx.id, d.checkins] as [string, CheckInOut[]];
            } catch {
              return [rx.id, [] as CheckInOut[]] as [string, CheckInOut[]];
            }
          })
        );
        if (cancelled) return;
        const map: Record<string, CheckInOut[]> = {};
        entries.forEach(([id, c]) => { map[id] = c; });
        setCheckinMap(map);
      })
      .catch((e) => setError(e.message))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [user, router]);

  // Pré-remplit le formulaire de déclaration depuis un signal patient
  function declareFromSignal(rx: PrescriptionOut, signal: CheckInOut) {
    writeSignalPrefill(rx, signal);
    router.push("/dashboard/medecin/nouvelle-declaration");
  }

  // Pré-remplit le formulaire de déclaration depuis le score Bégaud calculé
  function declareFromBegaud(rx: PrescriptionOut, score: ImputScore) {
    const prefill = {
      medicamentDCI: rx.drug_dci ?? "",
      medicamentIndication: rx.indication ?? "",
      medicamentDateDebut: rx.date_debut ?? "",
      patientAge: rx.patient_age ?? "",
      patientSexe: rx.patient_sexe ?? "",
      imputChronologie: String(score.Cscore),
      imputConclusion: `I${score.Iscore}${score.isGrave ? "B" : "b"}`,
    };
    try { sessionStorage.setItem("pharmavig_prefill_declaration", JSON.stringify(prefill)); } catch {}
    setBegaudRx(null);
    router.push("/dashboard/medecin/nouvelle-declaration");
  }

  function markSignalSeen(sigId: string) {
    api.markCheckinSeen(sigId).then(() => setSignals((prev) => prev.filter((x) => x.id !== sigId)));
  }

  // Enrichir chaque prescription avec son statut calculé
  const patients = useMemo(() => {
    return prescriptions.map((rx) => ({
      rx,
      checkins: checkinMap[rx.id] ?? [],
      status: getPatientStatus(rx, checkinMap[rx.id] ?? []),
    }));
  }, [prescriptions, checkinMap]);

  // Stats par statut
  const stats = useMemo(() => ({
    alerte:     patients.filter((p) => p.status === "alerte").length,
    en_attente: patients.filter((p) => p.status === "en_attente").length,
    repondu:    patients.filter((p) => p.status === "repondu").length,
    termine:    patients.filter((p) => p.status === "termine").length,
  }), [patients]);

  // Filtrage + tri
  const displayed = useMemo(() => {
    let list = patients;
    if (filter !== "tous") list = list.filter((p) => p.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.rx.patient_initiales?.toLowerCase().includes(q) ||
        p.rx.drug_dci?.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      if (sortBy === "urgence") return STATUS_CONFIG[a.status].sort - STATUS_CONFIG[b.status].sort;
      if (sortBy === "date") return new Date(b.rx.date_debut).getTime() - new Date(a.rx.date_debut).getTime();
      if (sortBy === "nom") return (a.rx.patient_initiales ?? "").localeCompare(b.rx.patient_initiales ?? "");
      return 0;
    });
  }, [patients, filter, sortBy, search]);

  return (
    <MedecinLayout>
      <PageHeader
        title="Patients en suivi actif"
        subtitle={`${patients.length} patient${patients.length !== 1 ? "s" : ""} enregistré${patients.length !== 1 ? "s" : ""}`}
        action={
          <Link
            href="/prescriptions/nouvelle"
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-colors"
            style={{ background: "#0F5B57" }}
          >
            + Nouveau patient
          </Link>
        }
      />

      {/* Bandeau confidentialité données patient */}
      <div className="mx-5 md:mx-8 mt-4 mb-2 rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: "rgba(15,91,87,0.05)", border: "1px solid rgba(15,91,87,0.15)" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
          <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="#0F5B57" fillOpacity="0.2"/>
          <path d="M9 12l2 2 4-4" stroke="#0F5B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-xs leading-relaxed" style={{ color: "#0a3f3c" }}>
          <strong>Données patients protégées</strong> — MAI DAWA utilise des liens temporaires. Aucun profil patient complet n&apos;est stocké. Les réponses au suivi arrivent directement dans votre tableau de bord.
        </p>
      </div>

      {/* ── Signaux actifs (anciennement dans /surveillance) ── */}
      <SignalsList
        signals={signals}
        prescriptions={prescriptions}
        checkinMap={checkinMap}
        onMarkSeen={markSignalSeen}
        onDeclare={declareFromSignal}
      />

      {/* ── Cartes KPI ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(["alerte", "en_attente", "repondu", "termine"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const count = stats[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(filter === s ? "tous" : s)}
              className={`bg-white border rounded-xl px-4 py-3 text-left transition-all hover:shadow-sm ${
                filter === s ? "ring-2 ring-offset-1" : ""
              } ${s === "alerte" ? "border-red-200" : s === "en_attente" ? "border-amber-200" : s === "repondu" ? "border-petrol/20" : "border-gray-200"}`}
              style={filter === s ? { "--tw-ring-color": s === "alerte" ? "#ef4444" : s === "en_attente" ? "#f59e0b" : s === "repondu" ? "#2FA88F" : "#9ca3af" } as React.CSSProperties : {}}
            >
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className={`text-xs font-semibold mt-0.5 ${
                s === "alerte" ? "text-red-600" : s === "en_attente" ? "text-amber-600" : s === "repondu" ? "text-petrol" : "text-gray-400"
              }`}>
                {cfg.icon} {cfg.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Barre d'outils ── */}
      <SectionCard>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Recherche */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un patient ou médicament…"
            className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30"
          />

          {/* Tri */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Trier :</span>
            {([
              ["urgence", "Urgence"],
              ["date",    "Date"],
              ["nom",     "Nom"],
            ] as [SortKey, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  sortBy === key
                    ? "border-teal-700 text-teal-700 font-semibold bg-teal-50"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bouton reset filtre */}
          {filter !== "tous" && (
            <button
              onClick={() => setFilter("tous")}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Voir tout
            </button>
          )}
        </div>
      </SectionCard>

      {/* ── Contenu ── */}
      <div className="mt-4 space-y-3">
        {loading && (
          <div className="text-center py-16 text-gray-400 text-sm">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-teal-700 rounded-full animate-spin mx-auto mb-3" />
            Chargement des patients…
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {!loading && !error && displayed.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">
              {patients.length === 0 ? "🩺" : "🔍"}
            </div>
            <p className="font-semibold text-gray-700 mb-1">
              {patients.length === 0 ? "Aucun patient en suivi" : "Aucun patient correspond à ce filtre"}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              {patients.length === 0
                ? "Créez une première prescription pour activer le suivi automatique."
                : "Modifiez les filtres ou la recherche."}
            </p>
            {patients.length === 0 && (
              <Link
                href="/prescriptions/nouvelle"
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-colors"
                style={{ background: "#0F5B57" }}
              >
                + Créer une prescription
              </Link>
            )}
          </div>
        )}

        {!loading && displayed.map(({ rx, checkins, status }) => (
          <PatientRow
            key={rx.id}
            rx={rx}
            checkins={checkins}
            status={status}
            onBegaud={() => { setBegaudRx(rx); setBegaudScore(null); }}
            onDeclareAlert={(signal) => declareFromSignal(rx, signal)}
          />
        ))}
      </div>

      {/* ── Note de bas de page ── */}
      {!loading && displayed.length > 0 && (
        <div className="mt-6 text-center text-xs text-gray-400">
          {displayed.length} patient{displayed.length > 1 ? "s" : ""} affiché{displayed.length > 1 ? "s" : ""}
          {filter !== "tous" && ` (filtre : ${STATUS_CONFIG[filter].label})`}
          {" · "}
          <Link href="/ordonnances/nouvelle" className="underline hover:text-gray-600">
            + Nouvelle prescription →
          </Link>
        </div>
      )}

      {/* ── S5.2 : Modal Bégaud ── */}
      {begaudRx && (
        <BegaudModal
          rx={begaudRx}
          score={begaudScore}
          onScoreChange={setBegaudScore}
          onClose={() => setBegaudRx(null)}
          onDeclare={(score) => declareFromBegaud(begaudRx, score)}
        />
      )}
    </MedecinLayout>
  );
}
