import { describe, expect, it } from 'vitest'
import type { GameRunState, OfflinePolicy } from '@/domain/game/entities/GameRunState'
import {
  OFFLINE_BASE_POLICY,
  computeOfflineRewardedDurationMs,
  computeOfflineRewards,
} from '@/domain/game/services/offline'
import { applyTick } from '@/domain/game/services/tick'

const state: GameRunState = {
  money: 0,
  packages: 0,
  ownedEmployees: 10,
  employees: 10,
  scannerBonus: 0,
  cartMultiplier: 1,
  truckMultiplier: 1,
  tickRate: 1,
  cadenceThroughputMultiplier: 1,
  warehouseLevel: 1,
  skillPoints: 0,
  upgrades: {},
}

describe('offline service', () => {
  it('applies trigger and cap with base policy', () => {
    const counted = computeOfflineRewardedDurationMs(3 * 60 * 60 * 1000, OFFLINE_BASE_POLICY)

    expect(counted).toBe(60 * 60 * 1000)
  })

  it('returns no rewards when below trigger threshold', () => {
    const reward = computeOfflineRewards(state, 60 * 1000, OFFLINE_BASE_POLICY)

    expect(reward.countedOfflineDurationMs).toBe(0)
    expect(reward.moneyGained).toBe(0)
    expect(reward.packagesDispatched).toBe(0)
  })

  it('matches replayed ticks when policy is full efficiency and no trigger', () => {
    const policy: OfflinePolicy = {
      triggerAfterMs: 0,
      efficiencyMultiplier: 1,
      maxRewardedDurationMs: 60 * 1000,
    }

    const offline = computeOfflineRewards(state, 10_000, policy)

    let replay = state
    for (let i = 0; i < 10; i += 1) {
      replay = applyTick({ state: replay, deltaSeconds: 1 })
    }

    expect(offline.moneyGained).toBe(replay.money)
    expect(offline.packagesDispatched).toBe(replay.packages)
  })

  it('supports offline branch progression limits from 20%/1h to 100%/6h', () => {
    const maxPolicy: OfflinePolicy = {
      triggerAfterMs: 2 * 60 * 1000,
      efficiencyMultiplier: 1,
      maxRewardedDurationMs: 6 * 60 * 60 * 1000,
    }

    const base = computeOfflineRewards(state, 8 * 60 * 60 * 1000, OFFLINE_BASE_POLICY)
    const maxed = computeOfflineRewards(state, 8 * 60 * 60 * 1000, maxPolicy)

    expect(base.countedOfflineDurationMs).toBe(60 * 60 * 1000)
    expect(maxed.countedOfflineDurationMs).toBe(6 * 60 * 60 * 1000)
    expect(maxed.moneyGained).toBeGreaterThan(base.moneyGained)
  })
})
