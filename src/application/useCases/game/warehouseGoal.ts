import type { GameRunState } from '@/domain/game/entities/GameRunState'

export interface WarehouseGoalClampResult {
  state: GameRunState
  reachedGoal: boolean
  appliedRatio: number
}

export function hasReachedWarehouseGoal(
  currentPackages: number,
  requiredPackages: number,
): boolean {
  return requiredPackages > 0 && currentPackages >= requiredPackages
}

export function clampRunStateToWarehouseGoal(input: {
  previousState: GameRunState
  nextState: GameRunState
  requiredPackages: number
}): WarehouseGoalClampResult {
  const { previousState, nextState, requiredPackages } = input

  if (requiredPackages <= 0) {
    return {
      state: nextState,
      reachedGoal: false,
      appliedRatio: 1,
    }
  }

  if (previousState.packages >= requiredPackages) {
    return {
      state: {
        ...previousState,
        packages: requiredPackages,
      },
      reachedGoal: true,
      appliedRatio: 0,
    }
  }

  if (nextState.packages <= requiredPackages) {
    return {
      state: nextState,
      reachedGoal: false,
      appliedRatio: 1,
    }
  }

  const packageDelta = nextState.packages - previousState.packages
  if (packageDelta <= 0) {
    return {
      state: nextState,
      reachedGoal: false,
      appliedRatio: 1,
    }
  }

  const ratio = Math.max(
    0,
    Math.min(1, (requiredPackages - previousState.packages) / packageDelta),
  )
  const moneyDelta = nextState.money - previousState.money

  return {
    state: {
      ...nextState,
      money: previousState.money + moneyDelta * ratio,
      packages: requiredPackages,
    },
    reachedGoal: true,
    appliedRatio: ratio,
  }
}
