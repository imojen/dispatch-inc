import type {
  BalanceCatalogDto,
  ScaleSpecDto,
  UpgradeBalanceDto,
} from '@/application/dto/balance'
import { evaluateScale } from '@/domain/balance/services/scaleEngine'

export interface UpgradePreview {
  currentLevel: number
  nextLevel: number
  currentCost: number
  nextCost: number
  currentEffect: number
  nextEffect: number
}

export class BalanceResolver {
  private readonly scaleMap: Map<string, ScaleSpecDto>
  private readonly upgradeMap: Map<string, UpgradeBalanceDto>
  private readonly skillMap: Map<string, UpgradeBalanceDto>
  private readonly warehouseMap: Map<string, UpgradeBalanceDto>

  constructor(private readonly catalog: BalanceCatalogDto) {
    this.scaleMap = new Map(catalog.scales.map((scale) => [scale.id, scale]))
    this.upgradeMap = new Map(catalog.upgrades.map((upgrade) => [upgrade.upgradeId, upgrade]))
    this.skillMap = new Map(catalog.skills.map((skill) => [skill.upgradeId, skill]))
    this.warehouseMap = new Map(catalog.warehouses.map((warehouse) => [warehouse.upgradeId, warehouse]))
  }

  resolveUpgradeCost(upgradeId: string, level: number): number {
    const entry = this.requireUpgrade(upgradeId)
    const scale = this.requireScale(entry.costScaleId)
    return Math.max(0, Math.floor(evaluateScale(scale, level)))
  }

  resolveUpgradeEffect(upgradeId: string, level: number): number {
    const entry = this.requireUpgrade(upgradeId)
    const scale = this.requireScale(entry.effectScaleId)
    return evaluateScale(scale, level)
  }

  resolveSkillCost(skillId: string, level: number): number {
    const entry = this.requireSkill(skillId)
    const scale = this.requireScale(entry.costScaleId)
    return evaluateScale(scale, level)
  }

  resolveSkillEffect(skillId: string, level: number): number {
    const entry = this.requireSkill(skillId)
    const scale = this.requireScale(entry.effectScaleId)
    return evaluateScale(scale, level)
  }

  resolveWarehouseCost(warehouseId: string, level: number): number {
    const entry = this.requireWarehouse(warehouseId)
    const scale = this.requireScale(entry.costScaleId)
    return evaluateScale(scale, level)
  }

  resolveWarehouseEffect(warehouseId: string, level: number): number {
    const entry = this.requireWarehouse(warehouseId)
    const scale = this.requireScale(entry.effectScaleId)
    return evaluateScale(scale, level)
  }

  resolveScaleById(scaleId: string, level: number): number {
    const scale = this.requireScale(scaleId)
    return evaluateScale(scale, level)
  }

  getUpgradePreview(upgradeId: string, currentLevel: number): UpgradePreview {
    return {
      currentLevel,
      nextLevel: currentLevel + 1,
      currentCost: this.resolveUpgradeCost(upgradeId, currentLevel),
      nextCost: this.resolveUpgradeCost(upgradeId, currentLevel + 1),
      currentEffect: this.resolveUpgradeEffect(upgradeId, currentLevel),
      nextEffect: this.resolveUpgradeEffect(upgradeId, currentLevel + 1),
    }
  }

  private requireUpgrade(upgradeId: string): UpgradeBalanceDto {
    const entry = this.upgradeMap.get(upgradeId)
    if (!entry) {
      throw new Error(`Unknown upgradeId: ${upgradeId}`)
    }
    return entry
  }

  private requireSkill(skillId: string): UpgradeBalanceDto {
    const entry = this.skillMap.get(skillId)
    if (!entry) {
      throw new Error(`Unknown skillId: ${skillId}`)
    }
    return entry
  }

  private requireWarehouse(warehouseId: string): UpgradeBalanceDto {
    const entry = this.warehouseMap.get(warehouseId)
    if (!entry) {
      throw new Error(`Unknown warehouseId: ${warehouseId}`)
    }
    return entry
  }

  private requireScale(scaleId: string): ScaleSpecDto {
    const scale = this.scaleMap.get(scaleId)
    if (!scale) {
      throw new Error(`Unknown scaleId: ${scaleId}`)
    }
    return scale
  }
}
