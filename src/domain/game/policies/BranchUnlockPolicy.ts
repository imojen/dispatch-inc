export function canUnlockNextBranchLevel(
  currentLevel: number,
  availableSkillPoints: number,
  maxLevel = 5,
): boolean {
  if (currentLevel < 0 || !Number.isInteger(currentLevel)) {
    return false
  }

  const nextLevel = currentLevel + 1
  return nextLevel <= maxLevel && availableSkillPoints >= 1
}
