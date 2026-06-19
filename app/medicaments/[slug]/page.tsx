"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchAnsm, unslugify, slugify,
  type BdpmDrug,
  type LocalProductContext,
} from "@/lib/drugApi";
import { fetchTerrain, type TerrainOut } from "@/lib/api";
import { getProductView, searchProducts, type ProductView } from "@/lib/referentiel/index";
import { listAlternativesByProductId, getMonographByDci } from "@/lib/referentiel/clinical";
import { normalizeSubstanceName } from "@/lib/referentiel/bdpmMatcher";
import { EditorialBadge } from "@/app/referentiel/_components/badges";
import { TABS, PRODUCT_TYPE_LABELS, type TabId } from "./_constants";
import {
  SourceLabel, ClinicalSourceLabel, Badge, AvailBadge, ValidBadge, SkeletonHeader,
} from "./_components/ui";
import { TabReferentiel, TabClinique, TabTerrain, Disclaimer } from "./_components/tabs";

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

export default function MedicamentProfil() {
  const params = useParams<{ slug: string }>();
  return <DrugProfileContent key={params.slug} slug={params.slug || ""} />;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
    document.title = `${dci} — Référentiel médicament Maroc | MAI DAWA`;
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

  // Couche clinique : monographie DCI + alternatives marocaines (même substance)
  const monograph = useMemo(() => getMonographByDci(name), [name]);
  const alternatives = useMemo(
    () => (productView?.product ? listAlternativesByProductId(productView.product.id) : []),
    [productView]
  );
  const monoDciSlug = slugify(substanceNames?.[0] ?? dci);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/medicaments" className="font-bold text-lg text-petrol">MAI DAWA — Médicaments</Link>
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

            {/* Monographie clinique DCI */}
            <Link
              href={`/referentiel/dci/${monoDciSlug}`}
              className="block bg-white border border-gray-200 rounded-2xl p-5 mb-4 hover:border-petrol/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gold mb-0.5">Monographie clinique</p>
                  {monograph ? (
                    <p className="text-sm text-gray-700">
                      Indications, posologie, contre-indications, interactions…
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      En cours de construction — disponibilité/prix au Maroc uniquement pour l&apos;instant.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {monograph && <EditorialBadge status={monograph.status} />}
                  <span className="text-sm font-semibold text-petrol">Ouvrir →</span>
                </div>
              </div>
              {monograph?.is_demo && (
                <p className="text-[11px] text-gold mt-2">⚠️ Donnée de démonstration — non validée médicalement.</p>
              )}
            </Link>

            {/* Alternatives au Maroc (même DCI) */}
            {alternatives.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gold mb-2">
                  Alternatives au Maroc · même substance
                </p>
                <div className="flex flex-wrap gap-2">
                  {alternatives.slice(0, 12).map((alt) => (
                    <Link
                      key={alt.product.id}
                      href={`/medicaments/${slugify(alt.dci.split(" / ")[0] || alt.product.brand_name)}`}
                      className="text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:border-petrol/40 hover:text-petrol transition-colors"
                    >
                      {alt.product.brand_name}
                    </Link>
                  ))}
                </div>
                {alternatives.length > 12 && (
                  <p className="text-xs text-gray-400 mt-2">+ {alternatives.length - 12} autre{alternatives.length - 12 > 1 ? "s" : ""}</p>
                )}
              </div>
            )}

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
