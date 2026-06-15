/**
 * generateDeclarationPDF
 * Génère un PDF A4 portrait structuré depuis les données FormData du formulaire médecin.
 * Utilise jsPDF v4. Appelé côté client uniquement (browser).
 */

// Import dynamique pour éviter les erreurs SSR
export async function generateDeclarationPDF(
  form: Record<string, unknown>,
  meta: {
    pvNumber: string;
    isDemo?: boolean;
    declarantNom?: string;
    declarantPrenom?: string;
    declarantSpecialite?: string;
    declarantEmail?: string;
    declarantTel?: string;
    declarantNumOrdre?: string;
    declarantEtablissement?: string;
    declarantVille?: string;
  }
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210; // largeur A4 mm
  const margin = 14;
  const contentW = W - margin * 2;
  let y = 0;

  // ─── Couleurs MAIA DAWA ────────────────────────────────────────────
  const PETROL   = [15, 91, 87]   as const;   // #0F5B57
  const GOLD     = [212, 175, 55] as const;   // #D4AF37
  const NIGHT    = [31, 45, 61]   as const;   // #1F2D3D
  const LIGHT_BG = [247, 243, 238] as const;  // #F7F3EE
  const GRAY_TXT = [100, 110, 120] as const;
  const BLACK    = [30, 30, 30]   as const;

  // ─── Helpers ──────────────────────────────────────────────────────
  function setColor(r: number, g: number, b: number) {
    doc.setTextColor(r, g, b);
  }
  function setFill(r: number, g: number, b: number) {
    doc.setFillColor(r, g, b);
  }
  function setDraw(r: number, g: number, b: number) {
    doc.setDrawColor(r, g, b);
  }

  function checkNewPage(needed = 12) {
    if (y + needed > 280) {
      doc.addPage();
      y = 18;
      drawPageHeader();
    }
  }

  function drawPageHeader() {
    setFill(...PETROL);
    doc.rect(0, 0, W, 8, "F");
    setFill(...GOLD);
    doc.rect(0, 8, W, 1.5, "F");
  }

  function sectionTitle(title: string) {
    checkNewPage(16);
    setFill(...PETROL);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    setColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin + 3, y + 4.8);
    y += 9;
  }

  function row(label: string, value: string | undefined | null, opts?: { bold?: boolean; alert?: boolean }) {
    if (!value) return;
    checkNewPage(7);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(...GRAY_TXT);
    doc.text(label, margin + 2, y);

    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    if (opts?.alert) {
      setColor(180, 30, 30);
    } else {
      setColor(...BLACK);
    }
    const lines = doc.splitTextToSize(value, contentW - 50);
    doc.text(lines, margin + 52, y);
    y += lines.length * 5.5;
  }

  function separator() {
    checkNewPage(4);
    setDraw(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, y, W - margin, y);
    y += 3;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PAGE 1 — EN-TÊTE
  // ═══════════════════════════════════════════════════════════════════
  drawPageHeader();

  // Logo / titre
  y = 18;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  setColor(...PETROL);
  doc.text("MAIA DAWA", margin, y);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setColor(...GOLD);
  doc.text("Pharmacovigilance Intelligence", margin, y + 5);

  // Titre du document
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  setColor(...NIGHT);
  const docTitle = "Déclaration d'Effet Indésirable Médicamenteux";
  doc.text(docTitle, W / 2, y, { align: "center" });

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  setColor(...GRAY_TXT);
  doc.text("Formulaire conforme CIOMS II — conforme aux standards de pharmacovigilance", W / 2, y + 5.5, { align: "center" });

  // Référence & date
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  setFill(...LIGHT_BG);
  setDraw(...PETROL);
  doc.setLineWidth(0.4);
  doc.roundedRect(W - margin - 58, 12, 58, 16, 2, 2, "FD");
  doc.setFontSize(7);
  setColor(...GRAY_TXT);
  doc.text("Référence", W - margin - 54, 17);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  setColor(...PETROL);
  doc.text(meta.pvNumber, W - margin - 54, 22);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  setColor(...GRAY_TXT);
  doc.text(dateStr, W - margin - 54, 26);

  // Watermark démo
  if (meta.isDemo) {
    doc.setFontSize(52);
    doc.setFont("helvetica", "bold");
    setColor(220, 50, 50);
    doc.saveGraphicsState?.();
    doc.setGState?.(new (doc as unknown as { GState: new (o: unknown) => unknown }).GState({ opacity: 0.12 }));
    doc.text("DÉMONSTRATION", W / 2, 160, { align: "center", angle: 45 });
    doc.restoreGraphicsState?.();
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
  }

  y = 36;

  // Ligne dorée de séparation
  setFill(...GOLD);
  doc.rect(margin, y, contentW, 0.6, "F");
  y += 4;

  // ─── SECTION DÉCLARANT ─────────────────────────────────────────────
  sectionTitle("1. Déclarant");

  const nom = meta.declarantNom || String(form.declarantNom || "");
  const prenom = meta.declarantPrenom || String(form.declarantPrenom || "");
  const specialite = meta.declarantSpecialite || String(form.declarantSpecialite || "");

  row("Nom & Prénom", `Dr ${prenom} ${nom}`.trim(), { bold: true });
  row("Spécialité", specialite);
  row("N° d'ordre", String(form.declarantNumOrdre || meta.declarantNumOrdre || "—"));
  row("Établissement", String(form.declarantEtablissement || meta.declarantEtablissement || "—"));
  row("Ville", String(form.declarantVille || meta.declarantVille || "—"));
  row("Email", String(form.declarantEmail || meta.declarantEmail || "—"));
  row("Téléphone", String(form.declarantTel || meta.declarantTel || "—"));
  y += 2;

  // ─── SECTION PATIENT ───────────────────────────────────────────────
  sectionTitle("2. Patient");

  row("Âge", form.patientAge ? `${form.patientAge} ans` : undefined);
  row("Sexe", String(form.patientSexe || "—"));
  row("Poids / Taille", [
    form.patientPoids ? `${form.patientPoids} kg` : null,
    form.patientTaille ? `${form.patientTaille} cm` : null,
  ].filter(Boolean).join(" / ") || undefined);
  row("Grossesse", form.patientGrossesse ? `${form.patientGrossesse}${form.patientGrossesseSemaines ? ` (${form.patientGrossesseSemaines} SA)` : ""}` : undefined);
  row("Allaitement", String(form.patientAllaitement || "—"));
  row("Antécédents", String(form.patientAntecedents || "—"));
  row("Allergies", String(form.patientAllergies || "—"));
  if (form.patientInsuffisanceRenaleStade) row("Insuff. rénale", String(form.patientInsuffisanceRenaleStade));
  if (form.patientInsuffisanceHepatiqueStade) row("Insuff. hépatique", String(form.patientInsuffisanceHepatiqueStade));
  y += 2;

  // ─── SECTION MÉDICAMENT SUSPECT ────────────────────────────────────
  sectionTitle("3. Médicament suspect");

  row("DCI", String(form.medicamentDCI || "—"), { bold: true });
  row("Nom commercial", String(form.medicamentNomCommercial || "—"));
  row("Forme / Voie", [form.medicamentForme, form.medicamentVoie].filter(Boolean).join(" / ") || undefined);
  row("Posologie", [
    form.medicamentPosologie,
    form.medicamentFrequence,
  ].filter(Boolean).join(" — ") || undefined);
  row("Indication", String(form.medicamentIndication || "—"));
  row("Début traitement", String(form.medicamentDateDebut || "—"));
  row("Fin traitement", String(form.medicamentDateFin || "Non précisée"));
  row("N° lot", String(form.medicamentLot || "—"));
  row("Laboratoire", String(form.medicamentLaboratoire || "—"));
  y += 2;

  // ─── SECTION MÉDICAMENTS CONCOMITANTS ──────────────────────────────
  const concos = (form.medicamentsConcomitants as Array<Record<string, unknown>> | undefined) ?? [];
  if (form.aucunConcomitant) {
    sectionTitle("4. Médicaments concomitants");
    checkNewPage(8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    setColor(...GRAY_TXT);
    doc.text("Aucun médicament concomitant déclaré.", margin + 3, y);
    y += 7;
  } else if (concos.length > 0) {
    sectionTitle("4. Médicaments concomitants");
    concos.forEach((c, i) => {
      checkNewPage(10);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      setColor(...NIGHT);
      doc.text(`${i + 1}. ${String(c.nom || "Médicament non précisé")}`, margin + 3, y);
      y += 5.5;
      row("Posologie", `${c.posologieDose} ${c.posologieUnite} — ${c.posologieFrequence}`);
      row("Indication", String(c.indication || "—"));
      if (c.arretAvantEI) {
        doc.setFontSize(7.5);
        setColor(120, 80, 0);
        doc.text("▸ Arrêté avant l'EIM", margin + 5, y);
        y += 5;
      }
      if (c.suspectSecondaire) {
        doc.setFontSize(7.5);
        setColor(150, 50, 50);
        doc.text("▸ Suspect secondaire", margin + 5, y);
        y += 5;
      }
      separator();
    });
  }

  // ─── SECTION EFFET INDÉSIRABLE ─────────────────────────────────────
  doc.addPage();
  y = 18;
  drawPageHeader();

  sectionTitle("5. Effet indésirable médicamenteux");

  if (form.eiMeddraTerm) {
    row("Terme MedDRA", `${form.eiMeddraTerm}${form.eiMeddraCode ? ` (code ${form.eiMeddraCode})` : ""}`, { bold: true });
  }
  row("Description clinique", String(form.eiDescription || "—"));
  row("Date de début", String(form.eiDateDebut || "—"));
  row("Date de fin", String(form.eiDateFin || "Non précisée"));
  row("Évolution", String(form.eiEvolution || "—"));
  y += 3;

  // Gravité
  checkNewPage(12);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  setColor(...NIGHT);
  doc.text("Gravité :", margin + 2, y);
  y += 6;

  const gravites: Array<{ key: string; label: string }> = [
    { key: "graviteDeces",                label: "Décès" },
    { key: "graviteVieDanger",            label: "Mise en danger de vie immédiate" },
    { key: "graviteHospitalisation",      label: "Hospitalisation ou prolongation" },
    { key: "graviteIncapacite",           label: "Incapacité / invalidité persistante" },
    { key: "graviteAnomalieCongenitale",  label: "Anomalie congénitale" },
    { key: "graviteMedicalementSignificatif", label: "Médicalement significatif" },
    { key: "graviteNonSerieux",           label: "Non sérieux" },
  ];

  gravites.forEach(({ key, label }) => {
    const val = !!form[key];
    checkNewPage(6);
    doc.setFontSize(8);
    doc.setFont("helvetica", val ? "bold" : "normal");
    setColor(val ? 180 : 160, val ? 30 : 160, val ? 30 : 160);
    doc.text(`${val ? "☑" : "☐"}  ${label}`, margin + 4, y);
    y += 5.5;
  });
  y += 2;

  // ─── SECTION IMPUTABILITÉ BÉGAUD ───────────────────────────────────
  sectionTitle("6. Imputabilité médicamenteuse (Méthode Bégaud)");

  row("Chronologie (C)", String(form.imputChronologie || "—"));
  row("Sémiologie (S)", String(form.imputSemiologie || "—"));
  row("Bibliographie (B)", String(form.imputBibliographie || "—"));
  row("Délai d'apparition", String(form.imputDelaiApparition || "—"));
  row("Evolution à l'arrêt", String(form.imputEvolutionArret || "—"));
  row("Ré-administration", String(form.imputReadministration || "—"));
  if (form.imputConclusion) {
    checkNewPage(10);
    setFill(...PETROL);
    doc.roundedRect(margin, y, contentW, 9, 1.5, 1.5, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    setColor(255, 255, 255);
    doc.text(`Conclusion : ${form.imputConclusion}`, margin + 4, y + 5.8);
    y += 12;
  }
  y += 2;

  // ─── SECTION COMMENTAIRES & NOTIFICATIONS ──────────────────────────
  sectionTitle("7. Commentaires & notifications");

  row("Commentaires", String(form.commentaires || "Aucun"));
  row("Accusé de réception", form.notifAccuseReception ? "Oui" : "Non");
  row("Suivi du statut", form.notifSuiviStatut ? "Oui" : "Non");
  row("Email de notification", String(form.notifEmail || form.declarantEmail || "—"));
  y += 4;

  // ─── PIED DE PAGE ──────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setFill(...PETROL);
    doc.rect(0, 291, W, 6, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    setColor(200, 230, 228);
    doc.text(
      `MAIA DAWA — Déclaration ${meta.pvNumber} — Confidentiel`,
      margin, 295
    );
    doc.text(`Page ${i} / ${totalPages}`, W - margin, 295, { align: "right" });
    if (meta.isDemo) {
      setColor(255, 200, 200);
      doc.text("DOCUMENT DE DÉMONSTRATION — NON VALABLE POUR SOUMISSION RÉELLE", W / 2, 295, { align: "center" });
    }
  }

  // ─── Téléchargement ────────────────────────────────────────────────
  const filename = `MAIA_DAWA_${meta.isDemo ? "DEMO_" : ""}${meta.pvNumber}.pdf`;
  doc.save(filename);
}
