# Testing Strategy Matrix --- Dispatch Inc.

## Purpose

Definir une matrice de tests executable pour la v1.

## Coverage Targets (locked)

- `src/domain/**`: 100%
- `src/application/**`: 100%
- `src/infrastructure/persistence/**`: coverage contract + scenarios critiques
- `src/infrastructure/balance/**`: validation + mapping + integration coverage
- `src/infrastructure/content/**`: text catalog validation + mapping coverage

## Test Layers

### 1. Domain Unit Tests

Scope:
- value objects
- domain services (`tick`, `economy`, `reset`, `offline`, `scaleEngine`)

Rules:
- tests deterministes uniquement
- pas de mock UI/browser

### 2. Application Use-case Tests

Scope:
- `runTick`
- `applyOfflineProgress`
- `createNewSave`
- `loadSave`
- `deleteSave`
- `importSave`
- `exportSave`
- `getUpgradePreview`

Rules:
- mock ports only
- verifier contracts DTO in/out

### 3. Adapter/Contract Tests

Scope:
- `SaveRepository` localStorage adapter
- `BalanceCatalogRepository` adapter
- `TextCatalogRepository` adapter
- migration chain

Rules:
- fixtures versionnees
- verification des invariants index/payload

### 4. UI Smoke Tests

Scope:
- `Continuer`
- `Nouvelle partie`
- `Charger`
- `Importer` (depuis popup `Charger`)
- `Supprimer`
- offline summary popup after resume/load
- fallback erreurs critiques

Rules:
- flux utilisateur seulement
- pas de tests pixel-perfect en v1

## Critical Scenario Matrix

- Tick determinism with variable tickrate
- Offline progression equivalence with repeated ticks
- Save import/export roundtrip integrity
- Save migration chain correctness
- Scale curve correctness (`linear`, `exponential`, `power`, `piecewise`, `softcap`)
- Big-number rounding consistency
- Offline summary popup correctness (duration/packages/money)
- Text catalog key coverage and missing-key fallback behavior

## Regression Strategy

- Golden fixtures for balance catalog (`catalog.v1`)
- Golden fixture for text catalog (`fr-FR.v1`)
- Save fixtures per version (`save.v1`, `save.v2`, ...)
- Large-number edge fixtures (`1e3`, `1e6`, `1e12`, `1e1000`)
- Snapshot suite for notation modes and thresholds

## Required Test Suites (v1)

- `domain/economy.spec.ts`
- `domain/tick.spec.ts`
- `domain/reset.spec.ts`
- `domain/offline.spec.ts`
- `domain/scaleEngine.spec.ts`
- `application/saveFlows.spec.ts`
- `application/progressionFlows.spec.ts`
- `infra/localStorageSaveRepository.spec.ts`
- `infra/balanceCatalog.spec.ts`
- `infra/textCatalog.spec.ts`
- `ui/mainMenu.smoke.spec.ts`
- `ui/offlineSummaryPopup.smoke.spec.ts`
- `ui/textCatalogResolution.smoke.spec.ts`

## CI Gates

- Lint pass required
- Test pass required
- Coverage thresholds required
- No skipped tests in changed files unless explicit justification

## Mutation Testing Policy

- Not mandatory for v1.
- Candidate for post-v1 hardening on `scaleEngine` and economy core.
