import { describe, expect, it } from 'vitest'
import type { GameStateDto } from '@/application/dto/game'
import { GameViewModelResolver } from '@/application/useCases/game/viewModel'
import { balanceCatalogV1 } from '@/data/balance/catalog.v1'

function createBaseState(overrides?: Partial<GameStateDto>): GameStateDto {
  return {
    simulation: {
      tickRate: '1',
      lastSeenAt: '2026-04-21T10:00:00.000Z',
      ...(overrides?.simulation ?? {}),
    },
    resources: {
      money: '0',
      packages: '0',
      ...(overrides?.resources ?? {}),
    },
    progression: {
      warehouseLevel: 1,
      architecturePoints: 0,
      skillPoints: 0,
      ...(overrides?.progression ?? {}),
    },
    upgrades: {
      employees: { level: 1 },
      scanners: { level: 1 },
      conveyors: { level: 0 },
      carts: { level: 0 },
      trucks: { level: 0 },
      ...(overrides?.upgrades ?? {}),
    },
    skills: {
      'offline.resilience': { level: 0 },
      ...(overrides?.skills ?? {}),
    },
  }
}

describe('game view model runtime snapshot', () => {
  it('exposes base and skill-boosted upgrade effects separately', () => {
    const resolver = new GameViewModelResolver(balanceCatalogV1)

    const snapshot = resolver.createSnapshot(
      createBaseState({
        skills: {
          'offline.resilience': { level: 0 },
          'staff.mastery': { level: 1 },
          'scan.mastery': { level: 1 },
        },
      }),
    )

    expect(snapshot.upgrades.employees.baseCurrentEffect).toBe(2)
    expect(snapshot.upgrades.employees.currentEffect).toBe(3)
    expect(snapshot.upgrades.employees.nextEffect).toBe(5)
    expect(snapshot.upgrades.scanners.baseCurrentEffect).toBe(0.1)
    expect(snapshot.upgrades.scanners.currentEffect).toBe(0.2)
    expect(snapshot.upgrades.scanners.nextEffect).toBe(0.4)
  })

  it('makes cadence tend toward 500 ms without reaching it', () => {
    const resolver = new GameViewModelResolver(balanceCatalogV1)

    const snapshot = resolver.createSnapshot(
      createBaseState({
        simulation: {
          tickRate: '1',
          lastSeenAt: '2026-04-21T10:00:00.000Z',
        },
        upgrades: {
          employees: { level: 1 },
          scanners: { level: 0 },
          conveyors: { level: 5 },
          carts: { level: 0 },
          trucks: { level: 0 },
        },
        skills: {
          'offline.resilience': { level: 0 },
          'conveyor.mastery': { level: 5 },
        },
      }),
    )

    expect(snapshot.tickDurationMs).toBeGreaterThan(500)
    expect(snapshot.tickDurationMs).toBeLessThan(600)
  })
})
