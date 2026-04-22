import type { GameStateDto } from '@/application/dto/game'
import type { BalanceCatalogRepository } from '@/application/ports/BalanceCatalogRepository'
import type { Clock } from '@/application/ports/Clock'
import {
  gameFailure,
  gameSuccess,
  type GameUseCaseResult,
} from '@/application/useCases/game/contracts'
import {
  applyRunStateToGameState,
  resolveGameState,
} from '@/application/useCases/game/stateMappers'
import { parseGameStateStrict } from '@/application/useCases/save/schema'
import { BalanceResolver } from '@/domain/balance/services/balanceResolver'
import { applyTick } from '@/domain/game/services/tick'

const MAX_DELTA_TIME_MS = 250
const MAX_INTERNAL_STEPS = 500

export interface RunTickInput {
  state: GameStateDto
  nowMs?: number
  deltaTimeMs?: number
}

export interface RunTickOutput {
  state: GameStateDto
  usedDeltaTimeMs: number
  steps: number
}

export type RunTick = (
  input: RunTickInput,
) => Promise<GameUseCaseResult<RunTickOutput>>

function clampDeltaTimeMs(value: number): number {
  return Math.max(0, Math.min(value, MAX_DELTA_TIME_MS))
}

function toTickDurationSeconds(tickRate: number): number {
  const safeTickRate = Math.max(tickRate, 0.0001)
  return 1 / safeTickRate
}

export function createRunTickUseCase(
  balanceCatalogRepository: BalanceCatalogRepository,
  clock: Clock,
): RunTick {
  return async (input: RunTickInput) => {
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

      const rawDeltaTimeMs = input.deltaTimeMs ?? nowMs - lastSeenMs
      const usedDeltaTimeMs = clampDeltaTimeMs(rawDeltaTimeMs)
      const tickDurationSeconds = toTickDurationSeconds(resolved.runState.tickRate)

      let remainingSeconds = usedDeltaTimeMs / 1000
      let steps = 0
      let runState = resolved.runState

      while (remainingSeconds > 0 && steps < MAX_INTERNAL_STEPS) {
        const chunkSeconds = Math.min(remainingSeconds, tickDurationSeconds)
        runState = applyTick({
          state: runState,
          deltaSeconds: chunkSeconds,
        })
        remainingSeconds -= chunkSeconds
        steps += 1
      }

      if (remainingSeconds > 0) {
        runState = applyTick({ state: runState, deltaSeconds: remainingSeconds })
        steps += 1
      }

      return gameSuccess({
        state: applyRunStateToGameState(state, runState, new Date(nowMs).toISOString()),
        usedDeltaTimeMs,
        steps,
      })
    } catch (error) {
      return gameFailure('SAVE_WRITE_FAILED', 'Unable to compute tick.', error)
    }
  }
}
