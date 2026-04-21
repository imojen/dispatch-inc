# Number & Notation Spec --- Dispatch Inc.

## Purpose

Definir les regles de formatage des grands nombres de facon lisible et coherente.

## Product Decisions (v1)

- Calcul gameplay: big-number domain abstraction uniquement.
- Affichage: formatter dedie en presentation/infrastructure.
- Mode par defaut pour nouveaux joueurs: `short`.
- Le joueur peut changer le mode de notation dans les settings.

## Notation Modes

- `short`: `1.23K`, `1.23M`, `1.23B`, `1.23T`
- `scientific`: `1.23e45`
- `engineering`: `123e42`
- `advanced`: notation idle avancee (suffixes etendus apres `T`)

## Context Rules

### Main HUD

- Objectif: lecture immediate.
- Mode recommande: `short` (ou mode joueur).
- Precision: 2 decimals par defaut.
- Valeurs tres petites (`< 1`) affichees avec max 4 decimals.

### Upgrade Cards

- Cout: precision compacte (2 decimals max).
- Effet: format simplifie (`+10%`, `x1.25`, `+1.2K/s`).
- Toujours afficher la variation next level.

### Tooltips / Details

- Afficher valeur formatee + valeur "exacte" tronquee intelligemment.
- Autoriser precision plus haute (jusqu'a 6 decimals utiles).

### Debug / Dev View

- Afficher representation complete serialisable.
- Inclure mode brut (`raw`) optionnel pour troubleshooting.

## Threshold Policy

`short` thresholds:
- `>= 1e3` -> `K`
- `>= 1e6` -> `M`
- `>= 1e9` -> `B`
- `>= 1e12` -> `T`
- au-dela: `advanced` ou fallback `scientific` selon setting

Automatic fallback:
- Si une valeur depasse la table de suffixes active, fallback vers `scientific`.

## Precision and Rounding

- Rounding display only, jamais dans le calcul.
- Policy par defaut: `nearest`.
- Configuration par contexte:
  - HUD: 2 decimals
  - cards: 2 decimals
  - tooltip: 2 a 6 decimals
  - debug: full precision

## Sign and Special Values

- Valeurs negatives: prefixe `-` conserve.
- Zero: afficher `0`.
- NaN/infini: interdit en domaine; si detecte en UI, afficher `ERR`.

## Locale Strategy

- Internal canonical format: `.` decimal separator.
- UI separators depends on locale setting (default fr-FR in product UI).
- Export JSON reste locale-agnostic.

## User Settings

- `notationMode`: `short | scientific | engineering | advanced`
- `precisionProfile`: `compact | standard | detailed`
- `showExactInTooltip`: boolean

## Test Requirements

- Snapshot tests for each mode and context
- Threshold boundary tests around every suffix switch
- Regression tests for very large values
- Locale rendering tests (`fr-FR`, `en-US`)
- Fallback tests to scientific mode
