export interface UpgradeState {
  level: number
}

export interface GameRunState {
  money: number
  packages: number
  employees: number
  scannerBonus: number
  cartMultiplier: number
  truckMultiplier: number
  tickRate: number
  warehouseLevel: number
  skillPoints: number
  upgrades: Record<string, UpgradeState>
}

export interface OfflinePolicy {
  triggerAfterMs: number
  efficiencyMultiplier: number
  maxRewardedDurationMs: number
}

export interface OfflineReward {
  countedOfflineDurationMs: number
  packagesDispatched: number
  moneyGained: number
}
