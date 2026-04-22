export type ScaleCurveKind =
  | 'linear'
  | 'exponential'
  | 'power'
  | 'piecewise'
  | 'softcap'

export interface PiecewiseStepDto {
  levelFrom: number
  base: string
  growth?: string
  exponent?: string
}

export interface ScaleSpecDto {
  id: string
  curve: ScaleCurveKind
  base: string
  growth?: string
  exponent?: string
  steps?: PiecewiseStepDto[]
  softcapAt?: string
  softcapPower?: string
  rounding: 'floor' | 'ceil' | 'nearest'
  min?: string
  max?: string
}

export interface UpgradeBalanceDto {
  upgradeId: string
  maxLevel?: number
  costScaleId: string
  effectScaleId: string
}

export interface BalanceCatalogDto {
  version: number
  scales: ScaleSpecDto[]
  upgrades: UpgradeBalanceDto[]
  skills: UpgradeBalanceDto[]
  warehouses: UpgradeBalanceDto[]
}
