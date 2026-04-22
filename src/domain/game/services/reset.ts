import type { GameRunState } from '@/domain/game/entities/GameRunState'

export function applyWarehouseReset(state: GameRunState): GameRunState {
  return {
    ...state,
    money: 0,
    packages: 0,
    employees: 0,
    scannerBonus: 0,
    cartMultiplier: 1,
    truckMultiplier: 1,
    skillPoints: state.skillPoints + 1,
    upgrades: {},
  }
}
