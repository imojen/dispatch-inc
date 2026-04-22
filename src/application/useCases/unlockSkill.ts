import type { GameStateDto } from '@/application/dto/game'
import type { BalanceCatalogRepository } from '@/application/ports/BalanceCatalogRepository'
import {
  gameFailure,
  gameSuccess,
  type GameUseCaseResult,
} from '@/application/useCases/game/contracts'
import { getLevel, setLevel } from '@/application/useCases/game/stateMappers'
import { parseGameStateStrict } from '@/application/useCases/save/schema'
import { BalanceResolver } from '@/domain/balance/services/balanceResolver'
import { canUnlockNextBranchLevel } from '@/domain/game/policies/BranchUnlockPolicy'

export interface UnlockSkillInput {
  state: GameStateDto
  skillId: string
}

export interface UnlockSkillOutput {
  state: GameStateDto
  cost: number
  nextLevel: number
}

export type UnlockSkill = (
  input: UnlockSkillInput,
) => Promise<GameUseCaseResult<UnlockSkillOutput>>

export function createUnlockSkillUseCase(
  balanceCatalogRepository: BalanceCatalogRepository,
): UnlockSkill {
  return async (input: UnlockSkillInput) => {
    let state: GameStateDto

    try {
      state = parseGameStateStrict(input.state)
    } catch (error) {
      return gameFailure('INVALID_STATE', 'Invalid game state payload.', error)
    }

    try {
      const catalog = await balanceCatalogRepository.getCatalog()
      const entry = catalog.skills.find((skill) => skill.upgradeId === input.skillId)

      if (!entry) {
        return gameFailure('UNKNOWN_SKILL', `Unknown skill id: ${input.skillId}`)
      }

      const resolver = new BalanceResolver(catalog)
      const currentLevel = getLevel(state.skills, input.skillId)
      const maxLevel = entry.maxLevel ?? 5

      if (currentLevel >= maxLevel) {
        return gameFailure('MAX_LEVEL_REACHED', `Max level reached for ${input.skillId}.`)
      }

      const currentSkillPoints = state.progression.skillPoints
      const rawCost = resolver.resolveSkillCost(input.skillId, currentLevel)
      const cost = Math.max(1, Math.ceil(rawCost))

      if (currentSkillPoints < cost) {
        return gameFailure(
          'INSUFFICIENT_FUNDS',
          `Insufficient skill points for ${input.skillId}: required ${cost}, current ${currentSkillPoints}.`,
        )
      }

      if (!canUnlockNextBranchLevel(currentLevel, currentSkillPoints, maxLevel)) {
        return gameFailure('INVALID_STATE', `Cannot unlock next level for ${input.skillId}.`)
      }

      const nextLevel = currentLevel + 1

      const nextState: GameStateDto = {
        ...state,
        progression: {
          ...state.progression,
          skillPoints: currentSkillPoints - cost,
        },
        skills: setLevel(state.skills, input.skillId, nextLevel),
      }

      return gameSuccess({
        state: nextState,
        cost,
        nextLevel,
      })
    } catch (error) {
      return gameFailure('SAVE_WRITE_FAILED', 'Unable to unlock skill.', error)
    }
  }
}
