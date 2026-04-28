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
import {
  applyWarehouseReset,
  WAREHOUSE_RESET_STARTING_MONEY,
} from '@/domain/game/services/reset'

export interface TriggerWarehouseResetInput {
  state: GameStateDto
}

export interface TriggerWarehouseResetOutput {
  state: GameStateDto
  completedWarehouseLevel: number
  requiredPackages: number
  nextWarehouseLevel: number
  nextWarehouseCapacity: number
  nextWarehousePackagesRequired: number
  restartMoney: number
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

      const resolvedWarehouseRequirement = resolver.resolveWarehouseRequirement(
        'warehouse.progression',
        state.progression.warehouseLevel,
      )

      if (
        !canUnlockNextWarehouse(
          resolved.runState.packages,
          resolvedWarehouseRequirement,
        )
      ) {
        return gameFailure(
          'INSUFFICIENT_PACKAGES',
          `Insufficient packages for warehouse reset: required ${resolvedWarehouseRequirement}, current ${resolved.runState.packages}.`,
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
        runUnlocks: {},
      }
      const resolvedNextState = resolveGameState(nextState, resolver)

      return gameSuccess({
        state: nextState,
        completedWarehouseLevel: state.progression.warehouseLevel,
        requiredPackages: resolvedWarehouseRequirement,
        nextWarehouseLevel,
        nextWarehouseCapacity: resolvedNextState.warehouseCapacity,
        nextWarehousePackagesRequired: resolver.resolveWarehouseRequirement(
          'warehouse.progression',
          nextWarehouseLevel,
        ),
        restartMoney: WAREHOUSE_RESET_STARTING_MONEY,
      })
    } catch (error) {
      return gameFailure('SAVE_WRITE_FAILED', 'Unable to trigger warehouse reset.', error)
    }
  }
}
