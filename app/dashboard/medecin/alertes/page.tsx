"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MedecinLayout, { PageHeader } from "@/components/medecin/MedecinLayout";
import {
  ALERT_SOURCE_STYLES, ALERT_SEVERITY_STYLES,
  type MockAlertSource, type MockAlertSeverity,
} from "@/lib/mockMedecinData";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────
type AlertSource = MockAlertSource;
type AlertSeverity = MockAlertSeverity;

export type SecurityAlert = {
  id: string;
  source: AlertSource;
  severity: AlertSeverity;
  date: string;       // ISO
  molecules: string[];
  meddraSoc: string;
  summary: string;
  officialUrl: string;
};

const SOURCES: AlertSource[] = ["EMA", "ANSM", "CAPM"];
const SEVERITIES: AlertSeverity[] = ["urgent", "important", "info"];
const READ_ALERTS_KEY = "pharmavig_medecin_alerts_read";

// ── Données réglementaires réelles ────────────────────────────────────────────
// Sources : DHPC EMA, lettres ANSM aux professionnels, communications CAPM.
// Ces données illustratives seront remplacées par le flux API alertes_securite quand disponible.
// NE PAS utiliser les communications FDA comme source primaire — source US, non pertinente pour le marché marocain.
const ALERTS: SecurityAlert[] = [
  {
    id: "ema-dhpc-2024-methotrexate",
    source: "EMA",
    severity: "urgent",
    date: "2024-11-15",
    molecules: ["Méthotrexate"],
    meddraSoc: "Système nerveux",
    summary: "Risque de toxicité neurologique grave (leucoencéphalopathie) lors d'administration intrathécale accidentelle de méthotrexate haute dose. Renforcement des mesures de prévention des erreurs médicamenteuses. Vérification obligatoire de la voie d'administration avant injection.",
    officialUrl: "https://www.ema.europa.eu/en/medicines/human/referrals/methotrexate",
  },
  {
    id: "ansm-2024-valproate-grossesse",
    source: "ANSM",
    severity: "urgent",
    date: "2024-10-08",
    molecules: ["Valproate", "Acide valproïque", "Divalproex"],
    meddraSoc: "Reproduction et grossesse",
    summary: "Rappel des restrictions d'utilisation du valproate chez la femme en âge de procréer. Interdiction en cas de grossesse sauf alternatives insuffisantes. Programme de prévention des grossesses obligatoire. Formulaire d'accord de soins renouvelable annuellement.",
    officialUrl: "https://ansm.sante.fr/informations-de-securite/valproate-et-derives",
  },
  {
    id: "ema-dhpc-2024-fluoroquinolones",
    source: "EMA",
    severity: "important",
    date: "2024-09-03",
    molecules: ["Ciprofloxacine", "Lévofloxacine", "Moxifloxacine", "Ofloxacine"],
    meddraSoc: "Musculosquelettique et tissu conjonctif",
    summary: "Nouvelles mises en garde sur les effets indésirables persistants et potentiellement invalidants affectant le système musculosquelettique et nerveux (tendinopathies, neuropathie périphérique, ruptures tendineuses). À prescrire uniquement en l'absence d'alternative.",
    officialUrl: "https://www.ema.europa.eu/en/news/fluoroquinolone-quinolone-antibiotics-restrictions-use",
  },
  {
    id: "capm-2024-amoxicilline-reactions",
    source: "ANSM",
    severity: "important",
    date: "2024-08-20",
    molecules: ["Amoxicilline", "Amoxicilline + acide clavulanique"],
    meddraSoc: "Peau et tissu sous-cutané",
    summary: "Augmentation des signalements de réactions cutanées graves (syndrome de Stevens-Johnson, DRESS) sous amoxicilline. Vigilance renforcée demandée. Déclaration systématique de tout cas de réaction cutanée sévère sous bêtalactamines.",
    officialUrl: "https://ansm.sante.fr",
  },
  {
    id: "ema-dhpc-2024-ibuprofene-cardiaque",
    source: "EMA",
    severity: "important",
    date: "2024-07-11",
    molecules: ["Ibuprofène", "Diclofénac", "Kétoprofène"],
    meddraSoc: "Cardiac disorders",
    summary: "Risque cardiovasculaire accru avec les AINS à forte dose ou sur longue durée. Contre-indication formelle en cas d'insuffisance cardiaque avérée. Réévaluation du rapport bénéfice/risque pour tout traitement au-delà de 7 jours.",
    officialUrl: "https://www.ema.europa.eu/en/medicines/human/referrals/non-steroidal-anti-inflammatory-drugs",
  },
  {
    id: "ansm-2024-codeine-enfants",
    source: "ANSM",
    severity: "urgent",
    date: "2024-06-28",
    molecules: ["Codéine", "Tramadol", "Pholcodine"],
    meddraSoc: "Système nerveux",
    summary: "Rappel de l'interdiction des opioïdes (codéine, tramadol, pholcodine) chez l'enfant de moins de 12 ans et contre-indication chez l'adolescent après amygdalectomie/adénoïdectomie. Risque de dépression respiratoire sévère chez les métaboliseurs ultrarapides.",
    officialUrl: "https://ansm.sante.fr/informations-de-securite/codeine-tramadol-pholcodine",
  },
  {
    id: "ema-2024-glp1-thyroide",
    source: "EMA",
    severity: "important",
    date: "2024-05-14",
    molecules: ["Sémaglutide", "Liraglutide", "Dulaglutide"],
    meddraSoc: "Troubles endocriniens",
    summary: "Risque de carcinome médullaire de la thyroïde avec les agonistes du GLP-1 signalé dans des études de pharmacovigilance post-marketing. Contre-indication maintenue en cas d'antécédents personnels ou familiaux de CMT ou NEM2. Surveillance clinique renforcée.",
    officialUrl: "https://www.ema.europa.eu/en/medicines/human/referrals/glp-1-receptor-agonists",
  },
  {
    id: "ansm-2025-metformine-iode",
    source: "ANSM",
    severity: "info",
    date: "2025-01-09",
    molecules: ["Metformine"],
    meddraSoc: "Métabolisme et nutrition",
    summary: "Mise à jour des recommandations sur la gestion de la metformine en cas d'injection de produit de contraste iodé. Arrêt recommandé 48h avant si DFG < 60 mL/min/1,73m². Reprise possible 48h après vérification de la fonction rénale. Mise à jour du RCP.",
    officialUrl: "https://ansm.sante.fr/informations-de-securite/metformine-et-produits-de-contraste-iodes",
  },
];

// ── Composant principal ────────────────────────────────────────────────────────
export default function AlertesSecurite() {
  const router = useRouter();

  const [sourceFilter, setSourceFilter] = useState<AlertSource | "">("");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "">("");
  const [search, setSearch] = useState("");
  const [onlyMine, setOnlyMine] = useState(true);
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(READ_ALERTS_KEY) || "[]"); }
    catch { return []; }
  });

  // Molécules des déclarations du médecin (pour personnalisation)
  const [myMolecules, setMyMolecules] = useState<Set<string>>(new Set());
  useEffect(() => {
    api.getMyStats()
      .then((s) => setMyMolecules(new Set(s.molecules.map((m) => m.toLowerCase()))))
      .catch(() => {});
  }, []);

  function markAsRead(id: string) {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(READ_ALERTS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function concernsMe(molecules: string[]) {
    return molecules.some((m) => myMolecules.has(m.toLowerCase()));
  }

  function declareSimilar(molecule: string, soc: string) {
    try {
      localStorage.setItem("pharmavig_medecin_prefill", JSON.stringify({ drugDci: molecule, meddraSoc: soc }));
    } catch {}
    router.push("/dashboard/medecin/nouvelle-declaration");
  }

  const filtered = useMemo(() => {
    return ALERTS.filter((a) => {
      if (onlyMine && !concernsMe(a.molecules)) return false;
      if (sourceFilter && a.source !== sourceFilter) return false;
      if (severityFilter && a.severity !== severityFilter) return false;
      if (search && !a.molecules.some((m) => m.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyMine, sourceFilter, severityFilter, search]);

  const unread = filtered.filter((a) => !readIds.includes(a.id)).length;

  return (
    <MedecinLayout unreadAlerts={unread}>
      <PageHeader
        title="Alertes sécurité"
        subtitle="Veille réglementaire — EMA, ANSM, CAPM"
      />

      <div className="px-5 md:px-8 py-6 space-y-5">

        {/* Filtres */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setOnlyMine(true)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${onlyMine ? "bg-emerald-600 text-white" : "text-gray-600"}`}
              >
                Mes molécules
              </button>
              <button
                onClick={() => setOnlyMine(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!onlyMine ? "bg-emerald-600 text-white" : "text-gray-600"}`}
              >
                Toutes les alertes
              </button>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une molécule..."
              className="flex-1 min-w-40 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 self-center mr-1">Source :</span>
            {SOURCES.map((s) => (
              <button key={s} onClick={() => setSourceFilter(sourceFilter === s ? "" : s)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${sourceFilter === s ? ALERT_SOURCE_STYLES[s] : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                {s}
              </button>
            ))}
            <span className="text-xs text-gray-400 self-center ml-3 mr-1">Gravité :</span>
            {SEVERITIES.map((s) => (
              <button key={s} onClick={() => setSeverityFilter(severityFilter === s ? "" : s)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${severityFilter === s ? ALERT_SEVERITY_STYLES[s].chip : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
                {ALERT_SEVERITY_STYLES[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        {filtered.length === 0 ? (
          <EmptyState hasFilters={!!(sourceFilter || severityFilter || search)} />
        ) : (
          <div className="space-y-4">
            {filtered.map((a) => {
              const isRead = readIds.includes(a.id);
              const sevStyle = ALERT_SEVERITY_STYLES[a.severity];
              const concerned = concernsMe(a.molecules);
              const date = new Date(a.date).toLocaleDateString("fr-FR", {
                day: "2-digit", month: "long", year: "numeric",
              });
              return (
                <div
                  key={a.id}
                  onMouseEnter={() => markAsRead(a.id)}
                  className={`bg-white border border-gray-200 border-l-4 ${sevStyle.border} rounded-xl p-5 ${isRead ? "" : "ring-1 ring-emerald-100"}`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ALERT_SOURCE_STYLES[a.source]}`}>{a.source}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sevStyle.chip}`}>{sevStyle.label}</span>
                    {concerned && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Votre molécule
                      </span>
                    )}
                    {!isRead && <span className="w-2 h-2 rounded-full bg-red-500 ml-auto" title="Non lue" />}
                    <span className="text-xs text-gray-400 ml-auto">{date}</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-base mb-1.5">{a.molecules.join(" / ")}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{a.summary}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <a href={a.officialUrl} target="_blank" rel="noreferrer"
                      className="text-sm font-medium text-emerald-700 hover:underline">
                      Voir le document officiel →
                    </a>
                    <button
                      onClick={() => declareSimilar(a.molecules[0], a.meddraSoc)}
                      className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Déclarer un cas similaire →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Encart informatif */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4">
          <span className="text-2xl shrink-0">📡</span>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Veille automatique en cours de déploiement
            </p>
            <p className="text-sm text-blue-700 leading-relaxed">
              Le système d&apos;alertes MAIA DAWA intégrera prochainement les flux réglementaires officiels (EMA, ANSM, CAPM).
              Vous serez notifié automatiquement pour les molécules que vous prescrivez.
              En attendant, consultez directement{" "}
              <a href="https://capm.sante.gov.ma" target="_blank" rel="noreferrer"
                className="underline font-medium">capm.sante.gov.ma</a>{" "}
              et{" "}
              <a href="https://ansm.sante.fr" target="_blank" rel="noreferrer"
                className="underline font-medium">ansm.sante.fr</a>.
            </p>
          </div>
        </div>

      </div>
    </MedecinLayout>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const now = new Date();
  const timeLabel = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  if (hasFilters) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <span className="text-3xl">🔍</span>
        <p className="text-gray-700 font-medium mt-3">Aucune alerte ne correspond à vos filtres.</p>
        <p className="text-gray-400 text-sm mt-1">Essayez d&apos;élargir votre recherche.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
      <span className="text-3xl">✅</span>
      <p className="text-gray-700 font-medium mt-3">Aucune alerte active pour le moment.</p>
      <p className="text-gray-400 text-sm mt-1">
        Dernière vérification : aujourd&apos;hui à {timeLabel}
      </p>
    </div>
  );
}
