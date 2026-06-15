"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { type DoctorProfile, type SavedOrdonnance, posologieLabel, dureeLabel, buildWhatsAppLink, buildSummaryText } from "@/lib/ordonnancier";

const VOIES_LABEL: Record<string, string> = {
  orale: "Orale", IV: "Intraveineuse", SC: "Sous-cutanée", IM: "Intramusculaire",
  topique: "Topique", inhalée: "Inhalée", autre: "Autre",
};

export function OrdonnancePreview({ ordonnance, doctorName, specialite, profile, prescriptionToken, suiviLoading, onBack, onGoToSuivi }: {
  ordonnance: SavedOrdonnance;
  doctorName: string;
  specialite?: string;
  profile: DoctorProfile;
  prescriptionToken: string | null;
  suiviLoading: boolean;
  onBack: () => void;
  onGoToSuivi: () => void;
}) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const dateLabel = new Date(ordonnance.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const validiteLabel = `${ordonnance.validite} mois`;

  async function handleDownload() {
    if (!pdfRef.current) return;
    setDownloading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"), import("html2canvas"),
      ]);

      const el = pdfRef.current;
      const prevBorderRadius = el.style.borderRadius;
      const prevBorder = el.style.border;
      el.style.borderRadius = "0";
      el.style.border = "none";

      const canvas = await html2canvas(el, {
        scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false,
      });

      el.style.borderRadius = prevBorderRadius;
      el.style.border = prevBorder;

      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      let y = margin;
      pdf.addImage(img, "PNG", margin, y, usableWidth, imgHeight);
      let heightLeft = imgHeight - usableHeight;
      while (heightLeft > 0) {
        y -= usableHeight;
        pdf.addPage();
        pdf.addImage(img, "PNG", margin, y, usableWidth, imgHeight);
        heightLeft -= usableHeight;
      }

      pdf.save(`${ordonnance.numero}_${ordonnance.patient.nom.replace(/\s+/g, "_")}.pdf`);
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  function handleWhatsApp() {
    const msg = `Votre ordonnance du ${dateLabel} (${ordonnance.numero}) — générée via MAIA DAWA. Merci de la présenter à votre pharmacien.`;
    window.open(buildWhatsAppLink(msg), "_blank");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildSummaryText(ordonnance));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="px-4 md:px-8 py-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">← Modifier</button>
          <span className="text-xs bg-petrol/5 text-petrol px-2.5 py-1 rounded-full font-medium">Aperçu — {ordonnance.numero}</span>
        </div>

        <div ref={pdfRef} id="ordonnance-pdf" className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5 relative overflow-hidden">
          {ordonnance.type === "securisee" && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center">
              <span className="text-6xl font-black tracking-widest -rotate-12 text-red-900 select-none">SÉCURISÉE</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-300">
            <div className="w-6 h-6 bg-petrol rounded-md flex items-center justify-center">
              <span className="text-white font-black text-[9px]">PV</span>
            </div>
            MAIA DAWA
          </div>

          <div className="flex items-start justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="font-bold text-gray-900 text-lg">{doctorName || "Dr. —"}</p>
              {specialite && <p className="text-sm text-gray-500">{specialite}</p>}
              {profile.etablissement && <p className="text-xs text-gray-400 mt-0.5">{profile.etablissement}</p>}
              {(profile.ville || profile.telephone) && (
                <p className="text-xs text-gray-400">{[profile.ville, profile.telephone && `Tél : ${profile.telephone}`].filter(Boolean).join(" — ")}</p>
              )}
              {profile.numOrdre && <p className="text-xs text-gray-400">N° Ordre : {profile.numOrdre}</p>}
            </div>
            <div className="text-right text-sm text-gray-500 shrink-0">
              <p>{dateLabel}</p>
              <p className="text-xs text-gray-400 mt-1">N° Ord : {ordonnance.numero}</p>
              {ordonnance.type !== "simple" && (
                <p className="text-xs font-semibold text-red-600 mt-1">
                  {ordonnance.type === "securisee" ? "Ordonnance sécurisée" : "Médicaments d'exception"}
                </p>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-700 grid grid-cols-2 gap-x-4 gap-y-1 border-b border-gray-100 pb-4">
            <p><span className="text-gray-400">Patient : </span><span className="font-medium text-gray-900">{ordonnance.patient.nom}</span></p>
            {ordonnance.patient.age && <p><span className="text-gray-400">Âge : </span>{ordonnance.patient.age}</p>}
            {ordonnance.patient.sexe && <p><span className="text-gray-400">Sexe : </span>{ordonnance.patient.sexe === "M" ? "Homme" : "Femme"}</p>}
            {ordonnance.patient.poids && <p><span className="text-gray-400">Poids : </span>{ordonnance.patient.poids} kg</p>}
            {ordonnance.patient.motif && <p className="col-span-2"><span className="text-gray-400">Motif : </span>{ordonnance.patient.motif}</p>}
          </div>

          <div>
            <p className="font-serif italic text-lg text-gray-800 mb-3">Rp/</p>
            <ol className="space-y-4">
              {ordonnance.meds.map((m, i) => (
                <li key={m.id} className="text-sm flex gap-2">
                  <span className="font-semibold text-gray-400 shrink-0">{i + 1}.</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {m.nom}{m.dosage ? ` ${m.dosage}` : ""}
                      {m.nonSubstituable && <span className="ml-2 text-xs font-bold text-red-600 uppercase">Non substituable</span>}
                    </p>
                    <p className="text-gray-600">
                      {[m.forme, m.voie && `Voie : ${VOIES_LABEL[m.voie] || m.voie}`].filter(Boolean).join(" — ")}
                    </p>
                    <p className="text-gray-600">{posologieLabel(m)} pendant {dureeLabel(m)}</p>
                    {m.instructions && <p className="text-gray-500 italic">{m.instructions}</p>}
                    {m.renouvelable && <p className="text-gray-500 text-xs">↻ Renouveler {m.renouvellements} fois</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="pt-12 flex items-end justify-between text-xs text-gray-400">
            <div className="text-center">
              {profile.signatureDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.signatureDataUrl} alt="Signature" className="h-14 object-contain mx-auto mb-1" />
              ) : (
                <div className="w-36 border-b border-gray-300 mb-1" />
              )}
              Signature
            </div>
            <div className="text-center">
              {profile.cachetDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.cachetDataUrl} alt="Cachet" className="h-14 object-contain mx-auto mb-1" />
              ) : (
                <div className="w-36 border-b border-gray-300 mb-1" />
              )}
              Cachet médecin
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
            Validité de l&apos;ordonnance : {validiteLabel} · Généré via MAIA DAWA
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-5">
          <button onClick={() => window.print()} className="bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
            🖨️ Imprimer
          </button>
          <button onClick={handleDownload} disabled={downloading} className="bg-petrol hover:bg-petrol-dark disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
            {downloading ? "Génération..." : "⬇️ Télécharger PDF"}
          </button>
          <button onClick={handleWhatsApp} className="bg-[#25D366] hover:brightness-95 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
            💬 Envoyer par WhatsApp
          </button>
          <button onClick={handleCopy} className="border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
            {copied ? "✓ Copié" : "📋 Copier le résumé"}
          </button>
        </div>

        <div className="mt-3">
          <Link href="/ordonnances/historique" className="block text-center text-xs text-gray-400 hover:text-gray-600 underline">
            Voir l&apos;historique des ordonnances
          </Link>
        </div>

        <div className={`mt-5 rounded-xl border-2 p-5 ${ordonnance.suiviActif ? "border-petrol bg-petrol/5" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🛡️</span>
            <p className="text-base font-bold text-gray-900">Suivi de tolérance</p>
            {ordonnance.suiviActif && (
              <span className="ml-auto text-xs font-bold text-petrol bg-petrol/10 border border-petrol/20 px-2.5 py-1 rounded-full">
                {suiviLoading ? "Activation…" : prescriptionToken ? "ACTIVÉ ✓" : "ACTIVÉ"}
              </span>
            )}
          </div>

          {ordonnance.suiviActif ? (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {["J+7", "J+30", "J+90"].map((j) => (
                  <span key={j} className="text-xs bg-white border border-petrol/20 text-petrol rounded-full px-3 py-1.5 font-medium">📅 {j}</span>
                ))}
              </div>
              <p className="text-xs text-petrol">En cas d&apos;effet signalé → notification immédiate + déclaration pré-remplie (CIOMS).</p>

              {suiviLoading ? (
                <div className="flex items-center gap-2 text-sm text-petrol">
                  <div className="w-4 h-4 border-2 border-petrol border-t-transparent rounded-full animate-spin" />
                  Enregistrement du suivi…
                </div>
              ) : prescriptionToken ? (
                <div className="space-y-2">
                  <div className="bg-white border border-petrol/20 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500 truncate">
                      {typeof window !== "undefined" ? `${window.location.origin}/suivi/${prescriptionToken}` : `/suivi/${prescriptionToken}`}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/suivi/${prescriptionToken}`)}
                      className="text-xs text-petrol font-semibold shrink-0 hover:text-petrol"
                    >
                      Copier
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/suivi/${prescriptionToken}`;
                      const firstMed = ordonnance.meds[0];
                      const msg = `Bonjour,\n\nVotre médecin souhaite suivre votre traitement par ${firstMed?.nom || "médicament"} pour s'assurer de sa bonne tolérance.\n\nMerci de répondre à ce court questionnaire de suivi :\n${link}\n\n(3 minutes max, en français ou en darija)`;
                      window.open(buildWhatsAppLink(msg), "_blank");
                    }}
                    className="w-full bg-[#25D366] hover:brightness-95 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    💬 Envoyer le lien au patient via WhatsApp
                  </button>
                  <button
                    onClick={() => window.open(`/dashboard/medecin/suivi`, "_blank")}
                    className="w-full border border-petrol/30 text-petrol py-2 rounded-lg text-sm font-medium hover:bg-petrol/5 transition-colors"
                  >
                    Voir dans le tableau de suivi →
                  </button>
                </div>
              ) : (
                <button onClick={onGoToSuivi} className="w-full bg-petrol hover:bg-petrol-dark text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  Finaliser le suivi manuellement →
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">Détectez automatiquement les effets indésirables grâce au suivi actif (check-ins J+7, J+30, J+90).</p>
              <button onClick={onGoToSuivi} className="w-full border-2 border-petrol text-petrol font-semibold py-2.5 rounded-lg text-sm hover:bg-petrol/5 transition-colors">
                🛡️ Activer le suivi pour ce patient →
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-5">
          🔒 Vos ordonnances sont stockées uniquement sur cet appareil. MAIA DAWA ne conserve aucune donnée patient.
        </p>

        <style jsx global>{`
          @media print {
            body * { visibility: hidden; }
            #ordonnance-pdf, #ordonnance-pdf * { visibility: visible; }
            #ordonnance-pdf { position: absolute; top: 0; left: 0; width: 100%; border: none; border-radius: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
