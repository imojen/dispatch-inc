import { describe, expect, it } from 'vitest'
import type { SaveSlotDto } from '@/application/dto/save'
import { LocalStorageSaveRepository } from '@/infrastructure/persistence/localStorage/saveRepository'

interface MemoryStorageHarness {
  storage: {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
    removeItem(key: string): void
  }
  writeRaw(key: string, value: string): void
  readRaw(key: string): string | null
}

function createMemoryStorageHarness(): MemoryStorageHarness {
  const map = new Map<string, string>()

  return {
    storage: {
      getItem(key: string): string | null {
        return map.get(key) ?? null
      },
      setItem(key: string, value: string): void {
        map.set(key, value)
      },
      removeItem(key: string): void {
        map.delete(key)
      },
    },
    writeRaw(key: string, value: string): void {
      map.set(key, value)
    },
    readRaw(key: string): string | null {
      return map.get(key) ?? null
    },
  }
}

function createSlot(id: string, lastPlayedAt: string): SaveSlotDto {
  return {
    id,
    label: id,
    createdAt: '2026-04-21T00:00:00.000Z',
    lastPlayedAt,
    version: 2,
    balanceCatalogVersion: 1,
    data: {
      simulation: {
        tickRate: '1',
        lastSeenAt: '2026-04-21T00:00:00.000Z',
      },
      resources: {
        money: '0',
        packages: '0',
      },
      progression: {
        warehouseLevel: 1,
        architecturePoints: 0,
        skillPoints: 0,
      },
      runUnlocks: {},
      upgrades: {},
      skills: {},
    },
  }
}

describe('LocalStorageSaveRepository', () => {
  it('cleans index entries with missing payloads', async () => {
    const harness = createMemoryStorageHarness()
    const repository = new LocalStorageSaveRepository(harness.storage)

    harness.writeRaw(
      'dispatchinc:saves:index',
      JSON.stringify({
        activeSlotId: 'missing-slot',
        slots: [
          {
            id: 'missing-slot',
            label: 'Missing',
            createdAt: '2026-04-21T00:00:00.000Z',
            lastPlayedAt: '2026-04-21T00:00:00.000Z',
            version: 2,
            balanceCatalogVersion: 1,
          },
        ],
      }),
    )

    const index = await repository.getIndex()

    expect(index.slots).toHaveLength(0)
    expect(index.activeSlotId).toBeUndefined()
  })

  it('sorts slots by lastPlayedAt when saving index', async () => {
    const harness = createMemoryStorageHarness()
    const repository = new LocalStorageSaveRepository(harness.storage)

    await repository.saveSlot(createSlot('older', '2026-04-21T01:00:00.000Z'))
    await repository.saveSlot(createSlot('newer', '2026-04-21T02:00:00.000Z'))

    await repository.saveIndex({
      activeSlotId: 'older',
      slots: [
        {
          id: 'older',
          label: 'older',
          createdAt: '2026-04-21T00:00:00.000Z',
          lastPlayedAt: '2026-04-21T01:00:00.000Z',
          version: 2,
          balanceCatalogVersion: 1,
        },
        {
          id: 'newer',
          label: 'newer',
          createdAt: '2026-04-21T00:00:00.000Z',
          lastPlayedAt: '2026-04-21T02:00:00.000Z',
          version: 2,
          balanceCatalogVersion: 1,
        },
      ],
    })

    const index = await repository.getIndex()

    expect(index.slots[0].id).toBe('newer')
    expect(index.slots[1].id).toBe('older')
    expect(index.activeSlotId).toBe('older')
  })

  it('removes metadata and activeSlotId when deleting a slot', async () => {
    const harness = createMemoryStorageHarness()
    const repository = new LocalStorageSaveRepository(harness.storage)

    const slot = createSlot('slot-a', '2026-04-21T03:00:00.000Z')
    await repository.saveSlot(slot)
    await repository.saveIndex({
      activeSlotId: slot.id,
      slots: [
        {
          id: slot.id,
          label: slot.label,
          createdAt: slot.createdAt,
          lastPlayedAt: slot.lastPlayedAt,
          version: slot.version,
          balanceCatalogVersion: slot.balanceCatalogVersion,
        },
      ],
    })

    await repository.deleteSlot(slot.id)

    const index = await repository.getIndex()
    expect(index.slots).toHaveLength(0)
    expect(index.activeSlotId).toBeUndefined()

    const payload = harness.readRaw('dispatchinc:save:slot-a')
    expect(payload).toBeNull()
  })
})
