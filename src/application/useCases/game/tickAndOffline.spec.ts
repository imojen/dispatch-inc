import { describe, expect, it } from 'vitest'
import type { GameStateDto } from '@/application/dto/game'
import { createApplyOfflineProgressUseCase } from '@/application/useCases/applyOfflineProgress'
import { createRunTickUseCase } from '@/application/useCases/runTick'
import { LocalBalanceCatalogRepository } from '@/infrastructure/balance/catalog/localCatalog'

class StubClock {
  constructor(private currentMs: number) {}

  nowMs(): number {
    return this.currentMs
  }
}

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
      scanners: { level: 0 },
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

describe('chapter 6 - tick/offline use-cases', () => {
  it('runTick clamps delta time and updates resources', async () => {
    const balanceRepository = new LocalBalanceCatalogRepository()
    const clock = new StubClock(Date.parse('2026-04-21T10:00:00.500Z'))
    const runTick = createRunTickUseCase(balanceRepository, clock)

    const result = await runTick({
      state: createBaseState(),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.usedDeltaTimeMs).toBe(250)
    expect(Number(result.value.state.resources.money)).toBeGreaterThan(0)
    expect(result.value.state.simulation.lastSeenAt).toBe('2026-04-21T10:00:00.500Z')
  })

  it('runTick uses variable tickrate to change step count', async () => {
    const balanceRepository = new LocalBalanceCatalogRepository()
    const clock = new StubClock(Date.parse('2026-04-21T10:00:00.250Z'))
    const runTick = createRunTickUseCase(balanceRepository, clock)

    const base = await runTick({ state: createBaseState() })
    const faster = await runTick({
      state: createBaseState({
        simulation: {
          tickRate: '20',
          lastSeenAt: '2026-04-21T10:00:00.000Z',
        },
        upgrades: {
          employees: { level: 1 },
          conveyors: { level: 5 },
        },
      }),
    })

    expect(base.ok).toBe(true)
    expect(faster.ok).toBe(true)

    if (base.ok && faster.ok) {
      expect(Number(faster.value.state.resources.money)).toBeGreaterThan(
        Number(base.value.state.resources.money),
      )
    }
  })

  it('runTick applies base skill multipliers to production', async () => {
    const balanceRepository = new LocalBalanceCatalogRepository()
    const clock = new StubClock(Date.parse('2026-04-21T10:00:01.000Z'))
    const runTick = createRunTickUseCase(balanceRepository, clock)

    const base = await runTick({
      state: createBaseState({
        simulation: {
          tickRate: '1',
          lastSeenAt: '2026-04-21T10:00:00.000Z',
        },
      }),
    })

    const boosted = await runTick({
      state: createBaseState({
        simulation: {
          tickRate: '1',
          lastSeenAt: '2026-04-21T10:00:00.000Z',
        },
        skills: {
          'offline.resilience': { level: 0 },
          'staff.mastery': { level: 1 },
          'scan.mastery': { level: 1 },
          'conveyor.mastery': { level: 1 },
          'sorting.mastery': { level: 1 },
          'shipping.mastery': { level: 1 },
        },
      }),
    })

    expect(base.ok).toBe(true)
    expect(boosted.ok).toBe(true)

    if (base.ok && boosted.ok) {
      expect(Number(boosted.value.state.resources.packages)).toBeGreaterThan(
        Number(base.value.state.resources.packages),
      )
      expect(Number(boosted.value.state.resources.money)).toBeGreaterThan(
        Number(base.value.state.resources.money),
      )
    }
  })

  it('applyOfflineProgress computes offline report with cap and replay window', async () => {
    const balanceRepository = new LocalBalanceCatalogRepository()
    const clock = new StubClock(Date.parse('2026-04-21T18:10:00.000Z'))
    const applyOfflineProgress = createApplyOfflineProgressUseCase(balanceRepository, clock)

    const result = await applyOfflineProgress({
      state: createBaseState({
        simulation: {
          tickRate: '1',
          lastSeenAt: '2026-04-21T10:00:00.000Z',
        },
      }),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.report.countedOfflineDurationMs).toBe(60 * 60 * 1000)
    expect(Number(result.value.report.offlineMoneyGained)).toBeGreaterThan(0)
    expect(Number.isInteger(Number(result.value.report.offlinePackagesDispatched))).toBe(true)
    expect(result.value.replayWindowDurationMs).toBe(6 * 60 * 60 * 1000 + 2 * 60 * 1000)
  })

  it('applyOfflineProgress supports max offline skill levels (100% / 6h)', async () => {
    const balanceRepository = new LocalBalanceCatalogRepository()
    const clock = new StubClock(Date.parse('2026-04-21T16:10:00.000Z'))
    const applyOfflineProgress = createApplyOfflineProgressUseCase(balanceRepository, clock)

    const result = await applyOfflineProgress({
      state: createBaseState({
        simulation: {
          tickRate: '1',
          lastSeenAt: '2026-04-21T10:00:00.000Z',
        },
        skills: {
          'offline.resilience': { level: 5 },
        },
      }),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.report.countedOfflineDurationMs).toBe(6 * 60 * 60 * 1000)
    expect(Number(result.value.report.offlineMoneyGained)).toBeGreaterThan(10000)
  })

  it('applyOfflineProgress can bypass the default trigger for explicit idle rest resume', async () => {
    const balanceRepository = new LocalBalanceCatalogRepository()
    const clock = new StubClock(Date.parse('2026-04-21T10:00:10.000Z'))
    const applyOfflineProgress = createApplyOfflineProgressUseCase(balanceRepository, clock)

    const result = await applyOfflineProgress({
      state: createBaseState({
        simulation: {
          tickRate: '1',
          lastSeenAt: '2026-04-21T10:00:00.000Z',
        },
      }),
      triggerAfterMsOverride: 0,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.report.countedOfflineDurationMs).toBe(10_000)
    expect(Number(result.value.report.offlineMoneyGained)).toBeGreaterThan(0)
  })
})
