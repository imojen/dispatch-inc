# Ubiquitous Language --- Dispatch Inc.

## Purpose

Definir un vocabulaire unique produit/design/engineering pour eviter les ambiguities.

## Core Terms

- `Run`: une session de progression complete, associee a un slot de sauvegarde.
- `Save Slot`: conteneur local d'une run (`id`, metadata, `GameStateDto`).
- `Tick`: unite atomique de simulation logique.
- `TickRate`: nombre de ticks logiques par seconde (`simulation.tickRate`).
- `DeltaTime`: duree simulee appliquee lors d'un tick.
- `Offline Progress`: simulation de progression entre `lastSeen` et `now`.
- `Reset` / `Demenagement`: action qui redemarre la run et accorde des points meta.
- `Architecture Point` / `Skill Point`: monnaie meta gagnee au reset.
- `Upgrade`: achat de progression dans une run.
- `Skill`: bonus meta persistant entre les runs.
- `Warehouse`: palier de progression redefinissant capacite et objectifs.
- `Scale`: definition de courbe (cout/effet par niveau).
- `ScaleId`: identifiant de courbe reference dans une upgrade/skill.
- `Balance Catalog`: source de verite centralisee pour les scales.

## Domain-specific Terms

### Production chain

- `Employee`: source de volume de base.
- `Scanner`: bonus d'efficacite.
- `Conveyor` (`tapis`): acceleration du rythme de production.
- `Cart`: parallelisation de flux.
- `Truck`: multiplicateur de valeur monetaire.

### Economy outputs

- `PackagesPerSecond` (`pps`): debit logique en colis/s.
- `MoneyPerSecond` (`mps`): debit logique en euro/s.
- `Capacity`: limite employees active d'un entrepot.

## DDD and Technical Terms

- `Domain`: regles metier pures, invariants, services.
- `Application Use Case`: orchestration des actions metier.
- `Infrastructure Adapter`: implementation technique (localStorage, formatage, etc.).
- `DTO`: contrat typé traversee de couche.
- `Mapper`: conversion explicite d'un modele vers un autre.

## Naming Conventions

- Un concept metier = un terme stable.
- Les termes domaine sont prioritaires dans le code.
- Les noms de DTO finissent en `Dto`.
- Les ports application finissent en `Repository` ou `Port`.

## Anti-ambiguity Rules

- `Bonus`: variation additive (ex: `+10%`).
- `Multiplier`: variation multiplicative (ex: `x1.2`).
- `Modifier`: terme umbrella (additif ou multiplicatif) explicite par type.
- `Run` != `Save Slot`: la run est le gameplay, le slot est le conteneur.
- `Cost Scale` != `Effect Scale`: une upgrade peut utiliser deux courbes differentes.

## Player-facing vs Internal Terms

Player-facing preferes:
- `Partie`, `Demenagement`, `Competence`, `Entrepot`, `Amelioration`.

Internal/dev preferes:
- `Run`, `Reset`, `SkillPoint`, `ScaleEngine`, `BalanceCatalog`, `GameStateDto`.
