export type BigNumberString = string

export interface SimulationDto {
  tickRate: BigNumberString
  lastSeenAt: string
}

export interface ResourcesDto {
  money: BigNumberString
  packages: BigNumberString
}

export interface ProgressionDto {
  warehouseLevel: number
  architecturePoints: number
  skillPoints: number
}

export interface LevelStateDto {
  level: number
}

export interface UnlockStateDto {
  unlocked: boolean
}

export interface GameStateDto {
  simulation: SimulationDto
  resources: ResourcesDto
  progression: ProgressionDto
  upgrades: Record<string, LevelStateDto>
  runUnlocks: Record<string, UnlockStateDto>
  skills: Record<string, LevelStateDto>
}

export interface OfflineReportDto {
  countedOfflineDurationMs: number
  offlinePackagesDispatched: BigNumberString
  offlineMoneyGained: BigNumberString
}
