import type { GameStateDto } from '@/application/dto/game'
import type { BalanceCatalogRepository } from '@/application/ports/BalanceCatalogRepository'
import type { Clock } from '@/application/ports/Clock'
import {
  gameFailure,
  gameSuccess,
  type GameUseCaseResult,
} from '@/application/useCases/game/contracts'
import { resolveGameState } from '@/application/useCases/game/stateMappers'
import { parseGameStateStrict } from '@/application/useCases/save/schema'
import { BalanceResolver } from '@/domain/balance/services/balanceResolver'
import { canUnlockNextWarehouse } from '@/domain/game/policies/WarehouseUnlockPolicy'
import { applyWarehouseReset } from '@/domain/game/services/reset'

export interface TriggerWarehouseResetInput {
  state: GameStateDto
}

export interface TriggerWarehouseResetOutput {
  state: GameStateDto
  spentMoney: number
  nextWarehouseLevel: number
}

export type TriggerWarehouseReset = (
  input: TriggerWarehouseResetInput,
) => Promise<GameUseCaseResult<TriggerWarehouseResetOutput>>

export function createTriggerWarehouseResetUseCase(
  balanceCatalogRepository: BalanceCatalogRepository,
  clock: Clock,
): TriggerWarehouseReset {
  return async (input: TriggerWarehouseResetInput) => {
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

      const resolvedWarehouseCost = resolver.resolveWarehouseCost(
        'warehouse.progression',
        state.progression.warehouseLevel,
      )

      if (!canUnlockNextWarehouse(resolved.runState.money, resolvedWarehouseCost)) {
        return gameFailure(
          'INSUFFICIENT_FUNDS',
          `Insufficient funds for warehouse reset: required ${resolvedWarehouseCost}, current ${resolved.runState.money}.`,
        )
      }

      const resetRunState = applyWarehouseReset(resolved.runState)
      const nowIso = new Date(clock.nowMs()).toISOString()

      const nextWarehouseLevel = state.progression.warehouseLevel + 1
      const nextState: GameStateDto = {
        ...state,
        simulation: {
          ...state.simulation,
          lastSeenAt: nowIso,
        },
        resources: {
          money: String(resetRunState.money),
          packages: String(resetRunState.packages),
        },
        progression: {
          warehouseLevel: nextWarehouseLevel,
          architecturePoints: state.progression.architecturePoints + 1,
          skillPoints: resetRunState.skillPoints,
        },
        upgrades: {},
      }

      return gameSuccess({
        state: nextState,
        spentMoney: resolvedWarehouseCost,
        nextWarehouseLevel,
      })
    } catch (error) {
      return gameFailure('SAVE_WRITE_FAILED', 'Unable to trigger warehouse reset.', error)
    }
  }
}
