import type { BalanceCatalogDto } from '@/application/dto/balance'
import type { GameStateDto } from '@/application/dto/game'
import {
  isUpgradeUnlocked,
  resolveEffectiveUpgradeEffect,
  resolveGameState,
  resolveUpgradeSkillMultiplier,
} from '@/application/useCases/game/stateMappers'
import { BalanceResolver } from '@/domain/balance/services/balanceResolver'
import { computeMoneyPerSecond, computePackagesPerSecond } from '@/domain/game/services/economy'

export interface UpgradeSnapshotDto {
  id: string
  currentLevel: number
  nextLevel: number
  currentCost: number
  unlockCost: number | null
  isUnlocked: boolean
  skillMultiplier: number
  baseCurrentEffect: number
  baseNextEffect: number
  currentEffect: number
  nextEffect: number
  maxLevel?: number
}

export interface OfflineSkillSnapshotDto {
  efficiency: number
  durationHours: number
}

export interface GameRuntimeSnapshotDto {
  money: number
  packages: number
  packagesPerSecond: number
  moneyPerSecond: number
  employees: number
  warehouseCapacity: number
  tickDurationMs: number
  nextWarehousePackagesRequired: number
  upgrades: Record<string, UpgradeSnapshotDto>
}

function floorToNonNegativeInteger(value: number): number {
  return Math.max(0, Math.floor(value + 1e-9))
}

export class GameViewModelResolver {
  private readonly resolver: BalanceResolver
  private readonly skillIds: Set<string>
  private readonly catalog: BalanceCatalogDto

  constructor(catalog: BalanceCatalogDto) {
    this.catalog = catalog
    this.resolver = new BalanceResolver(catalog)
    this.skillIds = new Set(catalog.skills.map((skill) => skill.upgradeId))
  }

  createSnapshot(state: GameStateDto): GameRuntimeSnapshotDto {
    const resolved = resolveGameState(state, this.resolver)
    const packagesPerSecond = computePackagesPerSecond({
      employees: resolved.runState.employees,
      scannerBonus: resolved.runState.scannerBonus,
      cartMultiplier: resolved.runState.cartMultiplier,
      truckMultiplier: resolved.runState.truckMultiplier,
      tickRate: resolved.runState.tickRate,
      cadenceThroughputMultiplier: resolved.runState.cadenceThroughputMultiplier,
    }).toNumber()

    const moneyPerSecond = computeMoneyPerSecond({
      employees: resolved.runState.employees,
      scannerBonus: resolved.runState.scannerBonus,
      cartMultiplier: resolved.runState.cartMultiplier,
      truckMultiplier: resolved.runState.truckMultiplier,
      tickRate: resolved.runState.tickRate,
      cadenceThroughputMultiplier: resolved.runState.cadenceThroughputMultiplier,
    })

    const upgrades: Record<string, UpgradeSnapshotDto> = {}
    for (const upgrade of this.catalog.upgrades) {
      const currentLevel = state.upgrades[upgrade.upgradeId]?.level ?? 0
      const preview = this.resolver.getUpgradePreview(upgrade.upgradeId, currentLevel)

      upgrades[upgrade.upgradeId] = {
        id: upgrade.upgradeId,
        currentLevel,
        nextLevel: preview.nextLevel,
        currentCost: preview.currentCost,
        unlockCost: preview.unlockCost ?? null,
        isUnlocked: isUpgradeUnlocked(state.runUnlocks, upgrade.upgradeId),
        skillMultiplier: resolveUpgradeSkillMultiplier(
          upgrade.upgradeId,
          state,
          this.resolver,
        ),
        baseCurrentEffect: preview.currentEffect,
        baseNextEffect: preview.nextEffect,
        currentEffect: resolveEffectiveUpgradeEffect(
          upgrade.upgradeId,
          preview.currentEffect,
          state,
          this.resolver,
        ),
        nextEffect: resolveEffectiveUpgradeEffect(
          upgrade.upgradeId,
          preview.nextEffect,
          {
            ...state,
            upgrades: {
              ...state.upgrades,
              [upgrade.upgradeId]: { level: preview.nextLevel },
            },
          },
          this.resolver,
        ),
        maxLevel: upgrade.maxLevel,
      }
    }

    const tickDurationMs = resolved.runState.tickRate > 0
      ? 1000 / resolved.runState.tickRate
      : 0

    return {
      money: resolved.runState.money,
      packages: floorToNonNegativeInteger(resolved.runState.packages),
      packagesPerSecond,
      moneyPerSecond,
      employees: resolved.runState.ownedEmployees,
      warehouseCapacity: resolved.warehouseCapacity,
      tickDurationMs,
      nextWarehousePackagesRequired: this.resolver.resolveWarehouseRequirement(
        'warehouse.progression',
        state.progression.warehouseLevel,
      ),
      upgrades,
    }
  }

  hasSkill(skillId: string): boolean {
    return this.skillIds.has(skillId)
  }

  resolveSkillCost(skillId: string, currentLevel: number): number {
    return this.resolver.resolveSkillCost(skillId, currentLevel)
  }

  resolveSkillEffect(skillId: string, level: number): number {
    return this.resolver.resolveSkillEffect(skillId, level)
  }

  resolveOfflineSkillAtLevel(level: number): OfflineSkillSnapshotDto {
    return {
      efficiency: this.resolver.resolveScaleById('skills.offline.efficiency.effect.v1', level),
      durationHours: this.resolver.resolveScaleById('skills.offline.duration.effect.v1', level),
    }
  }
}
