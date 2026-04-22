import type { Clock } from '@/application/ports/Clock'
import type { SaveRepository } from '@/application/ports/SaveRepository'
import {
  type AutosaveActiveSlotInput,
  type AutosaveActiveSlotOutput,
  saveFailure,
  saveSuccess,
  type SaveUseCaseResult,
} from '@/application/useCases/save/contracts'
import {
  normalizeIndex,
  toMetadata,
  upsertSlotMetadata,
} from '@/application/useCases/save/helpers'
import {
  parseGameStateStrict,
  parseSaveIndexStrict,
  parseSaveSlotStrict,
  SaveSchemaValidationError,
} from '@/application/useCases/save/schema'

export type AutosaveActiveSlot = (
  input: AutosaveActiveSlotInput,
) => Promise<SaveUseCaseResult<AutosaveActiveSlotOutput>>

export function createAutosaveActiveSlotUseCase(
  saveRepository: SaveRepository,
  clock: Clock,
): AutosaveActiveSlot {
  return async (input: AutosaveActiveSlotInput) => {
    let index

    try {
      index = parseSaveIndexStrict(await saveRepository.getIndex())
    } catch (error) {
      return saveFailure('SAVE_SCHEMA_INVALID', 'Save index is invalid.', error)
    }

    const activeSlotId = index.activeSlotId
    if (!activeSlotId) {
      return saveFailure('SAVE_NO_ACTIVE_SLOT', 'No active save slot is selected.')
    }

    try {
      const rawSlot = await saveRepository.getSlotById(activeSlotId)
      if (!rawSlot) {
        return saveFailure('SAVE_NOT_FOUND', `Active save slot ${activeSlotId} was not found.`)
      }

      const currentSlot = parseSaveSlotStrict(rawSlot)
      const state = parseGameStateStrict(input.state)
      const nowIso = new Date(clock.nowMs()).toISOString()

      const nextSlot = {
        ...currentSlot,
        data: state,
        lastPlayedAt: nowIso,
      }

      await saveRepository.saveSlot(nextSlot)

      const nextIndex = normalizeIndex({
        activeSlotId: currentSlot.id,
        slots: upsertSlotMetadata(index.slots, toMetadata(nextSlot)),
      })

      await saveRepository.saveIndex(nextIndex)

      return saveSuccess({
        slot: nextSlot,
        index: nextIndex,
      })
    } catch (error) {
      if (error instanceof SaveSchemaValidationError) {
        return saveFailure('SAVE_SCHEMA_INVALID', error.message, error)
      }

      return saveFailure('SAVE_WRITE_FAILED', 'Unable to autosave active slot.', error)
    }
  }
}
