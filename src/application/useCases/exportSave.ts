import type { Clock } from '@/application/ports/Clock'
import type { SaveRepository } from '@/application/ports/SaveRepository'
import {
  type ExportSaveInput,
  type ExportSaveOutput,
  saveFailure,
  saveSuccess,
  type SaveUseCaseResult,
} from '@/application/useCases/save/contracts'
import {
  buildExportFilename,
  stableJsonStringify,
} from '@/application/useCases/save/helpers'
import {
  parseSaveIndexStrict,
  parseSaveSlotStrict,
  SaveSchemaValidationError,
} from '@/application/useCases/save/schema'

export type ExportSave = (
  input?: ExportSaveInput,
) => Promise<SaveUseCaseResult<ExportSaveOutput>>

export function createExportSaveUseCase(
  saveRepository: SaveRepository,
  clock: Clock,
): ExportSave {
  return async (input?: ExportSaveInput) => {
    let index

    try {
      index = parseSaveIndexStrict(await saveRepository.getIndex())
    } catch (error) {
      return saveFailure('SAVE_SCHEMA_INVALID', 'Save index is invalid.', error)
    }

    const targetId = input?.id ?? index.activeSlotId
    if (!targetId) {
      return saveFailure('SAVE_NO_ACTIVE_SLOT', 'No active save slot available for export.')
    }

    try {
      const rawSlot = await saveRepository.getSlotById(targetId)
      if (!rawSlot) {
        return saveFailure('SAVE_NOT_FOUND', `Save slot ${targetId} was not found.`)
      }

      const slot = parseSaveSlotStrict(rawSlot)
      const filename = buildExportFilename(slot.label, clock.nowMs())
      const json = `${stableJsonStringify(slot, 2)}\n`

      return saveSuccess({
        slotId: slot.id,
        filename,
        json,
      })
    } catch (error) {
      if (error instanceof SaveSchemaValidationError) {
        return saveFailure('SAVE_SCHEMA_INVALID', error.message, error)
      }

      return saveFailure('SAVE_WRITE_FAILED', 'Unable to export save slot.', error)
    }
  }
}
