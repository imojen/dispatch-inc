import type { BalanceCatalogDto } from '@/application/dto/balance'

export function validateBalanceCatalog(catalog: BalanceCatalogDto): void {
  const scaleIds = new Set<string>()

  for (const scale of catalog.scales) {
    if (!scale.id.trim()) {
      throw new Error('Scale id cannot be empty')
    }

    if (scaleIds.has(scale.id)) {
      throw new Error(`Duplicate scale id: ${scale.id}`)
    }

    scaleIds.add(scale.id)
  }

  const validateUpgradeEntry = (id: string, costScaleId: string, effectScaleId: string): void => {
    if (!id.trim()) {
      throw new Error('Upgrade id cannot be empty')
    }

    if (!scaleIds.has(costScaleId)) {
      throw new Error(`Unknown cost scale id ${costScaleId} for ${id}`)
    }

    if (!scaleIds.has(effectScaleId)) {
      throw new Error(`Unknown effect scale id ${effectScaleId} for ${id}`)
    }
  }

  for (const entry of catalog.upgrades) {
    validateUpgradeEntry(entry.upgradeId, entry.costScaleId, entry.effectScaleId)
  }

  for (const entry of catalog.skills) {
    validateUpgradeEntry(entry.upgradeId, entry.costScaleId, entry.effectScaleId)
  }

  for (const entry of catalog.warehouses) {
    validateUpgradeEntry(entry.upgradeId, entry.costScaleId, entry.effectScaleId)
  }
}
