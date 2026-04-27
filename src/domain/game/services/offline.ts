import type {
  GameRunState,
  OfflinePolicy,
  OfflineReward,
} from '@/domain/game/entities/GameRunState'
import {
  computeMoneyPerSecond,
  computePackagesPerSecond,
} from '@/domain/game/services/economy'

export const OFFLINE_BASE_POLICY: OfflinePolicy = {
  triggerAfterMs: 2 * 60 * 1000,
  efficiencyMultiplier: 0.2,
  maxRewardedDurationMs: 60 * 60 * 1000,
}

export function computeOfflineRewardedDurationMs(
  rawDeltaMs: number,
  policy: OfflinePolicy,
): number {
  if (rawDeltaMs <= policy.triggerAfterMs) {
    return 0
  }

  const eligibleMs = rawDeltaMs - policy.triggerAfterMs
  return Math.min(eligibleMs, policy.maxRewardedDurationMs)
}

export function computeOfflineRewards(
  state: GameRunState,
  rawDeltaMs: number,
  policy: OfflinePolicy,
): OfflineReward {
  const countedOfflineDurationMs = computeOfflineRewardedDurationMs(rawDeltaMs, policy)
  const countedSeconds = countedOfflineDurationMs / 1000

  const moneyPerSecond =
    computeMoneyPerSecond({
      employees: state.employees,
      scannerBonus: state.scannerBonus,
      cartMultiplier: state.cartMultiplier,
      truckMultiplier: state.truckMultiplier,
      tickRate: state.tickRate,
      cadenceThroughputMultiplier: state.cadenceThroughputMultiplier,
    }) * policy.efficiencyMultiplier

  const packagesPerSecond =
    computePackagesPerSecond({
      employees: state.employees,
      scannerBonus: state.scannerBonus,
      cartMultiplier: state.cartMultiplier,
      truckMultiplier: state.truckMultiplier,
      tickRate: state.tickRate,
      cadenceThroughputMultiplier: state.cadenceThroughputMultiplier,
    }).toNumber() * policy.efficiencyMultiplier

  return {
    countedOfflineDurationMs,
    packagesDispatched: packagesPerSecond * countedSeconds,
    moneyGained: moneyPerSecond * countedSeconds,
  }
}
