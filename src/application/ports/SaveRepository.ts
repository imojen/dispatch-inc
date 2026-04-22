import type { SaveIndexDto, SaveSlotDto } from '@/application/dto/save'

export interface SaveRepository {
  getIndex(): Promise<SaveIndexDto>
  saveIndex(index: SaveIndexDto): Promise<void>
  getSlotById(id: string): Promise<SaveSlotDto | null>
  saveSlot(slot: SaveSlotDto): Promise<void>
  deleteSlot(id: string): Promise<void>
  saveMigrationBackup(id: string, rawPayload: unknown, timestampMs: number): Promise<string>
}
