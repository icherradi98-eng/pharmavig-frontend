"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, ReportDetail } from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  brouillon:     { label: "Brouillon",        color: "bg-gray-100 text-gray-600" },
  soumis:        { label: "Soumis au CAPM",   color: "bg-blue-100 text-blue-700" },
  transmis_capm: { label: "Transmis au CAPM", color: "bg-emerald-100 text-emerald-700" },
  traite:        { label: "Traité",           color: "bg-violet-100 text-violet-700" },
};

const GRAVITE_LABELS = [
  { key: "gravite_deces",              label: "Décès" },
  { key: "gravite_vie_danger",         label: "Mise en danger de vie immédiate" },
  { key: "gravite_hospitalisation",    label: "Hospitalisation / prolongation" },
  { key: "gravite_incapacite",         label: "Incapacité / invalidité persistante" },
  { key: "gravite_anomalie_congenitale", label: "Anomalie congénitale" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-gray-400 w-48 shrink-0">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

export default function DeclarationDetail() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getReport(id)
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
      Chargement...
    </div>
  );

  if (error || !report) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 font-medium mb-3">{error || "Déclaration introuvable"}</p>
        <Link href="/dashboard/medecin/mes-declarations" className="text-sm text-emerald-600 hover:underline">
          ← Retour à mes déclarations
        </Link>
      </div>
    </div>
  );

  const st = STATUS_LABELS[report.status] || { label: report.status, color: "bg-gray-100 text-gray-600" };
  const date = new Date(report.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const raw = report.raw_data as Record<string, unknown> | undefined;
  const gravitesCochees = GRAVITE_LABELS.filter((g) => report[g.key as keyof ReportDetail]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/medecin/mes-declarations" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Retour
          </Link>
          <div>
            <div className="font-semibold text-gray-900 text-sm">
              Déclaration — {report.drug_dci || report.drug_nom_commercial || "Médicament non précisé"}
            </div>
            <div className="text-xs text-gray-400">Soumise le {date}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {report.gravite_serieux && (
            <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-1 rounded-full">⚡ Sérieux</span>
          )}
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${st.color}`}>{st.label}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-4">

        {/* Référence CAPM */}
        {report.capm_reference && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-emerald-600 text-lg">✅</span>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Référence CAPM</p>
              <p className="text-xs font-mono text-emerald-700">{report.capm_reference}</p>
            </div>
          </div>
        )}

        {/* Numéro PV interne */}
        {raw?.begaud_score === undefined && raw?.typeDeclaration !== undefined && (
          <div className="bg-gray-100 rounded-xl px-5 py-3 text-xs text-gray-500 font-mono">
            Type : {String(raw.typeDeclaration) || "—"}
          </div>
        )}

        {/* Section Déclarant */}
        {raw && (
          <Section title="👨‍⚕️ Déclarant">
            <Row label="Nom" value={`Dr ${raw.declarantPrenom as string} ${raw.declarantNom as string}`} />
            <Row label="Spécialité" value={raw.declarantSpecialite as string} />
            <Row label="Établissement" value={raw.declarantEtablissement as string} />
            <Row label="Ville" value={raw.declarantVille as string} />
            <Row label="Email" value={raw.declarantEmail as string} />
            <Row label="Téléphone" value={raw.declarantTel as string} />
            <Row label="N° Ordre" value={raw.declarantNumOrdre as string} />
            <Row label="Type de déclaration" value={raw.typeDeclaration as string} />
          </Section>
        )}

        {/* Section Patient */}
        <Section title="🧑 Patient (anonymisé)">
          <Row label="Âge" value={report.patient_age ? `${report.patient_age} ans` : undefined} />
          <Row label="Sexe" value={report.patient_sexe} />
          <Row label="Poids" value={report.patient_poids ? `${report.patient_poids} kg` : undefined} />
          <Row label="Taille" value={report.patient_taille ? `${report.patient_taille} cm` : undefined} />
          <Row label="Grossesse" value={report.patient_grossesse} />
          {raw && <Row label="Insuffisance rénale" value={raw.patientInsuffisanceRenaleStade as string} />}
          {raw && <Row label="Insuffisance hépatique" value={raw.patientInsuffisanceHepatiqueStade as string} />}
          <Row label="Antécédents" value={report.patient_antecedents} />
          <Row label="Allergies" value={report.patient_allergies} />
        </Section>

        {/* Section Médicament suspect */}
        <Section title="💊 Médicament suspect">
          <Row label="DCI" value={report.drug_dci} />
          <Row label="Nom commercial" value={report.drug_nom_commercial} />
          <Row label="Forme" value={report.drug_forme} />
          <Row label="Voie" value={report.drug_voie} />
          <Row label="Posologie" value={report.drug_posologie} />
          <Row label="Indication" value={report.drug_indication} />
          <Row label="Date début" value={report.drug_date_debut} />
          <Row label="Date fin" value={report.drug_date_fin} />
          <Row label="N° de lot" value={report.drug_lot} />
          <Row label="Laboratoire" value={report.drug_laboratoire} />
          {raw && <Row label="N° AMM" value={raw.medicamentAMM as string} />}
        </Section>

        {/* Médicaments concomitants */}
        {report.concomitants && report.concomitants.length > 0 && (
          <Section title="📋 Médicaments concomitants">
            {report.concomitants.map((c, i) => (
              <div key={i} className="flex gap-4 text-sm py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-400 text-xs w-5 shrink-0">{i + 1}.</span>
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{c.nom || "—"}</span>
                  {c.posologie && <span className="text-gray-400 ml-2 text-xs">{c.posologie}</span>}
                  {c.indication && <span className="text-gray-500 ml-2 text-xs">({c.indication})</span>}
                </div>
              </div>
            ))}
          </Section>
        )}
        {raw?.aucunConcomitant === true && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-sm text-gray-500">
            ✅ Absence de médicaments concomitants confirmée par le déclarant
          </div>
        )}

        {/* Effet indésirable */}
        <Section title="⚠️ Effet indésirable">
          {raw && <Row label="Terme MedDRA (PT)" value={`${raw.eiMeddraTerm as string}${raw.eiMeddraCode ? ` #${raw.eiMeddraCode}` : ""}`} />}
          {raw && <Row label="SOC MedDRA" value={raw.eiMeddraSoc as string} />}
          <Row label="Date début" value={report.ei_date_debut} />
          <Row label="Date fin" value={report.ei_date_fin} />
          <Row label="Évolution" value={report.ei_evolution} />
          {report.ei_description && (
            <div className="text-sm">
              <span className="text-gray-400 block mb-1">Description clinique</span>
              <p className="text-gray-900 bg-gray-50 rounded-lg p-3 text-xs leading-relaxed">{report.ei_description}</p>
            </div>
          )}
          {raw && <Row label="Examens complémentaires" value={raw.examensComplementaires as string} />}
        </Section>

        {/* Gravité */}
        <Section title="🔴 Critères de gravité (ICH E2B R3)">
          {gravitesCochees.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {gravitesCochees.map((g) => (
                <span key={g.key} className="text-xs bg-red-100 text-red-700 font-semibold px-3 py-1 rounded-full">
                  {g.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Non sérieux — déclaration volontaire</p>
          )}
        </Section>

        {/* Imputabilité */}
        <Section title="🔬 Imputabilité (Méthode Bégaud)">
          <Row label="Score final" value={report.imput_conclusion} />
          {raw?.begaud_score && (
            <div className="flex gap-3 mt-1">
              {["Cscore", "Sscore", "Iscore"].map((k) => (
                <div key={k} className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold text-emerald-700">
                    {k === "Iscore" ? `I${(raw.begaud_score as Record<string, number>)[k]}` : (raw.begaud_score as Record<string, number>)[k]}
                  </div>
                  <div className="text-xs text-gray-500">{k.replace("score", "")}</div>
                </div>
              ))}
            </div>
          )}
          <Row label="Chronologie" value={report.imput_chronologie} />
          <Row label="Évolution à l'arrêt" value={report.imput_evolution_arret} />
          <Row label="Ré-administration" value={report.imput_readministration} />
        </Section>

        {/* Commentaires */}
        {report.commentaires && (
          <Section title="💬 Commentaires libres">
            <p className="text-sm text-gray-700 leading-relaxed">{report.commentaires}</p>
          </Section>
        )}

      </main>
    </div>
  );
}
