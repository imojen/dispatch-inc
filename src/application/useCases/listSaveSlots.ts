import type { SaveIndexDto, SaveSlotMetadataDto } from '@/application/dto/save'
import type { SaveRepository } from '@/application/ports/SaveRepository'
import {
  mapSaveErrorToUiTextKey,
  saveFailure,
  saveSuccess,
  type SaveErrorCode,
  type SaveUseCaseResult,
} from '@/application/useCases/save/contracts'
import { parseSaveIndexStrict, SaveSchemaValidationError } from '@/application/useCases/save/schema'

export interface ListSaveSlotsOutput {
  index: SaveIndexDto
  slots: SaveSlotMetadataDto[]
}

export type ListSaveSlots = () => Promise<SaveUseCaseResult<ListSaveSlotsOutput>>

export interface ListSaveSlotsFailure {
  code: SaveErrorCode
  uiTextKey: string
}

export function toListSaveSlotsFailure(errorCode: SaveErrorCode): ListSaveSlotsFailure {
  return {
    code: errorCode,
    uiTextKey: mapSaveErrorToUiTextKey(errorCode),
  }
}

export function createListSaveSlotsUseCase(saveRepository: SaveRepository): ListSaveSlots {
  return async () => {
    try {
      const index = parseSaveIndexStrict(await saveRepository.getIndex())
      return saveSuccess({
        index,
        slots: index.slots,
      })
    } catch (error) {
      if (error instanceof SaveSchemaValidationError) {
        return saveFailure('SAVE_SCHEMA_INVALID', error.message, error)
      }

      return saveFailure('SAVE_WRITE_FAILED', 'Unable to list save slots.', error)
    }
  }
}
