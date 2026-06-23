"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { unslugify, slugify } from "@/lib/drugApi";
import { referentielData } from "@/lib/referentiel/index";
import {
  getMonographByDci, getInteractionsForSubstanceId, editorialStatusMeta,
} from "@/lib/referentiel/clinical";
import type { DrugInteraction, EditorialStatus } from "@/lib/referentiel/types";
import { api, type MonographValidationStatus } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
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

// Champs cliniques éditables (mêmes clés que le modèle ClinicalMonograph côté serveur).
const EDIT_FIELDS: { key: string; label: string }[] = [
  { key: "indications", label: "Indications" },
  { key: "posology_adult", label: "Posologie adulte" },
  { key: "renal_adjustment", label: "Adaptation rénale" },
  { key: "hepatic_adjustment", label: "Adaptation hépatique" },
  { key: "contraindications", label: "Contre-indications" },
  { key: "precautions", label: "Précautions d'emploi" },
  { key: "adverse_effects_common", label: "Effets indésirables fréquents" },
  { key: "adverse_effects_serious", label: "Effets indésirables graves" },
  { key: "key_interactions", label: "Interactions importantes" },
  { key: "pregnancy_lactation", label: "Grossesse / allaitement" },
  { key: "monitoring", label: "Surveillance recommandée" },
  { key: "patient_advice", label: "Conseils patients" },
];

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

  const { user } = useAuth();
  const canEdit = user?.role === "medecin";

  // Statut + contenu validés côté serveur (override le fichier versionné).
  const [override, setOverride] = useState<MonographValidationStatus | null>(null);
  const [reviewerName, setReviewerName] = useState<string | null>(null);
  const [serverContent, setServerContent] = useState<Record<string, string | null> | null>(null);
  useEffect(() => {
    if (!mono) return;
    api.listMonographValidations()
      .then((list) => {
        const v = list.find((x) => x.monograph_id === mono.id);
        if (v) { setOverride(v.status); setReviewerName(v.reviewer_name); setServerContent(v.content ?? null); }
      })
      .catch(() => {});
  }, [mono]);

  const effectiveStatus: EditorialStatus = (override ?? mono?.status ?? "draft") as EditorialStatus;
  const meta = editorialStatusMeta(effectiveStatus);

  // Valeur effective d'un champ : édition serveur si présente, sinon brouillon versionné.
  const eff = (key: string): string | null => {
    const ov = serverContent?.[key];
    if (ov != null && String(ov).trim() !== "") return String(ov);
    return mono ? ((mono as unknown as Record<string, string | null>)[key] ?? null) : null;
  };

  // Mode édition (médecin)
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [savingContent, setSavingContent] = useState(false);
  const [editErr, setEditErr] = useState("");

  function startEditing() {
    const d: Record<string, string> = {};
    for (const f of EDIT_FIELDS) d[f.key] = eff(f.key) ?? "";
    setDraft(d);
    setEditErr("");
    setEditing(true);
  }
  async function saveContent() {
    if (!mono) return;
    setSavingContent(true); setEditErr("");
    try {
      const res = await api.validateMonograph({ monograph_id: mono.id, dci: mono.dci, content: draft });
      setServerContent(res.content ?? draft);
      if (res.reviewer_name) setReviewerName(res.reviewer_name);
      setEditing(false);
    } catch (e) {
      setEditErr(e instanceof Error ? e.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSavingContent(false);
    }
  }

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
            {mono && <EditorialBadge status={effectiveStatus} />}
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
              <ClinicalDisclaimer isDemo={mono.is_demo} isValidated={meta.isValidated} />
            </div>

            <div className="mb-5">
              <ValidationPanel
                monographId={mono.id}
                dci={mono.dci}
                status={effectiveStatus}
                onValidated={(s, who) => { setOverride(s); setReviewerName(who); }}
              />
            </div>

            {canEdit && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">{serverContent ? "Contenu édité (serveur)." : "Contenu issu du brouillon initial."}</p>
                {!editing && (
                  <button onClick={startEditing} className="text-sm font-semibold text-petrol hover:underline">✏️ Éditer le contenu</button>
                )}
              </div>
            )}

            {editing ? (
              <div className="space-y-3">
                {EDIT_FIELDS.map((f) => (
                  <div key={f.key} className="bg-white rounded-xl p-4 border border-gray-200">
                    <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-night">{f.label}</label>
                    <textarea
                      value={draft[f.key] ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                      rows={3}
                      placeholder="Non renseigné — ajoutez le contenu…"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol resize-y leading-relaxed"
                    />
                  </div>
                ))}
                {editErr && <p className="text-sm text-red-600">⚠️ {editErr}</p>}
                <div className="flex gap-2 sticky bottom-3">
                  <button onClick={saveContent} disabled={savingContent}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: "#0F5B57" }}>
                    {savingContent ? "Enregistrement…" : "Enregistrer le contenu"}
                  </button>
                  <button onClick={() => setEditing(false)} disabled={savingContent}
                    className="py-2.5 px-4 rounded-xl text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50">
                    Annuler
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">L&apos;enregistrement ne change pas le statut de validation — pense à valider la fiche ensuite si elle est prête.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Section title="Indications" body={eff("indications")} />
                <Section title="Posologie adulte" body={eff("posology_adult")} />
                <Section title="Adaptation rénale" body={eff("renal_adjustment")} />
                <Section title="Adaptation hépatique" body={eff("hepatic_adjustment")} />
                <Section title="Contre-indications" body={eff("contraindications")} accent="danger" />
                <Section title="Précautions d'emploi" body={eff("precautions")} />
                <Section title="Effets indésirables fréquents" body={eff("adverse_effects_common")} />
                <Section title="Effets indésirables graves" body={eff("adverse_effects_serious")} accent="danger" />
                <InteractionsSection text={eff("key_interactions")} rules={interactions} currentSubstanceId={substance?.id ?? null} />
                <Section title="Grossesse / allaitement" body={eff("pregnancy_lactation")} />
                <Section title="Surveillance recommandée" body={eff("monitoring")} />
                <Section title="Conseils patients" body={eff("patient_advice")} accent="advice" />
              </div>
            )}

            {/* Sources & métadonnées qualité */}
            <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5 text-xs text-gray-500 space-y-1.5">
              <p className="font-bold uppercase tracking-wide text-[10px] text-gray-400 mb-2">Sources & traçabilité</p>
              <MetaRow label="Statut éditorial" value={meta.label} />
              <MetaRow label="Source" value={mono.source_name ?? "—"} />
              <MetaRow label="Version" value={mono.version} />
              <MetaRow label="Revu par" value={reviewerName ?? mono.reviewed_by ?? "Non revu"} />
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

function ValidationPanel({ monographId, dci, status, onValidated }: {
  monographId: string;
  dci: string;
  status: EditorialStatus;
  onValidated: (status: MonographValidationStatus, reviewerName: string) => void;
}) {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3" style={{ background: "rgba(15,91,87,0.04)", border: "1px solid rgba(15,91,87,0.15)" }}>
        <span className="text-gray-600">Vous êtes médecin ? Connectez-vous pour valider cette fiche.</span>
        <Link href="/login?redirect=/referentiel" className="text-sm font-semibold text-petrol shrink-0 hover:underline">Se connecter →</Link>
      </div>
    );
  }
  if (user.role !== "medecin") {
    return (
      <p className="text-xs text-gray-400 px-1">La validation des monographies est réservée aux médecins.</p>
    );
  }

  const isPublished = status === "published";

  async function submit(next: MonographValidationStatus) {
    setSaving(true); setError("");
    try {
      const res = await api.validateMonograph({ monograph_id: monographId, dci, status: next, note: note.trim() || undefined });
      onValidated(res.status, res.reviewer_name);
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la validation.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(15,91,87,0.04)", border: "1px solid rgba(15,91,87,0.18)" }}>
      <p className="text-xs font-bold uppercase tracking-wide text-petrol mb-2">Validation médecin</p>
      {isPublished ? (
        <p className="text-sm text-gray-600 mb-3">✅ Fiche validée et publiée — le bandeau « à valider » a disparu pour tous les utilisateurs.</p>
      ) : (
        <p className="text-sm text-gray-600 mb-3">En tant que médecin référent, votre validation publie cette fiche (le bandeau disparaît pour tous).</p>
      )}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note de validation (optionnel)…"
        rows={note ? 2 : 1}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-petrol resize-y mb-3"
      />
      {error && <p className="text-xs text-red-600 mb-2">⚠️ {error}</p>}
      <div className="flex flex-wrap gap-2">
        {!isPublished ? (
          <button onClick={() => submit("published")} disabled={saving}
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-60" style={{ background: "#0F5B57" }}>
            {saving ? "Validation…" : "✓ Valider et publier"}
          </button>
        ) : (
          <button onClick={() => submit("draft")} disabled={saving}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-60">
            {saving ? "…" : "Repasser en brouillon"}
          </button>
        )}
      </div>
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
