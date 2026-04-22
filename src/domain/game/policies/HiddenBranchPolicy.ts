export interface HiddenBranchUnlockInput {
  mainBranchLevels: number[]
  mainBranchCount?: number
  maxLevelPerBranch?: number
}

export function isHiddenBranchUnlocked(input: HiddenBranchUnlockInput): boolean {
  const mainBranchCount = input.mainBranchCount ?? 7
  const maxLevelPerBranch = input.maxLevelPerBranch ?? 5

  if (input.mainBranchLevels.length !== mainBranchCount) {
    return false
  }

  return input.mainBranchLevels.every((level) => level >= maxLevelPerBranch)
}
