# Product Scope v1 --- Dispatch Inc.

## Purpose

Formaliser le scope produit de la version 1.

Decision de cadrage:
- Le scope v1 couvre la totalite du contenu des drafts actuels.
- Les items explicitement notes `optional` ou `future extension` conservent ce statut par defaut.

Documents de reference:
- `doc/draft/incremental_game_design.md`
- `doc/draft/centre_tri_game_design.md`
- `doc/draft/skill_tree_centre_tri.md`
- `doc/draft/ui_design_spec.md`
- `doc/draft/technical_stack_dispatch_inc.md`

## In Scope (v1)

### Gameplay loop

- Idle loop complet: production automatique, plateau, reset, reprise
- Reset type "demenagement" avec gain de points de competence
- Progression run + meta-progression inter-runs
- Tickrate variable selon les upgrades/competences

### Economie et progression

- Ressource principale: colis/argent
- Ressource meta: points de competence / architecture
- Upgrades de production (employes, scanners, tapis, chariots, camions)
- Entrepots avec couts/capacites progressifs
- Skill tree complet des branches definies dans les drafts
- Branche cachee "optimisation non conventionnelle"

### Balance et simulation

- Balance Engine centralise data-driven
- Scales couts/effets resolus via `ScaleEngine`
- Determinisme de simulation + offline progress coherent
- Support grands nombres et notations avancees

### UX/UI

- Layout desktop-first (stats, simulation centrale, upgrades)
- Simulation entrepot animee et lisible
- Cartes d'upgrade, overlays, ecran arbre de competences
- Feedback visuel instantane sur les actions critiques
- Catalogue de textes UI centralise (`fr-FR`) sans textes hardcodes dans les composants
- Architecture prete multi-langues (ajout futur d'une langue via fichier catalogue)

### Donnees, persistance, qualite

- Multi-saves local (`Nouvelle partie`, `Charger`, suppression)
- Export/import JSON de sauvegarde
- Migrations de sauvegardes versionnees
- Typage strict, DTOs aux frontieres, DDD boundary rules
- Lint, tests et couverture conformes a la stack technique

## Out of Scope (v1)

- Multiplayer/social
- Monetization
- Backend obligatoire

Backlog conditionnel (si temps/disponibilite):
- Cloud save
- Remote balance catalog
- Worker/offloading avance
- Publication de locales additionnelles (`en-US`, etc.)

## Acceptance Criteria v1

- Un joueur peut creer une partie, progresser, reset, quitter, recharger sans perte.
- Le systeme idle reste lisible et satisfaisant sans interaction constante.
- La progression est pilotable via le catalogue balance central.
- Les saves sont compatibles avec versioning/migration.
- Les regles DDD et quality gates sont respectees.

## Definition of Done

- Tous les items in-scope implementes et verifies
- `npm run lint` vert
- `npm run test` vert
- Couverture conforme aux objectifs du draft technique
- Docs de reference mises a jour
