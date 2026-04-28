import type { BalanceCatalogDto } from '@/application/dto/balance'
import type { SupportedLocale, UiTextCatalogDto } from '@/application/dto/content'
import type { ApplyOfflineProgress } from '@/application/useCases/applyOfflineProgress'
import type { GetUpgradePreview } from '@/application/useCases/getUpgradePreview'
import type { ListSaveSlots } from '@/application/useCases/listSaveSlots'
import type { PurchaseUpgrade } from '@/application/useCases/purchaseUpgrade'
import type { RunTick } from '@/application/useCases/runTick'
import type { TriggerWarehouseReset } from '@/application/useCases/triggerWarehouseReset'
import type { UnlockSkill } from '@/application/useCases/unlockSkill'
import type { UnlockUpgrade } from '@/application/useCases/unlockUpgrade'
import type { AutosaveActiveSlot } from '@/application/useCases/autosaveActiveSlot'
import type { CreateNewSave } from '@/application/useCases/createNewSave'
import type { DeleteSave } from '@/application/useCases/deleteSave'
import type { ExportSave } from '@/application/useCases/exportSave'
import { createApplyOfflineProgressUseCase } from '@/application/useCases/applyOfflineProgress'
import { createGetUpgradePreviewUseCase } from '@/application/useCases/getUpgradePreview'
import { createListSaveSlotsUseCase } from '@/application/useCases/listSaveSlots'
import { createPurchaseUpgradeUseCase } from '@/application/useCases/purchaseUpgrade'
import { createRunTickUseCase } from '@/application/useCases/runTick'
import { createTriggerWarehouseResetUseCase } from '@/application/useCases/triggerWarehouseReset'
import { createUnlockSkillUseCase } from '@/application/useCases/unlockSkill'
import { createUnlockUpgradeUseCase } from '@/application/useCases/unlockUpgrade'
import type { ImportSave } from '@/application/useCases/importSave'
import type { LoadSave } from '@/application/useCases/loadSave'
import { createAutosaveActiveSlotUseCase } from '@/application/useCases/autosaveActiveSlot'
import { createCreateNewSaveUseCase } from '@/application/useCases/createNewSave'
import { createDeleteSaveUseCase } from '@/application/useCases/deleteSave'
import { createExportSaveUseCase } from '@/application/useCases/exportSave'
import { createImportSaveUseCase } from '@/application/useCases/importSave'
import { createLoadSaveUseCase } from '@/application/useCases/loadSave'
import type { BalanceCatalogRepository } from '@/application/ports/BalanceCatalogRepository'
import type { Clock } from '@/application/ports/Clock'
import type { SaveRepository } from '@/application/ports/SaveRepository'
import type { TextCatalogRepository } from '@/application/ports/TextCatalogRepository'
import { LocalBalanceCatalogRepository } from '@/infrastructure/balance/catalog/localCatalog'
import { LocalTextCatalogRepository } from '@/infrastructure/content/catalog/localTextCatalog'
import { LocalStorageSaveRepository } from '@/infrastructure/persistence/localStorage/saveRepository'
import { BrowserClock } from '@/infrastructure/time/browserClock'

export interface AppPorts {
  saveRepository: SaveRepository
  balanceCatalogRepository: BalanceCatalogRepository
  textCatalogRepository: TextCatalogRepository
  clock: Clock
}

export interface AppUseCaseFactories {
  createGetBalanceCatalog: () => () => Promise<BalanceCatalogDto>
  createGetUpgradePreview: () => GetUpgradePreview
  createCreateNewSave: () => CreateNewSave
  createLoadSave: () => LoadSave
  createListSaveSlots: () => ListSaveSlots
  createDeleteSave: () => DeleteSave
  createExportSave: () => ExportSave
  createImportSave: () => ImportSave
  createAutosaveActiveSlot: () => AutosaveActiveSlot
  createRunTick: () => RunTick
  createApplyOfflineProgress: () => ApplyOfflineProgress
  createPurchaseUpgrade: () => PurchaseUpgrade
  createUnlockUpgrade: () => UnlockUpgrade
  createUnlockSkill: () => UnlockSkill
  createTriggerWarehouseReset: () => TriggerWarehouseReset
  createGetUiTextBundle: () => (
    locale: SupportedLocale,
  ) => Promise<UiTextCatalogDto>
}

export interface AppContainer {
  ports: AppPorts
  useCases: AppUseCaseFactories
}

export function createUseCaseFactories(ports: AppPorts): AppUseCaseFactories {
  return {
    createGetBalanceCatalog: () => async () =>
      ports.balanceCatalogRepository.getCatalog(),
    createGetUpgradePreview: () =>
      createGetUpgradePreviewUseCase(ports.balanceCatalogRepository),
    createCreateNewSave: () =>
      createCreateNewSaveUseCase(ports.saveRepository, ports.clock),
    createLoadSave: () => createLoadSaveUseCase(ports.saveRepository, ports.clock),
    createListSaveSlots: () => createListSaveSlotsUseCase(ports.saveRepository),
    createDeleteSave: () => createDeleteSaveUseCase(ports.saveRepository),
    createExportSave: () =>
      createExportSaveUseCase(ports.saveRepository, ports.clock),
    createImportSave: () =>
      createImportSaveUseCase(ports.saveRepository, ports.clock),
    createAutosaveActiveSlot: () =>
      createAutosaveActiveSlotUseCase(ports.saveRepository, ports.clock),
    createRunTick: () =>
      createRunTickUseCase(ports.balanceCatalogRepository, ports.clock),
    createApplyOfflineProgress: () =>
      createApplyOfflineProgressUseCase(ports.balanceCatalogRepository, ports.clock),
    createPurchaseUpgrade: () =>
      createPurchaseUpgradeUseCase(ports.balanceCatalogRepository),
    createUnlockUpgrade: () =>
      createUnlockUpgradeUseCase(ports.balanceCatalogRepository),
    createUnlockSkill: () =>
      createUnlockSkillUseCase(ports.balanceCatalogRepository),
    createTriggerWarehouseReset: () =>
      createTriggerWarehouseResetUseCase(ports.balanceCatalogRepository, ports.clock),
    createGetUiTextBundle: () => async (locale: SupportedLocale) =>
      ports.textCatalogRepository.getCatalog(locale),
  }
}

export function createAppContainer(): AppContainer {
  const ports: AppPorts = {
    saveRepository: new LocalStorageSaveRepository(),
    balanceCatalogRepository: new LocalBalanceCatalogRepository(),
    textCatalogRepository: new LocalTextCatalogRepository(),
    clock: new BrowserClock(),
  }

  return {
    ports,
    useCases: createUseCaseFactories(ports),
  }
}

export const appContainer = createAppContainer()
export const APP_CONTAINER_KEY = Symbol('APP_CONTAINER_KEY')
