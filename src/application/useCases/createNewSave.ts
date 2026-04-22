import type { Clock } from '@/application/ports/Clock'
import type { SaveRepository } from '@/application/ports/SaveRepository'
import {
  type CreateNewSaveInput,
  type CreateNewSaveOutput,
  DEFAULT_BALANCE_CATALOG_VERSION,
  CURRENT_SAVE_VERSION,
  saveFailure,
  saveSuccess,
  type SaveUseCaseResult,
} from '@/application/useCases/save/contracts'
import {
  createInitialGameState,
  generateUniqueSlotId,
  normalizeIndex,
  normalizeRequestedLabel,
  toMetadata,
  upsertSlotMetadata,
} from '@/application/useCases/save/helpers'
import { parseSaveIndexStrict } from '@/application/useCases/save/schema'

export type CreateNewSave = (
  input?: CreateNewSaveInput,
) => Promise<SaveUseCaseResult<CreateNewSaveOutput>>

export function createCreateNewSaveUseCase(
  saveRepository: SaveRepository,
  clock: Clock,
): CreateNewSave {
  return async (input?: CreateNewSaveInput) => {
    try {
      const nowMs = clock.nowMs()
      const nowIso = new Date(nowMs).toISOString()

      const currentIndex = parseSaveIndexStrict(await saveRepository.getIndex())
      const existingIds = new Set(currentIndex.slots.map((slot) => slot.id))
      const slotId = generateUniqueSlotId(existingIds, nowMs)

      const slot = {
        id: slotId,
        label: normalizeRequestedLabel(input?.label, nowMs),
        createdAt: nowIso,
        lastPlayedAt: nowIso,
        version: CURRENT_SAVE_VERSION,
        balanceCatalogVersion: DEFAULT_BALANCE_CATALOG_VERSION,
        data: createInitialGameState(nowIso),
      }

      await saveRepository.saveSlot(slot)

      const nextIndex = normalizeIndex({
        activeSlotId: slot.id,
        slots: upsertSlotMetadata(currentIndex.slots, toMetadata(slot)),
      })

      await saveRepository.saveIndex(nextIndex)

      return saveSuccess({
        slot,
        index: nextIndex,
      })
    } catch (error) {
      return saveFailure('SAVE_WRITE_FAILED', 'Unable to create save slot.', error)
    }
  }
}
