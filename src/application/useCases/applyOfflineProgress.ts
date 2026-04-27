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
}): {
  moneyGained: number
  packagesDispatched: number
} {
  let remainingMs = input.countedDurationMs
  let moneyGained = 0
  let packagesDispatched = 0
  let replayState = input.state

  while (remainingMs > 0) {
    const chunkMs = Math.min(remainingMs, OFFLINE_REPLAY_CHUNK_MS)
    const chunkSeconds = chunkMs / 1000

    const nextState = applyTick({
      state: replayState,
      deltaSeconds: chunkSeconds,
    })

    const deltaMoney = nextState.money - replayState.money
    const deltaPackages = nextState.packages - replayState.packages

    moneyGained += deltaMoney * input.efficiencyMultiplier
    packagesDispatched += deltaPackages * input.efficiencyMultiplier

    replayState = nextState
    remainingMs -= chunkMs
  }

  return {
    moneyGained,
    packagesDispatched,
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
      })

      const report = offlineRewardToDto({
        countedOfflineDurationMs: countedDurationMs,
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
