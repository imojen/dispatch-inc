import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { appContainer } from '@/app/di'
import { ROUTE_HOME } from '@/presentation/router'
import { appRouter } from '@/presentation/router'
import { useGameStore } from '@/presentation/stores/gameStore'
import { useSaveMenuStore } from '@/presentation/stores/saveMenuStore'
import { useUiStore } from '@/presentation/stores/uiStore'

function assertOk<T>(
  result: { ok: boolean; value?: T; error?: unknown },
): T {
  expect(result.ok).toBe(true)
  return (result as { ok: true; value: T }).value
}

beforeEach(async () => {
  localStorage.clear()
  setActivePinia(createPinia())
  await appRouter.push({ name: ROUTE_HOME })

  const ui = useUiStore()
  await ui.initialize('fr-FR')
})

describe('chapter 7 smoke - save menu flows', () => {
  it('smoke Nouvelle partie', async () => {
    const saveMenu = useSaveMenuStore()
    const game = useGameStore()

    await saveMenu.refreshSlots()
    await saveMenu.createNewRun('Smoke run')

    expect(saveMenu.slots).toHaveLength(1)
    expect(game.current).not.toBeNull()
    expect(appRouter.currentRoute.value.name).toBe('game')
  })

  it('smoke Charger', async () => {
    const saveMenu = useSaveMenuStore()
    const game = useGameStore()

    await saveMenu.createNewRun('Load run')
    const slotId = saveMenu.slots[0]?.id
    expect(slotId).toBeTruthy()

    game.resetSession()
    await appRouter.push({ name: ROUTE_HOME })
    await saveMenu.playSlot(slotId as string)

    expect(game.current).not.toBeNull()
    expect(appRouter.currentRoute.value.name).toBe('game')
  })

  it('smoke Importer', async () => {
    const saveMenu = useSaveMenuStore()

    await saveMenu.createNewRun('Import source')
    const sourceSlotId = saveMenu.slots[0]?.id as string

    const exportSave = appContainer.useCases.createExportSave()
    const exported = assertOk(await exportSave({ id: sourceSlotId }))

    await appRouter.push({ name: ROUTE_HOME })
    saveMenu.askDelete(sourceSlotId)
    await saveMenu.confirmDelete()
    expect(saveMenu.slots).toHaveLength(0)

    await saveMenu.importFromJson(exported.json)

    expect(saveMenu.slots).toHaveLength(1)
    expect(saveMenu.highlightedSlotId).toBeTruthy()
  })

  it('smoke Supprimer', async () => {
    const saveMenu = useSaveMenuStore()

    await saveMenu.createNewRun('Delete target')
    const slotId = saveMenu.slots[0]?.id as string

    await appRouter.push({ name: ROUTE_HOME })
    saveMenu.askDelete(slotId)
    await saveMenu.confirmDelete()

    expect(saveMenu.slots).toHaveLength(0)
  })

  it('smoke Charger ne calcule pas offline dans le store home', async () => {
    const saveMenu = useSaveMenuStore()
    const game = useGameStore()

    await saveMenu.createNewRun('Offline run')
    const slotId = saveMenu.slots[0]?.id as string
    const initialState = game.current
    expect(initialState).not.toBeNull()

    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    const autosaveActiveSlot = appContainer.useCases.createAutosaveActiveSlot()

    const updatedState = {
      ...(initialState as NonNullable<typeof initialState>),
      simulation: {
        ...(initialState as NonNullable<typeof initialState>).simulation,
        lastSeenAt: threeHoursAgo,
      },
      upgrades: {
        ...(initialState as NonNullable<typeof initialState>).upgrades,
        employees: { level: 1 },
      },
    }

    assertOk(await autosaveActiveSlot({ state: updatedState }))

    game.resetSession()
    await appRouter.push({ name: ROUTE_HOME })
    await saveMenu.playSlot(slotId)

    expect(game.shouldShowOfflinePopup).toBe(false)
    expect(game.offlineReport).toBeNull()
  })

  it('continue reprend prioritairement la save active', async () => {
    const saveMenu = useSaveMenuStore()
    const game = useGameStore()

    await saveMenu.createNewRun('Older active run')
    const activeSlotId = saveMenu.slots[0]?.id as string
    const activeState = game.current as NonNullable<typeof game.current>

    const autosaveActiveSlot = appContainer.useCases.createAutosaveActiveSlot()
    const oldOfflineState = {
      ...activeState,
      simulation: {
        ...activeState.simulation,
        lastSeenAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      upgrades: {
        ...activeState.upgrades,
        employees: { level: 1 },
      },
    }
    assertOk(await autosaveActiveSlot({ state: oldOfflineState }))

    await saveMenu.createNewRun('Newer non-active metadata run')
    const newerSlotId =
      saveMenu.slots.find((slot) => slot.id !== activeSlotId)?.id as string
    expect(newerSlotId).toBeTruthy()

    const loadSave = appContainer.useCases.createLoadSave()
    assertOk(await loadSave({ id: activeSlotId }))
    await saveMenu.refreshSlots()

    game.resetSession()
    await appRouter.push({ name: ROUTE_HOME })
    await saveMenu.continueLatest()

    expect(game.current).not.toBeNull()
    expect(game.shouldShowOfflinePopup).toBe(false)
  })
})

describe('chapter 7 smoke - text fallback', () => {
  it('returns missing key fallback in dev mode', async () => {
    const ui = useUiStore()
    await ui.initialize('fr-FR')

    expect(ui.t('missing.key.for.test')).toBe('[missing:missing.key.for.test]')
  })
})
