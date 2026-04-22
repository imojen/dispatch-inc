import {
  CURRENT_SAVE_VERSION,
  SUPPORTED_MIN_SAVE_VERSION,
} from '@/application/useCases/save/contracts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function toInteger(value: unknown, fallback: number, min = 0): number {
  if (Number.isInteger(value) && (value as number) >= min) {
    return value as number
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Math.floor(value)
    return rounded >= min ? rounded : fallback
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      const rounded = Math.floor(parsed)
      return rounded >= min ? rounded : fallback
    }
  }

  return fallback
}

function toNumericString(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return fallback
}

function readRequiredString(
  record: Record<string, unknown>,
  key: string,
  context: string,
): string {
  const value = record[key]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new SaveMigrationError(`${context}.${key} is required for migration`)
  }

  return value
}

export class SaveVersionUnsupportedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SaveVersionUnsupportedError'
  }
}

export class SaveMigrationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SaveMigrationError'
  }
}

function migrateV1ToV2(raw: unknown): unknown {
  if (!isRecord(raw)) {
    throw new SaveMigrationError('v1->v2 migration requires a save object payload')
  }

  const id = readRequiredString(raw, 'id', 'save')
  const label = readRequiredString(raw, 'label', 'save')
  const createdAt = readRequiredString(raw, 'createdAt', 'save')
  const lastPlayedAt = readRequiredString(raw, 'lastPlayedAt', 'save')
  const balanceCatalogVersion = toInteger(raw.balanceCatalogVersion, 1, 1)

  if (!isRecord(raw.data)) {
    throw new SaveMigrationError('v1->v2 migration requires save.data object')
  }

  const data = raw.data
  const simulation = isRecord(data.simulation) ? data.simulation : {}
  const resources = isRecord(data.resources) ? data.resources : {}
  const progression = isRecord(data.progression) ? data.progression : {}
  const upgrades = isRecord(data.upgrades) ? data.upgrades : {}
  const skills = isRecord(data.skills) ? data.skills : {}

  const skillPoints = toInteger(progression.skillPoints, 0, 0)
  const architecturePoints = toInteger(progression.architecturePoints, skillPoints, 0)

  return {
    id,
    label,
    createdAt,
    lastPlayedAt,
    version: 2,
    balanceCatalogVersion,
    data: {
      simulation: {
        tickRate: toNumericString(simulation.tickRate, '1'),
        lastSeenAt:
          typeof simulation.lastSeenAt === 'string' && simulation.lastSeenAt.trim().length > 0
            ? simulation.lastSeenAt
            : lastPlayedAt,
      },
      resources: {
        money: toNumericString(resources.money, '0'),
        packages: toNumericString(resources.packages, '0'),
      },
      progression: {
        warehouseLevel: toInteger(progression.warehouseLevel, 1, 1),
        architecturePoints,
        skillPoints,
      },
      upgrades,
      skills,
    },
  }
}

const MIGRATIONS: Record<number, (raw: unknown) => unknown> = {
  1: migrateV1ToV2,
}

function readSaveVersion(raw: unknown): number {
  if (!isRecord(raw)) {
    throw new SaveMigrationError('Save payload must be an object')
  }

  const version = raw.version
  if (!Number.isInteger(version) || (version as number) < 1) {
    throw new SaveMigrationError('Save payload version must be an integer >= 1')
  }

  return version as number
}

export interface SaveMigrationResult {
  payload: unknown
  fromVersion: number
  toVersion: number
  didMigrate: boolean
}

export function migrateRawSaveSlotToCurrent(rawInput: unknown): SaveMigrationResult {
  const original = cloneJson(rawInput)
  const fromVersion = readSaveVersion(original)

  if (fromVersion > CURRENT_SAVE_VERSION) {
    throw new SaveVersionUnsupportedError(
      `Save version ${fromVersion} is newer than supported version ${CURRENT_SAVE_VERSION}`,
    )
  }

  if (fromVersion < SUPPORTED_MIN_SAVE_VERSION) {
    throw new SaveVersionUnsupportedError(
      `Save version ${fromVersion} is older than supported minimum ${SUPPORTED_MIN_SAVE_VERSION}`,
    )
  }

  let payload: unknown = original
  let cursor = fromVersion

  while (cursor < CURRENT_SAVE_VERSION) {
    const migrate = MIGRATIONS[cursor]
    if (!migrate) {
      throw new SaveMigrationError(`Missing migration step v${cursor} -> v${cursor + 1}`)
    }

    payload = migrate(payload)
    cursor += 1
  }

  return {
    payload,
    fromVersion,
    toVersion: cursor,
    didMigrate: fromVersion !== cursor,
  }
}
