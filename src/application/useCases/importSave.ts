import type { Clock } from '@/application/ports/Clock'
import type { SaveRepository } from '@/application/ports/SaveRepository'
import {
  type ImportSaveInput,
  type ImportSaveOutput,
  saveFailure,
  saveSuccess,
  type SaveUseCaseResult,
} from '@/application/useCases/save/contracts'
import {
  migrateRawSaveSlotToCurrent,
  SaveMigrationError,
  SaveVersionUnsupportedError,
} from '@/application/useCases/save/migrations'
import {
  normalizeIndex,
  resolveIdCollision,
  resolveLabelCollision,
  toMetadata,
  upsertSlotMetadata,
} from '@/application/useCases/save/helpers'
import {
  parseSaveIndexStrict,
  parseSaveSlotStrict,
  SaveSchemaValidationError,
} from '@/application/useCases/save/schema'

export type ImportSave = (
  input: ImportSaveInput,
) => Promise<SaveUseCaseResult<ImportSaveOutput>>

export function createImportSaveUseCase(
  saveRepository: SaveRepository,
  clock: Clock,
): ImportSave {
  return async (input: ImportSaveInput) => {
    let parsed: unknown
    try {
      parsed = JSON.parse(input.json)
    } catch (error) {
      return saveFailure('SAVE_IMPORT_INVALID_JSON', 'Import payload is not valid JSON.', error)
    }

    let migrated: unknown
    try {
      migrated = migrateRawSaveSlotToCurrent(parsed).payload
    } catch (error) {
      if (error instanceof SaveVersionUnsupportedError) {
        return saveFailure('SAVE_VERSION_UNSUPPORTED', error.message, error)
      }

      if (error instanceof SaveMigrationError) {
        return saveFailure('SAVE_MIGRATION_FAILED', error.message, error)
      }

      return saveFailure('SAVE_IMPORT_INVALID_SCHEMA', 'Import payload is invalid.', error)
    }

    let importedSlot
    try {
      importedSlot = parseSaveSlotStrict(migrated)
    } catch (error) {
      return saveFailure('SAVE_IMPORT_INVALID_SCHEMA', 'Import payload schema is invalid.', error)
    }

    let index
    try {
      index = parseSaveIndexStrict(await saveRepository.getIndex())
    } catch (error) {
      return saveFailure('SAVE_SCHEMA_INVALID', 'Save index is invalid.', error)
    }

    try {
      const nowIso = new Date(clock.nowMs()).toISOString()
      const existingIds = new Set(index.slots.map((slot) => slot.id))
      const existingLabels = new Set(index.slots.map((slot) => slot.label))

      const idResolution = resolveIdCollision(importedSlot.id, existingIds)
      const labelResolution = resolveLabelCollision(importedSlot.label, existingLabels)

      const slot = {
        ...importedSlot,
        id: idResolution.id,
        label: labelResolution.label,
        lastPlayedAt: nowIso,
      }

      await saveRepository.saveSlot(slot)

      const nextIndex = normalizeIndex({
        activeSlotId: index.activeSlotId ?? slot.id,
        slots: upsertSlotMetadata(index.slots, toMetadata(slot)),
      })

      await saveRepository.saveIndex(nextIndex)

      return saveSuccess({
        slot,
        index: nextIndex,
        hadIdCollision: idResolution.hadCollision,
        hadLabelCollision: labelResolution.hadCollision,
      })
    } catch (error) {
      if (error instanceof SaveSchemaValidationError) {
        return saveFailure('SAVE_IMPORT_INVALID_SCHEMA', error.message, error)
      }

      return saveFailure('SAVE_WRITE_FAILED', 'Unable to import save slot.', error)
    }
  }
}
