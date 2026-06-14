# Référentiel médicament MAIA DAWA — Morocco-first

Base médicament **construite à partir d'une source marocaine officielle** (CNOPS via
data.gov.ma), enrichie ensuite par des sources cliniques publiques. Conçue pour la
prescription **et** la pharmacovigilance. Petite, propre, sourcée, extensible.

## Principe directeur
1. **Source Maroc d'abord** → référencement, prix (PPV / prix hôpital), base de remboursement.
2. **Enrichissement clinique secondaire** (BDPM / ANSM / EMA / HAS) → DCI, CI, EI, grossesse… — **jamais** pour affirmer une disponibilité au Maroc.
3. **Chaque donnée a une source, une date, un statut de validation.**
4. **Rien n'est inventé** : donnée absente → `needs_review` (champ créé, à compléter plus tard).
5. **Une base petite et propre vaut mieux qu'une grosse base fausse.**

## Statuts (jamais « disponible au Maroc » automatiquement)
- `morocco_reference_status`: `referenced_morocco_source` = présent dans une source MA — **≠ disponible**.
- `availability_status`: `availability_unconfirmed` (défaut) → `..._confirmed_by_pharmacist|lab|grossist` → `withdrawn_or_suspected_unavailable`.
- `validation_status`: `needs_review` → `auto_imported` → `validated`.
- Affichage attendu : **« Référencé dans une source marocaine — disponibilité à confirmer. »**

## Sources interdites (sans autorisation)
**Ne jamais** scraper / importer / recopier : **Vidal**, **medicament.ma**, bases propriétaires,
sites commerciaux non licenciés. Si une info y est vue → retrouver la **source officielle**
équivalente (RCP, ANSM, EMA, BDPM, HAS).

## Architecture data
`lib/referentiel/types.ts` — modèle (mappe 1:1 vers Postgres plus tard) :
`substances` · `medicinal_products` · `presentations` · `product_substances` · `sources`
· `clinical_enrichments` · `interaction_rules` · `adverse_event_mapping` · `generic_groups` · `audit_logs`.

`lib/referentiel/seed.ma.json` — **seed prioritaire** (~357 produits / 129 DCI) chargé par l'app.
`lib/referentiel/index.ts` — accès + recherche (accent-insensible, marque/DCI/dosage).

## Pipeline d'import (raw → normalized → seed)
```bash
# 1. déposer le fichier source dans data/raw/
#    (ex. ref-des-medicaments-cnops-2014.xlsx — data.gov.ma, licence ODbL)

# 2. normaliser (parseur XLSX dépendance-zéro) → data/normalized/*.json + import-report.json
node scripts/referentiel/normalize-cnops.mjs --inspect   # aperçu colonnes
node scripts/referentiel/normalize-cnops.mjs             # génère le dataset complet

# 3. construire le seed prioritaire de l'app (plafonné ~3 produits/DCI)
node scripts/referentiel/build-priority-seed.mjs
```
- `data/raw/` est **versionné** (source reproductible). `data/normalized/` est **régénérable** → gitignoré.
- Chaque ligne importée conserve : source, licence, date d'import, `validation_status`.

## Fichiers CNOPS mal structurés
Si le fichier est **structuré** (cas actuel) → mapping direct par en-tête (le script lit la
ligne d'en-tête, pas les positions → s'adapte à une colonne en plus comme `PH`).
Si **semi-structuré** → adapter le parsing, normaliser les colonnes, produire un CSV/JSON propre.
Si **trop ambigu** → **ne pas inventer** : `import-report.json` liste les lignes non importées /
ambiguës (`needs_review`). Le PDF scanné n'est pas supporté automatiquement (saisie/validation manuelle).

## Enrichissement BDPM (préparé, non bloquant)
Mapping prévu (Phase 2) : DCI Maroc → DCI BDPM ; substance → données cliniques publiques.
Stocké dans `clinical_enrichments` avec `source_country` et
`availability_relevance_for_morocco = false` si source étrangère. **BDPM ne prouve jamais la dispo MA.**

## Princeps / génériques
- `product_type`: `princeps` (P) / `generic` (G) / `biosimilar` / `hybrid` / `unknown`.
- Un lien générique↔princeps **ne se déduit pas de la seule DCI** : comparer DCI + dosage + forme + voie (+ conditionnement).
- Lien incertain → `equivalence_confidence = low` + `validation_status = needs_review`.
- **Jamais afficher « substituable » sans source/validation** (`substitution_status` défaut = `needs_review`).
- Les `generic_groups` peuvent être proposés automatiquement, **validation finale humaine**.

## Ajouter progressivement les 500 prioritaires
Le seed couvre les classes prioritaires (antibiotiques, antalgiques, anticoagulants,
antidiabétiques, antihypertenseurs, corticoïdes, psychotropes, oncologie courante…).
Pour étendre : éditer la liste `PRIORITY` dans `build-priority-seed.mjs` (ajout de DCI),
ou relever le plafond `CAP` (produits/DCI), puis relancer le script. La validation
pharmacien fait passer `needs_review` → `validated`.

## Limites actuelles
- Source CNOPS **2014** (à rafraîchir si une version plus récente paraît).
- Pas d'ATC ni de classe thérapeutique dans le fichier source → `atc_code = null` (enrichissement Phase 2).
- Disponibilité réelle **non confirmée** (par design) jusqu'à validation locale.
- Données cliniques (CI/EI/interactions) **pas encore** rattachées — structure prête (`clinical_enrichments`).
