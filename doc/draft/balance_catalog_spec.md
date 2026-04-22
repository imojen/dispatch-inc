# Balance Catalog Spec --- Dispatch Inc.

## Purpose

Definir la spec du moteur de scale centralise pour piloter couts et effets.

## Product Decision

- v1 utilise un catalogue local versionne comme source de verite.
- Toute progression numerique (upgrade/skill/warehouse) passe par ce catalogue.

## Objectives

- Centraliser 100% des formules de progression
- Permettre le rebalance sans modifier la logique metier
- Garantir des donnees testables, versionnees et valides au chargement

## Data Contracts

### `ScaleSpecDto`

```ts
type ScaleSpecDto = {
  id: string;
  curve: "linear" | "exponential" | "power" | "piecewise" | "softcap";
  base: string;
  growth?: string;
  exponent?: string;
  steps?: Array<{ levelFrom: number; base: string; growth?: string; exponent?: string }>;
  softcapAt?: string;
  softcapPower?: string;
  rounding: "floor" | "ceil" | "nearest";
  min?: string;
  max?: string;
};
```

### `UpgradeBalanceDto`

```ts
type UpgradeBalanceDto = {
  upgradeId: string;
  maxLevel?: number;
  costScaleId: string;
  effectScaleId: string;
};
```

### `BalanceCatalogDto`

```ts
type BalanceCatalogDto = {
  version: number;
  scales: ScaleSpecDto[];
  upgrades: UpgradeBalanceDto[];
  skills: UpgradeBalanceDto[];
  warehouses: UpgradeBalanceDto[];
};
```

## Supported Curves

- `linear`: `value = base + growth * level`
- `exponential`: `value = base * growth^level`
- `power`: `value = base * level^exponent`
- `piecewise`: sous-courbes par intervalles de niveaux
- `softcap`: attenuation apres un seuil (`softcapAt`, `softcapPower`)

## Mapping to Current Gameplay

Upgrades principales:
- `employees` -> cout `exponential`, effet `linear`/`step`
- `scanners` -> cout `exponential`, effet multiplicatif
- `conveyors` -> cout `exponential`, effet sur `tickRate`
- `carts` -> cout `exponential`, effet flux paralleles
- `trucks` -> cout `exponential`, effet valeur colis

Meta progression:
- branches de competences -> scales dediees par branche/niveau
  - v1 skill ids:
    - `staff.mastery`
    - `scan.mastery`
    - `conveyor.mastery`
    - `sorting.mastery`
    - `shipping.mastery`
    - `warehouse.mastery`
    - `offline.resilience`
    - `cheat.optimization` (branche cachee)
- branche cachee -> scales specifiques avec contraintes de debloquage
  - v1: unlock apres completion des 7 branches principales (35 niveaux / 35)
- branche offline v1: **un seul skill de branche** (`offline.resilience`) dont chaque niveau
  augmente en meme temps:
  - l'efficacite offline
  - la duree offline max
  via deux courbes d'effet liees au meme niveau de skill

Entrepots:
- couts de paliers via scales
- capacites employees via scales ou table piecewise

## Rules (Mandatory)

- Chaque objet upgradable reference des `scaleId`; aucune formule inline.
- La strategie d'arrondi est explicite pour chaque scale.
- Les valeurs sont serialisees en string numerique (big number friendly).
- Les modifications de balance se font dans le catalogue, pas dans les services domaine.

## Validation

Au chargement du catalogue:
- validation schema DTO
- unicite des `scale.id`
- references `costScaleId`/`effectScaleId` resolvables
- bornes de niveau coherentes
- monotonicite pour les courbes qui l'exigent

## Versioning

- Champ `version` obligatoire
- Migration de catalogue geree par version (`catalog.v1`, `catalog.v2`, ...)
- Les saves stockent la version de balance appliquee pour audit/debug

## Runtime Integration (DDD)

- `application` lit le catalogue via `BalanceCatalogRepository`
- `domain` calcule via `ScaleEngine` + `BalanceResolver`
- `presentation` consomme des previews (`nextCost`, `nextEffect`) via use-cases

## Test Requirements

- tests unitaires par type de courbe
- tests d'arrondi et bornes min/max
- tests de non-regression sur fixtures de catalogue
- tests d'integration use-case pour preview cout/effet

## v1 Scope Note

Le catalogue local couvre la totalite des besoins de balance des drafts actuels.  
Un adaptateur distant reste possible ensuite sans changer le domaine (port compatible).
