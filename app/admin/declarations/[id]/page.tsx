"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminNav } from "../../dashboard/page";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type AdminReport = {
  id: string;
  created_at: string;
  status: string;
  source: string;
  drug_dci?: string;
  drug_nom_commercial?: string;
  gravite_serieux: boolean;
  imput_conclusion?: string;
  capm_reference?: string;
  declarant_nom?: string;
  declarant_prenom?: string;
  declarant_email?: string;
  raw_data?: Record<string, unknown>;
};

const STATUTS = [
  { val: "soumis", label: "Soumis" },
  { val: "transmis_capm", label: "Transmis au CAPM" },
  { val: "traite", label: "Traité / Clôturé" },
];

const GRAVITE_LABELS = [
  { key: "graviteDeces", label: "Décès" },
  { key: "graviteVieDanger", label: "Mise en danger de vie" },
  { key: "graviteHospitalisation", label: "Hospitalisation" },
  { key: "graviteIncapacite", label: "Incapacité persistante" },
  { key: "graviteAnomalieCongenitale", label: "Anomalie congénitale" },
  { key: "graviteMedicalementSignificatif", label: "Médicalement significatif" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="bg-gray-800/50 border-b border-gray-800 px-5 py-3">
        <h3 className="font-semibold text-gray-200 text-sm">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-2.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-gray-500 w-52 shrink-0">{label}</span>
      <span className="text-gray-200 font-medium">{value}</span>
    </div>
  );
}

export default function AdminDeclarationDetail() {
  const { id } = useParams<{ id: string }>();
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [capmRef, setCapmRef] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/admin/declarations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setReport(data);
        setStatus(data.status || "soumis");
        setCapmRef(data.capm_reference || "");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`${BASE}/admin/declarations/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, capm_reference: capmRef || null }),
      });
      const data = await res.json();
      setReport(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400 text-sm">
      Chargement...
    </div>
  );

  if (error || !report) return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminNav active="Déclarations" />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-3">{error || "Introuvable"}</p>
          <Link href="/admin/declarations" className="text-emerald-400 hover:underline text-sm">← Retour</Link>
        </div>
      </main>
    </div>
  );

  const raw = (report.raw_data || {}) as Record<string, string | boolean | number | unknown[]>;
  const gravitesCochees = GRAVITE_LABELS.filter((g) => raw[g.key]);
  const date = new Date(report.created_at).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminNav active="Déclarations" />

      <main className="flex-1 px-8 py-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <Link href="/admin/declarations" className="text-gray-500 hover:text-gray-300 text-sm">
              ← Retour aux déclarations
            </Link>
            <h1 className="text-2xl font-bold text-white mt-2">
              {report.drug_dci || report.drug_nom_commercial || "Déclaration sans médicament"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Soumise le {date}</p>
          </div>
          {report.gravite_serieux && (
            <span className="bg-red-900/50 text-red-400 border border-red-800 font-bold px-4 py-2 rounded-xl text-sm">
              ⚡ Effet sérieux
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="col-span-2 space-y-4">

            <Section title="👨‍⚕️ Déclarant">
              <Row label="Nom" value={`${raw.declarantPrenom as string || ""} ${raw.declarantNom as string || ""}`} />
              <Row label="Spécialité" value={raw.declarantSpecialite as string} />
              <Row label="Établissement" value={raw.declarantEtablissement as string} />
              <Row label="Ville" value={raw.declarantVille as string} />
              <Row label="Email" value={report.declarant_email} />
              <Row label="Type de déclaration" value={raw.typeDeclaration as string} />
            </Section>

            <Section title="🧑 Patient (anonymisé)">
              <Row label="Âge" value={raw.patientAge ? `${raw.patientAge} ans` : undefined} />
              <Row label="Sexe" value={raw.patientSexe as string} />
              <Row label="Poids" value={raw.patientPoids ? `${raw.patientPoids} kg` : undefined} />
              <Row label="Grossesse" value={raw.patientGrossesse as string} />
              <Row label="Insuffisance rénale" value={raw.patientInsuffisanceRenaleStade as string} />
              <Row label="Insuffisance hépatique" value={raw.patientInsuffisanceHepatiqueStade as string} />
              <Row label="Antécédents" value={raw.patientAntecedents as string} />
              <Row label="Allergies" value={raw.patientAllergies as string} />
            </Section>

            <Section title="💊 Médicament suspect">
              <Row label="DCI" value={report.drug_dci} />
              <Row label="Nom commercial" value={report.drug_nom_commercial} />
              <Row label="Forme / Voie" value={raw.medicamentForme ? `${raw.medicamentForme} — ${raw.medicamentVoie}` : undefined} />
              <Row label="Posologie" value={raw.medicamentPosologie as string} />
              <Row label="Indication" value={raw.medicamentIndication as string} />
              <Row label="Date début" value={raw.medicamentDateDebut as string} />
              <Row label="Date fin" value={raw.medicamentEnCours ? "En cours" : raw.medicamentDateFin as string} />
              <Row label="N° de lot" value={raw.medicamentLot as string} />
              <Row label="Laboratoire" value={raw.medicamentLaboratoire as string} />
            </Section>

            {Array.isArray(raw.medicamentsConcomitants) && (raw.medicamentsConcomitants as unknown[]).length > 0 && (
              <Section title="📋 Médicaments concomitants">
                {(raw.medicamentsConcomitants as Record<string, string>[]).map((m, i) => (
                  <div key={i} className="flex gap-3 text-sm py-1.5 border-b border-gray-800 last:border-0">
                    <span className="text-gray-600 text-xs w-4">{i + 1}.</span>
                    <div>
                      <span className="text-gray-200 font-medium">{m.nom}</span>
                      {m.posologie && <span className="text-gray-500 ml-2 text-xs">{m.posologie}</span>}
                      {m.indication && <span className="text-gray-500 ml-2 text-xs">({m.indication})</span>}
                      {m.suspectSecondaire && <span className="ml-2 text-xs text-orange-400">Suspect secondaire</span>}
                      {m.arretAvantEI && <span className="ml-2 text-xs text-amber-400">Arrêté avant l'EI</span>}
                    </div>
                  </div>
                ))}
              </Section>
            )}

            <Section title="⚠️ Effet indésirable">
              {Boolean(raw.eiMeddraTerm) && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-emerald-900/50 text-emerald-400 border border-emerald-800 font-semibold px-2 py-0.5 rounded-full">PT MedDRA</span>
                  <span className="text-gray-200 font-medium text-sm">{String(raw.eiMeddraTerm)}</span>
                  {raw.eiMeddraCode && <span className="text-gray-500 font-mono text-xs">#{String(raw.eiMeddraCode)}</span>}
                  {raw.eiMeddraSoc && <span className="text-gray-500 text-xs">· {String(raw.eiMeddraSoc)}</span>}
                </div>
              )}
              <Row label="Date début" value={raw.eiDateDebut as string} />
              <Row label="Date fin" value={raw.eiEnCours ? "En cours" : raw.eiDateFin as string} />
              <Row label="Évolution" value={raw.eiEvolution as string} />
              {Boolean(raw.eiDescription) && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Description clinique</p>
                  <p className="text-gray-300 bg-gray-800 rounded-lg p-3 text-sm leading-relaxed">{String(raw.eiDescription)}</p>
                </div>
              )}
              {Boolean(raw.examensComplementaires) && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Examens complémentaires</p>
                  <p className="text-gray-300 text-sm">{String(raw.examensComplementaires)}</p>
                </div>
              )}
            </Section>

            <Section title="🔴 Critères de gravité (ICH E2B R3)">
              {gravitesCochees.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {gravitesCochees.map((g) => (
                    <span key={g.key} className="text-xs bg-red-900/40 text-red-400 border border-red-800 font-semibold px-3 py-1 rounded-full">
                      {g.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Non sérieux</p>
              )}
            </Section>

            <Section title="🔬 Imputabilité (Bégaud)">
              <Row label="Score final" value={report.imput_conclusion} />
              <Row label="Chronologie" value={raw.imputChronologie as string} />
              <Row label="Évolution à l'arrêt" value={raw.imputEvolutionArret as string} />
            </Section>

            {Boolean(raw.commentaires) && (
              <Section title="💬 Commentaires">
                <p className="text-gray-300 text-sm">{String(raw.commentaires)}</p>
              </Section>
            )}
          </div>

          {/* Panneau latéral admin */}
          <div className="space-y-4">

            {/* Statut */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-white font-semibold text-sm">Actions administrateur</h3>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Statut</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {STATUTS.map((s) => (
                    <option key={s.val} value={s.val}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">N° de référence CAPM</label>
                <input
                  value={capmRef}
                  onChange={(e) => setCapmRef(e.target.value)}
                  placeholder="Ex : CAPM-2026-00123"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>

              {saved && (
                <p className="text-xs text-emerald-400 text-center">✅ Modifications enregistrées</p>
              )}
            </div>

            {/* Infos techniques */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
              <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3">Informations techniques</h3>
              <div className="text-xs font-mono text-gray-600 break-all">{report.id}</div>
              <div className="text-xs text-gray-500">Source : {report.source}</div>
              <div className="text-xs text-gray-500">Soumis le : {date}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
