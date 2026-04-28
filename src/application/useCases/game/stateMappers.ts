import type {
  GameStateDto,
  LevelStateDto,
  OfflineReportDto,
  UnlockStateDto,
} from '@/application/dto/game'
import type { BalanceResolver } from '@/domain/balance/services/balanceResolver'
import type { GameRunState, OfflinePolicy } from '@/domain/game/entities/GameRunState'
import { OFFLINE_BASE_POLICY } from '@/domain/game/services/offline'

export interface ResolvedGameState {
  runState: GameRunState
  warehouseCapacity: number
  baseTickRate: number
  offlinePolicy: OfflinePolicy
}

function resolveSkillMultiplier(
  resolver: BalanceResolver,
  state: GameStateDto,
  skillId: string,
): number {
  return resolver.resolveSkillEffect(skillId, getLevel(state.skills, skillId))
}

export function resolveUpgradeSkillMultiplier(
  upgradeId: string,
  state: GameStateDto,
  resolver: BalanceResolver,
): number {
  switch (upgradeId) {
    case 'employees':
      return resolveSkillMultiplier(resolver, state, 'staff.mastery')
    case 'scanners':
      return resolveSkillMultiplier(resolver, state, 'scan.mastery')
    case 'conveyors':
      return resolveSkillMultiplier(resolver, state, 'conveyor.mastery')
    case 'carts':
      return resolveSkillMultiplier(resolver, state, 'sorting.mastery')
    case 'trucks':
      return resolveSkillMultiplier(resolver, state, 'shipping.mastery')
    default:
      return 1
  }
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

export function isUpgradeUnlocked(
  record: Record<string, UnlockStateDto> | undefined,
  upgradeId: string,
): boolean {
  return upgradeId === 'employees' || record?.[upgradeId]?.unlocked === true
}

export function setUpgradeUnlocked(
  record: Record<string, UnlockStateDto>,
  upgradeId: string,
  unlocked: boolean,
): Record<string, UnlockStateDto> {
  if (upgradeId === 'employees') {
    return record
  }

  return {
    ...record,
    [upgradeId]: { unlocked },
  }
}

function resolveEmployees(resolver: BalanceResolver, level: number): number {
  const raw = resolver.resolveUpgradeEffect('employees', level)
  return Math.max(0, Math.round(raw - 1))
}

function resolveAsymptoticTickRate(
  baseTickRate: number,
  rawMultiplier: number,
): number {
  const safeBaseTickRate = Math.max(0, baseTickRate)
  const safeRawMultiplier = Math.max(1, rawMultiplier)
  return safeBaseTickRate * (2 - 1 / safeRawMultiplier)
}

function resolveCadenceThroughputMultiplier(rawMultiplier: number): number {
  const safeRawMultiplier = Math.max(1, rawMultiplier)
  const displayedCadenceMultiplier = 2 - 1 / safeRawMultiplier
  return Math.sqrt(safeRawMultiplier / displayedCadenceMultiplier)
}

export function resolveEffectiveUpgradeEffect(
  upgradeId: string,
  baseEffect: number,
  state: GameStateDto,
  resolver: BalanceResolver,
): number {
  switch (upgradeId) {
    case 'employees':
      return Math.max(
        1,
        Math.round((baseEffect - 1) * resolveUpgradeSkillMultiplier(upgradeId, state, resolver)) +
          1,
      )
    case 'scanners':
      return baseEffect * resolveUpgradeSkillMultiplier(upgradeId, state, resolver)
    case 'conveyors':
      return baseEffect * resolveUpgradeSkillMultiplier(upgradeId, state, resolver)
    case 'carts':
      return baseEffect * resolveUpgradeSkillMultiplier(upgradeId, state, resolver)
    case 'trucks':
      return baseEffect * resolveUpgradeSkillMultiplier(upgradeId, state, resolver)
    default:
      return baseEffect
  }
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
  const staffMultiplier = resolveSkillMultiplier(resolver, state, 'staff.mastery')
  const scanMultiplier = resolveSkillMultiplier(resolver, state, 'scan.mastery')
  const conveyorSkillMultiplier = resolveSkillMultiplier(
    resolver,
    state,
    'conveyor.mastery',
  )
  const sortingMultiplier = resolveSkillMultiplier(resolver, state, 'sorting.mastery')
  const shippingMultiplier = resolveSkillMultiplier(resolver, state, 'shipping.mastery')
  const warehouseMultiplier = resolveSkillMultiplier(resolver, state, 'warehouse.mastery')

  const baseTickRate = numericStringToFinite(state.simulation.tickRate, 'simulation.tickRate')
  const baseEmployees = resolveEmployees(resolver, employeesLevel)
  const baseScannerBonus = resolver.resolveUpgradeEffect('scanners', scannersLevel)
  const conveyorTickMultiplier = resolver.resolveUpgradeEffect('conveyors', conveyorsLevel)
  const baseCartMultiplier = resolver.resolveUpgradeEffect('carts', cartsLevel)
  const baseTruckMultiplier = resolver.resolveUpgradeEffect('trucks', trucksLevel)
  const rawCadenceMultiplier = conveyorTickMultiplier * conveyorSkillMultiplier

  const runState: GameRunState = {
    money: numericStringToFinite(state.resources.money, 'resources.money'),
    packages: numericStringToFinite(state.resources.packages, 'resources.packages'),
    ownedEmployees: baseEmployees,
    employees: Math.max(0, Math.round(baseEmployees * staffMultiplier)),
    scannerBonus: baseScannerBonus * scanMultiplier,
    cartMultiplier: baseCartMultiplier * sortingMultiplier,
    truckMultiplier: baseTruckMultiplier * shippingMultiplier,
    tickRate: resolveAsymptoticTickRate(baseTickRate, rawCadenceMultiplier),
    cadenceThroughputMultiplier: resolveCadenceThroughputMultiplier(
      rawCadenceMultiplier,
    ),
    warehouseLevel: state.progression.warehouseLevel,
    skillPoints: state.progression.skillPoints,
    upgrades: state.upgrades,
  }

  const warehouseCapacity = Math.max(
    0,
    Math.round(
      resolver.resolveWarehouseEffect(
        'warehouse.progression',
        state.progression.warehouseLevel,
      ) * warehouseMultiplier,
    ),
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
