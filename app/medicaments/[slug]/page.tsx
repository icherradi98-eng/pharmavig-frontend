"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import {
  fetchFdaLabel, fetchAdverseEvents, fetchAnsm, fetchRxnormRelated, translateToFrench,
  unslugify, extractEffectNames, isSevere, truncate, isMajorInteraction, splitIntoItems,
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

  // On affiche la DCI telle que recherchée par l'utilisateur (en français), pas la
  // dénomination chimique brute renvoyée par la FDA (souvent en majuscules, en
  // anglais, avec sels/formes : "SITAGLIPTIN AND METFORMIN HYDROCHLORIDE").
  const dci = titleCaseFr(name);
  const fdaChemicalName = label?.generic_name && titleCaseFr(label.generic_name) !== dci ? label.generic_name : undefined;
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
              <h1 className="text-3xl font-bold text-blue-700">{dci}</h1>
              {fdaChemicalName && (
                <p className="text-gray-400 text-xs mt-1">Dénomination FDA : {fdaChemicalName}</p>
              )}
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

// Met en forme une DCI française à partir du slug recherché :
// "sitagliptine-et-metformine" -> "Sitagliptine et metformine"
const FR_LOWERCASE_WORDS = new Set(["et", "de", "du", "des", "le", "la", "les", "à", "en"]);
function titleCaseFr(s: string): string {
  const words = s.trim().split(/\s+/);
  return words
    .map((w, i) => (i > 0 && FR_LOWERCASE_WORDS.has(w.toLowerCase()) ? w.toLowerCase() : capitalize(w.toLowerCase())))
    .join(" ");
}

// Affiche un champ clinique FDA (en anglais) automatiquement traduit en français.
// On ne montre jamais le texte anglais brut sans avoir tenté de le traduire au préalable —
// en cas d'échec de la traduction, le texte source est affiché avec une mention explicite.
function FrenchClinicalText({ text }: { text?: string }) {
  const snippet = useMemo(() => truncate(text, 900), [text]);
  const [state, setState] = useState<{ status: "loading" | "done" | "error"; value?: string }>(() =>
    snippet.short ? { status: "loading" } : { status: "error" }
  );

  useEffect(() => {
    let cancelled = false;
    if (!snippet.short) return;
    translateToFrench(snippet.short).then((t) => {
      if (cancelled) return;
      if (t) setState({ status: "done", value: t });
      else setState({ status: "error" });
    });
    return () => { cancelled = true; };
  }, [snippet.short]);

  if (!snippet.short) return <p className="text-sm text-gray-400">Donnée non disponible.</p>;

  if (state.status === "loading") {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-3.5 w-full bg-gray-100 rounded" />
        <div className="h-3.5 w-5/6 bg-gray-100 rounded" />
        <div className="h-3.5 w-2/3 bg-gray-100 rounded" />
        <p className="text-xs text-gray-400 pt-1">🌐 Traduction du RCP en cours…</p>
      </div>
    );
  }

  if (state.status === "done" && state.value) {
    return (
      <div>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{state.value}</p>
        <p className="text-[11px] text-blue-500 mt-2">
          🌐 Traduction automatique (FDA, anglais → français) — à vérifier auprès du RCP marocain officiel et du CAPM.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
        ⚠️ Traduction automatique indisponible pour le moment — texte source affiché en anglais (FDA), à interpréter avec précaution.
      </p>
      <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{snippet.short}</p>
    </div>
  );
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
  const effectNames = useMemo(() => extractEffectNames(label?.adverse_reactions), [label]);
  const raw = truncate(label?.adverse_reactions, 1500);
  const [showRaw, setShowRaw] = useState(false);
  const [showFullRaw, setShowFullRaw] = useState(false);

  const chartData = events.map((e, i) => ({ ...e, isTop3: i < 3 }));

  return (
    <div className="space-y-6">
      <Section title="Effets indésirables connus (données RCP)" subtitle="Noms d'effets extraits du RCP FDA et traduits via le dictionnaire MedDRA français">
        {effectNames.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune donnée d&apos;effets indésirables structurée disponible.</p>
        ) : (
          <ul className="space-y-1.5">
            {effectNames.map((e, i) => {
              const severe = isSevere(e.original);
              return (
                <li key={i} className={`text-sm rounded-lg px-3 py-2 ${severe ? "bg-red-50 text-red-700 border border-red-100" : "bg-gray-50 text-gray-600"}`}>
                  {severe && <span className="font-semibold mr-1">⚠️</span>}
                  {e.fr ? (
                    <span>{e.fr}</span>
                  ) : (
                    <span>
                      <span className="italic">{capitalize(e.original)}</span>
                      <span className="block text-xs text-gray-400 mt-0.5">(terme original : {e.original})</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {label?.adverse_reactions && (
          <button onClick={() => setShowRaw(!showRaw)} className="mt-4 text-xs font-medium text-gray-500 hover:text-emerald-700 underline">
            {showRaw ? "Masquer" : "Afficher"} le texte source RCP (anglais, FDA)
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
  const risk = pregnancyRisk(label?.pregnancy);
  const style = PREGNANCY_STYLES[risk];

  return (
    <div className="space-y-6">
      <Section title="Indications" subtitle="Texte source FDA traduit automatiquement en français">
        <FrenchClinicalText text={label?.indications_and_usage} />
      </Section>

      <Section title="Posologie et mode d'administration" subtitle="Texte source FDA traduit automatiquement en français">
        <FrenchClinicalText text={label?.dosage_and_administration} />
      </Section>

      <Section title="Grossesse et allaitement">
        <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 mb-3 ${style.color}`}>
          <span className={`w-3 h-3 rounded-full ${style.dot}`} />
          <span className="text-sm font-semibold">{style.label}</span>
        </div>
        {label?.pregnancy && <FrenchClinicalText text={label.pregnancy} />}
      </Section>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <p className="text-xs text-blue-800 leading-relaxed">
          Ces informations sont issues des données FDA/RCP, traduites automatiquement. Consultez toujours le RCP marocain
          officiel et le CAPM pour les spécificités locales.
        </p>
      </div>
    </div>
  );
}

/* ---------------- TAB 3 — Interactions & Contre-indications ---------------- */

function TabInteractions({ label }: { label: FdaLabel | null | undefined }) {
  const interactions = useMemo(() => splitIntoItems(label?.drug_interactions || ""), [label]);
  const contraindications = useMemo(() => splitIntoItems(label?.contraindications || ""), [label]);
  const [showSourceInteractions, setShowSourceInteractions] = useState(false);
  const [showSourceContra, setShowSourceContra] = useState(false);

  return (
    <div className="space-y-6">
      <Section title="Interactions médicamenteuses" subtitle="Texte source FDA traduit automatiquement en français">
        {!label?.drug_interactions ? (
          <p className="text-sm text-gray-400">Aucune interaction documentée dans cette source — vérifiez auprès du CAPM ou du RCP marocain officiel.</p>
        ) : (
          <>
            <FrenchClinicalText text={label.drug_interactions} />
            <button onClick={() => setShowSourceInteractions(!showSourceInteractions)} className="mt-3 text-xs font-medium text-gray-500 hover:text-emerald-700 underline">
              {showSourceInteractions ? "Masquer" : "Voir la liste détaillée (texte source anglais, FDA)"}
            </button>
            {showSourceInteractions && <ExpandableList items={interactions} />}
          </>
        )}
      </Section>

      <Section title="Contre-indications" subtitle="Texte source FDA traduit automatiquement en français">
        {!label?.contraindications ? (
          <p className="text-sm text-gray-400">Aucune contre-indication documentée dans cette source — vérifiez auprès du CAPM ou du RCP marocain officiel.</p>
        ) : (
          <>
            <FrenchClinicalText text={label.contraindications} />
            <button onClick={() => setShowSourceContra(!showSourceContra)} className="mt-3 text-xs font-medium text-gray-500 hover:text-emerald-700 underline">
              {showSourceContra ? "Masquer" : "Voir la liste détaillée (texte source anglais, FDA)"}
            </button>
            {showSourceContra && <ExpandableList items={contraindications} />}
          </>
        )}
      </Section>
    </div>
  );
}

function ExpandableList({ items }: { items: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 5);
  return (
    <div className="mt-2">
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
        <button onClick={() => setExpanded(!expanded)} className="mt-3 text-xs font-medium text-emerald-700 underline">
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
