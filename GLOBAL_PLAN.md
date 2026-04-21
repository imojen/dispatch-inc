# GLOBAL PLAN --- Dispatch Inc. V1

## Usage

- [ ] Ce plan est la checklist unique d'implementation V1 (ordre recommande).
- [ ] Chaque item doit etre valide par code + tests + documentation associee.
- [ ] Ne pas commencer un chapitre suivant tant que les prerequis critiques ne sont pas valides.

---

# Chapter 0 --- Preparation & Governance

## 0.0 Repository identity

- [ ] Nom canonique du depot: `dispatch-inc`.
- [ ] Branche principale: `main`.
- [ ] Politique courante: branche unique `main` (pas de branches secondaires pour le moment).

## 0.1 Alignement initial

- [ ] Relire et valider les drafts de reference:
  - [ ] `doc/draft/technical_stack_dispatch_inc.md`
  - [ ] `doc/draft/product_scope_v1.md`
  - [ ] `doc/draft/ubiquitous_language.md`
  - [ ] `doc/draft/domain_model_dispatch_inc.md`
  - [ ] `doc/draft/balance_catalog_spec.md`
  - [ ] `doc/draft/save_contract_and_migrations.md`
  - [ ] `doc/draft/main_menu_flows.md`
  - [ ] `doc/draft/number_notation_spec.md`
  - [ ] `doc/draft/testing_strategy_matrix.md`
  - [ ] `doc/draft/quality_gates_and_ci.md`
  - [ ] `doc/draft/performance_budget.md`
- [ ] Verifier que le scope v1 = totalite des drafts actuels.
- [ ] Geler une baseline "V1 Draft Freeze" (date + version docs).

## 0.2 Regles de travail

- [ ] Verifier presence de `AGENTS.md` et alignement des regles.
- [ ] Travailler exclusivement sur `main` tant que la strategie multi-branches n'est pas activee.
- [ ] Si besoin de branches plus tard, definir la convention dans un chapitre de gouvernance v2.
- [ ] Definir convention commits (`type(scope): message`).
- [ ] Definir Definition of Done equipe (lint/tests/coverage/docs).

---

# Chapter 1 --- Project Bootstrap

## 1.1 Initialisation repo applicatif

- [ ] Initialiser projet Vue 3 + Vite + TypeScript.
- [ ] Configurer alias `@/` pour `src/`.
- [ ] Ajouter Pinia.
- [ ] Ajouter Vitest + config test.
- [ ] Ajouter ESLint + config TypeScript stricte.
- [ ] Ajouter script `typecheck`.
- [ ] Ajouter script `coverage`.

## 1.2 Scripts npm minimaux

- [ ] `npm run dev`
- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run coverage`

## 1.3 Structure DDD initiale

- [ ] Creer dossiers:
  - [ ] `src/app`
  - [ ] `src/presentation`
  - [ ] `src/application`
  - [ ] `src/domain`
  - [ ] `src/infrastructure`
  - [ ] `src/data`
  - [ ] `src/shared`
  - [ ] `src/styles`
- [ ] Ajouter placeholders `README.md` dans chaque couche pour rappeler les regles de dependance.

## 1.4 Qualite immediate

- [ ] Lancer `npm run lint`.
- [ ] Lancer `npm run typecheck`.
- [ ] Lancer `npm run test`.
- [ ] Corriger toute erreur avant suite.

---

# Chapter 2 --- Architecture Foundation (DDD + DTO + Ports)

## 2.1 Contracts & DTOs

- [ ] Creer `src/application/dto/game.ts`.
- [ ] Creer `src/application/dto/save.ts`.
- [ ] Creer `src/application/dto/balance.ts`.
- [ ] Definir types DTO minimaux:
  - [ ] `GameStateDto`
  - [ ] `SaveSlotMetadataDto`
  - [ ] `SaveSlotDto`
  - [ ] `SaveIndexDto`
  - [ ] `ScaleSpecDto`
  - [ ] `UpgradeBalanceDto`
  - [ ] `BalanceCatalogDto`

## 2.2 Ports application

- [ ] Creer `SaveRepository` port.
- [ ] Creer `BalanceCatalogRepository` port.
- [ ] Creer `Clock` port.

## 2.3 Composition root

- [ ] Creer `src/app/di.ts`.
- [ ] Enregistrer implementations infrastructure -> ports.
- [ ] Exposer factories de use-cases.

## 2.4 Boundary enforcement

- [ ] Ajouter lint rule/interdiction imports cross-layer invalides.
- [ ] Ajouter tests d'architecture (optionnel mais recommande).

## 2.5 Validation quality gate

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`

---

# Chapter 3 --- Domain Core (Value Objects + Services)

## 3.1 Value objects

- [ ] Implementer `Money`.
- [ ] Implementer `PackagesPerSecond`.
- [ ] Implementer `TickRate`.
- [ ] Implementer `UpgradeLevel`.
- [ ] Implementer `SkillLevel`.
- [ ] Implementer `WarehouseLevel`.
- [ ] Implementer `ScaleId`.
- [ ] Implementer `SaveVersion`.
- [ ] Ajouter tests unitaires pour chaque value object.

## 3.2 Game domain services

- [ ] Creer `domain/game/services/economy.ts`.
- [ ] Creer `domain/game/services/tick.ts`.
- [ ] Creer `domain/game/services/reset.ts`.
- [ ] Creer `domain/game/services/offline.ts`.
- [ ] Definir invariants deterministes.
- [ ] Ajouter tests unitaires:
  - [ ] formule de production
  - [ ] stacking multiplicateurs
  - [ ] tick variable
  - [ ] reset demenagement
  - [ ] equivalence offline vs replay ticks

## 3.3 Meta progression domain

- [ ] Modeliser skill tree state.
- [ ] Implementer verifications prerequis niveaux.
- [ ] Implementer branche cachee unlock policy.
- [ ] Ajouter tests de policies.

## 3.4 Warehouse progression domain

- [ ] Modeliser progression entrepots.
- [ ] Implementer checks capacite employees.
- [ ] Implementer warehouse unlock policy.
- [ ] Tester cas limites (capacity hard cap, surcapacite via skill speciale).

## 3.5 Quality gate

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`

---

# Chapter 4 --- Balance Engine (Centralized Scaling)

## 4.1 Balance domain services

- [ ] Implementer `ScaleEngine`:
  - [ ] curve `linear`
  - [ ] curve `exponential`
  - [ ] curve `power`
  - [ ] curve `piecewise`
  - [ ] curve `softcap`
- [ ] Implementer `BalanceResolver`.
- [ ] Ajouter arrondi (`floor|ceil|nearest`).
- [ ] Ajouter bornes `min|max`.

## 4.2 Balance catalog infrastructure

- [ ] Creer `src/data/balance/catalog.v1.ts`.
- [ ] Creer adapter `infrastructure/balance/catalog/localCatalog.ts`.
- [ ] Creer validator schema `infrastructure/balance/validators/balanceSchema.ts`.
- [ ] Creer mapper `infrastructure/balance/mappers/catalogMapper.ts`.

## 4.3 Mapping gameplay -> scales

- [ ] Mapper `employees` cost/effect scales.
- [ ] Mapper `scanners` cost/effect scales.
- [ ] Mapper `conveyors` cost/effect scales.
- [ ] Mapper `carts` cost/effect scales.
- [ ] Mapper `trucks` cost/effect scales.
- [ ] Mapper `skills` scales.
- [ ] Mapper `warehouses` scales.

## 4.4 Balance tests

- [ ] Test unitaire par famille de courbe.
- [ ] Tests monotonicite quand requise.
- [ ] Tests regression fixtures `catalog.v1`.
- [ ] Tests preview `nextCost/nextEffect`.

## 4.5 Quality gate

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run coverage` (verifier progression)

---

# Chapter 5 --- Save System (Multi-slot + Migration + Import/Export)

## 5.1 Save repository adapter

- [ ] Implementer `SaveRepository` localStorage:
  - [ ] lecture index
  - [ ] ecriture index
  - [ ] lecture slot
  - [ ] ecriture slot
  - [ ] suppression slot
- [ ] Gerer coherence index/payload.

## 5.2 Save use-cases

- [ ] `createNewSave`
- [ ] `loadSave`
- [ ] `deleteSave`
- [ ] `exportSave`
- [ ] `importSave`
- [ ] `autosaveActiveSlot`

## 5.3 Migration pipeline

- [ ] Creer `CURRENT_SAVE_VERSION`.
- [ ] Implementer migration `v1 -> v2` placeholder pattern.
- [ ] Ajouter pipeline incrementale.
- [ ] Ajouter backup pre-migration.
- [ ] Ajouter handling echec migration.

## 5.4 Import/export details

- [ ] Export JSON stable (filename standardise).
- [ ] Validation stricte import.
- [ ] Collision `id` handling.
- [ ] Label collision strategy.

## 5.5 Save tests

- [ ] create/load/delete happy path.
- [ ] multi-slot list ordering.
- [ ] migration success path.
- [ ] migration failure path.
- [ ] import invalid payload rejection.
- [ ] export/import roundtrip integrity.

## 5.6 Quality gate

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`

---

# Chapter 6 --- Application Use-cases (Gameplay Orchestration)

## 6.1 Tick orchestration

- [ ] Implementer `runTick` use-case.
- [ ] Integrer `Clock` port.
- [ ] Appliquer clamp `deltaTime`.
- [ ] Integrer tickrate variable.

## 6.2 Offline progression

- [ ] Implementer `applyOfflineProgress` use-case.
- [ ] Chunking replay strategy.
- [ ] Limite replay window v1.

## 6.3 Progression actions

- [ ] Implementer use-case `purchaseUpgrade`.
- [ ] Implementer use-case `unlockSkill`.
- [ ] Implementer use-case `triggerWarehouseReset`.
- [ ] Implementer use-case `getUpgradePreview`.

## 6.4 Error contract

- [ ] Definir result types success/failure pour tous use-cases.
- [ ] Mapper erreurs recoverables vers messages UI.

## 6.5 Application tests

- [ ] tests use-case tick/offline.
- [ ] tests use-case progression.
- [ ] tests error mapping.

## 6.6 Quality gate

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`

---

# Chapter 7 --- Presentation Foundation (Routing, Stores, Base UI)

## 7.1 Shell application

- [ ] Creer `HomePage`.
- [ ] Creer `GamePage`.
- [ ] Configurer navigation entre pages.

## 7.2 Stores presentation

- [ ] `saveMenuStore`
- [ ] `gameStore`
- [ ] `uiStore`
- [ ] Verifier absence de logique metier dans stores.

## 7.3 Main menu flows

- [ ] Implementer CTA `Nouvelle partie`.
- [ ] Implementer vue `Charger` slots.
- [ ] Implementer action `Importer`.
- [ ] Implementer action `Exporter`.
- [ ] Implementer action `Supprimer` + confirmation.
- [ ] Implementer etats vides/erreurs:
  - [ ] no saves
  - [ ] corrupted save
  - [ ] migration failure
  - [ ] invalid import

## 7.4 UI smoke tests

- [ ] test smoke `Nouvelle partie`.
- [ ] test smoke `Charger`.
- [ ] test smoke `Importer`.
- [ ] test smoke `Supprimer`.

## 7.5 Quality gate

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`

---

# Chapter 8 --- Core Gameplay UI (Stats, Upgrades, Warehouse View)

## 8.1 Layout implementation

- [ ] Colonne stats gauche.
- [ ] Vue simulation centrale.
- [ ] Zone cartes upgrades.
- [ ] Responsive minimum desktop -> laptop.

## 8.2 Stats panel

- [ ] afficher `packages/sec`.
- [ ] afficher `euro/sec`.
- [ ] afficher `employees/capacity`.
- [ ] afficher `tick duration`.
- [ ] afficher `next warehouse cost`.

## 8.3 Upgrade cards

- [ ] cards `employees`.
- [ ] cards `scanners`.
- [ ] cards `conveyors`.
- [ ] cards `carts`.
- [ ] cards `trucks`.
- [ ] afficher level current/next, cost, effet.
- [ ] etat disabled si achat impossible.

## 8.4 Warehouse overlays

- [ ] ecran demenagement (reset) complet.
- [ ] recap gain skill point.
- [ ] CTA unique reprise run.

## 8.5 Skill tree overlay

- [ ] arborescence branches principales.
- [ ] prerequis visuels.
- [ ] interactions unlock.
- [ ] tooltips effets.
- [ ] branche cachee et conditions d'affichage.

## 8.6 Feedback UX

- [ ] hover cards.
- [ ] click feedback.
- [ ] increments numeriques lisses.

## 8.7 Quality gate

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`

---

# Chapter 9 --- Simulation Visual Layer (Idle Satisfaction)

## 9.1 Warehouse scene primitives

- [ ] zone entree.
- [ ] zone scan.
- [ ] zone tri.
- [ ] tapis roulants.
- [ ] zone expedition.
- [ ] camions.

## 9.2 Dynamic animations

- [ ] mouvement colis continu.
- [ ] vitesse liee gameplay.
- [ ] densite visuelle progressive.
- [ ] apparition employees selon progression.
- [ ] cycle camions spawn/wait/leave.

## 9.3 Performance-safe rendering

- [ ] eviter rerender complet sur chaque tick.
- [ ] utiliser donnees derivees memoisees.
- [ ] profiler animation loops.

## 9.4 Quality gate

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`

---

# Chapter 10 --- Number & Notation System

## 10.1 Formatter implementation

- [ ] mode `short`.
- [ ] mode `scientific`.
- [ ] mode `engineering`.
- [ ] mode `advanced`.

## 10.2 Context binding

- [ ] HUD format policy.
- [ ] cards format policy.
- [ ] tooltip format policy.
- [ ] debug/raw format policy.

## 10.3 User settings

- [ ] setting `notationMode`.
- [ ] setting `precisionProfile`.
- [ ] setting `showExactInTooltip`.

## 10.4 Notation tests

- [ ] thresholds K/M/B/T.
- [ ] fallback scientific.
- [ ] large values regression.
- [ ] locale rendering checks.

## 10.5 Quality gate

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`

---

# Chapter 11 --- Audio/Visual Polish (v1 level)

## 11.1 Visual coherence

- [ ] appliquer palette/couleurs du draft UI.
- [ ] appliquer typographie cible.
- [ ] unifier spacing tokens.

## 11.2 Interaction polish

- [ ] transitions 150-250ms.
- [ ] states disabled/active/error harmonises.
- [ ] lisibilite stats en moins de 2 secondes.

## 11.3 Final UX pass

- [ ] minimiser clics inutiles.
- [ ] verifier no hidden critical info.
- [ ] verifier progression toujours visible.

---

# Chapter 12 --- Quality Completion & Coverage Hardening

## 12.1 Coverage closure

- [ ] atteindre 100% `src/domain/**`.
- [ ] atteindre 100% `src/application/**`.
- [ ] verifier seuils globaux.

## 12.2 Regression packs

- [ ] fixtures saves par version.
- [ ] fixtures balance catalog.
- [ ] fixtures huge numbers.

## 12.3 Bug bash technique

- [ ] session sur erreurs migration.
- [ ] session sur desync simulation.
- [ ] session sur regressions UI save menu.

## 12.4 Quality gate

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run coverage`

---

# Chapter 13 --- Performance Validation

## 13.1 Instrumentation active

- [ ] ajouter metrics tick p95/p99.
- [ ] ajouter metrics frame drops.
- [ ] ajouter metrics serialisation save.

## 13.2 Budget checks

- [ ] valider tick p95 <= 2ms (target).
- [ ] valider frame stability.
- [ ] valider save payload <= 512KB par slot.
- [ ] valider offline replay budget.

## 13.3 Mitigations si depassement

- [ ] optimiser hotspots domain.
- [ ] optimiser UI update granularity.
- [ ] preparer branche worker spike si seuil depasse.

---

# Chapter 14 --- Release Readiness V1

## 14.1 Functional checklist

- [ ] gameplay loop complet stable.
- [ ] reset + skill progression stable.
- [ ] multi-save stable.
- [ ] import/export stable.
- [ ] offline progress stable.
- [ ] balance data-driven stable.

## 14.2 Documentation finalisation

- [ ] mettre a jour drafts impactes.
- [ ] ajouter guide run local dev.
- [ ] ajouter troubleshooting saves/import.

## 14.3 Final QA

- [ ] parcours utilisateur complet "nouveau joueur".
- [ ] parcours "retour joueur avec save existante".
- [ ] parcours "import d'une save ancienne".
- [ ] parcours "session longue idle".

## 14.4 Go/No-Go

- [ ] tous quality gates verts.
- [ ] aucun bug bloquant ouvert.
- [ ] decision GO v1.

---

# Chapter 15 --- Post-V1 Backlog Seed (Do Not Block V1)

## 15.1 Technical extensions

- [ ] adapter IndexedDB.
- [ ] adapter remote balance catalog.
- [ ] worker simulation complet.

## 15.2 Product extensions

- [ ] cloud save.
- [ ] additional branches/events.
- [ ] deeper meta systems.

---

# Global Completion Checklist

- [ ] Chapters 0 -> 14 completes
- [ ] V1 feature scope fully delivered
- [ ] V1 documentation synced with implementation
- [ ] Release tag created
