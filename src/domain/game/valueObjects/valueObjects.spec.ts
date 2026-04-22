import { describe, expect, it } from 'vitest'
import { ScaleId } from '@/domain/balance/valueObjects/ScaleId'
import { Money } from '@/domain/game/valueObjects/Money'
import { PackagesPerSecond } from '@/domain/game/valueObjects/PackagesPerSecond'
import { SkillLevel } from '@/domain/game/valueObjects/SkillLevel'
import { TickRate } from '@/domain/game/valueObjects/TickRate'
import { UpgradeLevel } from '@/domain/game/valueObjects/UpgradeLevel'
import { WarehouseLevel } from '@/domain/game/valueObjects/WarehouseLevel'
import { SaveVersion } from '@/domain/save/valueObjects/SaveVersion'

describe('value objects', () => {
  it('validates non-negative money', () => {
    expect(() => new Money(-1)).toThrow()
    expect(new Money(10).toNumber()).toBe(10)
  })

  it('supports money arithmetic', () => {
    const result = new Money(10).add(new Money(5)).subtract(new Money(3))
    expect(result.toNumber()).toBe(12)
  })

  it('validates packages per second', () => {
    expect(() => new PackagesPerSecond(-0.1)).toThrow()
    expect(new PackagesPerSecond(42).toNumber()).toBe(42)
  })

  it('validates tick rate', () => {
    expect(() => new TickRate(0)).toThrow()
    expect(new TickRate(2).intervalSeconds()).toBe(0.5)
  })

  it('validates upgrade and skill levels', () => {
    expect(() => new UpgradeLevel(-1)).toThrow()
    expect(() => new SkillLevel(-1)).toThrow()
    expect(new UpgradeLevel(2).toNumber()).toBe(2)
    expect(new SkillLevel(3).toNumber()).toBe(3)
  })

  it('validates warehouse level', () => {
    expect(() => new WarehouseLevel(0)).toThrow()
    expect(new WarehouseLevel(1).toNumber()).toBe(1)
  })

  it('validates scale id and save version', () => {
    expect(() => new ScaleId('')).toThrow()
    expect(() => new SaveVersion(0)).toThrow()
    expect(new ScaleId('employees.cost.v1').toString()).toBe('employees.cost.v1')
    expect(new SaveVersion(1).toNumber()).toBe(1)
  })
})
