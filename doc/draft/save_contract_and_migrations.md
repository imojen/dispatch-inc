# Save Contract & Migrations --- Dispatch Inc.

## Purpose

Definir le contrat de sauvegarde v1, sa strategie de stockage local, et les migrations.

## Product Decisions (v1)

- Une run = un slot = un JSON complet.
- Multi-slots locaux obligatoires.
- Migration au chargement (pas en background).
- Export JSON et import JSON supportes.

## Save Slot DTO Contract

```ts
type SaveSlotMetadataDto = {
  id: string;
  label: string;
  createdAt: string; // ISO timestamp
  lastPlayedAt: string; // ISO timestamp
  version: number; // save payload version
  balanceCatalogVersion: number;
};

type SaveSlotDto = SaveSlotMetadataDto & {
  data: GameStateDto;
};
```

## Game State DTO (top-level contract)

```ts
type GameStateDto = {
  simulation: {
    tickRate: string;
    lastSeenAt: string;
  };
  resources: {
    money: string;
    packages: string;
  };
  progression: {
    warehouseLevel: number;
    architecturePoints: number;
    skillPoints: number;
  };
  upgrades: Record<string, { level: number }>;
  skills: Record<string, { level: number }>;
};
```

Notes:
- Les valeurs numeriques a grand range sont stockees en `string`.
- Les dates sont toujours en ISO UTC.

## Storage Strategy

Keys:
- index: `dispatchinc:saves:index`
- payload: `dispatchinc:save:<id>`
- optional backup before migration: `dispatchinc:save:<id>:backup:<timestamp>`

Index payload:
```ts
type SaveIndexDto = {
  activeSlotId?: string;
  slots: SaveSlotMetadataDto[];
};
```

Write policy:
1. Ecrire payload slot
2. Ecrire index
3. En cas d'echec index, garder payload et retenter index a la prochaine operation

## Load Algorithm

1. Lire index
2. Selectionner slot cible
3. Lire `dispatchinc:save:<id>`
4. Valider schema
5. Migrer si `version` < `CURRENT_SAVE_VERSION`
6. Revalider schema post-migration
7. Hydrater via use-case application

## Migration Rules

- Chaque save porte un `version`.
- Migrations strictement incrementales: `v1 -> v2 -> v3`.
- Migration pure et deterministe (pas d'effets externes).
- Backup du payload brut avant migration.
- Si migration echoue: slot non charge, message utilisateur explicite.

## Compatibility Policy

- Lecture garantie pour `CURRENT` et `CURRENT-1`.
- Versions trop anciennes: blocage avec guidance import manuel/outil de conversion.
- Version future inconnue: blocage (avoid downgrade corruption).

## Import/Export Rules

Export:
- Exporte le `SaveSlotDto` complet du slot actif ou selectionne.
- Format JSON stable, prettified.

Import:
1. Parser JSON
2. Valider schema minimal
3. Verifier `id` collision
4. Si collision: generer nouvel `id` et suffixer `label`
5. Migrer vers version courante
6. Ecrire payload puis index

Rejection criteria:
- JSON invalide
- schema invalide
- migration impossible
- data mandatory manquante

## Error Handling UX

- Corruption detectee: proposer "ignorer", "supprimer slot", "export brut".
- Migration impossible: afficher version detectee + version attendue.
- Import invalide: afficher premiere erreur structurante.

## Test Checklist

- create/load/delete slot
- autosave slot actif
- migration vN -> vN+1
- import collision handling
- backup creation before migration
- index/payload coherence recovery
