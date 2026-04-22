import type { BalanceCatalogRepository } from '@/application/ports/BalanceCatalogRepository'
import {
  gameFailure,
  gameSuccess,
  type GameUseCaseResult,
} from '@/application/useCases/game/contracts'
import { BalanceResolver, type UpgradePreview } from '@/domain/balance/services/balanceResolver'

export interface GetUpgradePreviewInput {
  upgradeId: string
  currentLevel: number
}

export type GetUpgradePreview = (
  input: GetUpgradePreviewInput,
) => Promise<GameUseCaseResult<UpgradePreview>>

export function createGetUpgradePreviewUseCase(
  balanceCatalogRepository: BalanceCatalogRepository,
): GetUpgradePreview {
  return async (
    input: GetUpgradePreviewInput,
  ): Promise<GameUseCaseResult<UpgradePreview>> => {
    if (!Number.isInteger(input.currentLevel) || input.currentLevel < 0) {
      return gameFailure('INVALID_STATE', 'currentLevel must be an integer >= 0.')
    }

    try {
      const catalog = await balanceCatalogRepository.getCatalog()
      const resolver = new BalanceResolver(catalog)
      return gameSuccess(resolver.getUpgradePreview(input.upgradeId, input.currentLevel))
    } catch (error) {
      return gameFailure('UNKNOWN_UPGRADE', `Unknown upgrade id: ${input.upgradeId}`, error)
    }
  }
}
