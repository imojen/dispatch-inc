# Performance Budget --- Dispatch Inc.

## Purpose

Fixer des objectifs perf mesurables pour la v1 avant implementation.

## Target Device Profile (v1)

- Desktop laptop standard (4 cores, 8 GB RAM)
- Recent mobile browser support is best-effort

## Simulation Budget

- Logic time per tick target (p95): <= 2 ms
- Logic time per tick hard cap (p99): <= 6 ms
- Max simulation time consumed per render frame: <= 8 ms

Tick backlog policy:
- Clamp `deltaTime` par frame
- Process en chunks fixes
- Garder UI responsive meme en rattrapage

## Rendering Budget

- UI target framerate: 60 FPS desktop
- Acceptable minimum under load: 30 FPS
- Max UI update latency after action: <= 100 ms
- Eviter rerender complet a chaque tick (updates ciblees)

## Memory Budget

- Save payload size target per slot: <= 512 KB
- Hard warning threshold per slot: 1 MB
- Runtime memory target long session: <= 200 MB tab usage

## Offline Simulation Limits

- Max delta applique en un batch: 60 secondes simulees
- Offline chunk size: 1 seconde logique (ou equivalent ticks)
- Max offline replay window v1: 7 jours
- Au-dela: appliquer formule de compression/approximation documentee

## Serialization Budget

- Save serialization (p95): <= 25 ms
- Save deserialization + validation (p95): <= 40 ms
- Migration execution (p95): <= 80 ms par slot

## Thresholds for Worker Offload

Passage a Web Worker recommande si l'un de ces seuils est depasse sur 3 runs:
- Tick p95 > 4 ms
- Frame drops > 5% pendant 30 secondes
- Offline replay > 500 ms pour 24h simulees

## Metrics & Instrumentation

Collecter:
- tick duration (avg/p95/p99)
- frame drop ratio
- use-case duration (`runTick`, `applyOfflineProgress`, `loadSave`)
- save serialize/deserialize duration
- migration duration and failure rate

Surface:
- overlay debug dev-only
- logs agreges pour profiling local

## Non-Goals v1

- micro-optimisation prematuree
- benchmarking multi-device complet automatise
