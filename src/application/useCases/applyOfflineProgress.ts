import type { GameStateDto, OfflineReportDto } from '@/application/dto/game'
import type { BalanceCatalogRepository } from '@/application/ports/BalanceCatalogRepository'
import type { Clock } from '@/application/ports/Clock'
import {
  gameFailure,
  gameSuccess,
  type GameUseCaseResult,
} from '@/application/useCases/game/contracts'
import {
  addMoneyAndPackages,
  offlineRewardToDto,
  resolveGameState,
} from '@/application/useCases/game/stateMappers'
import {
  clampRunStateToWarehouseGoal,
  hasReachedWarehouseGoal,
} from '@/application/useCases/game/warehouseGoal'
import { parseGameStateStrict } from '@/application/useCases/save/schema'
import { BalanceResolver } from '@/domain/balance/services/balanceResolver'
import { computeOfflineRewardedDurationMs } from '@/domain/game/services/offline'
import { applyTick } from '@/domain/game/services/tick'

const OFFLINE_REPLAY_CHUNK_MS = 1000
const OFFLINE_REPLAY_MAX_DURATION_MS = 6 * 60 * 60 * 1000

export interface ApplyOfflineProgressInput {
  state: GameStateDto
  nowMs?: number
  triggerAfterMsOverride?: number
}

export interface ApplyOfflineProgressOutput {
  state: GameStateDto
  report: OfflineReportDto
  rawOfflineDurationMs: number
  replayWindowDurationMs: number
}

export type ApplyOfflineProgress = (
  input: ApplyOfflineProgressInput,
) => Promise<GameUseCaseResult<ApplyOfflineProgressOutput>>

function replayOfflineRewardsInChunks(input: {
  state: ReturnType<typeof resolveGameState>['runState']
  countedDurationMs: number
  efficiencyMultiplier: number
  requiredPackages: number
}): {
  moneyGained: number
  packagesDispatched: number
  productiveDurationMs: number
} {
  let remainingMs = input.countedDurationMs
  let moneyGained = 0
  let packagesDispatched = 0
  let productiveDurationMs = 0
  let replayState = input.state

  if (hasReachedWarehouseGoal(replayState.packages, input.requiredPackages)) {
    return {
      moneyGained: 0,
      packagesDispatched: 0,
      productiveDurationMs: 0,
    }
  }

  while (remainingMs > 0) {
    const chunkMs = Math.min(remainingMs, OFFLINE_REPLAY_CHUNK_MS)
    const chunkSeconds = chunkMs / 1000

    const nextState = applyTick({
      state: replayState,
      deltaSeconds: chunkSeconds,
    })
    const clamped = clampRunStateToWarehouseGoal({
      previousState: replayState,
      nextState,
      requiredPackages: input.requiredPackages,
    })

    const deltaMoney = clamped.state.money - replayState.money
    const deltaPackages = clamped.state.packages - replayState.packages

    moneyGained += deltaMoney * input.efficiencyMultiplier
    packagesDispatched += deltaPackages * input.efficiencyMultiplier
    productiveDurationMs += chunkMs * clamped.appliedRatio

    replayState = clamped.state
    remainingMs -= chunkMs

    if (clamped.reachedGoal) {
      break
    }
  }

  return {
    moneyGained,
    packagesDispatched,
    productiveDurationMs,
  }
}

export function createApplyOfflineProgressUseCase(
  balanceCatalogRepository: BalanceCatalogRepository,
  clock: Clock,
): ApplyOfflineProgress {
  return async (input: ApplyOfflineProgressInput) => {
    let state: GameStateDto

    try {
      state = parseGameStateStrict(input.state)
    } catch (error) {
      return gameFailure('INVALID_STATE', 'Invalid game state payload.', error)
    }

    try {
      const catalog = await balanceCatalogRepository.getCatalog()
      const resolver = new BalanceResolver(catalog)
      const resolved = resolveGameState(state, resolver)

      const nowMs = input.nowMs ?? clock.nowMs()
      const lastSeenMs = Date.parse(state.simulation.lastSeenAt)
      if (Number.isNaN(lastSeenMs)) {
        return gameFailure('INVALID_STATE', 'Invalid simulation.lastSeenAt timestamp.')
      }

      const rawOfflineDurationMs = Math.max(0, nowMs - lastSeenMs)
      const effectiveTriggerAfterMs = Math.max(
        0,
        input.triggerAfterMsOverride ?? resolved.offlinePolicy.triggerAfterMs,
      )
      const replayWindowLimitMs =
        effectiveTriggerAfterMs + OFFLINE_REPLAY_MAX_DURATION_MS
      const replayWindowDurationMs = Math.min(rawOfflineDurationMs, replayWindowLimitMs)

      const countedDurationMs = computeOfflineRewardedDurationMs(
        replayWindowDurationMs,
        {
          ...resolved.offlinePolicy,
          triggerAfterMs: effectiveTriggerAfterMs,
        },
      )

      const replayed = replayOfflineRewardsInChunks({
        state: resolved.runState,
        countedDurationMs,
        efficiencyMultiplier: resolved.offlinePolicy.efficiencyMultiplier,
        requiredPackages: resolver.resolveWarehouseRequirement(
          'warehouse.progression',
          state.progression.warehouseLevel,
        ),
      })

      const report = offlineRewardToDto({
        countedOfflineDurationMs: replayed.productiveDurationMs,
        moneyGained: replayed.moneyGained,
        packagesDispatched: replayed.packagesDispatched,
      })

      return gameSuccess({
        state: addMoneyAndPackages(
          state,
          replayed.moneyGained,
          replayed.packagesDispatched,
          new Date(nowMs).toISOString(),
        ),
        report,
        rawOfflineDurationMs,
        replayWindowDurationMs,
      })
    } catch (error) {
      return gameFailure('SAVE_WRITE_FAILED', 'Unable to apply offline progression.', error)
    }
  }
}
