import { describe, expect, it } from 'vitest'
import type { GameStateDto } from '@/application/dto/game'
import { createPurchaseUpgradeUseCase } from '@/application/useCases/purchaseUpgrade'
import { createTriggerWarehouseResetUseCase } from '@/application/useCases/triggerWarehouseReset'
import { createUnlockUpgradeUseCase } from '@/application/useCases/unlockUpgrade'
import { createUnlockSkillUseCase } from '@/application/useCases/unlockSkill'
import { balanceCatalogV1 } from '@/data/balance/catalog.v1'
import { BalanceResolver } from '@/domain/balance/services/balanceResolver'
import { WAREHOUSE_RESET_STARTING_MONEY } from '@/domain/game/services/reset'
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
      money: '5000',
      packages: '0',
      ...(overrides?.resources ?? {}),
    },
    progression: {
      warehouseLevel: 1,
      architecturePoints: 0,
      skillPoints: 3,
      ...(overrides?.progression ?? {}),
    },
    upgrades: {
      employees: { level: 0 },
      scanners: { level: 0 },
      conveyors: { level: 0 },
      carts: { level: 0 },
      trucks: { level: 0 },
      ...(overrides?.upgrades ?? {}),
    },
    runUnlocks: {
      ...(overrides?.runUnlocks ?? {}),
    },
    skills: {
      'offline.resilience': { level: 0 },
      ...(overrides?.skills ?? {}),
    },
  }
}

describe('chapter 6 - progression use-cases', () => {
  it('purchaseUpgrade buys a level and deducts money', async () => {
    const repository = new LocalBalanceCatalogRepository()
    const purchaseUpgrade = createPurchaseUpgradeUseCase(repository)

    const result = await purchaseUpgrade({
      state: createBaseState(),
      upgradeId: 'employees',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.nextLevel).toBe(1)
    expect(result.value.state.upgrades.employees.level).toBe(1)
    expect(Number(result.value.state.resources.money)).toBeLessThan(5000)
  })

  it('purchaseUpgrade rejects locked upgrades before run unlock', async () => {
    const repository = new LocalBalanceCatalogRepository()
    const purchaseUpgrade = createPurchaseUpgradeUseCase(repository)

    const result = await purchaseUpgrade({
      state: createBaseState(),
      upgradeId: 'scanners',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('UPGRADE_LOCKED')
    }
  })

  it('purchaseUpgrade rejects when funds are insufficient', async () => {
    const repository = new LocalBalanceCatalogRepository()
    const purchaseUpgrade = createPurchaseUpgradeUseCase(repository)

    const result = await purchaseUpgrade({
      state: createBaseState({ resources: { money: '0', packages: '0' } }),
      upgradeId: 'employees',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('INSUFFICIENT_FUNDS')
    }
  })

  it('purchaseUpgrade rejects employee purchase when capacity is reached', async () => {
    const repository = new LocalBalanceCatalogRepository()
    const purchaseUpgrade = createPurchaseUpgradeUseCase(repository)

    const result = await purchaseUpgrade({
      state: createBaseState({
        resources: {
          money: '1000000000',
          packages: '0',
        },
        upgrades: {
          employees: { level: 10 },
          scanners: { level: 0 },
          conveyors: { level: 0 },
          carts: { level: 0 },
          trucks: { level: 0 },
        },
      }),
      upgradeId: 'employees',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('CAPACITY_REACHED')
    }
  })

  it('purchaseUpgrade allows more employees when warehouse mastery boosts capacity', async () => {
    const repository = new LocalBalanceCatalogRepository()
    const purchaseUpgrade = createPurchaseUpgradeUseCase(repository)

    const result = await purchaseUpgrade({
      state: createBaseState({
        resources: {
          money: '1000000000',
          packages: '0',
        },
        upgrades: {
          employees: { level: 10 },
          scanners: { level: 0 },
          conveyors: { level: 0 },
          carts: { level: 0 },
          trucks: { level: 0 },
        },
        skills: {
          'offline.resilience': { level: 0 },
          'warehouse.mastery': { level: 1 },
        },
      }),
      upgradeId: 'employees',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.state.upgrades.employees.level).toBe(11)
    }
  })

  it('unlockUpgrade consumes money and opens the upgrade for the current run', async () => {
    const repository = new LocalBalanceCatalogRepository()
    const unlockUpgrade = createUnlockUpgradeUseCase(repository)
    const purchaseUpgrade = createPurchaseUpgradeUseCase(repository)

    const unlocked = await unlockUpgrade({
      state: createBaseState(),
      upgradeId: 'scanners',
    })

    expect(unlocked.ok).toBe(true)
    if (!unlocked.ok) {
      return
    }

    expect(unlocked.value.state.runUnlocks.scanners?.unlocked).toBe(true)
    expect(Number(unlocked.value.state.resources.money)).toBeLessThan(5000)

    const purchased = await purchaseUpgrade({
      state: unlocked.value.state,
      upgradeId: 'scanners',
    })

    expect(purchased.ok).toBe(true)
  })

  it('purchaseUpgrade uses bought employees for capacity, not boosted staff mastery output', async () => {
    const repository = new LocalBalanceCatalogRepository()
    const purchaseUpgrade = createPurchaseUpgradeUseCase(repository)

    const result = await purchaseUpgrade({
      state: createBaseState({
        upgrades: {
          employees: { level: 4 },
          scanners: { level: 0 },
          conveyors: { level: 0 },
          carts: { level: 0 },
          trucks: { level: 0 },
        },
        skills: {
          'offline.resilience': { level: 0 },
          'staff.mastery': { level: 4 },
        },
      }),
      upgradeId: 'employees',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.state.upgrades.employees.level).toBe(5)
    }
  })

  it('unlockSkill consumes skill points and upgrades level', async () => {
    const repository = new LocalBalanceCatalogRepository()
    const unlockSkill = createUnlockSkillUseCase(repository)

    const result = await unlockSkill({
      state: createBaseState(),
      skillId: 'offline.resilience',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.state.skills['offline.resilience'].level).toBe(1)
    expect(result.value.state.progression.skillPoints).toBe(2)
  })

  it('unlockSkill rejects when max level is reached', async () => {
    const repository = new LocalBalanceCatalogRepository()
    const unlockSkill = createUnlockSkillUseCase(repository)

    const result = await unlockSkill({
      state: createBaseState({
        skills: {
          'offline.resilience': { level: 5 },
        },
      }),
      skillId: 'offline.resilience',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('MAX_LEVEL_REACHED')
    }
  })

  it('triggerWarehouseReset applies reset and grants progression point', async () => {
    const repository = new LocalBalanceCatalogRepository()
    const clock = new StubClock(Date.parse('2026-04-21T12:00:00.000Z'))
    const triggerWarehouseReset = createTriggerWarehouseResetUseCase(repository, clock)
    const resolver = new BalanceResolver(balanceCatalogV1)
    const requiredPackages = resolver.resolveWarehouseRequirement(
      'warehouse.progression',
      1,
    )
    const nextWarehousePackagesRequired = resolver.resolveWarehouseRequirement(
      'warehouse.progression',
      2,
    )

    const result = await triggerWarehouseReset({
      state: createBaseState({
        resources: {
          money: '50000',
          packages: String(requiredPackages),
        },
        upgrades: {
          employees: { level: 4 },
          scanners: { level: 2 },
          conveyors: { level: 1 },
          carts: { level: 1 },
          trucks: { level: 1 },
        },
        runUnlocks: {
          scanners: { unlocked: true },
          conveyors: { unlocked: true },
          carts: { unlocked: true },
          trucks: { unlocked: true },
        },
      }),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.state.resources.money).toBe(
      String(WAREHOUSE_RESET_STARTING_MONEY),
    )
    expect(result.value.state.resources.packages).toBe('0')
    expect(result.value.state.upgrades).toEqual({})
    expect(result.value.state.runUnlocks).toEqual({})
    expect(result.value.state.progression.warehouseLevel).toBe(2)
    expect(result.value.state.progression.skillPoints).toBe(4)
    expect(result.value.state.progression.architecturePoints).toBe(1)
    expect(result.value.completedWarehouseLevel).toBe(1)
    expect(result.value.requiredPackages).toBe(requiredPackages)
    expect(result.value.nextWarehouseCapacity).toBe(15)
    expect(result.value.nextWarehousePackagesRequired).toBe(nextWarehousePackagesRequired)
    expect(result.value.restartMoney).toBe(WAREHOUSE_RESET_STARTING_MONEY)
  })

  it('triggerWarehouseReset rejects when packages are insufficient', async () => {
    const repository = new LocalBalanceCatalogRepository()
    const clock = new StubClock(Date.parse('2026-04-21T12:00:00.000Z'))
    const triggerWarehouseReset = createTriggerWarehouseResetUseCase(repository, clock)

    const result = await triggerWarehouseReset({
      state: createBaseState({
        resources: {
          money: '10',
          packages: '0',
        },
      }),
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('INSUFFICIENT_PACKAGES')
    }
  })
})
