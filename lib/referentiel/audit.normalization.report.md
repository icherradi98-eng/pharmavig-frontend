# Audit de normalisation — Référentiel médicament marocain

**Date :** 2026-06-18
**Source auditée :** `lib/referentiel/seed.ma.json`
**Périmètre :** 357 spécialités marocaines (import CNOPS 2014 prioritaire)

---

## 1. Chiffres clés

| Indicateur | Valeur |
|---|---|
| Produits (spécialités) | **357** |
| Substances (DCI) — avant audit | 129 |
| Substances (DCI) — après correctifs sûrs | **154** |
| Liens produit ↔ substance | 421 |
| Produits liés à ≥ 1 substance | **357 / 357 (100 %)** |
| Produits non liés | 0 |
| Produits combinés (> 1 DCI) | 58 |
| Liens vers substance inexistante (avant) | **27 produits / 25 DCI** |
| Liens cassés (après correctif) | **0** |

Distribution substances/produit : `1 DCI : 299` · `2 DCI : 53` · `3 DCI : 4` · `4 DCI : 1`

---

## 2. Détail par point d'audit

### 2.1 Produits liés / non liés
✅ **100 % des produits sont liés** à au moins une substance via `product_substances`. Aucun produit orphelin.

### 2.2 DCI ambiguë
✅ Aucune substance avec un `dci_fr` vide ou contenant un séparateur d'association (`+`, `/`, « et »). Le modèle est atomique : les associations sont gérées par **plusieurs liens** vers le même produit, pas par une DCI composite. C'est la bonne approche.

### 2.3 Spelling / accents / casse
✅ `normalized_name == norm(dci_fr)` pour 100 % des substances. La normalisation est cohérente (majuscules pour `dci_fr`, minuscule sans accents pour `normalized_name`).

### 2.4 Substances à fusionner
✅ **0 groupe** de substances en doublon (même DCI normalisée). Aucune fusion nécessaire.

### 2.5 Produits combinés (associations)
ℹ️ **58 produits combinés** identifiés (jusqu'à 4 principes actifs : ex. STALEVO = lévodopa + carbidopa + entacapone). Tous correctement modélisés par liens multiples. Détectables via `isCombinationProduct()`.

### 2.6 Classes thérapeutiques manquantes
⚠️ **129/129 substances sans `therapeutic_class`** et **sans `atc_code`**.
- ATC : volontairement `null` (licence OMS à valider avant import en masse — voir contrainte projet). Saisie unitaire OK.
- Classe thérapeutique : à enrichir progressivement, en parallèle des monographies. **Non bloquant.**

### 2.7 Formes / dosages / voies
- Forme manquante : **0**
- Dosage manquant : **0**
- Voie manquante : **21 → 1 après correctif** (20 formes buvables corrigées en `ORALE`)

---

## 3. Corrections sûres effectuées ✅

> Uniquement les évidences déterministes. Aucune suppression. Marquées `needs_review`.

### 3.1 Réparation de 25 substances manquantes (clés étrangères cassées)
27 produits combinés référençaient des `substance_id` jamais matérialisés dans `substances[]`.
La DCI étant **encodée dans le `substance_id`** (ex. `sub-olmesartan` → OLMESARTAN) et correspondant à des INN connus, les 25 substances ont été **créées** avec `validation_status: "needs_review"`, `atc_code: null`, `therapeutic_class: null`.

DCI créées : acide ascorbique, acide salicylique, altizide, amiloride, carbidopa, chlorphénamine, chlorure de potassium, cinéole, entacapone, érysimum, ézétimibe, formotérol, misoprostol, néomycine, nystatine, olmésartan, oxytétracycline, polymyxine B, propyphénazone, rifamycine, rosiglitazone, spiramycine, sulbactam, tégafur, tobramycine.

**Impact :** produits désormais entièrement résolvables (alternatives + monographies) — ex. INEGY, EXFORGE déjà, STALEVO, AVANDAMET, CO-OLMETEC, DIPROSALIC, BACTRIM…

### 3.2 Voie d'administration ORALE déduite (20 présentations)
Toutes les présentations sans `route` dont la forme contient « BUVABLE » (POUDRE POUR SUSPENSION BUVABLE, SOLUTION BUVABLE, GOUTTES BUVABLES…) ont reçu `route: "ORALE"` — déduction déterministe.

---

## 4. Cas nécessitant une validation manuelle (`manual_review_needed`)

### 4.1 Doublons produits probables (13) — NE PAS supprimer sans contrôle
Même marque **et** même dosage/forme/packaging, deux `id` distincts (codes CNOPS différents). Possibles double-listings d'import à fusionner, OU deux conditionnements réels.

| Marque | IDs |
|---|---|
| MICROPAKINE LP 100 MG | `ma-micropakine-lp-100-mg-100-78`, `…-79` |
| TOTAPEN | `ma-totapen-1-123`, `ma-totapen-1-983` |
| CO-OLMETEC | `ma-co-olmetec-20-12-5-204`, `…-205` |
| AVANDAMET | `ma-avandamet-1-500-298`, `…-299` |
| LEVEMIR PENF | `ma-levemir-penf-100-367`, `…-368` |
| PAXIL CR 12.5 MG | `ma-paxil-cr-12-5-mg-12-5-562`, `…-563` |
| ACUPAN | `ma-acupan-20-645`, `ma-acupan-20-2532` |
| EXFORGE 5 MG/80 MG | `ma-exforge-5-mg-80-mg-5-80-761`, `…-762` |
| EFFEXOR LP 75 MG | `ma-effexor-lp-75-mg-75-945`, `…-946` |
| ERYACNE | `ma-eryacne-4-1045`, `ma-eryacne-4-1046` |
| COLCHICINE | `ma-colchicine-1-1408`, `ma-colchicine-1-1409` |
| MICARDIS | `ma-micardis-40-2038`, `ma-micardis-40-2039` |
| MYANTALGIC | `ma-myantalgic-37-50-325-2131`, `…-2132` |

> ⚠️ 71 autres « doublons de marque » sont en réalité des **variantes de dosage légitimes** (ex. même marque en 50 mg et 100 mg) — **pas** des doublons.

### 4.2 Voie ambiguë (1)
- **IMIZINE 10 % — PÂTE DENTAIRE** : usage local bucco-dentaire, route non auto-remplie (à trancher : ORALE vs BUCCOGINGIVALE).

### 4.3 Enrichissement de masse (non bloquant, à planifier)
- `therapeutic_class` : 129 substances à renseigner (idéalement avec les monographies).
- `atc_code` : à saisir unitairement après validation licence OMS.

---

## 5. Priorités de nettoyage recommandées

| Priorité | Action | Statut |
|---|---|---|
| **P0** | Réparer les 25 substances FK cassées | ✅ Fait |
| **P0** | Déduire la voie ORALE des formes buvables | ✅ Fait |
| **P1** | Trancher les 13 doublons produits (fusion ou conservation) | ⏳ Manuel |
| **P1** | Renseigner `therapeutic_class` des 20-30 DCI du pilote | ⏳ Manuel |
| **P2** | Voie d'IMIZINE (pâte dentaire) | ⏳ Manuel |
| **P2** | Compléter `dci_en` et synonymes pour la recherche | ⏳ Plus tard |
| **P3** | ATC après validation licence OMS | ⏳ Plus tard |

---

## 6. Helpers de normalisation disponibles

`lib/referentiel/normalization.ts` :
- `normalizeDci(dci)` — comparaison/recherche DCI
- `normalizeBrand(brand)` — rapproche les variantes d'une marque (retire dosage/forme)
- `dciSlug(dci)` — slug d'URL stable et déterministe
- `getActiveSubstances(productId)` / `isCombinationProduct(productId)` — détection associations
- `listAlternativesByDci(dci)` — alternatives marocaines par substance
- `findBrokenSubstanceRefs()` — audit FK réutilisable (tests/CI)

---

*Migration-ready : tous les correctifs respectent le modèle 5 tables existant et mappent 1:1 vers Postgres. Aucune donnée supprimée ; cas douteux conservés et tracés.*
