import type { GameRunState } from '@/domain/game/entities/GameRunState'

export const WAREHOUSE_RESET_STARTING_MONEY = 10

export function applyWarehouseReset(state: GameRunState): GameRunState {
  return {
    ...state,
    money: WAREHOUSE_RESET_STARTING_MONEY,
    packages: 0,
    ownedEmployees: 0,
    employees: 0,
    scannerBonus: 0,
    cartMultiplier: 1,
    truckMultiplier: 1,
    skillPoints: state.skillPoints + 1,
    upgrades: {},
  }
}
