"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormData } from "@/lib/declaration/types";
import type { ImputScore } from "../ImputabiliteBegaud";

type Props = {
  form: FormData;
  pvNumber: string;
  isSerieux: boolean;
  isFatal: boolean;
  delaiLegal: number | null;
  imputScore: ImputScore | null;
  onNewDeclaration: () => void;
};

export function SuccessScreen({ form, pvNumber, isSerieux, isFatal, delaiLegal, imputScore, onNewDeclaration }: Props) {
  const [refCopied, setRefCopied] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-lg w-full">

        {/* Titre */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(15,91,87,0.08)" }}>
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Déclaration enregistrée</h1>
          <p className="text-gray-500 text-sm">Votre déclaration a bien été enregistrée.</p>
        </div>

        {/* Numéro de référence */}
        {pvNumber && (
          <div className="rounded-xl px-5 py-3 text-center mb-4" style={{ background: "rgba(15,91,87,0.06)", border: "1px solid rgba(15,91,87,0.2)" }}>
            <p className="text-xs text-[#0F5B57] font-medium mb-1">Référence de déclaration</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-mono font-bold text-[#0F5B57]">{pvNumber}</p>
              <button
                onClick={async () => {
                  try { await navigator.clipboard.writeText(pvNumber); setRefCopied(true); setTimeout(() => setRefCopied(false), 2000); } catch {}
                }}
                className="text-xs font-semibold text-[#0F5B57] border border-[rgba(15,91,87,0.3)] rounded-md px-2 py-1 hover:bg-[rgba(15,91,87,0.08)] transition-colors"
                title="Copier la référence"
              >
                {refCopied ? "✓ Copié" : "Copier"}
              </button>
            </div>
            <p className="text-xs text-[#0F5B57] mt-1">Conservez cette référence pour le suivi</p>
          </div>
        )}

        {/* Alerte si sérieux */}
        {isSerieux && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
            <span className="text-base">⚡</span>
            <div>
              <p className="text-sm font-bold text-red-700">Déclaration sérieuse</p>
              <p className="text-xs text-red-600">
                {isFatal
                  ? "Cas fatal ou mettant en jeu le pronostic vital — délai réglementaire de notification : 7 jours."
                  : "Traitement prioritaire — délai réglementaire de notification : 15 jours."}
              </p>
            </div>
          </div>
        )}

        {/* Résumé de la déclaration soumise */}
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
          <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Résumé de votre déclaration</p>
          </div>
          <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><p className="text-xs text-gray-400">Médicament suspect</p><p className="font-medium text-gray-800">{form.medicamentDCI || form.medicamentNomCommercial || "—"}</p></div>
            <div><p className="text-xs text-gray-400">Effet observé</p><p className="font-medium text-gray-800">{form.eiMeddraTerm || "—"}</p></div>
            <div><p className="text-xs text-gray-400">Patient</p><p className="font-medium text-gray-800">{form.patientAge ? `${form.patientAge} ans` : "—"}{form.patientSexe ? `, ${form.patientSexe}` : ""}</p></div>
            <div><p className="text-xs text-gray-400">Gravité</p><p className={`font-medium ${isSerieux ? "text-red-600" : "text-gray-800"}`}>{isSerieux ? "⚡ Sérieux" : "Non sérieux"}</p></div>
            <div><p className="text-xs text-gray-400">Imputabilité</p><p className="font-medium text-gray-800">{imputScore ? `I${imputScore.Iscore}` : form.imputConclusion || "—"}</p></div>
            <div><p className="text-xs text-gray-400">Concomitants</p><p className="font-medium text-gray-800">{form.medicamentsConcomitants.length} déclaré(s)</p></div>
          </div>
        </div>

        {/* Que se passe-t-il maintenant */}
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
          <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Que se passe-t-il maintenant ?</p>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="text-base mt-0.5">📧</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Accusé de réception par email</p>
                <p className="text-xs text-gray-500">Un email de confirmation vous a été envoyé avec le numéro de référence.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="text-base mt-0.5">🔬</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Analyse pharmacovigilance</p>
                <p className="text-xs text-gray-500">
                  Votre déclaration sera analysée par les services de pharmacovigilance.{" "}
                  {delaiLegal ? `Délai réglementaire : ${delaiLegal} jours.` : "Délai habituel : 30 jours."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="text-base mt-0.5">📄</span>
              <div>
                <p className="text-sm font-medium text-gray-800">PDF CIOMS disponible</p>
                <p className="text-xs text-gray-500">Téléchargez le formulaire CIOMS complet depuis &quot;Mes déclarations&quot;.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="text-base mt-0.5">📊</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Suivi du statut</p>
                <p className="text-xs text-gray-500">Consultez l&apos;évolution de votre déclaration dans &quot;Mes déclarations&quot;.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {pvNumber && (
            <button
              onClick={async () => {
                const { generateDeclarationPDF } = await import("@/lib/generateDeclarationPDF");
                await generateDeclarationPDF(form as unknown as Record<string, unknown>, {
                  pvNumber,
                  declarantNom:         form.declarantNom,
                  declarantPrenom:      form.declarantPrenom,
                  declarantSpecialite:  form.declarantSpecialite,
                  declarantEmail:       form.declarantEmail,
                  declarantTel:         form.declarantTel,
                  declarantNumOrdre:    form.declarantNumOrdre,
                  declarantEtablissement: form.declarantEtablissement,
                  declarantVille:       form.declarantVille,
                });
              }}
              className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              📄 Télécharger PDF de ma déclaration
            </button>
          )}
          <Link
            href="/dashboard/medecin/mes-declarations"
            className="w-full text-center text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors" style={{ background: "#0F5B57" }}
          >
            Voir mes déclarations →
          </Link>
          <Link href="/dashboard/medecin" className="w-full text-center text-sm text-gray-500 hover:text-gray-700 underline py-2">
            Retour au tableau de bord
          </Link>
          <button
            onClick={onNewDeclaration}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-500 underline"
          >
            Faire une nouvelle déclaration
          </button>
        </div>

      </div>
    </div>
  );
}
