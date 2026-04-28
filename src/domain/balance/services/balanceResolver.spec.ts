import { describe, expect, it } from 'vitest'
import { balanceCatalogV1 } from '@/data/balance/catalog.v1'
import { BalanceResolver } from '@/domain/balance/services/balanceResolver'

describe('BalanceResolver', () => {
  it('resolves employee cost/effect and preview', () => {
    const resolver = new BalanceResolver(balanceCatalogV1)

    const costL1 = resolver.resolveUpgradeCost('employees', 1)
    const effectL1 = resolver.resolveUpgradeEffect('employees', 1)
    const preview = resolver.getUpgradePreview('employees', 1)

    expect(costL1).toBeGreaterThan(10)
    expect(Number.isInteger(costL1)).toBe(true)
    expect(effectL1).toBe(2)
    expect(Number.isInteger(preview.currentCost)).toBe(true)
    expect(Number.isInteger(preview.nextCost)).toBe(true)
    expect(preview.nextCost).toBeGreaterThan(preview.currentCost)
    expect(preview.nextEffect).toBeGreaterThan(preview.currentEffect)
  })

  it('throws on unknown upgrade id', () => {
    const resolver = new BalanceResolver(balanceCatalogV1)
    expect(() => resolver.resolveUpgradeCost('unknown', 1)).toThrow()
  })

  it('resolves skill and warehouse values', () => {
    const resolver = new BalanceResolver(balanceCatalogV1)

    expect(resolver.resolveSkillEffect('staff.mastery', 5)).toBe(1.92)
    expect(resolver.resolveSkillEffect('scan.mastery', 5)).toBe(1.92)
    expect(resolver.resolveSkillEffect('conveyor.mastery', 5)).toBe(1.84)
    expect(resolver.resolveSkillEffect('sorting.mastery', 5)).toBe(1.75)
    expect(resolver.resolveSkillEffect('shipping.mastery', 5)).toBe(1.75)
    expect(resolver.resolveSkillEffect('warehouse.mastery', 5)).toBe(1.54)
    expect(resolver.resolveSkillEffect('offline.resilience', 0)).toBe(0.2)
    expect(resolver.resolveSkillEffect('offline.resilience', 5)).toBe(1)
    expect(resolver.resolveSkillEffect('cheat.optimization', 5)).toBe(3.9)
    expect(resolver.resolveScaleById('skills.offline.duration.effect.v1', 0)).toBe(1)
    expect(resolver.resolveScaleById('skills.offline.duration.effect.v1', 5)).toBe(6)
    expect(resolver.resolveWarehouseEffect('warehouse.progression', 1)).toBeGreaterThan(0)
    expect(resolver.resolveWarehouseRequirement('warehouse.progression', 1)).toBe(19_600)
    expect(resolver.resolveWarehouseRequirement('warehouse.progression', 2)).toBe(30_700)
    expect(Number.isInteger(resolver.resolveWarehouseRequirement('warehouse.progression', 1))).toBe(true)
  })
})
