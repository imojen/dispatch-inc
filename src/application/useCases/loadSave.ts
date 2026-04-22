import type { Clock } from '@/application/ports/Clock'
import type { SaveRepository } from '@/application/ports/SaveRepository'
import {
  type LoadSaveInput,
  type LoadSaveOutput,
  CURRENT_SAVE_VERSION,
  saveFailure,
  saveSuccess,
  type SaveUseCaseResult,
} from '@/application/useCases/save/contracts'
import {
  SaveMigrationError,
  migrateRawSaveSlotToCurrent,
  SaveVersionUnsupportedError,
} from '@/application/useCases/save/migrations'
import {
  normalizeIndex,
  toMetadata,
  upsertSlotMetadata,
} from '@/application/useCases/save/helpers'
import {
  parseSaveIndexStrict,
  parseSaveSlotStrict,
  SaveSchemaValidationError,
} from '@/application/useCases/save/schema'

function readVersionUnsafe(rawSlot: unknown): number | null {
  if (typeof rawSlot !== 'object' || rawSlot === null || Array.isArray(rawSlot)) {
    return null
  }

  const version = (rawSlot as { version?: unknown }).version
  if (!Number.isInteger(version)) {
    return null
  }

  return version as number
}

export type LoadSave = (
  input: LoadSaveInput,
) => Promise<SaveUseCaseResult<LoadSaveOutput>>

export function createLoadSaveUseCase(
  saveRepository: SaveRepository,
  clock: Clock,
): LoadSave {
  return async (input: LoadSaveInput) => {
    let index

    try {
      index = parseSaveIndexStrict(await saveRepository.getIndex())
    } catch (error) {
      return saveFailure('SAVE_SCHEMA_INVALID', 'Save index is invalid.', error)
    }

    const rawSlot = await saveRepository.getSlotById(input.id)
    if (!rawSlot) {
      const cleaned = normalizeIndex({
        activeSlotId: index.activeSlotId === input.id ? undefined : index.activeSlotId,
        slots: index.slots.filter((slot) => slot.id !== input.id),
      })
      await saveRepository.saveIndex(cleaned)

      return saveFailure('SAVE_NOT_FOUND', `Save slot ${input.id} was not found.`)
    }

    let backupKey: string | undefined

    try {
      const rawVersion = readVersionUnsafe(rawSlot)
      if (rawVersion !== null && rawVersion < CURRENT_SAVE_VERSION) {
        backupKey = await saveRepository.saveMigrationBackup(input.id, rawSlot, clock.nowMs())
      }

      const migrationResult = migrateRawSaveSlotToCurrent(rawSlot)
      const nowIso = new Date(clock.nowMs()).toISOString()
      const validated = parseSaveSlotStrict(migrationResult.payload)

      const loadedSlot = {
        ...validated,
        lastPlayedAt: nowIso,
      }

      await saveRepository.saveSlot(loadedSlot)

      const nextIndex = normalizeIndex({
        activeSlotId: loadedSlot.id,
        slots: upsertSlotMetadata(index.slots, toMetadata(loadedSlot)),
      })

      await saveRepository.saveIndex(nextIndex)

      return saveSuccess({
        slot: loadedSlot,
        didMigrate: migrationResult.didMigrate,
        backupKey,
        index: nextIndex,
      })
    } catch (error) {
      if (error instanceof SaveVersionUnsupportedError) {
        return saveFailure('SAVE_VERSION_UNSUPPORTED', error.message, error)
      }

      if (error instanceof SaveMigrationError) {
        return saveFailure('SAVE_MIGRATION_FAILED', error.message, error)
      }

      if (error instanceof SaveSchemaValidationError) {
        return saveFailure('SAVE_SCHEMA_INVALID', error.message, error)
      }

      return saveFailure('SAVE_WRITE_FAILED', 'Unable to load save slot.', error)
    }
  }
}
