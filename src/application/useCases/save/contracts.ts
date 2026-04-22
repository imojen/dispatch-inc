import type { GameStateDto } from '@/application/dto/game'
import type { SaveIndexDto, SaveSlotDto } from '@/application/dto/save'

export const CURRENT_SAVE_VERSION = 2
export const SUPPORTED_MIN_SAVE_VERSION = Math.max(1, CURRENT_SAVE_VERSION - 1)
export const DEFAULT_BALANCE_CATALOG_VERSION = 1

export type SaveErrorCode =
  | 'SAVE_NOT_FOUND'
  | 'SAVE_SCHEMA_INVALID'
  | 'SAVE_VERSION_UNSUPPORTED'
  | 'SAVE_MIGRATION_FAILED'
  | 'SAVE_IMPORT_INVALID_JSON'
  | 'SAVE_IMPORT_INVALID_SCHEMA'
  | 'SAVE_NO_ACTIVE_SLOT'
  | 'SAVE_WRITE_FAILED'

export interface SaveUseCaseError<Code extends SaveErrorCode = SaveErrorCode> {
  code: Code
  message: string
  cause?: unknown
}

export type SaveUseCaseResult<
  T,
  Code extends SaveErrorCode = SaveErrorCode,
> =
  | {
      ok: true
      value: T
    }
  | {
      ok: false
      error: SaveUseCaseError<Code>
    }

export function saveSuccess<T>(value: T): SaveUseCaseResult<T> {
  return {
    ok: true,
    value,
  }
}

export function saveFailure<Code extends SaveErrorCode>(
  code: Code,
  message: string,
  cause?: unknown,
): SaveUseCaseResult<never, Code> {
  return {
    ok: false,
    error: {
      code,
      message,
      cause,
    },
  }
}

export function mapSaveErrorToUiTextKey(code: SaveErrorCode): string {
  const mapping: Record<SaveErrorCode, string> = {
    SAVE_NOT_FOUND: 'save.error.notFound',
    SAVE_SCHEMA_INVALID: 'save.error.corrupted',
    SAVE_VERSION_UNSUPPORTED: 'save.error.versionUnsupported',
    SAVE_MIGRATION_FAILED: 'save.error.migrationFailure',
    SAVE_IMPORT_INVALID_JSON: 'save.error.importInvalid',
    SAVE_IMPORT_INVALID_SCHEMA: 'save.error.importInvalid',
    SAVE_NO_ACTIVE_SLOT: 'save.error.noActiveSlot',
    SAVE_WRITE_FAILED: 'save.error.writeFailed',
  }

  return mapping[code]
}

export interface CreateNewSaveInput {
  label?: string
}

export interface CreateNewSaveOutput {
  slot: SaveSlotDto
  index: SaveIndexDto
}

export interface LoadSaveInput {
  id: string
}

export interface LoadSaveOutput {
  slot: SaveSlotDto
  didMigrate: boolean
  backupKey?: string
  index: SaveIndexDto
}

export interface DeleteSaveInput {
  id: string
}

export interface DeleteSaveOutput {
  deleted: boolean
  index: SaveIndexDto
}

export interface ExportSaveInput {
  id?: string
}

export interface ExportSaveOutput {
  slotId: string
  filename: string
  json: string
}

export interface ImportSaveInput {
  json: string
}

export interface ImportSaveOutput {
  slot: SaveSlotDto
  index: SaveIndexDto
  hadIdCollision: boolean
  hadLabelCollision: boolean
}

export interface AutosaveActiveSlotInput {
  state: GameStateDto
}

export interface AutosaveActiveSlotOutput {
  slot: SaveSlotDto
  index: SaveIndexDto
}
