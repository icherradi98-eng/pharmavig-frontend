import Link from "next/link";
import { slugify } from "@/lib/drugApi";
import type { BdpmDrug } from "@/lib/drugApi";
import type { TerrainOut } from "@/lib/api";
import type { ProductView } from "@/lib/referentiel/index";
import type { AlternativeProduct } from "@/lib/referentiel/clinical";
import type { ClinicalMonograph } from "@/lib/referentiel/types";
import type { Inconsistency } from "@/lib/referentiel/inconsistencies";
import { PRODUCT_TYPE_LABELS, CLINICAL_SECTIONS } from "../_constants";
import { Section, DataRow, Stat, BdpmExternalLinks } from "./ui";
import { EmptyState, NotProvided } from "./EmptyState";
import { TONE_STYLES, CombinationBadge } from "./badges";
import { SourceTraceabilityAccordion } from "./DataQualityBanner";

// ═════════════════════════════════════════════════════════════════════════════
// TAB 1 — Référentiel Maroc
// ═════════════════════════════════════════════════════════════════════════════

export function TabReferentiel({
  view, alternatives, inconsistencies,
}: {
  view: ProductView | null;
  alternatives: AlternativeProduct[];
  inconsistencies: Inconsistency[];
}) {
  if (!view) {
    return (
      <EmptyState
        icon={<span className="text-xl">🗂️</span>}
        title="Médicament non encore référencé dans la base Maroc"
        description="Le référentiel est en construction (priorité aux médicaments les plus utilisés). Pour vérifier la disponibilité, consultez un pharmacien ou le DMP (sante.gov.ma)."
        action={
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/medicaments" className="text-sm font-medium text-petrol border border-petrol/20 bg-petrol/5 px-4 py-2 rounded-lg hover:bg-petrol/10">← Nouvelle recherche</Link>
            <a href="https://dmp.sante.gov.ma" target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">DMP Maroc →</a>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <ProductSummaryCard view={view} />
      <AlternativesCard alternatives={alternatives} />
      <SourceTraceabilityAccordion view={view} inconsistencies={inconsistencies} />
    </div>
  );
}

function ProductSummaryCard({ view }: { view: ProductView }) {
  const { product, presentation, substances } = view;
  return (
    <Section title="Résumé produit">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <DataRow label="Marque" value={product.brand_name} />
        <DataRow label="Type produit" value={PRODUCT_TYPE_LABELS[product.product_type] ?? product.product_type} />
        <DataRow label="Laboratoire" value={product.lab_name} />
        {presentation?.pharmaceutical_form && <DataRow label="Forme" value={presentation.pharmaceutical_form} />}
        {presentation?.strength && <DataRow label="Dosage" value={`${presentation.strength} ${presentation.unit ?? ""}`.trim()} />}
        {presentation?.route && <DataRow label="Voie" value={presentation.route} />}
        {presentation?.packaging && <DataRow label="Conditionnement" value={presentation.packaging} />}
        {presentation?.ppv != null && <DataRow label="Prix public" value={`${presentation.ppv} MAD`} />}
        {presentation?.hospital_price != null && <DataRow label="Prix hôpital" value={`${presentation.hospital_price} MAD`} />}
        {presentation?.reimbursement_status && <DataRow label="Remboursement" value={presentation.reimbursement_status} />}
        {presentation?.prescription_conditions && <DataRow label="Conditions de prescription" value={presentation.prescription_conditions} />}
      </dl>

      {substances.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Substances actives</p>
          <div className="flex flex-wrap gap-2">
            {substances.map(({ substance, link }) => (
              <span key={link.substance_id} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-lg bg-petrol/5 text-petrol border border-petrol/15">
                {substance?.dci_fr ?? link.substance_id}
                {link.dosage && <span className="text-xs text-gray-400">{link.dosage} {link.unit}</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Alternatives au Maroc (chips propres, dédoublonnées à l'affichage) ────────
function AlternativesCard({ alternatives }: { alternatives: AlternativeProduct[] }) {
  // Dédoublonnage d'AFFICHAGE uniquement (la donnée n'est pas modifiée).
  const seen = new Set<string>();
  const unique = alternatives.filter((a) => {
    const k = a.product.brand_name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  if (unique.length === 0) {
    return (
      <Section title="Alternatives au Maroc">
        <EmptyState compact title="Aucune alternative identifiée pour l'instant" description="Les spécialités partageant la même substance active apparaîtront ici." />
      </Section>
    );
  }

  return (
    <Section title="Alternatives au Maroc" subtitle="Spécialités partageant la même substance active">
      <div className="flex flex-wrap gap-2">
        {unique.slice(0, 24).map((alt) => (
          <Link
            key={alt.product.id}
            href={`/medicaments/${slugify(alt.dci.split(" / ")[0] || alt.product.brand_name)}`}
            className="text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:border-petrol/40 hover:text-petrol transition-colors"
          >
            {alt.product.brand_name}
          </Link>
        ))}
      </div>
      {unique.length > 24 && <p className="text-xs text-gray-400 mt-2">+ {unique.length - 24} autre{unique.length - 24 > 1 ? "s" : ""}</p>}
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 2 — Synthèse clinique
// ═════════════════════════════════════════════════════════════════════════════

export function TabClinique({
  monograph, substanceNames, dciSlug, bdpm,
}: {
  monograph: ClinicalMonograph | null;
  substanceNames: string[];
  dciSlug: string;
  bdpm: BdpmDrug | null | undefined;
}) {
  const isCombination = substanceNames.length > 1;

  return (
    <div className="space-y-4">
      {/* Notice médicament combiné */}
      {isCombination && (
        <CombinationDrugNotice substanceNames={substanceNames} coveredBy={monograph?.dci} />
      )}

      {!monograph ? (
        <EmptyState
          icon={<span className="text-xl">🏗️</span>}
          title="Synthèse clinique en construction"
          description="Le contenu clinique (indications, posologie, contre-indications…) sera ajouté progressivement puis validé médicalement. En attendant, consultez le RCP officiel."
          action={<BdpmExternalLinks className="justify-center" />}
        />
      ) : (
        <>
          {/* Statut éditorial — wording professionnel (pas « Généré par IA ») */}
          {monograph.status !== "published" && (
            <div className="rounded-xl px-4 py-2.5 text-xs flex items-center gap-2" style={{ background: "rgba(15,91,87,0.05)", border: "1px solid rgba(15,91,87,0.15)", color: "#0a3f3c" }}>
              <span>📝</span>
              <span><strong>Contenu structuré — validation médicale requise.</strong> Synthèse à valider par un médecin puis un pharmacien.</span>
            </div>
          )}

          {/* Sections cliniques (structure fixe, colorées par niveau de risque) */}
          <div className="space-y-3">
            {CLINICAL_SECTIONS.map((sec) => {
              const value = sec.field ? (monograph[sec.field] as string | null) : null;
              const emptyText = sec.title === "À retenir en pratique"
                ? "Résumé pratique non disponible pour l'instant."
                : null;
              return <ClinicalSectionCard key={sec.title} title={sec.title} tone={sec.tone} value={value} emptyText={emptyText} />;
            })}
          </div>

          {/* Sources (section O) */}
          <Section title="Sources et traçabilité">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
              <DataRow label="Source" value={monograph.source_name} />
              <DataRow label="Version" value={monograph.version} />
              <DataRow label="Statut" value={monograph.status === "published" ? "Validé · publié" : "À valider"} />
              <DataRow label="Revu par" value={monograph.reviewed_by ?? "Non revu"} />
            </dl>
            <div className="mt-3"><BdpmExternalLinks /></div>
            {bdpm && bdpm.match?.status === "accepted" && bdpm.denomination && (
              <p className="text-[11px] text-gray-400 mt-2">Référence externe BDPM (France) : {bdpm.denomination}.</p>
            )}
          </Section>

          {/* Note de bas — UNE seule fois */}
          <p className="text-xs text-gray-400 text-center px-4">
            Cette synthèse est une aide à la lecture et ne remplace pas le RCP officiel.
          </p>
        </>
      )}

      {monograph && (
        <div className="text-center">
          <Link href={`/referentiel/dci/${dciSlug}`} className="text-sm font-semibold text-petrol hover:underline">
            Ouvrir la monographie complète →
          </Link>
        </div>
      )}
    </div>
  );
}

function ClinicalSectionCard({ title, tone, value, emptyText }: { title: string; tone: keyof typeof TONE_STYLES; value: string | null; emptyText: string | null }) {
  const s = TONE_STYLES[tone];
  return (
    <div className="bg-white rounded-xl p-4" style={{ border: `1px solid ${s.accent}` }}>
      <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: s.titleColor }}>{title}</p>
      {value
        ? <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{value}</p>
        : emptyText
          ? <p className="text-sm text-gray-400">{emptyText}</p>
          : <NotProvided />}
    </div>
  );
}

function CombinationDrugNotice({ substanceNames, coveredBy }: { substanceNames: string[]; coveredBy?: string }) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: "rgba(15,91,87,0.05)", border: "1px solid rgba(15,91,87,0.18)" }}>
      <div className="flex items-center gap-2 mb-1">
        <CombinationBadge />
        <span className="text-sm font-semibold" style={{ color: "#0a3f3c" }}>Médicament combiné</span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "#0a3f3c" }}>
        Ce médicament contient plusieurs substances actives : {substanceNames.join(", ")}.
        {coveredBy
          ? ` Synthèse disponible pour : ${coveredBy}. Synthèse complète de l'association à compléter.`
          : " Synthèse complète de l'association à compléter."}
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 3 — Données terrain MAI DAWA
// ═════════════════════════════════════════════════════════════════════════════

export function TabTerrain({ terrain, dci, onDeclare }: { terrain: TerrainOut | null | undefined; dci: string; onDeclare: () => void }) {
  if (terrain === undefined) {
    return (
      <Section title="Données terrain MAI DAWA">
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-petrol border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Chargement des données terrain…</p>
        </div>
      </Section>
    );
  }

  if (terrain === null || terrain.total === 0) {
    return (
      <Section title="Données terrain MAI DAWA">
        <EmptyState
          icon={<span className="text-xl">📡</span>}
          title={`Aucun signal terrain déclaré pour ${dci} pour l'instant`}
          description="Les données terrain proviennent des déclarations d'effets indésirables et retours professionnels collectés via MAI DAWA."
          action={
            <button onClick={onDeclare} className="inline-block bg-petrol hover:bg-petrol-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Contribuer — déclarer un cas →
            </button>
          }
        />
        <p className="text-center text-xs text-gray-400 mt-2">Chaque déclaration contribue à améliorer la pharmacovigilance locale.</p>
      </Section>
    );
  }

  const { total, graves, graves_pct, begaud_avg, top_effets, by_evolution, last_report_date } = terrain;

  return (
    <Section title="Données terrain MAI DAWA">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Stat label="Déclarations MAI DAWA" value={String(total)} />
        <Stat label="Effets graves" value={`${graves} (${graves_pct}%)`} highlight={graves_pct >= 30} />
        <Stat label="Score Bégaud moyen" value={begaud_avg !== null ? `I${begaud_avg.toFixed(1)}` : "N/A"} />
        <Stat label="Dernier signalement" value={last_report_date ? new Date(last_report_date).toLocaleDateString("fr-MA", { month: "short", year: "numeric" }) : "—"} />
      </div>

      {top_effets.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Effets rapportés localement</p>
          <ul className="space-y-1.5 mb-5">
            {top_effets.map(({ terme, count }) => (
              <li key={terme} className="text-sm bg-gray-50 text-gray-600 rounded-lg px-3 py-2 flex items-center justify-between">
                <span>{terme}</span><span className="text-xs font-semibold text-gray-400">{count} cas</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {by_evolution.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Évolution observée</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {by_evolution.map(({ evolution, count }) => (
              <span key={evolution} className="text-xs bg-petrol/5 text-petrol border border-petrol/10 rounded-full px-3 py-1">{evolution} · {count}</span>
            ))}
          </div>
        </>
      )}

      <div className="flex items-start gap-2">
        <span className="text-sm shrink-0">ℹ️</span>
        <p className="text-xs text-gray-400">Données agrégées et anonymisées issues des déclarations MAI DAWA. Aucune donnée identifiante n&apos;est exposée.</p>
      </div>
      <button onClick={onDeclare} className="mt-4 text-sm text-petrol hover:underline font-medium">+ Contribuer — déclarer un cas →</button>
    </Section>
  );
}
