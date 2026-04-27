import { defineStore } from 'pinia'
import type { SaveSlotMetadataDto } from '@/application/dto/save'
import { mapSaveErrorToUiTextKey } from '@/application/useCases/save/contracts'
import { appContainer } from '@/app/di'
import { appRouter, ROUTE_GAME } from '@/presentation/router'
import { useGameStore } from '@/presentation/stores/gameStore'
import { useUiStore } from '@/presentation/stores/uiStore'

type SlotIssueKind = 'corrupted' | 'migrationFailure'

interface SaveMenuState {
  slots: SaveSlotMetadataDto[]
  activeSlotId?: string
  highlightedSlotId?: string
  isLoadViewOpen: boolean
  isWorking: boolean
  importInProgress: boolean
  pendingDeleteSlotId?: string
  lastErrorKey?: string
  lastSuccessKey?: string
  slotIssues: Record<string, SlotIssueKind>
}

function downloadJson(filename: string, json: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}

export const useSaveMenuStore = defineStore('saveMenu', {
  state: (): SaveMenuState => ({
    slots: [],
    activeSlotId: undefined,
    highlightedSlotId: undefined,
    isLoadViewOpen: false,
    isWorking: false,
    importInProgress: false,
    pendingDeleteSlotId: undefined,
    lastErrorKey: undefined,
    lastSuccessKey: undefined,
    slotIssues: {},
  }),

  actions: {
    clearMessages(): void {
      this.lastErrorKey = undefined
      this.lastSuccessKey = undefined
    },

    notifyError(messageKey: string): void {
      this.lastErrorKey = messageKey
      this.lastSuccessKey = undefined
      const ui = useUiStore()
      ui.notifyError(messageKey)
    },

    notifySuccess(messageKey: string): void {
      this.lastSuccessKey = messageKey
      this.lastErrorKey = undefined
      const ui = useUiStore()
      ui.notifySuccess(messageKey)
    },

    openLoadView(): void {
      this.isLoadViewOpen = true
    },

    closeLoadView(): void {
      this.isLoadViewOpen = false
    },

    askDelete(slotId: string): void {
      this.pendingDeleteSlotId = slotId
    },

    cancelDelete(): void {
      this.pendingDeleteSlotId = undefined
    },

    async refreshSlots(): Promise<void> {
      const listSaveSlots = appContainer.useCases.createListSaveSlots()
      const result = await listSaveSlots()

      if (!result.ok) {
        this.notifyError(mapSaveErrorToUiTextKey(result.error.code))
        return
      }

      this.activeSlotId = result.value.index.activeSlotId
      this.slots = result.value.slots

      const allowedIds = new Set(this.slots.map((slot) => slot.id))
      this.slotIssues = Object.fromEntries(
        Object.entries(this.slotIssues).filter(([id]) => allowedIds.has(id)),
      )
    },

    async createNewRun(label?: string): Promise<boolean> {
      if (this.isWorking) {
        return false
      }

      this.isWorking = true
      this.clearMessages()

      const createNewSave = appContainer.useCases.createCreateNewSave()
      const result = await createNewSave({ label })

      this.isWorking = false

      if (!result.ok) {
        this.notifyError(mapSaveErrorToUiTextKey(result.error.code))
        return false
      }

      const gameStore = useGameStore()
      gameStore.setCurrentState(result.value.slot.data)
      gameStore.setOfflineReport(null, false)

      this.notifySuccess('save.success.created')
      this.activeSlotId = result.value.slot.id
      this.slots = result.value.index.slots
      this.isLoadViewOpen = false

      await appRouter.push({ name: ROUTE_GAME })
      return true
    },

    async playSlot(slotId: string): Promise<void> {
      if (this.isWorking) {
        return
      }

      this.isWorking = true
      this.clearMessages()

      const loadSave = appContainer.useCases.createLoadSave()
      const loaded = await loadSave({ id: slotId })

      if (!loaded.ok) {
        this.isWorking = false
        this.notifyError(mapSaveErrorToUiTextKey(loaded.error.code))

        if (loaded.error.code === 'SAVE_SCHEMA_INVALID') {
          this.slotIssues[slotId] = 'corrupted'
        }

        if (
          loaded.error.code === 'SAVE_MIGRATION_FAILED' ||
          loaded.error.code === 'SAVE_VERSION_UNSUPPORTED'
        ) {
          this.slotIssues[slotId] = 'migrationFailure'
        }

        return
      }

      const gameStore = useGameStore()
      gameStore.setLoadedStateForGameEntry(loaded.value.slot.data)

      await this.refreshSlots()
      this.isWorking = false
      await appRouter.push({ name: ROUTE_GAME })
    },

    async continueLatest(): Promise<void> {
      await this.refreshSlots()

      const activeOrLatest =
        this.slots.find((slot) => slot.id === this.activeSlotId) ?? this.slots[0]
      if (!activeOrLatest) {
        this.notifyError('save.error.notFound')
        return
      }

      await this.playSlot(activeOrLatest.id)
    },

    async exportSlot(slotId: string): Promise<void> {
      this.clearMessages()
      const exportSave = appContainer.useCases.createExportSave()
      const result = await exportSave({ id: slotId })

      if (!result.ok) {
        this.notifyError(mapSaveErrorToUiTextKey(result.error.code))
        return
      }

      downloadJson(result.value.filename, result.value.json)
      this.notifySuccess('save.success.exported')
    },

    async importFromJson(json: string): Promise<void> {
      if (this.importInProgress) {
        return
      }

      this.importInProgress = true
      this.clearMessages()

      const importSave = appContainer.useCases.createImportSave()
      const result = await importSave({ json })
      this.importInProgress = false

      if (!result.ok) {
        this.notifyError(mapSaveErrorToUiTextKey(result.error.code))
        return
      }

      this.highlightedSlotId = result.value.slot.id
      this.notifySuccess('save.success.imported')
      await this.refreshSlots()
      this.openLoadView()
    },

    async importFromFile(file: { text: () => Promise<string> }): Promise<void> {
      const json = await file.text()
      await this.importFromJson(json)
    },

    async confirmDelete(): Promise<void> {
      const targetId = this.pendingDeleteSlotId
      if (!targetId) {
        return
      }

      this.clearMessages()

      const deleteSave = appContainer.useCases.createDeleteSave()
      const result = await deleteSave({ id: targetId })

      if (!result.ok) {
        this.notifyError(mapSaveErrorToUiTextKey(result.error.code))
        return
      }

      this.pendingDeleteSlotId = undefined
      this.notifySuccess('save.success.deleted')
      await this.refreshSlots()
    },
  },
})
