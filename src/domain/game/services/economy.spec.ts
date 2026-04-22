import { describe, expect, it } from 'vitest'
import {
  computeMoneyPerSecond,
  computePackagesPerSecond,
} from '@/domain/game/services/economy'

describe('economy service', () => {
  it('computes production formula correctly', () => {
    const pps = computePackagesPerSecond({
      employees: 10,
      scannerBonus: 0,
      cartMultiplier: 1,
      truckMultiplier: 1,
      tickRate: 1,
    })

    expect(pps.toNumber()).toBe(10)
  })

  it('stacks multipliers deterministically', () => {
    const moneyPerSecond = computeMoneyPerSecond({
      employees: 10,
      scannerBonus: 0.2,
      cartMultiplier: 1.5,
      truckMultiplier: 2,
      tickRate: 1,
    })

    expect(moneyPerSecond).toBe(36)
  })

  it('applies tickrate as throughput multiplier', () => {
    const baseMoneyPerSecond = computeMoneyPerSecond({
      employees: 10,
      scannerBonus: 0.2,
      cartMultiplier: 1.5,
      truckMultiplier: 2,
      tickRate: 1,
    })

    const boostedMoneyPerSecond = computeMoneyPerSecond({
      employees: 10,
      scannerBonus: 0.2,
      cartMultiplier: 1.5,
      truckMultiplier: 2,
      tickRate: 2,
    })

    expect(boostedMoneyPerSecond).toBe(baseMoneyPerSecond * 2)
  })
})
