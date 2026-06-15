/** Mappe une voie BDPM/référentiel vers les valeurs du select du formulaire */
export function mapVoie(raw: string): string {
  const v = raw.toLowerCase();
  if (v.includes("orale") || v.includes("oral")) return "Orale (per os)";
  if (v.includes("intraveineuse") || v.includes("intravenous")) return "Intraveineuse (IV)";
  if (v.includes("intramusculaire") || v.includes("intramuscular")) return "Intramusculaire (IM)";
  if (v.includes("sous-cutanée") || v.includes("sous-cutanee") || v.includes("subcutaneous")) return "Sous-cutanée (SC)";
  if (v.includes("transdermique") || v.includes("transdermal")) return "Transdermique";
  if (v.includes("inhalée") || v.includes("inhalation") || v.includes("inhaled")) return "Inhalée";
  if (v.includes("rectale") || v.includes("rectal")) return "Rectale";
  if (v.includes("ophtalmique") || v.includes("ophthalmic") || v.includes("ocular")) return "Ophtalmique";
  return "";
}

/** Mappe une forme BDPM/référentiel vers les valeurs du select du formulaire */
export function mapForme(raw: string): string {
  const f = raw.toLowerCase();
  if (f.includes("comprimé") || f.includes("comprimes") || f.includes("tablet")) return "Comprimé";
  if (f.includes("gélule") || f.includes("gelule") || f.includes("capsule")) return "Gélule";
  if (f.includes("injectable") || f.includes("injection") || f.includes("solution for injection")) return "Solution injectable";
  if (f.includes("sirop") || f.includes("syrup") || f.includes("oral solution")) return "Sirop";
  if (f.includes("pommade") || f.includes("crème") || f.includes("creme") || f.includes("ointment") || f.includes("cream") || f.includes("gel")) return "Pommade / Crème";
  if (f.includes("patch") || f.includes("transdermal")) return "Patch";
  if (f.includes("suppositoire") || f.includes("suppository")) return "Suppositoire";
  if (f.includes("inhalateur") || f.includes("inhaler") || f.includes("aerosol")) return "Inhalateur";
  if (f.includes("gouttes") || f.includes("drops")) return "Gouttes";
  if (f.includes("sachet")) return "Sachet";
  return "";
}
