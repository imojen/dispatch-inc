import { describe, expect, it } from 'vitest'
import { applyWarehouseReset } from '@/domain/game/services/reset'
import type { GameRunState } from '@/domain/game/entities/GameRunState'

describe('reset service', () => {
  it('resets run state and grants one skill point', () => {
    const state: GameRunState = {
      money: 100,
      packages: 100,
      employees: 5,
      scannerBonus: 1,
      cartMultiplier: 2,
      truckMultiplier: 2,
      tickRate: 1,
      warehouseLevel: 2,
      skillPoints: 3,
      upgrades: { employees: { level: 4 } },
    }

    const next = applyWarehouseReset(state)

    expect(next.money).toBe(0)
    expect(next.packages).toBe(0)
    expect(next.employees).toBe(0)
    expect(next.skillPoints).toBe(4)
    expect(next.upgrades).toEqual({})
  })
})
