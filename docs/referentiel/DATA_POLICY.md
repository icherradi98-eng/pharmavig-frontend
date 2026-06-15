# Politique de données — Référentiel médicament MAIA DAWA

## 1. Ce qui est "Référentiel Maroc"

**Source :** CNOPS — Référentiel des médicaments (data.gov.ma), licence ODbL.  
**Contenu :** marque commerciale, DCI, dosage, forme, voie, PPV (MAD), prix hôpital, base de remboursement, laboratoire, type princeps/générique.  
**Ce que cela signifie :** le médicament figure dans une source marocaine officielle.  
**Ce que cela NE signifie PAS :** disponibilité actuelle confirmée, prix actuel, remboursement en vigueur.  
**Affichage obligatoire :** badge "Source Maroc · CNOPS (2014 — à rafraîchir)" + avertissement disponibilité.

## 2. Ce qui est "Enrichissement clinique"

**Source :** BDPM (ANSM — France) via API publique `medicaments-api.giygas.dev`.  
**Contenu :** dénomination officielle, forme pharmaceutique, voies d'administration, substances actives, conditions de prescription, génériques référencés en France.  
**Ce que cela signifie :** données cliniques issues du marché français.  
**Ce que cela NE signifie PAS :** disponibilité au Maroc, conformité avec le RCP marocain, remboursement au Maroc.  
**Affichage obligatoire :** badge "Enrichissement clinique : BDPM (France — non opposable au Maroc)" + lien vers DMP (sante.gov.ma).

## 3. Ce qui est "non validé"

Tout ce qui porte `validation_status: "auto_imported"` ou `"needs_review"` :

- **`auto_imported`** : importé depuis le fichier CNOPS, parsé automatiquement, non relu par un professionnel de santé.
- **`needs_review`** : données ambiguës ou incomplètes lors de l'import. Ne pas afficher comme vérité médicale.

Ces données ne constituent pas une validation pharmaceutique, médicale, ni réglementaire.  
Elles sont affichées à titre informatif et de traçabilité uniquement.

## 4. Ce qui ne doit JAMAIS être affiché comme disponibilité réelle

Les règles absolues :

| Donnée | Affichage interdit | Affichage correct |
|---|---|---|
| Médicament dans CNOPS 2014 | "Disponible au Maroc" | "Référencé — disponibilité à confirmer" |
| Prix CNOPS 2014 | "Prix actuel" | "Prix source 2014 — à vérifier" |
| Générique référencé BDPM | "Générique disponible au Maroc" | "Générique référencé en France" |
| Molécule présente dans BDPM | "Médicament disponible" | "Enrichissement clinique source France" |
| Substance avec atc_code null | "ATC non disponible" | ne pas afficher |

## 5. Sources autorisées et interdites

### Autorisées
| Source | Usage | Restrictions |
|---|---|---|
| data.gov.ma / CNOPS | Référencement MA, prix, forme, DCI | Données 2014 — ne pas affirmer dispo |
| BDPM (ANSM) | Enrichissement clinique uniquement | Jamais pour affirmer dispo MA |
| RCP publics EMA / ANSM / HAS | Enrichissement clinique | Jamais pour affirmer dispo MA |
| CAPM | Alertes pharmacovigilance MA | Source de référence pour les déclarations |
| Données terrain MAIA DAWA | Pharmacovigilance locale | Données anonymisées, loi 09-08 |

### Interdites sans autorisation explicite
- **Vidal** — propriétaire, aucun scraping, aucune copie de monographie
- **medicament.ma** — propriétaire, aucune importation
- **OpenFDA / FAERS** — supprimés (source US, non pertinente pour le Maroc)
- **RxNorm** — supprimé (nomenclature US)
- **Bases propriétaires** de laboratoires ou grossistes sans accord contractuel
- **Sites commerciaux** non licenciés

## 6. Codes ATC (OMS)

Le champ `atc_code` existe dans le modèle mais est `null` par défaut.  
**Ne pas importer de dataset ATC complet** avant vérification de la licence OMS pour usage commercial.  
La saisie manuelle unitaire reste autorisée pour les substances les plus courantes.

## 7. Statuts de validation — table de référence

| `validation_status` | Signification | Affiché comment |
|---|---|---|
| `needs_review` | Non vérifié — donnée incertaine | Badge "À vérifier" gris |
| `auto_imported` | Importé automatiquement, non relu | Badge "Importé — non revu" amber |
| `validated` | Validé par pharmacien/médecin/équipe | Badge "Validé" vert |

| `availability_status` | Signification |
|---|---|
| `availability_unconfirmed` | Défaut — ne jamais afficher "disponible" |
| `availability_confirmed_by_pharmacist` | Confirmé par pharmacien local |
| `availability_confirmed_by_lab` | Confirmé par le laboratoire |
| `availability_confirmed_by_grossist` | Confirmé par grossiste |
| `withdrawn_or_suspected_unavailable` | Retiré ou non trouvé |
| `needs_review` | Statut incertain |

## 8. Fraîcheur des sources

| `source_freshness` | Signification | Action requise |
|---|---|---|
| `fresh` | < 2 ans | Normale |
| `stale` | ≥ 2 ans | Afficher avertissement |
| `unknown` | Date absente | Afficher avertissement |

La source CNOPS 2014 a `source_freshness: "stale"` et `source_year: 2014`.  
Surveiller data.gov.ma pour une version plus récente.

## 9. Disclaimer obligatoire

Tout affichage de données médicament doit inclure :

> *"Données issues de sources ouvertes (CNOPS · data.gov.ma), enrichies progressivement. La disponibilité réelle au Maroc doit être confirmée auprès d'une source locale qualifiée. Ces données ne remplacent pas le RCP marocain officiel ni l'avis d'un professionnel de santé."*
