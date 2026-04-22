import { describe, expect, it } from 'vitest'
import { canUnlockNextBranchLevel } from '@/domain/game/policies/BranchUnlockPolicy'
import { isHiddenBranchUnlocked } from '@/domain/game/policies/HiddenBranchPolicy'
import {
  canHireEmployee,
  canUnlockNextWarehouse,
} from '@/domain/game/policies/WarehouseUnlockPolicy'

describe('policies', () => {
  it('enforces branch prerequisite and max level', () => {
    expect(canUnlockNextBranchLevel(0, 1)).toBe(true)
    expect(canUnlockNextBranchLevel(5, 1)).toBe(false)
    expect(canUnlockNextBranchLevel(2, 0)).toBe(false)
  })

  it('supports hidden branch unlock conditions', () => {
    expect(
      isHiddenBranchUnlocked({
        mainBranchLevels: [5, 5, 5, 5, 5, 5],
      }),
    ).toBe(false)
    expect(
      isHiddenBranchUnlocked({
        mainBranchLevels: [5, 5, 5, 5, 5, 5, 4],
      }),
    ).toBe(false)
    expect(
      isHiddenBranchUnlocked({
        mainBranchLevels: [5, 5, 5, 5, 5, 5, 5],
      }),
    ).toBe(true)
  })

  it('validates warehouse unlock and employee capacity checks', () => {
    expect(canUnlockNextWarehouse(1000, 1000)).toBe(true)
    expect(canUnlockNextWarehouse(999, 1000)).toBe(false)

    expect(canHireEmployee(4, 5)).toBe(true)
    expect(canHireEmployee(5, 5)).toBe(false)
    expect(canHireEmployee(5, 5, 0.5)).toBe(true)
  })
})
