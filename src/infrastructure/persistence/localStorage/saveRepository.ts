import type {
  SaveIndexDto,
  SaveSlotDto,
  SaveSlotMetadataDto,
} from '@/application/dto/save'
import type { SaveRepository } from '@/application/ports/SaveRepository'

type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const SAVE_INDEX_KEY = 'dispatchinc:saves:index'

function createMemoryStorage(): StorageLike {
  const memory = new Map<string, string>()
  return {
    getItem(key: string): string | null {
      return memory.get(key) ?? null
    },
    setItem(key: string, value: string): void {
      memory.set(key, value)
    },
    removeItem(key: string): void {
      memory.delete(key)
    },
  }
}

function resolveStorage(): StorageLike {
  if (typeof localStorage !== 'undefined') {
    return localStorage
  }
  return createMemoryStorage()
}

function slotKey(id: string): string {
  return `dispatchinc:save:${id}`
}

function backupKey(id: string, timestampMs: number): string {
  return `dispatchinc:save:${id}:backup:${timestampMs}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isIsoDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value))
}

function normalizeSlotMetadata(input: unknown): SaveSlotMetadataDto | null {
  if (!isRecord(input)) {
    return null
  }

  const {
    id,
    label,
    createdAt,
    lastPlayedAt,
    version,
    balanceCatalogVersion,
  } = input

  if (typeof id !== 'string' || !id.trim()) {
    return null
  }

  if (typeof label !== 'string' || !label.trim()) {
    return null
  }

  if (typeof createdAt !== 'string' || !isIsoDate(createdAt)) {
    return null
  }

  if (typeof lastPlayedAt !== 'string' || !isIsoDate(lastPlayedAt)) {
    return null
  }

  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    return null
  }

  if (
    typeof balanceCatalogVersion !== 'number' ||
    !Number.isInteger(balanceCatalogVersion) ||
    balanceCatalogVersion < 1
  ) {
    return null
  }

  return {
    id,
    label,
    createdAt,
    lastPlayedAt,
    version,
    balanceCatalogVersion,
  }
}

function sortSlots(slots: SaveSlotMetadataDto[]): SaveSlotMetadataDto[] {
  return [...slots].sort((a, b) => {
    const aMs = Date.parse(a.lastPlayedAt)
    const bMs = Date.parse(b.lastPlayedAt)
    return bMs - aMs
  })
}

function normalizeIndex(input: unknown): SaveIndexDto {
  if (!isRecord(input)) {
    return { slots: [] }
  }

  const slotsInput = input.slots
  const activeSlotIdInput = input.activeSlotId

  const slots = Array.isArray(slotsInput)
    ? slotsInput
        .map((entry) => normalizeSlotMetadata(entry))
        .filter((entry): entry is SaveSlotMetadataDto => entry !== null)
    : []

  const slotIds = new Set(slots.map((slot) => slot.id))
  const activeSlotId =
    typeof activeSlotIdInput === 'string' && slotIds.has(activeSlotIdInput)
      ? activeSlotIdInput
      : undefined

  return {
    activeSlotId,
    slots: sortSlots(slots),
  }
}

function payloadExists(storage: StorageLike, id: string): boolean {
  return storage.getItem(slotKey(id)) !== null
}

function enforceCoherence(storage: StorageLike, index: SaveIndexDto): SaveIndexDto {
  const coherentSlots = index.slots.filter((slot) => payloadExists(storage, slot.id))
  const coherentIds = new Set(coherentSlots.map((slot) => slot.id))

  return {
    activeSlotId:
      index.activeSlotId !== undefined && coherentIds.has(index.activeSlotId)
        ? index.activeSlotId
        : undefined,
    slots: sortSlots(coherentSlots),
  }
}

export class LocalStorageSaveRepository implements SaveRepository {
  private readonly storage: StorageLike

  constructor(storage: StorageLike = resolveStorage()) {
    this.storage = storage
  }

  async getIndex(): Promise<SaveIndexDto> {
    const raw = this.storage.getItem(SAVE_INDEX_KEY)
    if (!raw) {
      return { slots: [] }
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      const fallback: SaveIndexDto = { slots: [] }
      this.storage.setItem(SAVE_INDEX_KEY, JSON.stringify(fallback))
      return fallback
    }

    const normalized = normalizeIndex(parsed)
    const coherent = enforceCoherence(this.storage, normalized)
    this.storage.setItem(SAVE_INDEX_KEY, JSON.stringify(coherent))
    return coherent
  }

  async saveIndex(index: SaveIndexDto): Promise<void> {
    const normalized = normalizeIndex(index)
    const coherent = enforceCoherence(this.storage, normalized)
    this.storage.setItem(SAVE_INDEX_KEY, JSON.stringify(coherent))
  }

  async getSlotById(id: string): Promise<SaveSlotDto | null> {
    const raw = this.storage.getItem(slotKey(id))
    if (!raw) {
      return null
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error(`Corrupted save payload for slot ${id}`)
    }

    return parsed as SaveSlotDto
  }

  async saveSlot(slot: SaveSlotDto): Promise<void> {
    this.storage.setItem(slotKey(slot.id), JSON.stringify(slot))
  }

  async deleteSlot(id: string): Promise<void> {
    this.storage.removeItem(slotKey(id))

    const index = await this.getIndex()
    const nextSlots = index.slots.filter((slot) => slot.id !== id)

    await this.saveIndex({
      activeSlotId: index.activeSlotId === id ? undefined : index.activeSlotId,
      slots: nextSlots,
    })
  }

  async saveMigrationBackup(
    id: string,
    rawPayload: unknown,
    timestampMs: number,
  ): Promise<string> {
    const key = backupKey(id, timestampMs)
    this.storage.setItem(key, JSON.stringify(rawPayload))
    return key
  }
}
