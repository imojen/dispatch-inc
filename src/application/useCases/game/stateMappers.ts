import type { GameStateDto, LevelStateDto, OfflineReportDto } from '@/application/dto/game'
import type { BalanceResolver } from '@/domain/balance/services/balanceResolver'
import type { GameRunState, OfflinePolicy } from '@/domain/game/entities/GameRunState'
import { OFFLINE_BASE_POLICY } from '@/domain/game/services/offline'

export interface ResolvedGameState {
  runState: GameRunState
  warehouseCapacity: number
  baseTickRate: number
  offlinePolicy: OfflinePolicy
}

function numericStringToFinite(value: string, path: string): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`${path} must be a finite numeric string.`)
  }
  return parsed
}

function finiteToNumericString(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error('Cannot serialize non-finite number.')
  }
  return Number(value.toFixed(6)).toString()
}

function finiteToIntegerNumericString(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error('Cannot serialize non-finite number.')
  }

  const integerValue = Math.max(0, Math.floor(value + 1e-9))
  return integerValue.toString()
}

export function getLevel(
  record: Record<string, LevelStateDto>,
  id: string,
): number {
  return record[id]?.level ?? 0
}

export function setLevel(
  record: Record<string, LevelStateDto>,
  id: string,
  level: number,
): Record<string, LevelStateDto> {
  return {
    ...record,
    [id]: { level },
  }
}

function resolveEmployees(resolver: BalanceResolver, level: number): number {
  const raw = resolver.resolveUpgradeEffect('employees', level)
  return Math.max(0, Math.round(raw - 1))
}

export function resolveGameState(
  state: GameStateDto,
  resolver: BalanceResolver,
): ResolvedGameState {
  const employeesLevel = getLevel(state.upgrades, 'employees')
  const scannersLevel = getLevel(state.upgrades, 'scanners')
  const conveyorsLevel = getLevel(state.upgrades, 'conveyors')
  const cartsLevel = getLevel(state.upgrades, 'carts')
  const trucksLevel = getLevel(state.upgrades, 'trucks')

  const offlineResilienceLevel = getLevel(state.skills, 'offline.resilience')

  const baseTickRate = numericStringToFinite(state.simulation.tickRate, 'simulation.tickRate')
  const conveyorTickMultiplier = resolver.resolveUpgradeEffect('conveyors', conveyorsLevel)

  const runState: GameRunState = {
    money: numericStringToFinite(state.resources.money, 'resources.money'),
    packages: numericStringToFinite(state.resources.packages, 'resources.packages'),
    employees: resolveEmployees(resolver, employeesLevel),
    scannerBonus: resolver.resolveUpgradeEffect('scanners', scannersLevel),
    cartMultiplier: resolver.resolveUpgradeEffect('carts', cartsLevel),
    truckMultiplier: resolver.resolveUpgradeEffect('trucks', trucksLevel),
    tickRate: baseTickRate * conveyorTickMultiplier,
    warehouseLevel: state.progression.warehouseLevel,
    skillPoints: state.progression.skillPoints,
    upgrades: state.upgrades,
  }

  const warehouseCapacity = resolver.resolveWarehouseEffect(
    'warehouse.progression',
    state.progression.warehouseLevel,
  )

  const offlinePolicy: OfflinePolicy = {
    triggerAfterMs: OFFLINE_BASE_POLICY.triggerAfterMs,
    efficiencyMultiplier: resolver.resolveScaleById(
      'skills.offline.efficiency.effect.v1',
      offlineResilienceLevel,
    ),
    maxRewardedDurationMs: resolver.resolveScaleById(
      'skills.offline.duration.effect.v1',
      offlineResilienceLevel,
    ) * 60 * 60 * 1000,
  }

  return {
    runState,
    warehouseCapacity,
    baseTickRate,
    offlinePolicy,
  }
}

export function applyRunStateToGameState(
  baseState: GameStateDto,
  runState: GameRunState,
  nowIso: string,
): GameStateDto {
  return {
    ...baseState,
    simulation: {
      ...baseState.simulation,
      lastSeenAt: nowIso,
    },
    resources: {
      money: finiteToNumericString(runState.money),
      packages: finiteToNumericString(runState.packages),
    },
  }
}

export function offlineRewardToDto(input: {
  countedOfflineDurationMs: number
  packagesDispatched: number
  moneyGained: number
}): OfflineReportDto {
  return {
    countedOfflineDurationMs: input.countedOfflineDurationMs,
    offlinePackagesDispatched: finiteToIntegerNumericString(input.packagesDispatched),
    offlineMoneyGained: finiteToNumericString(input.moneyGained),
  }
}

export function addMoneyAndPackages(
  state: GameStateDto,
  addedMoney: number,
  addedPackages: number,
  nowIso: string,
): GameStateDto {
  const currentMoney = numericStringToFinite(state.resources.money, 'resources.money')
  const currentPackages = numericStringToFinite(state.resources.packages, 'resources.packages')

  return {
    ...state,
    simulation: {
      ...state.simulation,
      lastSeenAt: nowIso,
    },
    resources: {
      money: finiteToNumericString(currentMoney + addedMoney),
      packages: finiteToNumericString(currentPackages + addedPackages),
    },
  }
}

export function getMoneyAsNumber(state: GameStateDto): number {
  return numericStringToFinite(state.resources.money, 'resources.money')
}

export function setMoney(state: GameStateDto, nextMoney: number): GameStateDto {
  return {
    ...state,
    resources: {
      ...state.resources,
      money: finiteToNumericString(nextMoney),
    },
  }
}
