# Technical Stack & Architecture --- Dispatch Inc.

## 🎯 Purpose

This document defines the complete technical stack, architecture, and development rules for the project.

Goals:
- Fully client-side idle game
- Maintainable and scalable codebase
- Deterministic simulation
- Domain Driven Development with strict border controls
- 100% test coverage on domain and application game logic

---

# 🧱 Core Stack

## Frontend

- Vue 3
- Vite
- TypeScript
- Pinia (presentation state only)

## Numbers & Formatting

- Big number engine via dedicated domain layer (`Decimal`-like wrapper)
- Human-readable notation formatter (short, scientific, engineering, advanced idle notation)
- All economy math goes through this layer (no raw JS `number` for late game values)

## Balance Engine (data-driven)

- Centralized scale engine for upgrade costs and bonus effects
- No hardcoded growth formulas inside features/components
- Curves are declared in a single balance catalog and resolved by `scaleId`
- Supported curve families: `linear`, `exponential`, `power`, `piecewise`, `softcap`

## Testing

- Vitest
- Target: 100% coverage on logic and calculations in domain/application layers

## Storage

- localStorage adapter (initial infrastructure)
- JSON DTO serialization
- Multi-slot save manager

## Deployment

- Static build (Vite)

---

# 🧠 Core Architecture (DDD)

## Layers and responsibilities

- Presentation (`Vue/Pinia`): rendering, interactions, and view state only
- Application: use-case orchestration, DTO contracts, transaction flow
- Domain: entities, value objects, domain services, invariants
- Infrastructure: localStorage, serialization, migrations, adapters

## Dependency rule (strict)

- `presentation -> application -> domain`
- `infrastructure -> application/domain` through ports/adapters only
- Domain must not import Vue, Pinia, localStorage, or browser APIs

## Border controls (mandatory)

- Any data crossing a layer boundary must use typed DTOs/objects
- Mapping is explicit (`mapper`/`factory`), never implicit shape passing
- Domain models are never persisted or exposed to UI directly

## Separation rules

- No business logic in components or Pinia stores
- No side effects in domain calculations
- Use-cases are the only entry point for game-critical actions

---

# 🧩 DTO Strategy

## DTO contracts

Use typed DTOs for:
- Use-case input/output (`RunTickInputDto`, `RunTickOutputDto`, etc.)
- Save payloads (`SaveSlotDto`, `GameStateDto`)
- Balance payloads (`ScaleSpecDto`, `UpgradeBalanceDto`, `BalanceCatalogDto`)
- Import/export payloads
- Persistence migration payloads

## Mapping chain

- `presentation -> application`: ViewModel/store state mapped to input DTOs
- `application -> domain`: DTOs mapped to domain objects/value objects
- `domain -> application`: domain results mapped to output DTOs
- `application -> infrastructure`: persistence DTOs only

---

# 📁 Project Structure (DDD)

    src/
      app/
        bootstrap.ts
        di.ts

      presentation/
        components/
          layout/
          stats/
          upgrades/
          warehouse/
          modals/
          skills/
        pages/
          HomePage.vue
          GamePage.vue
        stores/
          gameStore.ts
          uiStore.ts
          saveMenuStore.ts
        mappers/
          viewToUseCase.ts
          useCaseToView.ts

      application/
        dto/
          game.ts
          save.ts
          balance.ts
        ports/
          SaveRepository.ts
          Clock.ts
          BalanceCatalogRepository.ts
        useCases/
          runTick.ts
          applyOfflineProgress.ts
          getUpgradePreview.ts
          rebalanceFromCatalog.ts
          createNewSave.ts
          loadSave.ts
          deleteSave.ts
          exportSave.ts
          importSave.ts

      domain/
        balance/
          entities/
          valueObjects/
            ScaleSpec.ts
            ScaleId.ts
          services/
            scaleEngine.ts
            balanceResolver.ts
        game/
          entities/
          valueObjects/
          services/
            tick.ts
            economy.ts
            reset.ts
            offline.ts
          policies/
        save/
          entities/
          valueObjects/
          services/

      infrastructure/
        balance/
          catalog/
            localCatalog.ts
          validators/
            balanceSchema.ts
          mappers/
            catalogMapper.ts
        persistence/
          localStorage/
            saveRepository.ts
            migrations/
            serializers/
        formatting/
          notation.ts
        time/
          browserClock.ts

      data/
        balance/
          catalog.v1.ts
        upgrades.ts
        skills.ts
        warehouses.ts

      shared/
        utils/
          math.ts
          format.ts
          ids.ts
        types/
          brand.ts

      styles/
        tokens.css
        base.css
        layout.css
        components.css

      App.vue
      main.ts

---

# 🔁 Game Loop Architecture

## Tick System

- Tickrate is a gameplay variable (`simulation.tickRate`)
- Base tickrate is configurable and can evolve through upgrades/skills
- Tick interval = `1 / tickRate`
- UI rendering remains independent from logic ticks

## Determinism rules

- Simulation uses fixed-step logic ticks
- Production is expressed per second, then integrated with `deltaTime`
- `deltaTime` is clamped per frame (anti-freeze spike)
- Tickrate changes must not create rounding exploits
- Tick orchestration is done by an application use-case (`runTick`)

## Example flow

    presentation/store trigger
      -> application.runTick(inputDto)
      -> domain.tickService.compute(nextState)
      -> application returns outputDto
      -> presentation store updates view state

---

# 🧮 Economy System

## Domain logic

All economy calculations are pure domain services.

## Centralized scaling model (MANDATORY)

- Costs and effects must be resolved through `ScaleEngine`
- Upgrades store references (`costScaleId`, `effectScaleId`) instead of formulas
- Balancing changes are done in the catalog, not inside domain feature code
- Application layer can expose preview use-cases (`next level cost`, `delta effect`)

Example:

```ts
export function computeProduction(state: DomainGameState): BigNumberLike {
  const base = state.staff.total;
  const efficiency = state.modifiers.scannerEfficiency;
  const carts = state.modifiers.cartMultiplier;

  return base.mul(efficiency).mul(carts);
}
```

Must be:
- Deterministic
- Side-effect free
- Fully testable

## Example balance spec (DTO)

```ts
type ScaleSpecDto = {
  id: string;
  curve: "linear" | "exponential" | "power" | "piecewise" | "softcap";
  base: string;
  growth?: string;
  exponent?: string;
  rounding: "floor" | "ceil" | "nearest";
};
```

## Big-number ready (MANDATORY)

- Economy values must support very large idle-game ranges
- One single number abstraction must be used across domain and persistence DTOs
- No direct floating-point comparisons in economy logic
- Formatting layer must support:
  - short (`1.23M`)
  - scientific (`1.23e45`)
  - engineering (`123e42`)
  - advanced late-game notation (configurable)
- Notation formatting is infrastructure/presentation concern, not domain concern

---

# 💾 Save System

## Save Manager (localStorage-backed adapter)

The game uses a save manager that supports multiple local saves.

DDD responsibilities:
- Domain defines save invariants and slot concepts
- Application defines save use-cases and repository ports
- Infrastructure implements `SaveRepository` with localStorage

## Main menu flow

- `Nouvelle partie` creates a new save slot
- `Charger` opens the local save slot list
- One game run = one save JSON

## Slot model

Each slot stores:
- `id`
- `label`
- `createdAt`
- `lastPlayedAt`
- `version`
- full serialized game state DTO (`data`)

## Storage keys

- save index: `dispatchinc:saves:index`
- one payload per save: `dispatchinc:save:<id>`

## Requirements

- Autosave active slot every 5--15s
- Save on major events
- Create/load/delete slot actions
- Manual export/import
- Export current save as JSON
- Slot operations go through application use-cases only
- Persist DTO payloads only (never raw UI/store snapshots)

## Versioning

```ts
{
  version: 1,
  data: { ... }
}
```

Must support:
- Migration between versions
- Per-slot migration on load

---

# ⏳ Offline Progress

On load:

    delta = now - lastSeen
    applyOfflineProgress(delta)

Rules:
- Must use the same domain logic as tick simulation
- Executed through application use-case, delegated to domain services

---

# 🌳 Skill System

- Skills are domain state
- Skill effects are applied by domain services
- UI only reads projections and triggers use-cases

---

# 🧪 Testing Strategy (MANDATORY)

## Tooling

- Vitest

## Scope

- Domain and application logic are mandatory
- Infrastructure adapter tests for save repository and migrations
- Infrastructure balance catalog validation and mapper tests
- UI smoke tests for save menu flows (`Nouvelle partie`, `Charger`)

## Coverage requirement

100% coverage on:
- `src/domain/**`
- `src/application/**`
- economy calculations
- scale engine calculations
- reset logic
- save/load logic

## Example test

```ts
import { computeProduction } from "@/domain/game/services/economy";

test("basic production", () => {
  const state = {
    staff: { total: bn(10) },
    modifiers: {
      scannerEfficiency: bn(1),
      cartMultiplier: bn(1),
    },
  };

  expect(computeProduction(state).toString()).toBe("10");
});
```

## What must be tested

### Economy

- Production calculation
- Scaling behavior
- Multipliers stacking
- Big-number arithmetic behavior
- Rounding strategy consistency
- Scale curve evaluation (`linear`, `exponential`, `power`, `piecewise`, `softcap`)
- Upgrade cost/effect preview consistency across levels

### Upgrades

- Cost progression
- Effect application

### Skills

- Stacking effects
- Edge cases

### Reset

- State reset correctness
- Skill points gain

### Save system

- Serialization/deserialization
- Version migration
- Multi-slot index handling
- Slot selection and load
- Export/import JSON integrity
- Repository contract compliance (`SaveRepository` port)

### Offline system

- Correct delta application

---

# ⚠️ Strict Rules

## MUST

- Use pure functions for all domain calculations
- Keep deterministic logic
- Type everything (state, DTOs, ports, use-cases)
- Respect DDD boundaries (`presentation/application/domain/infrastructure`)
- Use DTOs at every layer boundary
- Keep domain framework-agnostic
- Route all balance/scaling logic through `ScaleEngine` + catalog

## MUST NOT

- Put business logic inside Vue components or Pinia stores
- Access localStorage/browser APIs from domain layer
- Mutate domain state inside calculation functions
- Mix UI and domain logic
- Bypass application use-cases for game-critical actions
- Hardcode upgrade cost/effect formulas outside the centralized balance catalog

---

# 🎨 Styling Architecture

## tokens.css

- colors
- spacing
- typography

## base.css

- reset
- typography

## layout.css

- grid
- panels

## components.css

- buttons
- cards

---

# 🚀 Build & Dev

## Commands

    npm install
    npm run dev
    npm run build
    npm run lint
    npm run test
    npm run coverage

## Main Menu UX (Save-first entrypoint)

On app start, show:
- `Nouvelle partie`
- `Charger`

If user creates a run, initialize a new slot and enter game.  
If user loads, select an existing slot then hydrate state from its JSON DTO.

---

# 📊 Performance Considerations

- Avoid recalculating full state every frame
- Memoize heavy computations when needed
- Keep DOM minimal in simulation area
- Consider workers if domain simulation grows heavy

---

# 🧠 Future Extensions

- IndexedDB adapter (same `SaveRepository` port)
- Remote balance catalog adapter (same `BalanceCatalogRepository` port)
- Web Workers for simulation orchestration
- Optional cloud save adapter

---

# ✅ Success Criteria

- Game runs entirely client-side
- Domain/application logic fully test-covered
- DDD boundaries remain explicit and respected
- Easy to extend without coupling regressions
- Stable saves across versions

---

End of document.
