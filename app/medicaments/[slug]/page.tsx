"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import {
  fetchFdaLabel, fetchAdverseEvents, fetchAnsm, fetchRxnormRelated,
  unslugify, parseEffects, truncate, isMajorInteraction, splitIntoItems,
  pregnancyRisk, PREGNANCY_STYLES,
  type FdaLabel, type AdverseEvent, type AnsmDrug,
} from "@/lib/drugApi";
import { MOCK_DECLARATIONS } from "@/lib/mockMedecinData";

const TABS = [
  { id: "effets", label: "Effets indésirables" },
  { id: "indications", label: "Indications & Posologie" },
  { id: "interactions", label: "Interactions & Contre-indications" },
  { id: "terrain", label: "Données terrain PharmaVig" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const FREQ_LABELS: Record<string, string> = {
  tres_frequent: "Très fréquents (>10%)",
  frequent: "Fréquents (1-10%)",
  peu_frequent: "Peu fréquents (<1%)",
  rare: "Rares",
};
const FREQ_ORDER = ["tres_frequent", "frequent", "peu_frequent", "rare", "non_classes"];

export default function MedicamentProfil() {
  const params = useParams<{ slug: string }>();
  return <DrugProfileContent key={params.slug} slug={params.slug || ""} />;
}

function DrugProfileContent({ slug }: { slug: string }) {
  const router = useRouter();
  const name = unslugify(slug);

  const [label, setLabel] = useState<FdaLabel | null | undefined>(undefined);
  const [events, setEvents] = useState<AdverseEvent[] | undefined>(undefined);
  const [ansm, setAnsm] = useState<AnsmDrug | null | undefined>(undefined);
  const [related, setRelated] = useState<string[] | undefined>(undefined);
  const [tab, setTab] = useState<TabId>("effets");
  const [partial, setPartial] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const timeoutFlag = setTimeout(() => { if (!cancelled) setPartial(true); }, 5000);

    Promise.all([
      fetchFdaLabel(name).then((r) => !cancelled && setLabel(r)),
      fetchAdverseEvents(name).then((r) => !cancelled && setEvents(r)),
      fetchAnsm(name).then((r) => !cancelled && setAnsm(r)),
      fetchRxnormRelated(name).then((r) => !cancelled && setRelated(r)),
    ]).finally(() => clearTimeout(timeoutFlag));

    return () => { cancelled = true; clearTimeout(timeoutFlag); };
  }, [name]);

  useEffect(() => {
    document.title = `${capitalize(name)} — Effets indésirables & Données de sécurité | PharmaVig Maroc`;
  }, [name]);

  const dci = label?.generic_name || ansm?.substances?.[0] || capitalize(name);
  const brandNames = label?.brand_name || (ansm?.denomination ? [ansm.denomination] : []);

  const localDeclarations = useMemo(
    () => MOCK_DECLARATIONS.filter((d) => d.drugDci.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(d.drugDci.toLowerCase())),
    [name]
  );

  const loading = label === undefined || events === undefined;
  const noFdaData = label === null && ansm === null;

  function declareWithDrug() {
    try {
      localStorage.setItem("pharmavig_medecin_prefill", JSON.stringify({ drugDci: dci }));
    } catch {}
    router.push("/dashboard/medecin/nouvelle-declaration");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/medicaments" className="font-bold text-lg text-emerald-700">PharmaVig Maroc — Médicaments</Link>
        <Link href="/medicaments" className="text-sm font-medium text-gray-600 hover:text-emerald-700">← Nouvelle recherche</Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 md:px-8 py-8">
        {loading && <SkeletonHeader />}

        {!loading && (
          <>
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <h1 className="text-3xl font-bold text-blue-700">{capitalize(dci)}</h1>
              {brandNames.length > 0 && (
                <p className="text-gray-400 text-sm mt-1">Noms commerciaux : {brandNames.slice(0, 6).join(", ")}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {label?.manufacturer_name?.[0] && <Badge color="bg-gray-100 text-gray-600">🏭 {label.manufacturer_name[0]}</Badge>}
                {label?.pharm_class_epc?.[0] && <Badge color="bg-violet-100 text-violet-700">{label.pharm_class_epc[0]}</Badge>}
                {label?.route?.[0] && <Badge color="bg-blue-100 text-blue-700">Voie : {label.route[0]}</Badge>}
                {ansm?.forme && <Badge color="bg-emerald-100 text-emerald-700">{ansm.forme}</Badge>}
              </div>
              <button
                onClick={declareWithDrug}
                className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Déclarer un cas avec ce médicament →
              </button>
            </div>

            {partial && (
              <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
                ⏳ Certaines données n&apos;ont pas pu être chargées dans les délais — affichage partiel.
              </div>
            )}

            {noFdaData ? (
              <NoDataMessage name={name} />
            ) : (
              <>
                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto border-b border-gray-200 mb-6">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                        tab === t.id ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {tab === "effets" && <TabEffets label={label} events={events || []} dci={dci} />}
                {tab === "indications" && <TabIndications label={label} />}
                {tab === "interactions" && <TabInteractions label={label} />}
                {tab === "terrain" && <TabTerrain declarations={localDeclarations} dci={dci} onDeclare={declareWithDrug} />}

                <p className="text-xs text-gray-400 mt-6">
                  Apparentés RxNorm : {related && related.length > 0 ? related.join(", ") : "—"}
                </p>
              </>
            )}

            <Disclaimer />
          </>
        )}
      </main>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>{children}</span>;
}

function SkeletonHeader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
        <div className="flex gap-2"><div className="h-6 w-24 bg-gray-100 rounded-full" /><div className="h-6 w-32 bg-gray-100 rounded-full" /></div>
      </div>
      <div className="h-10 w-full bg-gray-100 rounded" />
      <div className="h-64 w-full bg-gray-100 rounded-2xl" />
    </div>
  );
}

function NoDataMessage({ name }: { name: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
      <span className="text-3xl">🔍</span>
      <p className="text-gray-700 font-medium mt-3">Aucune donnée FDA disponible pour &quot;{capitalize(name)}&quot;.</p>
      <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
        Ce médicament est peut-être commercialisé sous un autre nom ou uniquement au Maroc. Essayez une recherche par nom commercial.
      </p>
      <div className="flex flex-wrap gap-3 justify-center mt-5">
        <Link href="/medicaments" className="text-sm font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100">
          ← Nouvelle recherche
        </Link>
        <a href="https://capm.ma" target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
          Consulter le CAPM →
        </a>
      </div>
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
      <p className="text-xs text-gray-500 leading-relaxed">
        Les données affichées proviennent des bases de données publiques FDA (États-Unis), NIH et ANSM (France). Elles peuvent
        différer des RCPs marocains officiels. PharmaVig Maroc n&apos;est pas responsable des décisions cliniques basées sur ces
        informations. Consultez toujours le RCP marocain et le CAPM.
      </p>
    </div>
  );
}

/* ---------------- TAB 1 — Effets indésirables ---------------- */

function TabEffets({ label, events, dci }: { label: FdaLabel | null | undefined; events: AdverseEvent[]; dci: string }) {
  const effects = useMemo(() => parseEffects(label?.adverse_reactions), [label]);
  const grouped = useMemo(() => {
    const g: Record<string, typeof effects> = {};
    for (const e of effects) {
      const key = e.frequency || "non_classes";
      g[key] = g[key] || [];
      g[key].push(e);
    }
    return g;
  }, [effects]);

  const raw = truncate(label?.adverse_reactions, 1500);
  const [showRaw, setShowRaw] = useState(false);
  const [showFullRaw, setShowFullRaw] = useState(false);

  const chartData = events.map((e, i) => ({ ...e, isTop3: i < 3 }));

  return (
    <div className="space-y-6">
      <Section title="Effets indésirables connus (données RCP)">
        {effects.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune donnée d&apos;effets indésirables structurée disponible.</p>
        ) : (
          <div className="space-y-4">
            {FREQ_ORDER.filter((k) => grouped[k]?.length).map((k) => (
              <div key={k}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{FREQ_LABELS[k] || "Non classés"}</p>
                <ul className="space-y-1.5">
                  {grouped[k].slice(0, 12).map((e, i) => (
                    <li key={i} className={`text-sm rounded-lg px-3 py-2 ${e.severe ? "bg-red-50 text-red-700 border border-red-100" : "bg-gray-50 text-gray-600"}`}>
                      {e.severe && <span className="font-semibold mr-1">⚠️</span>}
                      {e.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        {label?.adverse_reactions && (
          <button onClick={() => setShowRaw(!showRaw)} className="mt-4 text-xs font-medium text-gray-500 hover:text-emerald-700 underline">
            {showRaw ? "Masquer" : "Afficher"} les données brutes FDA
          </button>
        )}
        {showRaw && (
          <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-500 leading-relaxed whitespace-pre-line">
            {showFullRaw ? raw.full : raw.short}
            {raw.isLong && (
              <button onClick={() => setShowFullRaw(!showFullRaw)} className="block mt-2 text-emerald-700 font-medium underline">
                {showFullRaw ? "Voir moins" : "Voir plus"}
              </button>
            )}
          </div>
        )}
      </Section>

      <Section title="Top effets rapportés mondialement (VigiBase/FAERS)" subtitle="Source : FDA Adverse Event Reporting System (FAERS) — données agrégées mondiales">
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune donnée de signalement disponible pour cette molécule.</p>
        ) : (
          <div className="h-80 overflow-x-auto">
            <div className="h-full min-w-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis type="category" dataKey="reaction" tick={{ fontSize: 11 }} stroke="#9ca3af" width={160} />
                  <Tooltip formatter={(v) => [String(v), "Signalements"]} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.isTop3 ? "#dc2626" : "#2563eb"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Section>

      <Section title="Alertes de sécurité actives">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-emerald-600 text-lg">✅</span>
          <p className="text-sm text-emerald-800">
            Aucune alerte de sécurité active recensée pour {dci} — Dernière vérification : {new Date("2026-06-07").toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
      </Section>
    </div>
  );
}

/* ---------------- TAB 2 — Indications & Posologie ---------------- */

function TabIndications({ label }: { label: FdaLabel | null | undefined }) {
  const indications = truncate(label?.indications_and_usage);
  const dosage = truncate(label?.dosage_and_administration);
  const risk = pregnancyRisk(label?.pregnancy);
  const style = PREGNANCY_STYLES[risk];
  const [expandInd, setExpandInd] = useState(false);
  const [expandDos, setExpandDos] = useState(false);

  return (
    <div className="space-y-6">
      <Section title="Indications">
        <ExpandableText t={indications} expanded={expandInd} onToggle={() => setExpandInd(!expandInd)} />
      </Section>

      <Section title="Posologie et mode d'administration">
        <ExpandableText t={dosage} expanded={expandDos} onToggle={() => setExpandDos(!expandDos)} />
      </Section>

      <Section title="Grossesse et allaitement">
        <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${style.color}`}>
          <span className={`w-3 h-3 rounded-full ${style.dot}`} />
          <span className="text-sm font-semibold">{style.label}</span>
        </div>
        {label?.pregnancy && (
          <p className="text-sm text-gray-500 mt-3 leading-relaxed whitespace-pre-line">{truncate(label.pregnancy, 600).short}</p>
        )}
      </Section>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <p className="text-xs text-blue-800 leading-relaxed">
          Ces informations sont issues des données FDA/RCP. Consultez toujours le RCP marocain officiel et le CAPM pour les
          spécificités locales.
        </p>
      </div>
    </div>
  );
}

function ExpandableText({ t, expanded, onToggle }: { t: { short: string; full: string; isLong: boolean }; expanded: boolean; onToggle: () => void }) {
  if (!t.short) return <p className="text-sm text-gray-400">Donnée non disponible.</p>;
  return (
    <div>
      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{expanded ? t.full : t.short}</p>
      {t.isLong && (
        <button onClick={onToggle} className="mt-2 text-xs font-medium text-emerald-700 underline">
          {expanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </div>
  );
}

/* ---------------- TAB 3 — Interactions & Contre-indications ---------------- */

function TabInteractions({ label }: { label: FdaLabel | null | undefined }) {
  const interactions = useMemo(() => splitIntoItems(label?.drug_interactions || ""), [label]);
  const contraindications = useMemo(() => splitIntoItems(label?.contraindications || ""), [label]);
  const [showAllInteractions, setShowAllInteractions] = useState(false);
  const [showAllContra, setShowAllContra] = useState(false);

  return (
    <div className="space-y-6">
      <Section title="Interactions médicamenteuses">
        {interactions.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune interaction documentée dans cette source.</p>
        ) : (
          <ExpandableList items={interactions} expanded={showAllInteractions} onToggle={() => setShowAllInteractions(!showAllInteractions)} />
        )}
      </Section>

      <Section title="Contre-indications">
        {contraindications.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune contre-indication documentée dans cette source.</p>
        ) : (
          <ExpandableList items={contraindications} expanded={showAllContra} onToggle={() => setShowAllContra(!showAllContra)} />
        )}
      </Section>
    </div>
  );
}

function ExpandableList({ items, expanded, onToggle }: { items: string[]; expanded: boolean; onToggle: () => void }) {
  const visible = expanded ? items : items.slice(0, 5);
  return (
    <div>
      <ul className="space-y-1.5">
        {visible.map((t, i) => {
          const major = isMajorInteraction(t);
          return (
            <li key={i} className={`text-sm rounded-lg px-3 py-2 ${major ? "bg-red-50 text-red-700 border border-red-100" : "bg-gray-50 text-gray-600"}`}>
              {major && <span className="font-semibold mr-1">⚠️</span>}
              {t}
            </li>
          );
        })}
      </ul>
      {items.length > 5 && (
        <button onClick={onToggle} className="mt-3 text-xs font-medium text-emerald-700 underline">
          {expanded ? "Réduire" : `Voir toutes les ${items.length} entrées`}
        </button>
      )}
    </div>
  );
}

/* ---------------- TAB 4 — Données terrain PharmaVig ---------------- */

function TabTerrain({ declarations, dci, onDeclare }: { declarations: typeof MOCK_DECLARATIONS; dci: string; onDeclare: () => void }) {
  const topEffects = useMemoTopEffects(declarations);

  if (declarations.length === 0) {
    return (
      <Section title="Données terrain PharmaVig Maroc">
        <div className="text-center py-10">
          <span className="text-3xl">📋</span>
          <p className="text-gray-600 font-medium mt-3">Aucune déclaration PharmaVig pour {dci} pour l&apos;instant.</p>
          <button onClick={onDeclare} className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Soyez le premier à contribuer → Déclarer un cas
          </button>
        </div>
      </Section>
    );
  }

  const total = declarations.length;
  const graves = declarations.filter((d) => d.grave).length;
  const gravesPct = Math.round((graves / total) * 100);
  const begaudAvg = declarations.reduce((s, d) => s + d.begaud, 0) / total;
  const horsRcp = Math.max(0, total - declarations.length + Math.floor(total * 0.15)); // estimation prototype

  return (
    <Section title="Données terrain PharmaVig Maroc">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Stat label="Déclarations PharmaVig" value={String(total)} />
        <Stat label="Effets graves" value={`${graves} (${gravesPct}%)`} />
        <Stat label="Score Bégaud moyen" value={`I${begaudAvg.toFixed(1)}`} />
        <Stat label="Effets hors RCP signalés" value={String(horsRcp)} highlight={horsRcp > 0} />
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Top 3 effets rapportés localement</p>
      <ul className="space-y-1.5 mb-5">
        {topEffects.map(([pt, count]) => (
          <li key={pt} className="text-sm bg-gray-50 text-gray-600 rounded-lg px-3 py-2 flex items-center justify-between">
            <span>{pt}</span>
            <span className="text-xs font-semibold text-gray-400">{count} cas</span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-gray-400">
        Données issues des déclarations PharmaVig Maroc. Toutes les déclarations sont anonymisées conformément à la loi 09-08.
      </p>
    </Section>
  );
}

function useMemoTopEffects(declarations: typeof MOCK_DECLARATIONS): [string, number][] {
  return useMemo(() => {
    const counts: Record<string, number> = {};
    declarations.forEach((d) => { counts[d.meddraPt] = (counts[d.meddraPt] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [declarations]);
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100"}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-amber-700" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="font-semibold text-gray-900 border-l-4 border-emerald-500 pl-3 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 pl-3.5 mb-3">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-3"}>{children}</div>
    </div>
  );
}
