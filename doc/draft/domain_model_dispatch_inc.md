# Domain Model --- Dispatch Inc.

## Purpose

Definir les aggregates, invariants et regles metier de v1 dans un cadre DDD.

## Bounded Contexts

### 1. Gameplay Context

Responsabilites:
- simulation par ticks
- production/economie de run
- achat upgrades et progression entrepot
- reset de run (demenagement)

### 2. Meta Progression Context

Responsabilites:
- skill points
- arbre de competences
- application des bonus meta a la run

### 3. Balance Context

Responsabilites:
- definition de courbes cout/effet
- resolution des scales via `ScaleEngine`
- garanties de coherence des donnees de balance

### 4. Save Management Context

Responsabilites:
- cycle de vie des slots (create/load/delete/export/import)
- versioning et migration de payload

## Aggregates

### `GameRun` (aggregate root)

Contient:
- ressources runtime (argent, production)
- etat upgrades run
- entrepot actif (niveau, capacite)
- horodatages utiles a la simulation
- parametres de simulation (`tickRate`)

Invariants:
- ressources non negatives
- `tickRate` dans bornes configurees
- capacite employees respectee hors regle explicite de depassement

### `MetaProgression` (aggregate root)

Contient:
- skill points disponibles/depenses
- niveaux de competences par branche
- unlocks de branches/cachees

Invariants:
- points depenses <= points disponibles cumul
- prerequis de niveau respectes

### `SaveSlot` (aggregate root)

Contient:
- metadata (`id`, `label`, `createdAt`, `lastPlayedAt`, `version`)
- `GameStateDto` serialise

Invariants:
- `id` unique dans l'index local
- `version` obligatoire
- slot reference dans index et payload coherent

## Value Objects

- `Money`
- `PackagesPerSecond`
- `TickRate`
- `WarehouseLevel`
- `UpgradeLevel`
- `SkillLevel`
- `ScaleId`
- `SaveVersion`

Tous les value objects sont types, valides a la creation et immutables.

## Domain Services

- `TickService`: applique un tick deterministe
- `EconomyService`: calcule production et gains
- `UpgradeService`: validation achat + application effet
- `ResetService`: effectue demenagement et calcule gain meta
- `OfflineProgressService`: rejoue progression hors-ligne avec les memes regles
- `ScaleEngine`: resout couts/effets a partir du catalogue de scales
- `BalanceResolver`: mappe `ScaleId` + niveau -> valeur metier

## Domain Policies

- `BranchUnlockPolicy`: regles de debloquage branches de competences
- `WarehouseUnlockPolicy`: regles de passage entre entrepots
- `HiddenBranchPolicy`: regles de debloquage branche cachee

## Hard Errors vs Recoverable Errors

Hard errors (bloquants):
- invariant casse au niveau aggregate
- payload de save invalide ou non migrable
- `ScaleId` inexistant

Recoverable errors (retour use-case):
- fonds insuffisants pour achat
- prerequis non satisfaits
- tentative d'action impossible dans l'etat courant
