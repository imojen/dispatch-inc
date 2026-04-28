import type { GameStateDto } from '@/application/dto/game'
import type { SaveIndexDto, SaveSlotDto, SaveSlotMetadataDto } from '@/application/dto/save'

export function buildDefaultSaveLabel(timestampMs: number): string {
  const iso = new Date(timestampMs).toISOString().slice(0, 16).replace('T', ' ')
  return `Partie ${iso}`
}

export function normalizeRequestedLabel(
  label: string | undefined,
  timestampMs: number,
): string {
  const trimmed = label?.trim()
  if (trimmed && trimmed.length > 0) {
    return trimmed
  }
  return buildDefaultSaveLabel(timestampMs)
}

export function createInitialGameState(nowIso: string): GameStateDto {
  return {
    simulation: {
      tickRate: '1',
      lastSeenAt: nowIso,
    },
    resources: {
      money: '10',
      packages: '0',
    },
    progression: {
      warehouseLevel: 1,
      architecturePoints: 0,
      skillPoints: 0,
    },
    upgrades: {},
    runUnlocks: {},
    skills: {},
  }
}

export function toMetadata(slot: SaveSlotDto): SaveSlotMetadataDto {
  return {
    id: slot.id,
    label: slot.label,
    createdAt: slot.createdAt,
    lastPlayedAt: slot.lastPlayedAt,
    version: slot.version,
    balanceCatalogVersion: slot.balanceCatalogVersion,
  }
}

export function sortSlotsByLastPlayedAtDesc(
  slots: SaveSlotMetadataDto[],
): SaveSlotMetadataDto[] {
  return [...slots].sort((a, b) => Date.parse(b.lastPlayedAt) - Date.parse(a.lastPlayedAt))
}

export function normalizeIndex(index: SaveIndexDto): SaveIndexDto {
  const slots = sortSlotsByLastPlayedAtDesc(index.slots)
  const slotIds = new Set(slots.map((slot) => slot.id))
  const activeSlotId =
    index.activeSlotId !== undefined && slotIds.has(index.activeSlotId)
      ? index.activeSlotId
      : undefined

  return {
    activeSlotId,
    slots,
  }
}

export function upsertSlotMetadata(
  slots: SaveSlotMetadataDto[],
  metadata: SaveSlotMetadataDto,
): SaveSlotMetadataDto[] {
  const withoutCurrent = slots.filter((slot) => slot.id !== metadata.id)
  return sortSlotsByLastPlayedAtDesc([...withoutCurrent, metadata])
}

export function generateUniqueSlotId(
  existingIds: Set<string>,
  timestampMs: number,
): string {
  const base = `save-${timestampMs.toString(36)}`

  if (!existingIds.has(base)) {
    return base
  }

  let sequence = 2
  while (existingIds.has(`${base}-${sequence}`)) {
    sequence += 1
  }

  return `${base}-${sequence}`
}

export function resolveIdCollision(
  requestedId: string,
  existingIds: Set<string>,
): { id: string; hadCollision: boolean } {
  if (!existingIds.has(requestedId)) {
    return {
      id: requestedId,
      hadCollision: false,
    }
  }

  let sequence = 2
  let candidate = `${requestedId}-import-${sequence}`

  while (existingIds.has(candidate)) {
    sequence += 1
    candidate = `${requestedId}-import-${sequence}`
  }

  return {
    id: candidate,
    hadCollision: true,
  }
}

export function resolveLabelCollision(
  requestedLabel: string,
  existingLabels: Set<string>,
): { label: string; hadCollision: boolean } {
  if (!existingLabels.has(requestedLabel)) {
    return {
      label: requestedLabel,
      hadCollision: false,
    }
  }

  let sequence = 2
  let candidate = `${requestedLabel} (import ${sequence})`

  while (existingLabels.has(candidate)) {
    sequence += 1
    candidate = `${requestedLabel} (import ${sequence})`
  }

  return {
    label: candidate,
    hadCollision: true,
  }
}

function sanitizeFilenameSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-\s_]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildExportFilename(label: string, timestampMs: number): string {
  const safeLabel = sanitizeFilenameSegment(label) || 'partie'
  const dateStamp = new Date(timestampMs).toISOString().slice(0, 10)
  return `dispatchinc-save-${safeLabel}-${dateStamp}.json`
}

function toStableSerializable(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => toStableSerializable(entry))
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    const sortedEntries = Object.entries(record).sort(([a], [b]) => a.localeCompare(b))

    return sortedEntries.reduce<Record<string, unknown>>((acc, [key, entry]) => {
      acc[key] = toStableSerializable(entry)
      return acc
    }, {})
  }

  return value
}

export function stableJsonStringify(value: unknown, spacing = 2): string {
  return JSON.stringify(toStableSerializable(value), null, spacing)
}
