import { describe, expect, it } from 'vitest'
import { createAutosaveActiveSlotUseCase } from '@/application/useCases/autosaveActiveSlot'
import { createCreateNewSaveUseCase } from '@/application/useCases/createNewSave'
import { createDeleteSaveUseCase } from '@/application/useCases/deleteSave'
import { createExportSaveUseCase } from '@/application/useCases/exportSave'
import { createImportSaveUseCase } from '@/application/useCases/importSave'
import { createLoadSaveUseCase } from '@/application/useCases/loadSave'
import { parseSaveSlotStrict } from '@/application/useCases/save/schema'
import { LocalStorageSaveRepository } from '@/infrastructure/persistence/localStorage/saveRepository'

interface MemoryStorageHarness {
  storage: {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
    removeItem(key: string): void
  }
  readRaw(key: string): string | null
  writeRaw(key: string, value: string): void
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
    readRaw(key: string): string | null {
      return map.get(key) ?? null
    },
    writeRaw(key: string, value: string): void {
      map.set(key, value)
    },
  }
}

class StubClock {
  constructor(private currentMs: number) {}

  nowMs(): number {
    return this.currentMs
  }

  setNowMs(nextMs: number): void {
    this.currentMs = nextMs
  }
}

function assertSuccess<T>(result: { ok: boolean; value?: T }): T {
  expect(result.ok).toBe(true)
  return (result as { ok: true; value: T }).value
}

describe('save use-cases', () => {
  it('handles create/load/delete happy path', async () => {
    const clock = new StubClock(Date.parse('2026-04-21T10:00:00.000Z'))
    const harness = createMemoryStorageHarness()
    const repository = new LocalStorageSaveRepository(harness.storage)

    const createNewSave = createCreateNewSaveUseCase(repository, clock)
    const loadSave = createLoadSaveUseCase(repository, clock)
    const deleteSave = createDeleteSaveUseCase(repository)

    const created = assertSuccess(await createNewSave({ label: 'Run A' }))
    expect(created.index.activeSlotId).toBe(created.slot.id)
    expect(created.index.slots).toHaveLength(1)
    expect(created.slot.data.resources.money).toBe('10')

    clock.setNowMs(Date.parse('2026-04-21T10:05:00.000Z'))
    const loaded = assertSuccess(await loadSave({ id: created.slot.id }))
    expect(loaded.slot.id).toBe(created.slot.id)
    expect(loaded.didMigrate).toBe(false)

    const deleted = assertSuccess(await deleteSave({ id: created.slot.id }))
    expect(deleted.deleted).toBe(true)
    expect(deleted.index.slots).toHaveLength(0)
    expect(deleted.index.activeSlotId).toBeUndefined()
  })

  it('keeps slot list ordered by lastPlayedAt descending', async () => {
    const clock = new StubClock(Date.parse('2026-04-21T10:00:00.000Z'))
    const harness = createMemoryStorageHarness()
    const repository = new LocalStorageSaveRepository(harness.storage)

    const createNewSave = createCreateNewSaveUseCase(repository, clock)

    const first = assertSuccess(await createNewSave({ label: 'Run 1' }))

    clock.setNowMs(Date.parse('2026-04-21T11:00:00.000Z'))
    const second = assertSuccess(await createNewSave({ label: 'Run 2' }))

    expect(second.index.slots[0].id).toBe(second.slot.id)
    expect(second.index.slots[1].id).toBe(first.slot.id)
  })

  it('migrates v1 save and creates a backup before migration', async () => {
    const clock = new StubClock(Date.parse('2026-04-21T12:00:00.000Z'))
    const harness = createMemoryStorageHarness()
    const repository = new LocalStorageSaveRepository(harness.storage)
    const loadSave = createLoadSaveUseCase(repository, clock)

    const legacySlot = {
      id: 'legacy-slot',
      label: 'Legacy',
      createdAt: '2026-04-20T12:00:00.000Z',
      lastPlayedAt: '2026-04-20T15:00:00.000Z',
      version: 1,
      balanceCatalogVersion: 1,
      data: {
        simulation: {
          tickRate: '1',
          lastSeenAt: '2026-04-20T15:00:00.000Z',
        },
        resources: {
          money: '100',
          packages: '100',
        },
        progression: {
          warehouseLevel: 1,
          skillPoints: 3,
        },
        upgrades: {},
      },
    }

    harness.writeRaw('dispatchinc:save:legacy-slot', JSON.stringify(legacySlot))
    harness.writeRaw(
      'dispatchinc:saves:index',
      JSON.stringify({
        activeSlotId: 'legacy-slot',
        slots: [
          {
            id: 'legacy-slot',
            label: 'Legacy',
            createdAt: '2026-04-20T12:00:00.000Z',
            lastPlayedAt: '2026-04-20T15:00:00.000Z',
            version: 1,
            balanceCatalogVersion: 1,
          },
        ],
      }),
    )

    const loadedResult = await loadSave({ id: 'legacy-slot' })
    const loaded = assertSuccess(loadedResult)

    expect(loaded.didMigrate).toBe(true)
    expect(loaded.backupKey).toBeDefined()
    expect(loaded.slot.version).toBe(2)
    expect(loaded.slot.data.progression.architecturePoints).toBe(3)
    expect(loaded.slot.data.skills).toEqual({})

    const backupPayload = harness.readRaw(loaded.backupKey as string)
    expect(backupPayload).not.toBeNull()
  })

  it('returns migration failure when legacy payload cannot be migrated', async () => {
    const clock = new StubClock(Date.parse('2026-04-21T12:30:00.000Z'))
    const harness = createMemoryStorageHarness()
    const repository = new LocalStorageSaveRepository(harness.storage)
    const loadSave = createLoadSaveUseCase(repository, clock)

    const brokenLegacy = {
      id: 'broken-slot',
      label: 'Broken',
      createdAt: '2026-04-20T12:00:00.000Z',
      lastPlayedAt: '2026-04-20T15:00:00.000Z',
      version: 1,
      balanceCatalogVersion: 1,
    }

    harness.writeRaw('dispatchinc:save:broken-slot', JSON.stringify(brokenLegacy))
    harness.writeRaw(
      'dispatchinc:saves:index',
      JSON.stringify({
        slots: [
          {
            id: 'broken-slot',
            label: 'Broken',
            createdAt: '2026-04-20T12:00:00.000Z',
            lastPlayedAt: '2026-04-20T15:00:00.000Z',
            version: 1,
            balanceCatalogVersion: 1,
          },
        ],
      }),
    )

    const loaded = await loadSave({ id: 'broken-slot' })

    expect(loaded.ok).toBe(false)
    if (!loaded.ok) {
      expect(loaded.error.code).toBe('SAVE_MIGRATION_FAILED')
    }
  })

  it('rejects invalid import payloads and keeps storage intact', async () => {
    const clock = new StubClock(Date.parse('2026-04-21T13:00:00.000Z'))
    const harness = createMemoryStorageHarness()
    const repository = new LocalStorageSaveRepository(harness.storage)
    const importSave = createImportSaveUseCase(repository, clock)

    const invalid = await importSave({ json: '{"foo": 42}' })
    expect(invalid.ok).toBe(false)

    const index = await repository.getIndex()
    expect(index.slots).toHaveLength(0)
  })

  it('supports export/import roundtrip integrity', async () => {
    const clock = new StubClock(Date.parse('2026-04-21T13:30:00.000Z'))
    const harness = createMemoryStorageHarness()
    const repository = new LocalStorageSaveRepository(harness.storage)

    const createNewSave = createCreateNewSaveUseCase(repository, clock)
    const exportSave = createExportSaveUseCase(repository, clock)
    const deleteSave = createDeleteSaveUseCase(repository)
    const importSave = createImportSaveUseCase(repository, clock)

    const created = assertSuccess(await createNewSave({ label: 'Roundtrip' }))
    const exported = assertSuccess(await exportSave({ id: created.slot.id }))

    const deleted = assertSuccess(await deleteSave({ id: created.slot.id }))
    expect(deleted.index.slots).toHaveLength(0)

    clock.setNowMs(Date.parse('2026-04-21T13:35:00.000Z'))
    const imported = assertSuccess(await importSave({ json: exported.json }))

    const parsedExportedSlot = parseSaveSlotStrict(JSON.parse(exported.json))
    expect(imported.slot.data).toEqual(parsedExportedSlot.data)
    expect(imported.slot.id).toBe(parsedExportedSlot.id)
  })

  it('handles id and label collisions on import', async () => {
    const clock = new StubClock(Date.parse('2026-04-21T14:00:00.000Z'))
    const harness = createMemoryStorageHarness()
    const repository = new LocalStorageSaveRepository(harness.storage)

    const createNewSave = createCreateNewSaveUseCase(repository, clock)
    const exportSave = createExportSaveUseCase(repository, clock)
    const importSave = createImportSaveUseCase(repository, clock)

    const created = assertSuccess(await createNewSave({ label: 'Collision' }))
    const exported = assertSuccess(await exportSave({ id: created.slot.id }))

    clock.setNowMs(Date.parse('2026-04-21T14:10:00.000Z'))
    const imported = assertSuccess(await importSave({ json: exported.json }))

    expect(imported.hadIdCollision).toBe(true)
    expect(imported.hadLabelCollision).toBe(true)
    expect(imported.slot.id).not.toBe(created.slot.id)
    expect(imported.slot.label).toContain('import')
  })

  it('autosaves the active slot state', async () => {
    const clock = new StubClock(Date.parse('2026-04-21T15:00:00.000Z'))
    const harness = createMemoryStorageHarness()
    const repository = new LocalStorageSaveRepository(harness.storage)

    const createNewSave = createCreateNewSaveUseCase(repository, clock)
    const autosave = createAutosaveActiveSlotUseCase(repository, clock)

    const created = assertSuccess(await createNewSave({ label: 'Autosave' }))

    clock.setNowMs(Date.parse('2026-04-21T15:05:00.000Z'))
    const autosaved = assertSuccess(
      await autosave({
        state: {
          ...created.slot.data,
          resources: {
            ...created.slot.data.resources,
            money: '12345',
          },
        },
      }),
    )

    expect(autosaved.slot.data.resources.money).toBe('12345')
    expect(autosaved.slot.lastPlayedAt).toBe('2026-04-21T15:05:00.000Z')
  })
})
