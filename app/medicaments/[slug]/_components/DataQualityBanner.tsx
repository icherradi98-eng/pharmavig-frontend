"use client";

import { useState } from "react";
import type { ProductView } from "@/lib/referentiel/index";
import type { Inconsistency } from "@/lib/referentiel/inconsistencies";
import { PRODUCT_TYPE_LABELS } from "../_constants";

// ── Bandeau UNIQUE de qualité des données (remplace tous les disclaimers) ──────

export function DataQualityBanner({ stale }: { stale: boolean }) {
  return (
    <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.28)" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b08900" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-xs leading-relaxed" style={{ color: "#7a5c00" }}>
        Données issues de sources publiques{stale ? " et anciennes" : ""}. Disponibilité, prix et informations
        cliniques <strong>à confirmer auprès des sources officielles locales</strong> (DMP, CAPM).
        Cette fiche ne remplace pas le RCP officiel.
      </p>
    </div>
  );
}

// ── Accordéon « Sources et qualité des données » (champs techniques + incohérences) ──

function fmtDate(d: string | null | undefined): string | null {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("fr-MA"); } catch { return d; }
}

export function SourceTraceabilityAccordion({
  view, inconsistencies,
}: {
  view: ProductView | null;
  inconsistencies: Inconsistency[];
}) {
  const [open, setOpen] = useState(false);
  if (!view) return null;
  const { product, source } = view;

  const rows: [string, string | null][] = [
    ["Source", source?.source_name ?? null],
    ["Date de la source", fmtDate(product.source_primary_date)],
    ["Pays d'enregistrement", product.country],
    ["Statut réglementaire", product.regulatory_status],
    ["Référencement Maroc", product.morocco_reference_status],
    ["Statut d'import", product.validation_status],
    ["Identifiant source", product.source_primary_id],
    ["Dernière vérification", fmtDate(product.last_verified_at) ?? "Jamais vérifié"],
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700">Sources et qualité des données</span>
        <span className="flex items-center gap-2 shrink-0">
          {inconsistencies.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {inconsistencies.length} point{inconsistencies.length > 1 ? "s" : ""} à vérifier
            </span>
          )}
          <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs mt-3">
            {rows.map(([label, value]) =>
              value ? (
                <div key={label} className="flex gap-2">
                  <dt className="text-gray-400 shrink-0 w-40">{label}</dt>
                  <dd className="text-gray-700 font-medium break-all">{value}</dd>
                </div>
              ) : null
            )}
            <div className="flex gap-2">
              <dt className="text-gray-400 shrink-0 w-40">Type produit</dt>
              <dd className="text-gray-700 font-medium">{PRODUCT_TYPE_LABELS[product.product_type] ?? product.product_type}</dd>
            </div>
          </dl>

          {inconsistencies.length > 0 && (
            <div className="mt-4 rounded-xl px-4 py-3" style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.25)" }}>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "#7a5c00" }}>Possibles incohérences détectées automatiquement</p>
              <ul className="space-y-1">
                {inconsistencies.map((i) => (
                  <li key={i.code} className="text-xs flex items-start gap-1.5" style={{ color: "#7a5c00" }}>
                    <span className="shrink-0">•</span><span>{i.label}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-gray-400 mt-2">Aucune correction automatique n&apos;est appliquée — données à vérifier manuellement.</p>
            </div>
          )}

          <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
            Référentiel issu de sources publiques (CNOPS · data.gov.ma). L&apos;enrichissement clinique
            (synthèse) s&apos;appuie sur des sources publiques (RCP / BDPM, EMA, OMS) et ne remplace pas le RCP
            officiel marocain. Pour toute décision, consulter le DMP (sante.gov.ma) et le CAPM.
          </p>
        </div>
      )}
    </div>
  );
}
