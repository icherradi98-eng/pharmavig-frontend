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
import { MEDDRA_TERMS } from "@/lib/meddraTerms";
import ImputabiliteBegaud, { type ImputScore } from "../nouvelle-declaration/ImputabiliteBegaud";

// ─── S5.1 : symptôme → SOC MedDRA via la base des 250 termes ────────────────
// Remplace le mappage figé de 20 entrées par une recherche dans meddraTerms.ts

function symptomToSoc(symptom: string): string {
  if (!symptom) return "";
  const q = symptom.toLowerCase().trim();
  // 1. Correspondance exacte sur le Preferred Term
  const exact = MEDDRA_TERMS.find((t) => t.pt.toLowerCase() === q);
  if (exact) return exact.soc;
  // 2. Le terme MedDRA est contenu dans le symptôme patient (ex. "Maux de tête" → "Céphalées")
  const contained = MEDDRA_TERMS.find((t) => q.includes(t.pt.toLowerCase()));
  if (contained) return contained.soc;
  // 3. Le symptôme patient est contenu dans le terme MedDRA
  const partial = MEDDRA_TERMS.find((t) => t.pt.toLowerCase().includes(q));
  if (partial) return partial.soc;
  return "";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function daysSince(dateStr: string): number {
  return Math.round((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function daysUntil(dateStr: string): number {
  return Math.round((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

// ─── Calcul du statut patient depuis ses check-ins ───────────────────────────

type PatientStatus = "alerte" | "en_attente" | "repondu" | "termine";

function getPatientStatus(
  rx: PrescriptionOut,
  checkins: CheckInOut[]
): PatientStatus {
  if (!rx.monitoring_active || rx.monitoring_ended) return "termine";
  const hasAlert = checkins.some(
    (c) => c.status === "repondu" && (c.severity === "urgent" || c.has_symptoms)
  );
  if (hasAlert) return "alerte";
  const hasPending = checkins.some((c) => c.status === "pending" || c.status === "rappel_envoye");
  if (hasPending) return "en_attente";
  const hasReplied = checkins.some((c) => c.status === "repondu");
  if (hasReplied) return "repondu";
  return "en_attente";
}

// ─── Config visuelle par statut ───────────────────────────────────────────────

const STATUS_CONFIG: Record<PatientStatus, {
  label: string;
  badge: string;
  row: string;
  icon: string;
  sort: number;
}> = {
  alerte:     { label: "Alerte",      badge: "bg-red-100 text-red-700 border border-red-300",     row: "border-l-4 border-l-red-400",    icon: "🔴", sort: 0 },
  en_attente: { label: "En attente",  badge: "bg-amber-100 text-amber-700 border border-amber-300", row: "border-l-4 border-l-amber-400",  icon: "🟡", sort: 1 },
  repondu:    { label: "Répondu",     badge: "bg-emerald-100 text-emerald-700 border border-emerald-300", row: "border-l-4 border-l-emerald-400", icon: "🟢", sort: 2 },
  termine:    { label: "Terminé",     badge: "bg-gray-100 text-gray-500 border border-gray-200",   row: "border-l-4 border-l-gray-200",   icon: "⚪", sort: 3 },
};

// ─── Composant ligne patient ──────────────────────────────────────────────────

function PatientRow({
  rx,
  checkins,
  status,
  onBegaud,
}: {
  rx: PrescriptionOut;
  checkins: CheckInOut[];
  status: PatientStatus;
  onBegaud: () => void;
}) {
  const cfg = STATUS_CONFIG[status];

  const lastReplied = [...checkins]
    .filter((c) => c.status === "repondu" && c.responded_at)
    .sort((a, b) => new Date(b.responded_at!).getTime() - new Date(a.responded_at!).getTime())[0];

  const nextPending = [...checkins]
    .filter((c) => c.status === "pending" || c.status === "rappel_envoye")
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())[0];

  const alertCheckins = checkins.filter(
    (c) => c.status === "repondu" && (c.severity === "urgent" || c.has_symptoms)
  );

  const daysSinceStart = daysSince(rx.date_debut);

  return (
    <div className={`bg-white rounded-xl overflow-hidden ${cfg.row} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="px-5 py-4 flex items-center gap-4">

        {/* Avatar initiales */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white"
          style={{ background: status === "alerte" ? "#ef4444" : status === "en_attente" ? "#f59e0b" : status === "repondu" ? "#10b981" : "#9ca3af" }}>
          {rx.patient_initiales?.slice(0, 2).toUpperCase() ?? "??"}
        </div>

        {/* Infos patient */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-semibold text-gray-900 text-sm">{rx.patient_initiales}</span>
            {rx.patient_age && <span className="text-xs text-gray-400">{rx.patient_age} ans</span>}
            {rx.patient_sexe && <span className="text-xs text-gray-400">· {rx.patient_sexe}</span>}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {cfg.icon} {cfg.label}
            </span>
            {alertCheckins.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                ⚠️ {alertCheckins.length} signal{alertCheckins.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="font-medium text-gray-700">{rx.drug_dci}{rx.drug_dose ? ` ${rx.drug_dose}` : ""}</span>
            <span>·</span>
            <span>Début {formatDate(rx.date_debut)} ({daysSinceStart} j)</span>
            {nextPending && (
              <>
                <span>·</span>
                <span className="text-amber-600 font-medium">
                  Prochain check-in J+{nextPending.day_offset} ({
                    daysUntil(nextPending.scheduled_date) >= 0
                      ? `dans ${daysUntil(nextPending.scheduled_date)} j`
                      : `en retard de ${Math.abs(daysUntil(nextPending.scheduled_date))} j`
                  })
                </span>
              </>
            )}
            {lastReplied && !nextPending && (
              <>
                <span>·</span>
                <span className="text-emerald-600">Dernière réponse {formatDate(lastReplied.responded_at)}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Lien vers questionnaire patient (via token public) */}
          {nextPending && (
            <a
              href={`/suivi/${rx.access_token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
            >
              📋 Questionnaire
            </a>
          )}
          {/* Imputabilité Bégaud — accessible depuis chaque fiche patient */}
          <button
            onClick={onBegaud}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-violet-300 text-violet-700 hover:bg-violet-50 transition-colors"
            title="Calculer l'imputabilité Bégaud pour ce patient"
          >
            🔬 Bégaud
          </button>
          {/* Lien vers détail prescription */}
          <Link
            href={`/prescriptions/${rx.id}`}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Voir fiche →
          </Link>
          {/* Déclarer si alerte */}
          {status === "alerte" && (
            <Link
              href="/dashboard/medecin/nouvelle-declaration"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors"
              style={{ background: "#0F5B57" }}
            >
              Déclarer ⚡
            </Link>
          )}
        </div>
      </div>

      {/* Ligne de symptômes si alerte */}
      {alertCheckins.length > 0 && (
        <div className="bg-red-50 border-t border-red-100 px-5 py-2.5">
          <p className="text-xs text-red-700">
            <span className="font-semibold">Symptômes signalés :</span>{" "}
            {alertCheckins
              .flatMap((c) => c.symptoms ?? [])
              .filter(Boolean)
              .join(", ") || "Voir détail"}
            {alertCheckins.some((c) => c.stopped_treatment) && (
              <span className="ml-2 font-bold">· Traitement arrêté</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

type SortKey = "urgence" | "date" | "nom";
type FilterKey = "tous" | "alerte" | "en_attente" | "repondu" | "termine";

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
    const symptoms = signal.symptoms ?? [];
    let eiMeddraSoc = "";
    for (const s of symptoms) { const soc = symptomToSoc(s); if (soc) { eiMeddraSoc = soc; break; } }
    const symptomsList = symptoms.length ? symptoms.join(", ") : (signal.symptoms_other || "symptômes signalés");
    const prefill = {
      medicamentDCI: rx.drug_dci ?? "",
      medicamentPosologie: rx.drug_dose ?? "",
      medicamentFrequence: rx.drug_frequence ?? "",
      medicamentIndication: rx.indication ?? "",
      medicamentDateDebut: rx.date_debut ?? "",
      patientAge: rx.patient_age ?? "",
      patientSexe: rx.patient_sexe ?? "",
      eiDescription: `Le patient ${rx.patient_initiales} signale : ${symptomsList}, à J${signal.day_offset ?? "?"} du traitement par ${rx.drug_dci}.${signal.stopped_treatment ? " Traitement arrêté par le patient." : ""}`,
      eiMeddraSoc,
      eiDateDebut: signal.responded_at ? signal.responded_at.slice(0, 10) : "",
    };
    try { sessionStorage.setItem("pharmavig_prefill_declaration", JSON.stringify(prefill)); } catch {}
    router.push("/dashboard/medecin/nouvelle-declaration");
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

      {/* ── Signaux actifs (anciennement dans /surveillance) ── */}
      {signals.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-bold text-gray-800">
              {signals.length} signal{signals.length > 1 ? "s" : ""} patient{signals.length > 1 ? "s" : ""} en attente
            </h2>
          </div>
          <div className="space-y-2">
            {signals.map((sig) => {
              // Retrouver la prescription parente
              const rx = prescriptions.find((p) =>
                (checkinMap[p.id] ?? []).some((c) => c.id === sig.id)
              );
              const urgent = sig.severity === "urgent";
              return (
                <div key={sig.id}
                  className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${urgent ? "border-red-300 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {urgent && (
                        <span className="text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">
                          Urgent
                        </span>
                      )}
                      <span className="font-semibold text-gray-900 text-sm">
                        {rx ? `${rx.patient_initiales} — ${rx.drug_dci}` : "Patient"}
                      </span>
                      <span className="text-xs text-gray-500">
                        J{sig.day_offset} · {sig.responded_at ? new Date(sig.responded_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {(sig.symptoms && sig.symptoms.length) ? sig.symptoms.join(", ") : (sig.symptoms_other || "Symptômes signalés")}
                    </p>
                    {sig.stopped_treatment && (
                      <p className="text-xs text-red-600 font-semibold mt-1">
                        ⚠️ Traitement arrêté{sig.stop_reason ? ` — ${sig.stop_reason}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => api.markCheckinSeen(sig.id).then(() => setSignals((prev) => prev.filter((x) => x.id !== sig.id)))}
                      className="text-xs text-gray-500 hover:text-gray-700 underline whitespace-nowrap"
                    >
                      Marquer vu
                    </button>
                    {rx && (
                      <button
                        onClick={() => declareFromSignal(rx, sig)}
                        className="text-xs font-semibold px-3 py-2 rounded-lg text-white whitespace-nowrap transition-colors"
                        style={{ background: "#0F5B57" }}
                      >
                        Évaluer et déclarer ⚡
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Cartes KPI ── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(["alerte", "en_attente", "repondu", "termine"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const count = stats[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(filter === s ? "tous" : s)}
              className={`bg-white border rounded-xl px-4 py-3 text-left transition-all hover:shadow-sm ${
                filter === s ? "ring-2 ring-offset-1" : ""
              } ${s === "alerte" ? "border-red-200" : s === "en_attente" ? "border-amber-200" : s === "repondu" ? "border-emerald-200" : "border-gray-200"}`}
              style={filter === s ? { "--tw-ring-color": s === "alerte" ? "#ef4444" : s === "en_attente" ? "#f59e0b" : s === "repondu" ? "#10b981" : "#9ca3af" } as React.CSSProperties : {}}
            >
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className={`text-xs font-semibold mt-0.5 ${
                s === "alerte" ? "text-red-600" : s === "en_attente" ? "text-amber-600" : s === "repondu" ? "text-emerald-600" : "text-gray-400"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,91,87,0.25)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* En-tête modal */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <p className="font-bold text-gray-900 text-sm">
                  🔬 Imputabilité Bégaud — {begaudRx.patient_initiales}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {begaudRx.drug_dci}{begaudRx.drug_dose ? ` ${begaudRx.drug_dose}` : ""}
                  {begaudRx.indication ? ` · ${begaudRx.indication}` : ""}
                </p>
              </div>
              <button
                onClick={() => setBegaudRx(null)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            {/* Corps : calculateur Bégaud */}
            <div className="px-6 py-4">
              <ImputabiliteBegaud
                onScoreChange={(score) => setBegaudScore(score)}
              />
            </div>

            {/* Pied : score + CTA */}
            {begaudScore && (
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-4 rounded-b-2xl">
                <div className="flex gap-3">
                  {(["Cscore", "Sscore", "Iscore"] as const).map((k) => (
                    <div key={k} className="text-center bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
                      <div className="text-lg font-bold text-violet-700">
                        {k === "Iscore" ? `I${begaudScore[k]}` : begaudScore[k]}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase">{k.replace("score", "")}</div>
                    </div>
                  ))}
                  {begaudScore.isGrave && (
                    <div className="text-center bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      <div className="text-lg font-bold text-red-600">G</div>
                      <div className="text-[10px] text-gray-400 uppercase">Grave</div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    const prefill = {
                      medicamentDCI: begaudRx.drug_dci ?? "",
                      medicamentIndication: begaudRx.indication ?? "",
                      medicamentDateDebut: begaudRx.date_debut ?? "",
                      patientAge: begaudRx.patient_age ?? "",
                      patientSexe: begaudRx.patient_sexe ?? "",
                      imputChronologie: String(begaudScore.Cscore),
                      imputConclusion: `I${begaudScore.Iscore}${begaudScore.isGrave ? "B" : "b"}`,
                    };
                    try { sessionStorage.setItem("pharmavig_prefill_declaration", JSON.stringify(prefill)); } catch {}
                    setBegaudRx(null);
                    router.push("/dashboard/medecin/nouvelle-declaration");
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-colors"
                  style={{ background: "#0F5B57" }}
                >
                  ⚡ Déclarer avec ce score
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </MedecinLayout>
  );
}
