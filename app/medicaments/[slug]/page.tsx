"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchAnsm, unslugify,
  type BdpmDrug,
  type LocalProductContext,
} from "@/lib/drugApi";
import { fetchTerrain, type TerrainOut } from "@/lib/api";
import { getProductView, searchProducts, DISCLAIMER, type ProductView } from "@/lib/referentiel/index";
import { normalizeSubstanceName } from "@/lib/referentiel/bdpmMatcher";
import type { Source } from "@/lib/referentiel/types";

function buildLocalContext(brandName: string, view: ProductView): LocalProductContext {
  const substances = (view.substances ?? [])
    .map((s) => normalizeSubstanceName(s.substance?.dci_fr ?? ""))
    .filter((s) => s.length > 1);

  // CNOPS n'a qu'une colonne DCI1 → contexte substances toujours incomplet
  // sauf si le produit a été validé manuellement (validation_status === "validated")
  const substanceCompletenessStatus =
    view.product?.validation_status === "validated" ? "complete" : "incomplete";

  return {
    brandName,
    substances,
    form: view.presentation?.pharmaceutical_form ?? null,
    route: view.presentation?.route ?? null,
    substance_completeness_status: substanceCompletenessStatus,
  };
}

const TABS = [
  { id: "referentiel", label: "Référentiel Maroc" },
  { id: "clinique", label: "Enrichissement clinique" },
  { id: "terrain", label: "Données terrain MAIA DAWA" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Labels de source honnêtes (jamais "EMA" si la donnée ne vient pas de l'EMA) ──

function SourceLabel({ source }: { source: Source | undefined }) {
  if (!source) {
    return (
      <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-200">
        Source clinique : non renseignée
      </span>
    );
  }
  if (source.country === "MA") {
    const stale = source.source_freshness === "stale";
    return (
      <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${
        stale
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-blue-50 text-blue-700 border-blue-200"
      }`}>
        Source Maroc · {source.source_name.split("—")[0].trim()}
        {stale && source.source_year ? ` (${source.source_year} — à rafraîchir)` : ""}
      </span>
    );
  }
  return (
    <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
      Référentiel local
    </span>
  );
}

function ClinicalSourceLabel({ hasBdpm }: { hasBdpm: boolean }) {
  if (!hasBdpm) {
    return (
      <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-200">
        Enrichissement clinique à venir
      </span>
    );
  }
  return (
    <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
      Enrichissement clinique : BDPM (France — non opposable au Maroc)
    </span>
  );
}

// ── Badge de statut disponibilité ──────────────────────────────────────────────

const AVAIL_LABELS: Record<string, { label: string; color: string }> = {
  availability_unconfirmed:               { label: "Disponibilité à confirmer", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  availability_confirmed_by_pharmacist:   { label: "Confirmé (pharmacien)", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  availability_confirmed_by_lab:          { label: "Confirmé (laboratoire)", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  availability_confirmed_by_grossist:     { label: "Confirmé (grossiste)", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  withdrawn_or_suspected_unavailable:     { label: "Retiré ou indisponible suspecté", color: "bg-red-50 text-red-700 border border-red-200" },
  needs_review:                           { label: "À vérifier", color: "bg-gray-50 text-gray-500 border border-gray-200" },
};

const VALID_LABELS: Record<string, { label: string; color: string }> = {
  needs_review:    { label: "Non vérifié", color: "bg-gray-50 text-gray-400 border border-gray-200" },
  auto_imported:   { label: "Importé — non revu", color: "bg-amber-50 text-amber-600 border border-amber-100" },
  validated:       { label: "Validé manuellement", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  princeps: "Princeps", generic: "Générique", biosimilar: "Biosimilaire",
  hybrid: "Hybride", unknown: "Type inconnu",
};

export default function MedicamentProfil() {
  const params = useParams<{ slug: string }>();
  return <DrugProfileContent key={params.slug} slug={params.slug || ""} />;
}

function DrugProfileContent({ slug }: { slug: string }) {
  const router = useRouter();
  const name = unslugify(slug);
  const dci = capitalize(name);

  const productView = useMemo(() => {
    const results = searchProducts(name, 1);
    return results.length > 0 ? (getProductView(results[0].id) ?? null) : null;
  }, [name]);
  const [bdpm, setBdpm] = useState<BdpmDrug | null | undefined>(undefined);
  const [terrain, setTerrain] = useState<TerrainOut | null | undefined>(undefined);
  const [tab, setTab] = useState<TabId>("referentiel");

  useEffect(() => {
    // Construit le contexte local pour le matching BDPM
    const localCtx = productView ? buildLocalContext(name, productView) : undefined;
    fetchAnsm(name, localCtx).then((r) => setBdpm(r));
    fetchTerrain(name).then((r) => setTerrain(r));
  }, [name, productView]);

  useEffect(() => {
    document.title = `${dci} — Référentiel médicament Maroc | MAIA DAWA`;
  }, [dci]);

  function declareWithDrug() {
    try {
      localStorage.setItem("pharmavig_medecin_prefill", JSON.stringify({ drugDci: dci }));
    } catch {}
    router.push("/dashboard/medecin/nouvelle-declaration");
  }

  const loading = bdpm === undefined;

  // Marque commerciale de référence
  const brandName = productView?.product?.brand_name ?? dci;
  const labName = productView?.product?.lab_name;
  const substanceNames = productView?.substances
    .map((s) => s.substance?.dci_fr)
    .filter(Boolean) as string[] | undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/medicaments" className="font-bold text-lg text-petrol">MAIA DAWA — Médicaments</Link>
        <Link href="/medicaments" className="text-sm font-medium text-gray-600 hover:text-petrol">← Nouvelle recherche</Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 md:px-8 py-8">
        {loading && <SkeletonHeader />}

        {!loading && (
          <>
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-3xl font-bold text-petrol">{brandName}</h1>
                  {substanceNames && substanceNames.length > 0 && brandName !== substanceNames[0] && (
                    <p className="text-gray-500 text-sm mt-1">DCI : {substanceNames.join(" / ")}</p>
                  )}
                  {labName && <p className="text-gray-400 text-xs mt-0.5">Laboratoire : {labName}</p>}
                </div>
                {productView?.product && (
                  <div className="flex flex-col gap-1.5 items-end shrink-0">
                    <AvailBadge status={productView.product.availability_status} />
                    <ValidBadge status={productView.product.validation_status} />
                    <SourceLabel source={productView.source} />
                  </div>
                )}
              </div>

              {/* Badges type produit */}
              {productView?.product && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge color="bg-petrol/10 text-petrol">
                    {PRODUCT_TYPE_LABELS[productView.product.product_type] ?? productView.product.product_type}
                  </Badge>
                  {productView.presentation?.pharmaceutical_form && (
                    <Badge color="bg-petrol/10 text-petrol">{productView.presentation.pharmaceutical_form}</Badge>
                  )}
                  {productView.presentation?.route && (
                    <Badge color="bg-petrol/10 text-petrol">Voie : {productView.presentation.route}</Badge>
                  )}
                  <ClinicalSourceLabel hasBdpm={bdpm !== undefined && bdpm !== null} />
                </div>
              )}

              {/* Pas dans le référentiel local */}
              {!productView && (
                <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  ⚠️ Ce médicament n&apos;est pas encore dans le référentiel Morocco-first. La base est en cours de construction.
                </div>
              )}

              <button
                onClick={declareWithDrug}
                className="mt-5 bg-petrol hover:bg-petrol-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Déclarer un cas avec ce médicament →
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-gray-200 mb-6">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.id ? "border-petrol text-petrol" : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "referentiel" && <TabReferentiel view={productView} dci={dci} />}
            {tab === "clinique" && <TabClinique bdpm={bdpm} dci={dci} />}
            {tab === "terrain" && <TabTerrain terrain={terrain} dci={dci} onDeclare={declareWithDrug} />}

            <Disclaimer />
          </>
        )}
      </main>
    </div>
  );
}

// ── Helpers UI ────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>{children}</span>;
}

function AvailBadge({ status }: { status: string }) {
  const cfg = AVAIL_LABELS[status] ?? AVAIL_LABELS["needs_review"];
  return <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>;
}

function ValidBadge({ status }: { status: string }) {
  const cfg = VALID_LABELS[status] ?? VALID_LABELS["needs_review"];
  return <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>;
}

function SkeletonHeader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
        <div className="flex gap-2"><div className="h-6 w-24 bg-gray-100 rounded-full" /><div className="h-6 w-32 bg-gray-100 rounded-full" /></div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
      <h3 className="font-semibold text-gray-900 border-l-4 border-petrol pl-3 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 pl-3.5 mb-3">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-3"}>{children}</div>
    </div>
  );
}

// ── TAB 1 — Référentiel Maroc ─────────────────────────────────────────────────

function TabReferentiel({ view, dci: _dci }: { view: ProductView | null; dci: string }) {
  if (!view) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <span className="text-3xl">🗂️</span>
        <p className="text-gray-700 font-medium mt-3">
          Médicament non encore référencé dans la base Morocco-first.
        </p>
        <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
          Le référentiel est en construction. Priorité aux 300–500 médicaments les plus utilisés.
          Pour vérifier la disponibilité, consultez un pharmacien ou le DMP (sante.gov.ma).
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-5">
          <Link href="/medicaments" className="text-sm font-medium text-petrol border border-petrol/20 bg-petrol/5 px-4 py-2 rounded-lg hover:bg-petrol/10">
            ← Nouvelle recherche
          </Link>
          <a href="https://dmp.sante.gov.ma" target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
            DMP Maroc →
          </a>
        </div>
      </div>
    );
  }

  const { product, presentation, substances, source } = view;

  // Badge fraîcheur source
  const sourceLabel = source
    ? `${source.source_name}${source.source_year ? ` (${source.source_year})` : ""}${source.source_freshness === "stale" ? " — données anciennes, à confirmer" : ""}`
    : "—";

  return (
    <div className="space-y-4">
      {/* Avertissement source ancienne */}
      {source?.source_freshness === "stale" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">⏳ Source ancienne ({source.source_year}) :</span> Ce référentiel
          est issu du fichier CNOPS publié sur data.gov.ma. Les prix et la disponibilité peuvent avoir changé
          depuis {source.source_year}. Statut : <strong>auto_imported / needs_review</strong> — non validé médicalement.
          <br /><span className="text-xs text-amber-600 mt-1 block">Ces données ne constituent pas une validation pharmaceutique ni médicale.</span>
        </div>
      )}

      {/* Informations produit */}
      <Section title="Fiche produit" subtitle={`Source : ${sourceLabel} · Pays : MA · Statut : ${product.validation_status}`}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <DataRow label="Marque" value={product.brand_name} />
          <DataRow label="Pays d'enregistrement" value={product.country} />
          <DataRow label="Type produit" value={PRODUCT_TYPE_LABELS[product.product_type]} />
          <DataRow label="Statut réglementaire" value={product.regulatory_status} />
          <DataRow label="Labo" value={product.lab_name} />
          <DataRow label="Référencement Maroc" value={product.morocco_reference_status} />
          {product.source_primary_date && (
            <DataRow label="Date source" value={new Date(product.source_primary_date).toLocaleDateString("fr-MA")} />
          )}
          {product.last_verified_at && (
            <DataRow label="Dernière vérification" value={new Date(product.last_verified_at).toLocaleDateString("fr-MA")} />
          )}
        </dl>
      </Section>

      {/* Substances actives */}
      {substances.length > 0 && (
        <Section title="Substances actives (DCI)">
          <ul className="space-y-2">
            {substances.map(({ substance, link }) => (
              <li key={link.substance_id} className="flex items-center gap-3 text-sm bg-petrol/5 border border-petrol/10 rounded-lg px-3 py-2">
                <span className="font-semibold text-petrol">{substance?.dci_fr ?? link.substance_id}</span>
                {link.dosage && <span className="text-gray-500">{link.dosage} {link.unit}</span>}
                <span className="text-xs text-gray-400 ml-auto">{link.role === "active_substance" ? "SA" : link.role}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Présentation / Conditionnement */}
      {presentation && (
        <Section title="Présentation & Prix" subtitle="Données CNOPS — à confirmer localement">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {presentation.pharmaceutical_form && <DataRow label="Forme" value={presentation.pharmaceutical_form} />}
            {presentation.route && <DataRow label="Voie" value={presentation.route} />}
            {presentation.strength && <DataRow label="Dosage" value={`${presentation.strength} ${presentation.unit ?? ""}`} />}
            {presentation.packaging && <DataRow label="Conditionnement" value={presentation.packaging} />}
            {presentation.ppv != null && <DataRow label="PPV (MAD)" value={`${presentation.ppv} MAD`} />}
            {presentation.hospital_price != null && <DataRow label="Prix hôpital" value={`${presentation.hospital_price} MAD`} />}
            {presentation.reimbursement_status && <DataRow label="Remboursement" value={presentation.reimbursement_status} />}
            {presentation.prescription_conditions && <DataRow label="Conditions prescription" value={presentation.prescription_conditions} />}
          </dl>
        </Section>
      )}

      {/* Avertissement disponibilité */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        <span className="font-semibold">⚠️ Disponibilité :</span> {DISCLAIMER}
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="text-gray-400 shrink-0 w-36">{label}</dt>
      <dd className="text-gray-800 font-medium">{value}</dd>
    </div>
  );
}

// ── TAB 2 — Enrichissement clinique (BDPM France) ─────────────────────────────

function TabClinique({ bdpm, dci }: { bdpm: BdpmDrug | null | undefined; dci: string }) {
  const matchStatus = bdpm?.match?.status;
  const matchConfidence = bdpm?.match?.confidence;

  // Seul "accepted" + confidence != "none" autorise l'affichage
  const isReliable =
    bdpm != null &&
    matchStatus === "accepted" &&
    matchConfidence !== "none";

  const isRejected = bdpm != null && matchStatus === "rejected";
  const isNeedsReview = bdpm != null && matchStatus === "needs_review";

  return (
    <div className="space-y-4">
      {/* Avertissement source */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
        <span className="font-semibold">ℹ️ Enrichissement clinique (France) :</span> Les données ci-dessous
        proviennent de la BDPM (ANSM — France). Elles servent d&apos;enrichissement scientifique uniquement.
        Elles n&apos;attestent pas de la disponibilité au Maroc ni de la conformité avec le RCP marocain.
        Consultez toujours le DMP (sante.gov.ma) et le CAPM pour les spécificités locales.
      </div>

      {bdpm === undefined && (
        <div className="text-center py-8 text-gray-400 text-sm animate-pulse">Chargement BDPM…</div>
      )}

      {/* Aucun résultat BDPM */}
      {bdpm === null && (
        <BdpmNoData dci={dci} reason="Aucun candidat BDPM trouvé pour ce médicament." />
      )}

      {/* Match rejeté par le moteur de matching */}
      {isRejected && (
        <BdpmNoData
          dci={dci}
          reason={`Aucun enrichissement BDPM fiable trouvé pour ${dci}.`}
          detail={bdpm.match?.reason}
          rejectionCode={bdpm.match?.rejection_code}
        />
      )}

      {/* Match candidat non affiché (needs_review) */}
      {isNeedsReview && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">⚠️ Enrichissement candidat non affiché :</span> Un candidat BDPM a
          été trouvé mais le score de correspondance est insuffisant pour garantir qu&apos;il s&apos;agit
          du même médicament (score {bdpm.match?.score ?? 0}/100 — seuil haute confiance : 75).
          <br />
          <span className="text-xs mt-1 block text-amber-700">Raison : {bdpm.match?.reason}</span>
          <BdpmExternalLinks className="mt-3" />
        </div>
      )}

      {/* Données BDPM fiables */}
      {isReliable && bdpm && (
        <>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-xs text-emerald-700 flex items-center gap-2">
            <span>✓</span>
            <span>
              Match BDPM fiable — {bdpm.match.reason} · Données enrichissement France uniquement
            </span>
          </div>

          <Section title="Données BDPM (ANSM — France)" subtitle="Enrichissement clinique · source étrangère · ne vaut pas confirmation de disponibilité au Maroc">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {bdpm.denomination && <DataRow label="Dénomination" value={bdpm.denomination} />}
              {bdpm.forme && <DataRow label="Forme" value={bdpm.forme} />}
              {bdpm.voies?.[0] && <DataRow label="Voie(s)" value={bdpm.voies.join(", ")} />}
              {bdpm.statut && <DataRow label="Statut AMM (FR)" value={bdpm.statut} />}
              {bdpm.presentation?.tauxRemboursement && (
                <DataRow label="Remboursement SS (FR)" value={bdpm.presentation.tauxRemboursement} />
              )}
              {bdpm.conditions && bdpm.conditions.length > 0 && (
                <DataRow label="Conditions prescription (FR)" value={bdpm.conditions.join(", ")} />
              )}
            </dl>
          </Section>

          {bdpm.substances && bdpm.substances.length > 0 && (
            <Section title="Composition (BDPM France)">
              <ul className="space-y-1.5">
                {bdpm.substances.map((s) => (
                  <li key={s} className="text-sm bg-petrol/5 border border-petrol/10 rounded-lg px-3 py-2 text-gray-700">{s}</li>
                ))}
              </ul>
            </Section>
          )}

          {bdpm.generiques && bdpm.generiques.length > 0 && (
            <Section title="Génériques référencés (France)" subtitle="Liste BDPM France — les génériques marocains peuvent différer">
              <ul className="space-y-1.5">
                {bdpm.generiques.map((g) => (
                  <li key={g} className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">{g}</li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Données cliniques complètes">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-sm text-gray-600 space-y-2">
              <p>
                Les données cliniques complètes (indications, posologie, contre-indications, interactions,
                effets indésirables) doivent être consultées dans le RCP marocain officiel.
              </p>
              <BdpmExternalLinks className="mt-2" />
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

const REJECTION_LABELS: Record<string, string> = {
  composition_mismatch: "Composition incompatible",
  route_mismatch: "Voie d'administration incompatible",
  form_mismatch: "Forme pharmaceutique incompatible",
};

function BdpmNoData({
  dci,
  reason,
  detail,
  rejectionCode,
}: {
  dci: string;
  reason: string;
  detail?: string;
  rejectionCode?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <p className="text-gray-700 font-medium text-sm">{reason}</p>
      {rejectionCode && (
        <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
          {REJECTION_LABELS[rejectionCode] ?? rejectionCode}
        </span>
      )}
      {detail && <p className="text-gray-400 text-xs mt-2">{detail}</p>}
      <p className="text-gray-400 text-xs mt-3">
        Pour {dci}, consultez directement le RCP marocain officiel :
      </p>
      <BdpmExternalLinks className="mt-2" />
    </div>
  );
}

function BdpmExternalLinks({ className }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className ?? ""}`}>
      <a href="https://dmp.sante.gov.ma" target="_blank" rel="noreferrer"
        className="text-sm text-petrol font-medium border border-petrol/20 bg-petrol/5 px-4 py-2 rounded-lg hover:bg-petrol/10">
        DMP Maroc (RCP officiel) →
      </a>
      <a href="https://capm.ma" target="_blank" rel="noreferrer"
        className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
        CAPM →
      </a>
    </div>
  );
}

// ── TAB 3 — Données terrain MAIA DAWA ─────────────────────────────────────────

function TabTerrain({ terrain, dci, onDeclare }: { terrain: TerrainOut | null | undefined; dci: string; onDeclare: () => void }) {
  if (terrain === undefined) {
    return (
      <Section title="Données terrain MAIA DAWA">
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-petrol border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Chargement des données terrain…</p>
        </div>
      </Section>
    );
  }

  if (terrain === null || terrain.total === 0) {
    return (
      <Section title="Données terrain MAIA DAWA">
        <div className="text-center py-8">
          <span className="text-3xl">📋</span>
          <p className="text-gray-700 font-medium mt-3">Aucun signal terrain pour {dci} pour l&apos;instant.</p>
          <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
            Les données terrain sont constituées par les déclarations d&apos;effets indésirables
            soumises par les professionnels de santé marocains via MAIA DAWA.
          </p>
          <button onClick={onDeclare} className="mt-5 inline-block bg-petrol hover:bg-petrol-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Contribuer — Déclarer un cas →
          </button>
        </div>
        <div className="mt-4 bg-petrol/5 border border-petrol/10 rounded-xl p-4 flex gap-3 text-left">
          <span className="text-lg shrink-0">🔬</span>
          <p className="text-xs text-petrol leading-relaxed">
            <span className="font-semibold">Pourquoi ces données comptent :</span> 95% des effets indésirables
            ne sont jamais signalés. Chaque déclaration MAIA DAWA contribue à la pharmacovigilance nationale.
          </p>
        </div>
      </Section>
    );
  }

  const { total, graves, graves_pct, begaud_avg, top_effets, by_evolution, last_report_date } = terrain;

  return (
    <Section title="Données terrain MAIA DAWA">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Stat label="Déclarations MAIA DAWA" value={String(total)} />
        <Stat label="Effets graves" value={`${graves} (${graves_pct}%)`} highlight={graves_pct >= 30} />
        <Stat label="Score Bégaud moyen" value={begaud_avg !== null ? `I${begaud_avg.toFixed(1)}` : "N/A"} />
        <Stat label="Dernier signalement" value={last_report_date ? new Date(last_report_date).toLocaleDateString("fr-MA", { month: "short", year: "numeric" }) : "—"} />
      </div>

      {top_effets.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Top effets rapportés localement</p>
          <ul className="space-y-1.5 mb-5">
            {top_effets.map(({ terme, count }) => (
              <li key={terme} className="text-sm bg-gray-50 text-gray-600 rounded-lg px-3 py-2 flex items-center justify-between">
                <span>{terme}</span>
                <span className="text-xs font-semibold text-gray-400">{count} cas</span>
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
              <span key={evolution} className="text-xs bg-petrol/5 text-petrol border border-petrol/10 rounded-full px-3 py-1">
                {evolution} · {count}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="flex items-start gap-2 mt-2">
        <span className="text-sm shrink-0">ℹ️</span>
        <p className="text-xs text-gray-400">
          Données agrégées et anonymisées issues des déclarations MAIA DAWA. Conformément à la loi 09-08 (CNDP), aucune donnée identifiante n&apos;est exposée.
        </p>
      </div>

      <button onClick={onDeclare} className="mt-4 text-sm text-petrol hover:underline font-medium">
        + Contribuer — Déclarer un cas →
      </button>
    </Section>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100"}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-amber-700" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
      <p className="text-xs text-gray-500 leading-relaxed">
        {DISCLAIMER} Les données d&apos;enrichissement clinique proviennent de la BDPM (ANSM, France) — elles servent
        à l&apos;enrichissement scientifique uniquement et ne remplacent pas le RCP marocain officiel.
        Consultez le DMP (sante.gov.ma) et le CAPM pour les informations de référence locale.
      </p>
    </div>
  );
}
