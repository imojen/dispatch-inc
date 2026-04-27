# GLOBAL PLAN --- Dispatch Inc. V1

## Usage

- [ ] Ce plan est la checklist unique d'implementation V1 (ordre recommande).
- [ ] Chaque item doit etre valide par code + tests + documentation associee.
- [ ] Ne pas commencer un chapitre suivant tant que les prerequis critiques ne sont pas valides.

---

# Chapter 0 --- Preparation & Governance

## 0.0 Repository identity

- [x] Nom canonique du depot: `dispatch-inc`.
- [x] Branche principale: `main`.
- [x] Politique courante: branche unique `main` (pas de branches secondaires pour le moment).

## 0.1 Alignement initial

- [x] Relire et valider les drafts de reference:
  - [x] `doc/draft/technical_stack_dispatch_inc.md`
  - [x] `doc/draft/product_scope_v1.md`
  - [x] `doc/draft/ubiquitous_language.md`
  - [x] `doc/draft/domain_model_dispatch_inc.md`
  - [x] `doc/draft/balance_catalog_spec.md`
  - [x] `doc/draft/save_contract_and_migrations.md`
  - [x] `doc/draft/main_menu_flows.md`
  - [x] `doc/draft/number_notation_spec.md`
  - [x] `doc/draft/ui_text_catalog_spec.md`
  - [x] `doc/draft/testing_strategy_matrix.md`
  - [x] `doc/draft/quality_gates_and_ci.md`
  - [x] `doc/draft/performance_budget.md`
- [x] Verifier que le scope v1 = totalite des drafts actuels.
- [x] Geler une baseline "V1 Draft Freeze" (2026-04-21, docs v1 drafts aligns).

## 0.2 Regles de travail

- [x] Verifier presence de `AGENTS.md` et alignement des regles.
- [x] Travailler exclusivement sur `main` tant que la strategie multi-branches n'est pas activee.
- [x] Acter que la convention multi-branches sera definie en gouvernance v2 si necessaire.
- [x] Definir convention commits (`type(scope): message`).
- [x] Definir Definition of Done equipe (lint/tests/coverage/docs).

---

# Chapter 1 --- Project Bootstrap

## 1.1 Initialisation repo applicatif

- [x] Initialiser projet Vue 3 + Vite + TypeScript.
- [x] Configurer alias `@/` pour `src/`.
- [x] Ajouter Pinia.
- [x] Ajouter Vitest + config test.
- [x] Ajouter ESLint + config TypeScript stricte.
- [x] Ajouter script `typecheck`.
- [x] Ajouter script `coverage`.

## 1.2 Scripts npm minimaux

- [x] `npm run dev`
- [x] `npm run build`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run test`
- [x] `npm run coverage`

## 1.3 Structure DDD initiale

- [x] Creer dossiers:
  - [x] `src/app`
  - [x] `src/presentation`
  - [x] `src/application`
  - [x] `src/domain`
  - [x] `src/infrastructure`
  - [x] `src/data`
  - [x] `src/shared`
  - [x] `src/styles`
- [x] Ajouter placeholders `README.md` dans chaque couche pour rappeler les regles de dependance.

## 1.4 Qualite immediate

- [x] Lancer `npm run lint`.
- [x] Lancer `npm run typecheck`.
- [x] Lancer `npm run test`.
- [x] Corriger toute erreur bloquante avant suite (tests executees vertes).

---

# Chapter 2 --- Architecture Foundation (DDD + DTO + Ports)

## 2.1 Contracts & DTOs

- [x] Creer `src/application/dto/game.ts`.
- [x] Creer `src/application/dto/save.ts`.
- [x] Creer `src/application/dto/balance.ts`.
- [x] Creer `src/application/dto/content.ts`.
- [x] Definir types DTO minimaux:
  - [x] `GameStateDto`
  - [x] `SaveSlotMetadataDto`
  - [x] `SaveSlotDto`
  - [x] `SaveIndexDto`
  - [x] `ScaleSpecDto`
  - [x] `UpgradeBalanceDto`
  - [x] `BalanceCatalogDto`
  - [x] `UiTextCatalogDto`

## 2.2 Ports application

- [x] Creer `SaveRepository` port.
- [x] Creer `BalanceCatalogRepository` port.
- [x] Creer `Clock` port.
- [x] Creer `TextCatalogRepository` port.

## 2.3 Composition root

- [x] Creer `src/app/di.ts`.
- [x] Enregistrer implementations infrastructure -> ports.
- [x] Exposer factories de use-cases.
- [x] Enregistrer le fournisseur de texte UI (`fr-FR`) via `TextCatalogRepository`.

## 2.4 Boundary enforcement

- [x] Ajouter lint rule/interdiction imports cross-layer invalides.
- [x] Ajouter tests d'architecture (optionnel mais recommande).

## 2.5 Validation quality gate

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run test`

---

# Chapter 3 --- Domain Core (Value Objects + Services)

## 3.1 Value objects

- [x] Implementer `Money`.
- [x] Implementer `PackagesPerSecond`.
- [x] Implementer `TickRate`.
- [x] Implementer `UpgradeLevel`.
- [x] Implementer `SkillLevel`.
- [x] Implementer `WarehouseLevel`.
- [x] Implementer `ScaleId`.
- [x] Implementer `SaveVersion`.
- [x] Ajouter tests unitaires pour chaque value object.

## 3.2 Game domain services

- [x] Creer `domain/game/services/economy.ts`.
- [x] Creer `domain/game/services/tick.ts`.
- [x] Creer `domain/game/services/reset.ts`.
- [x] Creer `domain/game/services/offline.ts`.
- [x] Definir invariants deterministes.
- [x] Ajouter tests unitaires:
  - [x] formule de production
  - [x] stacking multiplicateurs
  - [x] tick variable
  - [x] reset demenagement
  - [x] equivalence offline vs replay ticks

## 3.3 Meta progression domain

- [x] Modeliser skill tree state.
- [x] Implementer verifications prerequis niveaux.
- [x] Implementer branche cachee unlock policy.
- [x] Ajouter tests de policies.

## 3.4 Warehouse progression domain

- [x] Modeliser progression entrepots.
- [x] Implementer checks capacite employees.
- [x] Implementer warehouse unlock policy.
- [x] Tester cas limites (capacity hard cap, surcapacite via skill speciale).

## 3.5 Quality gate

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run test`

---

# Chapter 4 --- Balance Engine (Centralized Scaling)

## 4.1 Balance domain services

- [x] Implementer `ScaleEngine`:
  - [x] curve `linear`
  - [x] curve `exponential`
  - [x] curve `power`
  - [x] curve `piecewise`
  - [x] curve `softcap`
- [x] Implementer `BalanceResolver`.
- [x] Ajouter arrondi (`floor|ceil|nearest`).
- [x] Ajouter bornes `min|max`.

## 4.2 Balance catalog infrastructure

- [x] Creer `src/data/balance/catalog.v1.ts`.
- [x] Creer adapter `infrastructure/balance/catalog/localCatalog.ts`.
- [x] Creer validator schema `infrastructure/balance/validators/balanceSchema.ts`.
- [x] Creer mapper `infrastructure/balance/mappers/catalogMapper.ts`.

## 4.3 Mapping gameplay -> scales

- [x] Mapper `employees` cost/effect scales.
- [x] Mapper `scanners` cost/effect scales.
- [x] Mapper `conveyors` cost/effect scales.
- [x] Mapper `carts` cost/effect scales.
- [x] Mapper `trucks` cost/effect scales.
- [x] Mapper `skills` scales.
- [x] Mapper `warehouses` scales.

## 4.4 Balance tests

- [x] Test unitaire par famille de courbe.
- [x] Tests monotonicite quand requise.
- [x] Tests regression fixtures `catalog.v1`.
- [x] Tests preview `nextCost/nextEffect`.

## 4.5 Quality gate

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run test`
- [x] `npm run coverage` (verifier progression)

---

# Chapter 5 --- Save System (Multi-slot + Migration + Import/Export)

## 5.1 Save repository adapter

- [x] Implementer `SaveRepository` localStorage:
  - [x] lecture index
  - [x] ecriture index
  - [x] lecture slot
  - [x] ecriture slot
  - [x] suppression slot
- [x] Gerer coherence index/payload.

## 5.2 Save use-cases

- [x] `createNewSave`
- [x] `loadSave`
- [x] `deleteSave`
- [x] `exportSave`
- [x] `importSave`
- [x] `autosaveActiveSlot`

## 5.3 Migration pipeline

- [x] Creer `CURRENT_SAVE_VERSION`.
- [x] Implementer migration `v1 -> v2` placeholder pattern.
- [x] Ajouter pipeline incrementale.
- [x] Ajouter backup pre-migration.
- [x] Ajouter handling echec migration.

## 5.4 Import/export details

- [x] Export JSON stable (filename standardise).
- [x] Validation stricte import.
- [x] Collision `id` handling.
- [x] Label collision strategy.

## 5.5 Save tests

- [x] create/load/delete happy path.
- [x] multi-slot list ordering.
- [x] migration success path.
- [x] migration failure path.
- [x] import invalid payload rejection.
- [x] export/import roundtrip integrity.

## 5.6 Quality gate

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run test`

---

# Chapter 6 --- Application Use-cases (Gameplay Orchestration)

## 6.1 Tick orchestration

- [x] Implementer `runTick` use-case.
- [x] Integrer `Clock` port.
- [x] Appliquer clamp `deltaTime`.
- [x] Integrer tickrate variable.

## 6.2 Offline progression

- [x] Implementer `applyOfflineProgress` use-case.
- [x] Chunking replay strategy.
- [x] Limite replay window v1.
- [x] Produire un `offlineReport` (duree retenue, colis dispatches, euros gagnes).

## 6.3 Progression actions

- [x] Implementer use-case `purchaseUpgrade`.
- [x] Implementer use-case `unlockSkill`.
- [x] Implementer use-case `triggerWarehouseReset`.
- [x] Implementer use-case `getUpgradePreview`.

## 6.4 Error contract

- [x] Definir result types success/failure pour tous use-cases.
- [x] Mapper erreurs recoverables vers messages UI.

## 6.5 Application tests

- [x] tests use-case tick/offline.
- [x] tests use-case progression.
- [x] tests error mapping.

## 6.6 Quality gate

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run test`

---

# Chapter 7 --- Presentation Foundation (Routing, Stores, Base UI)

## 7.0 Assets drafts informations : (to be used)

Directory assets/ contient :

- dispatch-inc.png : big logo du splashscreen / home page
- logo.png : petit icon (favicon / menu icon)

## 7.1 Shell application

- [x] Creer `HomePage`.
- [x] Creer `GamePage`.
- [x] Configurer navigation entre pages.

## 7.2 Stores presentation

- [x] `saveMenuStore`
- [x] `gameStore`
- [x] `uiStore`
- [x] Verifier absence de logique metier dans stores.
- [x] Integrer resolution des textes par keys depuis le catalogue central (pas de textes hardcodes).

## 7.3 Main menu flows

- [x] Implementer CTA conditionnel `Continuer` (reprend la save la plus recente).
- [x] Implementer CTA `Nouvelle partie`.
- [x] Implementer vue `Charger` slots.
- [x] Implementer action `Importer` depuis la popup `Charger`.
- [x] Implementer action `Exporter`.
- [x] Implementer action `Supprimer` + confirmation.
- [x] Sur entree directe `/game`, auto-charger la save la plus recente (equivalent `Continuer`) si elle existe.
- [x] Afficher popup bilan offline apres `loadSave` si offline > 2 min et gains > 0.
- [x] Mapper tous les libelles/messages des flows vers le catalogue de textes `fr-FR`.
- [x] Implementer etats vides/erreurs:
  - [x] no saves
  - [x] corrupted save
  - [x] migration failure
  - [x] invalid import

## 7.4 UI smoke tests

- [x] test smoke `Nouvelle partie`.
- [x] test smoke `Charger`.
- [x] test smoke `Importer`.
- [x] test smoke `Supprimer`.
- [x] test smoke popup bilan offline (affichage unique par reprise).
- [x] test smoke resolution des textes via keys (fallback key manquante).

## 7.5 Quality gate

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run test`

---

# Chapter 8 --- Core Gameplay UI (Stats, Upgrades, Central Panel)

## 8.1 Layout implementation

- [x] Layout vertical mono-colonne.
- [x] Header principal `Entrepot niveau X`.
- [x] Barre ressources compacte avec popup stats secondaires.
- [x] Liste verticale des upgrades.
- [x] Responsive minimum desktop -> laptop.
- [x] Refonte direction artistique terminal retro / Minitel / ASCII.
- [x] Footer log terminal avec hints de commande.

## 8.2 Stats panel

- [x] afficher `packages/sec`.
- [x] afficher `euro/sec`.
- [x] afficher `employees/capacity`.
- [x] afficher `tick duration`.
- [x] afficher `next warehouse cost`.

## 8.3 Upgrade entries (liste hotspots)

- [x] entree `employees`.
- [x] entree `scanners`.
- [x] entree `conveyors`.
- [x] entree `carts`.
- [x] entree `trucks`.
- [x] afficher niveau par entree (vue par defaut).
- [x] afficher details upgrade dans chaque entree (description fonctionnelle, effet, cout, etat).
- [x] click entree => tentative d'achat upgrade associee.

## 8.4 Warehouse overlays

- [x] ecran demenagement (reset) complet.
- [x] recap gain skill point.
- [x] CTA unique reprise run.
- [x] popup "Resume offline" (temps, colis, euros).

## 8.5 Skill tree overlay

- [x] arborescence branches principales.
- [x] prerequis visuels.
- [x] interactions unlock.
- [x] tooltips effets.
- [x] branche cachee et conditions d'affichage.
- [x] catalogue v1 complet aligne draft: 7 branches principales + offline + cheat.

## 8.6 Feedback UX

- [x] hover cards.
- [x] click feedback.
- [x] increments numeriques lisses.
- [x] systeme global de notifications toast en haut a droite (style industriel, auto-dismiss).

## 8.7 Quality gate

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run test`

---

# Chapter 9 --- Future Simulation Visual Layer (Post-redesign)

## 9.1 Current direction

- [x] supprimer la dependance a un asset de background pour le panneau central.
- [x] supprimer la notion de zones/regiones positionnees pour les upgrades.
- [x] utiliser temporairement une liste simple de hotspots actionable.

## 9.2 Future visual scene primitives

- [ ] zone entree.
- [ ] zone scan.
- [ ] zone tri.
- [ ] tapis roulants.
- [ ] zone expedition.
- [ ] camions.

## 9.3 Dynamic animations

- [ ] mouvement colis continu.
- [ ] vitesse liee gameplay.
- [ ] densite visuelle progressive.
- [ ] apparition employees selon progression.
- [ ] cycle camions spawn/wait/leave.

## 9.4 Performance-safe rendering

- [ ] eviter rerender complet sur chaque tick.
- [ ] utiliser donnees derivees memoisees.
- [ ] profiler animation loops.

## 9.5 Quality gate

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
- [ ] fixture text catalog `fr-FR.v1` (keys mandatory).
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
- [x] optimiser UI update granularity.
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
- [ ] add locale catalog `en-US` (same keys as `fr-FR`) without UI refactor.

---

# Global Completion Checklist

- [ ] Chapters 0 -> 14 completes
- [ ] V1 feature scope fully delivered
- [ ] V1 documentation synced with implementation
- [ ] Release tag created
