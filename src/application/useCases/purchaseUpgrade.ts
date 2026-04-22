import type { GameStateDto } from '@/application/dto/game'
import type { BalanceCatalogRepository } from '@/application/ports/BalanceCatalogRepository'
import {
  gameFailure,
  gameSuccess,
  type GameUseCaseResult,
} from '@/application/useCases/game/contracts'
import {
  getLevel,
  getMoneyAsNumber,
  resolveGameState,
  setLevel,
  setMoney,
} from '@/application/useCases/game/stateMappers'
import { parseGameStateStrict } from '@/application/useCases/save/schema'
import { BalanceResolver } from '@/domain/balance/services/balanceResolver'
import { canHireEmployee } from '@/domain/game/policies/WarehouseUnlockPolicy'

export interface PurchaseUpgradeInput {
  state: GameStateDto
  upgradeId: string
}

export interface PurchaseUpgradeOutput {
  state: GameStateDto
  cost: number
  nextLevel: number
}

export type PurchaseUpgrade = (
  input: PurchaseUpgradeInput,
) => Promise<GameUseCaseResult<PurchaseUpgradeOutput>>

export function createPurchaseUpgradeUseCase(
  balanceCatalogRepository: BalanceCatalogRepository,
): PurchaseUpgrade {
  return async (input: PurchaseUpgradeInput) => {
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

      const resolver = new BalanceResolver(catalog)
      const currentLevel = getLevel(state.upgrades, input.upgradeId)

      if (entry.maxLevel !== undefined && currentLevel >= entry.maxLevel) {
        return gameFailure('MAX_LEVEL_REACHED', `Max level reached for ${input.upgradeId}.`)
      }

      const currentMoney = getMoneyAsNumber(state)
      const cost = resolver.resolveUpgradeCost(input.upgradeId, currentLevel)

      if (currentMoney < cost) {
        return gameFailure(
          'INSUFFICIENT_FUNDS',
          `Insufficient funds for ${input.upgradeId}: required ${cost}, current ${currentMoney}.`,
        )
      }

      if (input.upgradeId === 'employees') {
        const resolved = resolveGameState(state, resolver)
        if (!canHireEmployee(resolved.runState.employees, resolved.warehouseCapacity)) {
          return gameFailure('CAPACITY_REACHED', 'Warehouse employee capacity reached.')
        }
      }

      const nextLevel = currentLevel + 1
      const withDeductedMoney = setMoney(state, currentMoney - cost)
      const nextState = {
        ...withDeductedMoney,
        upgrades: setLevel(withDeductedMoney.upgrades, input.upgradeId, nextLevel),
      }

      return gameSuccess({
        state: nextState,
        cost,
        nextLevel,
      })
    } catch (error) {
      return gameFailure('SAVE_WRITE_FAILED', 'Unable to purchase upgrade.', error)
    }
  }
}
