import type { GameStateDto } from '@/application/dto/game'
import type { BalanceCatalogRepository } from '@/application/ports/BalanceCatalogRepository'
import {
  gameFailure,
  gameSuccess,
  type GameUseCaseResult,
} from '@/application/useCases/game/contracts'
import {
  getMoneyAsNumber,
  isUpgradeUnlocked,
  setMoney,
  setUpgradeUnlocked,
} from '@/application/useCases/game/stateMappers'
import { parseGameStateStrict } from '@/application/useCases/save/schema'
import { BalanceResolver } from '@/domain/balance/services/balanceResolver'

export interface UnlockUpgradeInput {
  state: GameStateDto
  upgradeId: string
}

export interface UnlockUpgradeOutput {
  state: GameStateDto
  cost: number
  upgradeId: string
}

export type UnlockUpgrade = (
  input: UnlockUpgradeInput,
) => Promise<GameUseCaseResult<UnlockUpgradeOutput>>

export function createUnlockUpgradeUseCase(
  balanceCatalogRepository: BalanceCatalogRepository,
): UnlockUpgrade {
  return async (input: UnlockUpgradeInput) => {
    let state: GameStateDto

    try {
      state = parseGameStateStrict(input.state)
    } catch (error) {
      return gameFailure('INVALID_STATE', 'Invalid game state payload.', error)
    }

    try {
      const catalog = await balanceCatalogRepository.getCatalog()
      const entry = catalog.upgrades.find((upgrade) => upgrade.upgradeId === input.upgradeId)

      if (!entry) {
        return gameFailure('UNKNOWN_UPGRADE', `Unknown upgrade id: ${input.upgradeId}`)
      }

      if (isUpgradeUnlocked(state.runUnlocks, input.upgradeId)) {
        return gameFailure(
          'MAX_LEVEL_REACHED',
          `Upgrade ${input.upgradeId} is already unlocked for this run.`,
        )
      }

      const resolver = new BalanceResolver(catalog)
      const unlockCost = resolver.resolveUpgradeUnlockCost(input.upgradeId)
      if (unlockCost === null) {
        return gameFailure(
          'UNKNOWN_UPGRADE',
          `Upgrade ${input.upgradeId} does not support run unlocks.`,
        )
      }

      const currentMoney = getMoneyAsNumber(state)
      if (currentMoney < unlockCost) {
        return gameFailure(
          'INSUFFICIENT_FUNDS',
          `Insufficient funds to unlock ${input.upgradeId}: required ${unlockCost}, current ${currentMoney}.`,
        )
      }

      const withDeductedMoney = setMoney(state, currentMoney - unlockCost)
      const nextState: GameStateDto = {
        ...withDeductedMoney,
        runUnlocks: setUpgradeUnlocked(
          withDeductedMoney.runUnlocks,
          input.upgradeId,
          true,
        ),
      }

      return gameSuccess({
        state: nextState,
        cost: unlockCost,
        upgradeId: input.upgradeId,
      })
    } catch (error) {
      return gameFailure('SAVE_WRITE_FAILED', 'Unable to unlock upgrade.', error)
    }
  }
}
