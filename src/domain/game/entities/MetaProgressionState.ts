export interface BranchProgressionState {
  level: number
}

export interface MetaProgressionState {
  availableSkillPoints: number
  spentSkillPoints: number
  branches: Record<string, BranchProgressionState>
  hiddenBranchUnlocked: boolean
}
