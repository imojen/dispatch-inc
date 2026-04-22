import type { SaveRepository } from '@/application/ports/SaveRepository'
import {
  type DeleteSaveInput,
  type DeleteSaveOutput,
  saveFailure,
  saveSuccess,
  type SaveUseCaseResult,
} from '@/application/useCases/save/contracts'
import { parseSaveIndexStrict } from '@/application/useCases/save/schema'

export type DeleteSave = (
  input: DeleteSaveInput,
) => Promise<SaveUseCaseResult<DeleteSaveOutput>>

export function createDeleteSaveUseCase(
  saveRepository: SaveRepository,
): DeleteSave {
  return async (input: DeleteSaveInput) => {
    try {
      const beforeIndex = parseSaveIndexStrict(await saveRepository.getIndex())
      const deleted = beforeIndex.slots.some((slot) => slot.id === input.id)

      await saveRepository.deleteSlot(input.id)

      const afterIndex = parseSaveIndexStrict(await saveRepository.getIndex())

      return saveSuccess({
        deleted,
        index: afterIndex,
      })
    } catch (error) {
      return saveFailure('SAVE_WRITE_FAILED', 'Unable to delete save slot.', error)
    }
  }
}
