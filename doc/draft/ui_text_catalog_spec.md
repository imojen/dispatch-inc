# UI Text Catalog Spec --- Dispatch Inc.

## Purpose

Definir une strategie centralisee pour tous les textes UI/UX, en francais uniquement pour la v1.

## Product Decisions (v1)

- Langue unique supportee en v1: `fr-FR`.
- Aucun texte UI ne doit etre hardcode dans les composants/pages.
- Tous les libelles, titres, messages, boutons et erreurs UI proviennent d'un catalogue central.
- Objectif d'architecture: pouvoir ajouter l'anglais (ou autre) en traduisant/ajoutant un fichier de catalogue, sans refactor UI metier.

## Architecture Rules (DDD)

- `domain`: ne contient aucun texte de presentation.
- `application`: retourne des codes/keys de message, pas des phrases UI hardcodees.
- `presentation`: resout les keys via un service de catalogue de textes.
- `infrastructure`: fournit le catalogue `fr-FR` versionne.

## Data Model (Draft)

```ts
type UiTextKey = string;

type UiTextCatalogDto = {
  locale: "fr-FR";
  version: number;
  entries: Record<UiTextKey, string>;
};
```

## Key Naming Convention

- format: `section.subsection.item`
- exemples:
  - `home.cta.continue`
  - `home.cta.newRun`
  - `home.cta.load`
  - `home.load.import`
  - `save.error.corrupted`
  - `offline.report.title`
  - `offline.report.moneyLabel`

## Mandatory Coverage of Text Keys

- Home/menu principal
- Save management
- Offline report popup
- Upgrade cards
- Warehouse hotspot upgrade descriptions (one dedicated text key per upgrade, e.g. `game.upgrades.employees.description`)
- Global toast notifications (success/error/info messages)
- Skill tree labels
- Errors and warnings
- Empty states

## Fallback Policy

- En v1, fallback local unique: afficher `[missing:<key>]` en dev.
- En production, fallback sur une phrase de secours minimalement lisible.
- Chaque key manquante doit etre journalisee.

## Validation Rules

- unicite des keys
- valeurs non vides
- aucune key orpheline pour les ecrans critiques
- schema valide au chargement

## Testing Requirements

- test de validation du catalogue (`fr-FR`)
- test snapshot des ecrans critiques avec resolution de keys
- test "no hardcoded UI string" sur composants critiques
- test de fallback key manquante

## Future-proofing (post-v1)

- Structure prete pour d'autres locales sans refactor.
- Ajout d'une locale = nouveau fichier catalogue + validation.
- Le "switch langue" doit reposer sur le choix d'un fichier locale compatible (`fr-FR.v1.ts`, `en-US.v1.ts`, etc.).
