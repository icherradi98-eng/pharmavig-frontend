// ─────────────────────────────────────────────────────────────────────────────
// Couche d'accès au référentiel médicament Morocco-first (seed CNOPS prioritaire).
// Recherche accent-insensible par marque / DCI / dosage, avec statuts source &
// validation. Données : data.gov.ma (CNOPS, ODbL) — disponibilité À CONFIRMER.
// ─────────────────────────────────────────────────────────────────────────────

import raw from "./seed.ma.json";
import type {
  ReferentielDataset, MedicinalProduct, Substance, Presentation, ProductSubstance, Source,
} from "./types";

const data = raw as unknown as ReferentielDataset;

export const DISCLAIMER =
  "Données issues de sources ouvertes et/ou publiques (CNOPS · data.gov.ma), enrichies progressivement. " +
  "La disponibilité réelle au Maroc doit être confirmée auprès d'une source locale qualifiée.";

const norm = (s: string) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

const subById = new Map(data.substances.map((s) => [s.id, s]));
const linksByProduct = new Map<string, ProductSubstance[]>();
for (const l of data.product_substances) {
  if (!linksByProduct.has(l.product_id)) linksByProduct.set(l.product_id, []);
  linksByProduct.get(l.product_id)!.push(l);
}
const presByProduct = new Map(data.presentations.map((p) => [p.medicinal_product_id, p]));
const srcById = new Map(data.sources.map((s) => [s.id, s]));

export type ProductView = {
  product: MedicinalProduct;
  presentation: Presentation | null;
  substances: { substance: Substance | undefined; link: ProductSubstance }[];
  source: Source | undefined;
};

export function getProductView(id: string): ProductView | null {
  const product = data.medicinal_products.find((p) => p.id === id);
  if (!product) return null;
  const links = linksByProduct.get(id) ?? [];
  return {
    product,
    presentation: presByProduct.get(id) ?? null,
    substances: links.map((link) => ({ substance: subById.get(link.substance_id), link })),
    source: srcById.get(product.source_primary_id),
  };
}

export type SearchResult = {
  id: string;
  brand_name: string;
  dci: string;
  product_type: MedicinalProduct["product_type"];
  availability_status: MedicinalProduct["availability_status"];
  validation_status: MedicinalProduct["validation_status"];
};

/** Recherche accent-insensible sur marque OU DCI ; tolère les fautes mineures (sous-chaîne). */
export function searchProducts(query: string, limit = 30): SearchResult[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const out: SearchResult[] = [];
  for (const p of data.medicinal_products) {
    const links = linksByProduct.get(p.id) ?? [];
    const dcis = links.map((l) => subById.get(l.substance_id)?.dci_fr).filter(Boolean) as string[];
    const hay = norm(p.brand_name + " " + dcis.join(" "));
    if (hay.includes(q)) {
      out.push({
        id: p.id, brand_name: p.brand_name, dci: dcis.join(" / ") || "—",
        product_type: p.product_type, availability_status: p.availability_status, validation_status: p.validation_status,
      });
      if (out.length >= limit) break;
    }
  }
  return out;
}

export const referentielStats = {
  substances: data.substances.length,
  products: data.medicinal_products.length,
  source: data.sources[0]?.source_name ?? "—",
  version: data.version,
};

export { data as referentielData };
