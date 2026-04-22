import type { GameStateDto, LevelStateDto } from '@/application/dto/game'
import type { SaveIndexDto, SaveSlotDto, SaveSlotMetadataDto } from '@/application/dto/save'

const NUMERIC_STRING_REGEX = /^-?(?:\d+|\d*\.\d+)(?:[eE][+-]?\d+)?$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function assertRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new SaveSchemaValidationError(`${path} must be an object`)
  }

  return value
}

function assertString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new SaveSchemaValidationError(`${path} must be a non-empty string`)
  }

  return value
}

function assertIsoDateString(value: unknown, path: string): string {
  const str = assertString(value, path)

  if (Number.isNaN(Date.parse(str))) {
    throw new SaveSchemaValidationError(`${path} must be an ISO-compatible timestamp`)
  }

  return str
}

function assertInteger(value: unknown, path: string, min = 0): number {
  if (!Number.isInteger(value) || (value as number) < min) {
    throw new SaveSchemaValidationError(`${path} must be an integer >= ${min}`)
  }

  return value as number
}

function assertNumericString(
  value: unknown,
  path: string,
  options?: { allowNegative?: boolean; mustBePositive?: boolean },
): string {
  const str = assertString(value, path)

  if (!NUMERIC_STRING_REGEX.test(str)) {
    throw new SaveSchemaValidationError(`${path} must be a numeric string`)
  }

  if (options?.allowNegative === false && str.startsWith('-')) {
    throw new SaveSchemaValidationError(`${path} must be >= 0`)
  }

  if (options?.mustBePositive) {
    const asNumber = Number(str)
    if (!Number.isFinite(asNumber) || asNumber <= 0) {
      throw new SaveSchemaValidationError(`${path} must be > 0`)
    }
  }

  return str
}

function parseLevelStateRecord(value: unknown, path: string): Record<string, LevelStateDto> {
  const record = assertRecord(value, path)
  const entries = Object.entries(record)

  return entries.reduce<Record<string, LevelStateDto>>((acc, [key, entry]) => {
    const entryRecord = assertRecord(entry, `${path}.${key}`)
    acc[key] = {
      level: assertInteger(entryRecord.level, `${path}.${key}.level`, 0),
    }
    return acc
  }, {})
}

export class SaveSchemaValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SaveSchemaValidationError'
  }
}

export function parseGameStateStrict(input: unknown): GameStateDto {
  const root = assertRecord(input, 'save.data')
  const simulation = assertRecord(root.simulation, 'save.data.simulation')
  const resources = assertRecord(root.resources, 'save.data.resources')
  const progression = assertRecord(root.progression, 'save.data.progression')

  return {
    simulation: {
      tickRate: assertNumericString(simulation.tickRate, 'save.data.simulation.tickRate', {
        mustBePositive: true,
      }),
      lastSeenAt: assertIsoDateString(simulation.lastSeenAt, 'save.data.simulation.lastSeenAt'),
    },
    resources: {
      money: assertNumericString(resources.money, 'save.data.resources.money', {
        allowNegative: false,
      }),
      packages: assertNumericString(resources.packages, 'save.data.resources.packages', {
        allowNegative: false,
      }),
    },
    progression: {
      warehouseLevel: assertInteger(progression.warehouseLevel, 'save.data.progression.warehouseLevel', 1),
      architecturePoints: assertInteger(
        progression.architecturePoints,
        'save.data.progression.architecturePoints',
        0,
      ),
      skillPoints: assertInteger(progression.skillPoints, 'save.data.progression.skillPoints', 0),
    },
    upgrades: parseLevelStateRecord(root.upgrades, 'save.data.upgrades'),
    skills: parseLevelStateRecord(root.skills, 'save.data.skills'),
  }
}

export function parseSaveSlotMetadataStrict(input: unknown): SaveSlotMetadataDto {
  const root = assertRecord(input, 'save.metadata')

  return {
    id: assertString(root.id, 'save.id'),
    label: assertString(root.label, 'save.label'),
    createdAt: assertIsoDateString(root.createdAt, 'save.createdAt'),
    lastPlayedAt: assertIsoDateString(root.lastPlayedAt, 'save.lastPlayedAt'),
    version: assertInteger(root.version, 'save.version', 1),
    balanceCatalogVersion: assertInteger(root.balanceCatalogVersion, 'save.balanceCatalogVersion', 1),
  }
}

export function parseSaveSlotStrict(input: unknown): SaveSlotDto {
  const root = assertRecord(input, 'save')
  const metadata = parseSaveSlotMetadataStrict(root)
  const data = parseGameStateStrict(root.data)

  return {
    ...metadata,
    data,
  }
}

export function parseSaveIndexStrict(input: unknown): SaveIndexDto {
  const root = assertRecord(input, 'index')
  const slotsRaw = root.slots

  if (!Array.isArray(slotsRaw)) {
    throw new SaveSchemaValidationError('index.slots must be an array')
  }

  const slots = slotsRaw.map((entry, idx) => parseSaveSlotMetadataStrict({
    ...(assertRecord(entry, `index.slots[${idx}]`)),
  }))

  const slotIds = new Set(slots.map((slot) => slot.id))
  const activeSlotIdRaw = root.activeSlotId
  const activeSlotId =
    activeSlotIdRaw === undefined
      ? undefined
      : assertString(activeSlotIdRaw, 'index.activeSlotId')

  if (activeSlotId !== undefined && !slotIds.has(activeSlotId)) {
    throw new SaveSchemaValidationError('index.activeSlotId must reference an existing slot id')
  }

  return {
    activeSlotId,
    slots,
  }
}
