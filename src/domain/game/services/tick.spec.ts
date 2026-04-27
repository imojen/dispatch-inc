import { describe, expect, it } from 'vitest'
import { applyTick } from '@/domain/game/services/tick'
import type { GameRunState } from '@/domain/game/entities/GameRunState'

const baseState: GameRunState = {
  money: 0,
  packages: 0,
  ownedEmployees: 10,
  employees: 10,
  scannerBonus: 0,
  cartMultiplier: 1,
  truckMultiplier: 1,
  tickRate: 2,
  warehouseLevel: 1,
  skillPoints: 0,
  upgrades: {},
}

describe('tick service', () => {
  it('uses variable tick rate when delta is omitted', () => {
    const next = applyTick({ state: baseState })

    expect(next.money).toBe(10)
    expect(next.packages).toBe(10)
  })

  it('supports explicit delta override', () => {
    const next = applyTick({ state: baseState, deltaSeconds: 2 })

    expect(next.money).toBe(40)
    expect(next.packages).toBe(40)
  })
})
