import { describe, expect, it } from 'vitest'
import {
  applyWarehouseReset,
  WAREHOUSE_RESET_STARTING_MONEY,
} from '@/domain/game/services/reset'
import type { GameRunState } from '@/domain/game/entities/GameRunState'

describe('reset service', () => {
  it('resets run state and grants one skill point', () => {
    const state: GameRunState = {
      money: 100,
      packages: 100,
      ownedEmployees: 5,
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

    expect(next.money).toBe(WAREHOUSE_RESET_STARTING_MONEY)
    expect(next.packages).toBe(0)
    expect(next.ownedEmployees).toBe(0)
    expect(next.employees).toBe(0)
    expect(next.skillPoints).toBe(4)
    expect(next.upgrades).toEqual({})
  })
})
