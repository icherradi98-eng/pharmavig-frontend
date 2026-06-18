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

### 4.1 Doublons produits probables (27 paires) — NE PAS supprimer sans contrôle
Même marque **et** même dosage **et** même forme **et** même packaging, deux `id` distincts (codes CNOPS consécutifs). Probables double-listings d'import à fusionner, OU deux conditionnements réels.

> **Note méthodologique :** le premier audit en annonçait 13 (marques dont *toutes* les variantes étaient identiques — sous-comptage). Le validateur (`npm run validate:referentiel`) groupe par **signature complète** marque+dosage+forme+packaging et trouve **27 paires** exactes — chiffre de référence. La liste complète et à jour est produite par la commande de validation.

Principaux exemples : CRESTOR 5, XARELTO 10, PLAVIX 75, TAHOR 80, GLIVEC 100, MICARDIS 40, RISPERDAL 2, EXFORGE 5/80, STALEVO 50/12.5/200, CO-OLMETEC, AVANDAMET, TOTAPEN, COLCHICINE, SEROPLEX 10, AMAREL 4, NAPROSYNE 500, OFLOCET 200, ZYLORIC 300, LAROXYL 50, ACUPAN, ERYACNE, EFFEXOR LP 75, PAXIL CR 12.5, LEVEMIR PENF, MICROPAKINE LP 100, MYANTALGIC, ELOXATINE 5 mg/ml.

> ⚠️ Les autres « doublons de marque » sont en réalité des **variantes de dosage légitimes** (ex. même marque en 50 mg et 100 mg) — **pas** des doublons, donc non listés ici.

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
| **P1** | Trancher les 27 paires de doublons produits (fusion ou conservation) | ⏳ Manuel |
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
