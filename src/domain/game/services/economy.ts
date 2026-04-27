import { PackagesPerSecond } from '@/domain/game/valueObjects/PackagesPerSecond'

export interface EconomyComputationInput {
  employees: number
  scannerBonus: number
  cartMultiplier: number
  truckMultiplier: number
  tickRate: number
  cadenceThroughputMultiplier?: number
}

export function computePackagesPerSecond(
  input: EconomyComputationInput,
): PackagesPerSecond {
  const safeTickRate = Math.max(0, input.tickRate)
  const safeCadenceThroughputMultiplier = Math.max(
    1,
    input.cadenceThroughputMultiplier ?? 1,
  )
  const production =
    input.employees *
    (1 + input.scannerBonus) *
    input.cartMultiplier *
    safeTickRate *
    safeCadenceThroughputMultiplier
  return new PackagesPerSecond(production)
}

export function computeMoneyPerSecond(input: EconomyComputationInput): number {
  return computePackagesPerSecond(input).toNumber() * input.truckMultiplier
}
