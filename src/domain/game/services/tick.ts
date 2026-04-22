import type { GameRunState } from '@/domain/game/entities/GameRunState'
import { computeMoneyPerSecond, type EconomyComputationInput } from '@/domain/game/services/economy'

export interface TickInput {
  state: GameRunState
  deltaSeconds?: number
}

function toEconomyInput(state: GameRunState): EconomyComputationInput {
  return {
    employees: state.employees,
    scannerBonus: state.scannerBonus,
    cartMultiplier: state.cartMultiplier,
    truckMultiplier: state.truckMultiplier,
    tickRate: state.tickRate,
  }
}

export function applyTick(input: TickInput): GameRunState {
  const deltaSeconds = input.deltaSeconds ?? 1 / input.state.tickRate
  const moneyPerSecond = computeMoneyPerSecond(toEconomyInput(input.state))
  const packagesPerSecond = moneyPerSecond / input.state.truckMultiplier

  return {
    ...input.state,
    money: input.state.money + moneyPerSecond * deltaSeconds,
    packages: input.state.packages + packagesPerSecond * deltaSeconds,
  }
}
