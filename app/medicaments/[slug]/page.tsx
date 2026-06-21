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
import { detectInconsistencies } from "@/lib/referentiel/inconsistencies";
import { normalizeSubstanceName } from "@/lib/referentiel/bdpmMatcher";
import { TABS, type TabId } from "./_constants";
import { SkeletonHeader } from "./_components/ui";
import { StatusBadge, SourceBadge, ValidationBadge, VerifyBadge, CombinationBadge } from "./_components/badges";
import { DataQualityBanner } from "./_components/DataQualityBanner";
import { TabReferentiel, TabClinique, TabTerrain } from "./_components/tabs";

function buildLocalContext(brandName: string, view: ProductView): LocalProductContext {
  const substances = (view.substances ?? [])
    .map((s) => normalizeSubstanceName(s.substance?.dci_fr ?? ""))
    .filter((s) => s.length > 1);

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

  const brandName = productView?.product?.brand_name ?? dci;
  const labName = productView?.product?.lab_name;
  const substanceNames = (productView?.substances
    .map((s) => s.substance?.dci_fr)
    .filter(Boolean) as string[] | undefined) ?? [];

  // Couches clinique + dérivées
  const monograph = useMemo(() => getMonographByDci(name), [name]);
  const alternatives = useMemo(
    () => (productView?.product ? listAlternativesByProductId(productView.product.id) : []),
    [productView]
  );
  const inconsistencies = useMemo(() => detectInconsistencies(productView, monograph), [productView, monograph]);
  const monoDciSlug = slugify(substanceNames[0] ?? dci);

  const form = productView?.presentation?.pharmaceutical_form;
  const route = productView?.presentation?.route;
  const isCombination = substanceNames.length > 1;
  const stale = productView?.source?.source_freshness === "stale";

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
            {/* ── A. Header médicament (léger, ≤ 3 badges) ── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-petrol break-words">{brandName}</h1>
                  {substanceNames.length > 0 && brandName !== substanceNames[0] && (
                    <p className="text-gray-500 text-sm mt-1">
                      DCI : {substanceNames.join(" / ")}
                      {isCombination && <span className="ml-2 align-middle"><CombinationBadge /></span>}
                    </p>
                  )}
                  {(form || route) && (
                    <p className="text-gray-400 text-xs mt-1">{[form, route && `Voie : ${route}`].filter(Boolean).join(" · ")}</p>
                  )}
                  {labName && <p className="text-gray-400 text-xs mt-0.5">Laboratoire : {labName}</p>}
                </div>

                {productView?.product && (
                  <div className="flex flex-col gap-1.5 items-end shrink-0">
                    <StatusBadge status={productView.product.availability_status} />
                    <SourceBadge source={productView.source} />
                    {inconsistencies.length > 0
                      ? <VerifyBadge />
                      : <ValidationBadge status={productView.product.validation_status} />}
                  </div>
                )}
              </div>

              <button
                onClick={declareWithDrug}
                className="mt-5 bg-petrol hover:bg-petrol-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Déclarer un cas avec ce médicament →
              </button>
            </div>

            {/* ── B. Bandeau UNIQUE de qualité des données ── */}
            {productView && (
              <div className="mb-5">
                <DataQualityBanner stale={!!stale} />
              </div>
            )}

            {/* ── C. Onglets ── */}
            <div className="flex gap-1 overflow-x-auto border-b border-gray-200 mb-6">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    tab === t.id ? "border-petrol text-petrol" : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "referentiel" && <TabReferentiel view={productView} alternatives={alternatives} inconsistencies={inconsistencies} />}
            {tab === "clinique" && <TabClinique monograph={monograph} substanceNames={substanceNames} dciSlug={monoDciSlug} bdpm={bdpm} />}
            {tab === "terrain" && <TabTerrain terrain={terrain} dci={dci} onDeclare={declareWithDrug} />}
          </>
        )}
      </main>
    </div>
  );
}
