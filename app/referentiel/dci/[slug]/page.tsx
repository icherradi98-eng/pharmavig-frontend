"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { unslugify, slugify } from "@/lib/drugApi";
import { referentielData } from "@/lib/referentiel/index";
import {
  getMonographByDci, getInteractionsForSubstanceId, editorialStatusMeta,
} from "@/lib/referentiel/clinical";
import type { DrugInteraction } from "@/lib/referentiel/types";
import { EditorialBadge, ClinicalDisclaimer } from "../../_components/badges";

const norm = (s: string) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const SEVERITY_META: Record<string, { label: string; bg: string; color: string }> = {
  contraindicated: { label: "Contre-indiqué", bg: "#fde8e8", color: "#C0392B" },
  major:           { label: "Majeure",        bg: "#fde8e8", color: "#C0392B" },
  moderate:        { label: "Modérée",        bg: "rgba(212,175,55,0.15)", color: "#92700a" },
  minor:           { label: "Mineure",        bg: "rgba(47,168,143,0.12)", color: "#1f8a73" },
  unknown:         { label: "À préciser",     bg: "rgba(107,114,128,0.1)", color: "#6b7280" },
};

export default function MonographPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const dciName = unslugify(slug);

  const mono = useMemo(() => getMonographByDci(dciName), [dciName]);
  const substance = useMemo(() => {
    if (mono) return referentielData.substances.find((s) => s.id === mono.substance_id) ?? null;
    return referentielData.substances.find((s) => norm(s.dci_fr) === norm(dciName)) ?? null;
  }, [mono, dciName]);
  const interactions = useMemo(
    () => (substance ? getInteractionsForSubstanceId(substance.id) : []),
    [substance]
  );

  const title = substance?.dci_fr ?? (dciName.charAt(0).toUpperCase() + dciName.slice(1));

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/referentiel" className="font-bold text-lg text-petrol">MAI DAWA — Référentiel</Link>
        <Link href="/referentiel" className="text-sm font-medium text-gray-600 hover:text-petrol">← Tous les médicaments</Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 md:px-8 py-8">
        {/* En-tête */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gold mb-1">Monographie clinique · DCI</p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-petrol">{title}</h1>
              {mono?.therapeutic_class && <p className="text-sm text-gray-500 mt-1">{mono.therapeutic_class}</p>}
            </div>
            {mono && <EditorialBadge status={mono.status} />}
          </div>
          <Link
            href={`/medicaments/${slugify(title)}`}
            className="inline-block mt-4 text-sm font-semibold text-petrol hover:underline"
          >
            Voir les spécialités disponibles au Maroc →
          </Link>
        </div>

        {!mono && <NoMonograph />}

        {mono && (
          <>
            <div className="mb-5">
              <ClinicalDisclaimer isDemo={mono.is_demo} isValidated={editorialStatusMeta(mono.status).isValidated} />
            </div>

            <div className="space-y-3">
              <Section title="Indications" body={mono.indications} />
              <Section title="Posologie adulte" body={mono.posology_adult} />
              <Section title="Adaptation rénale" body={mono.renal_adjustment} />
              <Section title="Adaptation hépatique" body={mono.hepatic_adjustment} />
              <Section title="Contre-indications" body={mono.contraindications} accent="danger" />
              <Section title="Précautions d'emploi" body={mono.precautions} />
              <Section title="Effets indésirables fréquents" body={mono.adverse_effects_common} />
              <Section title="Effets indésirables graves" body={mono.adverse_effects_serious} accent="danger" />
              <InteractionsSection text={mono.key_interactions} rules={interactions} currentSubstanceId={substance?.id ?? null} />
              <Section title="Grossesse / allaitement" body={mono.pregnancy_lactation} />
              <Section title="Surveillance recommandée" body={mono.monitoring} />
              <Section title="Conseils patients" body={mono.patient_advice} accent="advice" />
            </div>

            {/* Sources & métadonnées qualité */}
            <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5 text-xs text-gray-500 space-y-1.5">
              <p className="font-bold uppercase tracking-wide text-[10px] text-gray-400 mb-2">Sources & traçabilité</p>
              <MetaRow label="Statut éditorial" value={editorialStatusMeta(mono.status).label} />
              <MetaRow label="Source" value={mono.source_name ?? "—"} />
              <MetaRow label="Version" value={mono.version} />
              <MetaRow label="Revu par" value={mono.reviewed_by ?? "Non revu"} />
              <MetaRow label="Dernière révision" value={mono.reviewed_at ?? "—"} />
              <MetaRow label="Dernière vérification" value={mono.last_verified_at ?? "—"} />
              {mono.is_demo && <p className="pt-2 text-gold font-medium">⚠️ Donnée de démonstration — non validée médicalement.</p>}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function NoMonograph() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
      <div className="text-3xl mb-3">🏗️</div>
      <p className="text-night font-semibold">Monographie clinique en cours de construction</p>
      <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
        Les données affichées actuellement concernent uniquement la disponibilité et le prix au Maroc.
        Le contenu clinique (indications, posologie, contre-indications…) sera ajouté progressivement,
        puis validé par un médecin et un pharmacien avant publication.
      </p>
    </div>
  );
}

const ACCENT_STYLES: Record<string, { border: string; titleColor: string }> = {
  danger: { border: "#f3c6c2", titleColor: "#C0392B" },
  advice: { border: "rgba(15,91,87,0.25)", titleColor: "#0F5B57" },
  default: { border: "#e5e7eb", titleColor: "#1F2D3D" },
};

function Section({ title, body, accent = "default" }: { title: string; body: string | null; accent?: "default" | "danger" | "advice" }) {
  if (!body) return null;
  const s = ACCENT_STYLES[accent] ?? ACCENT_STYLES.default;
  return (
    <div className="bg-white rounded-xl p-4" style={{ border: `1px solid ${s.border}` }}>
      <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: s.titleColor }}>{title}</p>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{body}</p>
    </div>
  );
}

function InteractionsSection({ text, rules, currentSubstanceId }: { text: string | null; rules: DrugInteraction[]; currentSubstanceId: string | null }) {
  if (!text && rules.length === 0) return null;
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5 text-night">Interactions importantes</p>
      {text && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3">{text}</p>}
      {rules.length > 0 && (
        <div className="space-y-1.5">
          {rules.map((r) => {
            const other = r.substance_a_id === currentSubstanceId ? r.substance_b_label : r.substance_a_label;
            const sev = SEVERITY_META[r.severity] ?? SEVERITY_META.unknown;
            return (
              <div key={r.id} className="flex items-start gap-2 text-sm">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5" style={{ background: sev.bg, color: sev.color }}>{sev.label}</span>
                <div>
                  <span className="font-medium text-night">{other}</span>
                  {r.recommendation && <span className="text-gray-500"> — {r.recommendation}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-600 text-right">{value}</span>
    </div>
  );
}
