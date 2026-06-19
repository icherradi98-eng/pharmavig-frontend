# Politique de sourcing — Référentiel clinique MAI DAWA

Objectif : enrichir les monographies à partir des **mêmes sources primaires** que les
bases commerciales (type Vidal), **sans jamais copier** une base propriétaire.

> Principe : les **faits** pharmacologiques (doses, contre-indications, interactions,
> effets indésirables) sont universels et **libres**. Ce qui est protégé, c'est
> **l'expression** (texte rédactionnel, mise en forme) d'un éditeur donné.
> On reprend les faits depuis les sources publiques ; on rédige notre propre texte.

## ✅ Sources autorisées (primaires, publiques)

| Source | Description | Usage |
|---|---|---|
| **RCP marocain** (DMP, sante.gov.ma) | Résumé des Caractéristiques du Produit de l'AMM marocaine | **À privilégier** quand disponible (colle à l'AMM locale) |
| **BDPM** — base-donnees-publique.medicaments.gouv.fr (ANSM) | RCP français officiel, public, réutilisable | Source d'enrichissement principale (déjà branchée via `fetchAnsm`) |
| **EMA** (EPAR) | Évaluations publiques européennes | Médicaments à autorisation centralisée |
| **OMS** | Listes et monographies de référence | Compléments |

Ces sources sont **celles que Vidal lui-même compile**. On va directement à la source.

## ❌ Sources interdites

- **Vidal**, **medicament.ma**, et toute base **propriétaire/commerciale**.
- Aucun **scraping**, aucune **copie** ni **paraphrase systématique** de leur contenu.
- Sources retirées du projet : OpenFDA/FDA, RxNorm, FAERS.

## Règles d'écriture d'une monographie

1. Rédiger **notre propre texte** à partir des faits issus des sources autorisées.
2. Renseigner `source_name` et `source_url` (traçabilité).
3. Statut initial `draft` ou `AI_generated` → **jamais `published`** sans relecture
   médecin (`physician_reviewed`) puis pharmacien (`pharmacist_reviewed`).
4. Séparer les couches : le **fond clinique** vient des sources étrangères publiques ;
   la **disponibilité / prix / formes au Maroc** vient de la couche CNOPS et n'est
   **jamais** déduite d'une source étrangère.

## À confirmer avec l'avocat

- Conditions de **réutilisation commerciale** de la BDPM (licence ouverte, à vérifier).
- Conditions de réutilisation de l'EMA / OMS.
- Statut du RCP marocain pour réutilisation.

*Cette note n'est pas un avis juridique. Validation juridique requise avant exploitation commerciale.*
