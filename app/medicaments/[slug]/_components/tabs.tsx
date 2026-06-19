import Link from "next/link";
import type { BdpmDrug } from "@/lib/drugApi";
import type { TerrainOut } from "@/lib/api";
import { DISCLAIMER, type ProductView } from "@/lib/referentiel/index";
import { PRODUCT_TYPE_LABELS, REJECTION_LABELS } from "../_constants";
import { Section, DataRow, Stat, BdpmExternalLinks } from "./ui";

// ── TAB 1 — Référentiel Maroc ─────────────────────────────────────────────────

export function TabReferentiel({ view, dci: _dci }: { view: ProductView | null; dci: string }) {
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

// ── TAB 2 — Enrichissement clinique (BDPM France) ─────────────────────────────

export function TabClinique({ bdpm, dci }: { bdpm: BdpmDrug | null | undefined; dci: string }) {
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

// ── TAB 3 — Données terrain MAI DAWA ─────────────────────────────────────────

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
        <div className="text-center py-8">
          <span className="text-3xl">📋</span>
          <p className="text-gray-700 font-medium mt-3">Aucun signal terrain pour {dci} pour l&apos;instant.</p>
          <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
            Les données terrain sont constituées par les déclarations d&apos;effets indésirables
            soumises par les professionnels de santé marocains via MAI DAWA.
          </p>
          <button onClick={onDeclare} className="mt-5 inline-block bg-petrol hover:bg-petrol-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Contribuer — Déclarer un cas →
          </button>
        </div>
        <div className="mt-4 bg-petrol/5 border border-petrol/10 rounded-xl p-4 flex gap-3 text-left">
          <span className="text-lg shrink-0">🔬</span>
          <p className="text-xs text-petrol leading-relaxed">
            <span className="font-semibold">Pourquoi ces données comptent :</span> 95% des effets indésirables
            ne sont jamais signalés. Chaque déclaration MAI DAWA contribue à la pharmacovigilance nationale.
          </p>
        </div>
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
          Données agrégées et anonymisées issues des déclarations MAI DAWA. Conformément à la loi 09-08 (CNDP), aucune donnée identifiante n&apos;est exposée.
        </p>
      </div>

      <button onClick={onDeclare} className="mt-4 text-sm text-petrol hover:underline font-medium">
        + Contribuer — Déclarer un cas →
      </button>
    </Section>
  );
}

export function Disclaimer() {
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
