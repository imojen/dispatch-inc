import type { GameStateDto } from './game'

export interface SaveSlotMetadataDto {
  id: string
  label: string
  createdAt: string
  lastPlayedAt: string
  version: number
  balanceCatalogVersion: number
}

export interface SaveSlotDto extends SaveSlotMetadataDto {
  data: GameStateDto
}

export interface SaveIndexDto {
  activeSlotId?: string
  slots: SaveSlotMetadataDto[]
}
