// ─────────────────────────────────────────────────────────────────────────────
// Générateur PDF d'ordonnance — NATIF (jsPDF), jamais une image plate.
//
// Le texte médical est écrit en texte sélectionnable ; seules les images de marque
// (logo, signature, cachet, header/footer, filigrane) sont placées aux coordonnées
// du modèle. Le corps reste lisible, marges préservées, fond blanc.
// Fallback : DEFAULT_TEMPLATE si le médecin n'a pas personnalisé.
// ─────────────────────────────────────────────────────────────────────────────

import { type DoctorProfile, type SavedOrdonnance, posologieLabel, dureeLabel } from "./ordonnancier";
import {
  A4, DEFAULT_TEMPLATE, type PrescriptionTemplate, footerZone, imageFormat,
} from "./prescriptionTemplate";

const VOIES_LABEL: Record<string, string> = {
  orale: "Orale", IV: "Intraveineuse", SC: "Sous-cutanée", IM: "Intramusculaire",
  topique: "Topique", inhalée: "Inhalée", autre: "Autre",
};

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [15, 91, 87];
}

/**
 * Génère et télécharge le PDF d'une ordonnance à partir du modèle de marque.
 * @param tplArg modèle personnalisé ; si absent → modèle MAI DAWA par défaut.
 */
export async function generateOrdonnancePDF(
  ordonnance: SavedOrdonnance,
  profile: DoctorProfile,
  tplArg?: PrescriptionTemplate | null,
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const tpl = tplArg ?? DEFAULT_TEMPLATE;
  const [pr, pg, pb] = hexToRgb(tpl.primaryColor);

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = A4.width, H = A4.height, M = A4.margin;
  const contentW = W - 2 * M;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyPdf = pdf as any;

  const setOpacity = (o: number) => { try { anyPdf.setGState(anyPdf.GState({ opacity: o })); } catch { /* GState absent */ } };
  const addImg = (url: string, x: number, y: number, w: number, h: number) => {
    try { pdf.addImage(url, imageFormat(url), x, y, w, h); } catch { /* image illisible : on ignore */ }
  };

  const fz = footerZone(tpl);

  // ── Filigrane (derrière tout le contenu, opacité réglable) ──
  if (tpl.watermarkDataUrl) {
    setOpacity(Math.max(0, Math.min(1, tpl.watermarkOpacity)));
    addImg(tpl.watermarkDataUrl, tpl.watermark.x, tpl.watermark.y, tpl.watermark.width, tpl.watermark.height);
    setOpacity(1);
  }

  // ── En-tête : bandeau image OU logo + identité médecin (selon headerLayout) ──
  if (tpl.headerImageDataUrl) {
    addImg(tpl.headerImageDataUrl, M, M, contentW, tpl.headerHeight);
  } else {
    if (tpl.logoDataUrl) addImg(tpl.logoDataUrl, tpl.logo.x, tpl.logo.y, tpl.logo.width, tpl.logo.height);

    const doctorName = `Dr. ${profile.prenom} ${profile.nom}`.trim().replace(/^Dr\.\s*$/, "Dr. —");
    const lines: { text: string; size: number; bold: boolean; color: [number, number, number] }[] = [
      { text: doctorName, size: 13, bold: true, color: [17, 24, 39] },
    ];
    if (profile.specialite) lines.push({ text: profile.specialite, size: 9.5, bold: false, color: [80, 80, 80] });
    const meta = [profile.etablissement, profile.ville, profile.telephone && `Tél : ${profile.telephone}`, profile.numOrdre && `N° Ordre : ${profile.numOrdre}`]
      .filter(Boolean).join("  ·  ");
    if (meta) lines.push({ text: meta, size: 8, bold: false, color: [120, 120, 120] });

    // alignement
    const align: "left" | "center" | "right" = tpl.headerLayout;
    const tx = align === "left" ? M : align === "right" ? W - M : W / 2;
    // si logo à gauche et texte à gauche, décaler le texte sous/à côté du logo
    let ty = M + 5;
    for (const ln of lines) {
      pdf.setFont("helvetica", ln.bold ? "bold" : "normal");
      pdf.setFontSize(ln.size);
      pdf.setTextColor(ln.color[0], ln.color[1], ln.color[2]);
      pdf.text(ln.text, tx, ty, { align });
      ty += ln.size * 0.42 + 1.5;
    }
  }

  // trait de séparation header
  pdf.setDrawColor(pr, pg, pb);
  pdf.setLineWidth(0.4);
  pdf.line(M, M + tpl.headerHeight, W - M, M + tpl.headerHeight);

  // ── Date + numéro (coin droit du header) ──
  const dateLabel = new Date(ordonnance.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); pdf.setTextColor(110, 110, 110);
  pdf.text(dateLabel, W - M, M + tpl.headerHeight - 6, { align: "right" });
  pdf.text(`N° Ord : ${ordonnance.numero}`, W - M, M + tpl.headerHeight - 2, { align: "right" });

  let y = M + tpl.headerHeight + 8;

  // ── Bloc patient ──
  pdf.setFontSize(9.5); pdf.setTextColor(40, 40, 40);
  const p = ordonnance.patient;
  const patientBits = [
    `Patient : ${p.nom}`,
    p.age && `Âge : ${p.age}`,
    p.sexe && `Sexe : ${p.sexe === "M" ? "Homme" : "Femme"}`,
    p.poids && `Poids : ${p.poids} kg`,
  ].filter(Boolean) as string[];
  pdf.setFont("helvetica", "bold");
  pdf.text(patientBits.join("    "), M, y);
  y += 5;
  if (p.motif) {
    pdf.setFont("helvetica", "normal"); pdf.setTextColor(90, 90, 90);
    pdf.text(`Motif : ${p.motif}`, M, y); y += 5;
  }
  pdf.setDrawColor(225, 225, 225); pdf.setLineWidth(0.2);
  pdf.line(M, y, W - M, y); y += 7;

  // ── Rp/ ──
  pdf.setFont("times", "italic"); pdf.setFontSize(14); pdf.setTextColor(40, 40, 40);
  pdf.text("Rp/", M, y); y += 7;

  // ── Médicaments (texte sélectionnable, avec retour à la ligne + pagination) ──
  const footerTop = fz.y - 4;
  ordonnance.meds.forEach((m, i) => {
    // saut de page si on entre dans la zone de pied
    if (y > footerTop - 18) { pdf.addPage(); y = M + 6; }

    pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(17, 24, 39);
    const title = `${i + 1}. ${m.nom}${m.dosage ? ` ${m.dosage}` : ""}${m.nonSubstituable ? "  (NON SUBSTITUABLE)" : ""}`;
    for (const line of pdf.splitTextToSize(title, contentW)) { pdf.text(line, M, y); y += 5; }

    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(90, 90, 90);
    const sub = [m.forme, m.voie && `Voie : ${VOIES_LABEL[m.voie] || m.voie}`].filter(Boolean).join(" — ");
    if (sub) { pdf.text(sub, M + 4, y); y += 4.5; }
    const poso = `${posologieLabel(m)} pendant ${dureeLabel(m)}`;
    for (const line of pdf.splitTextToSize(poso, contentW - 4)) { pdf.text(line, M + 4, y); y += 4.5; }
    if (m.instructions) {
      pdf.setFont("helvetica", "italic"); pdf.setTextColor(120, 120, 120);
      for (const line of pdf.splitTextToSize(m.instructions, contentW - 4)) { pdf.text(line, M + 4, y); y += 4.5; }
    }
    if (m.renouvelable) {
      pdf.setFont("helvetica", "normal"); pdf.setTextColor(120, 120, 120); pdf.setFontSize(8);
      pdf.text(`Renouveler ${m.renouvellements} fois`, M + 4, y); y += 4.5;
    }
    y += 3;
  });

  // ── Pied de page : bandeau image OU signature + cachet (zone footer) ──
  if (tpl.footerImageDataUrl) {
    addImg(tpl.footerImageDataUrl, M, H - M - tpl.footerHeight, contentW, tpl.footerHeight);
  } else {
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(130, 130, 130);
    // Signature
    if (tpl.signatureDataUrl) addImg(tpl.signatureDataUrl, tpl.signature.x, tpl.signature.y, tpl.signature.width, tpl.signature.height);
    pdf.text("Signature", tpl.signature.x + tpl.signature.width / 2, tpl.signature.y + tpl.signature.height + 3, { align: "center" });
    // Cachet
    if (tpl.stampDataUrl) addImg(tpl.stampDataUrl, tpl.stamp.x, tpl.stamp.y, tpl.stamp.width, tpl.stamp.height);
    pdf.text("Cachet", tpl.stamp.x + tpl.stamp.width / 2, tpl.stamp.y + tpl.stamp.height + 3, { align: "center" });
  }

  // ── Ligne de validité (bas de page) ──
  pdf.setDrawColor(225, 225, 225); pdf.setLineWidth(0.2);
  pdf.line(M, H - M + 2, W - M, H - M + 2);
  pdf.setFontSize(7.5); pdf.setTextColor(150, 150, 150);
  pdf.text(`Validité : ${ordonnance.validite} mois  ·  Généré via MAI DAWA`, W / 2, H - M + 6, { align: "center" });

  pdf.save(`${ordonnance.numero}_${ordonnance.patient.nom.replace(/\s+/g, "_")}.pdf`);
}
