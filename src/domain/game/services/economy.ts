import { PackagesPerSecond } from '@/domain/game/valueObjects/PackagesPerSecond'

export interface EconomyComputationInput {
  employees: number
  scannerBonus: number
  cartMultiplier: number
  truckMultiplier: number
  tickRate: number
}

export function computePackagesPerSecond(
  input: EconomyComputationInput,
): PackagesPerSecond {
  const safeTickRate = Math.max(0, input.tickRate)
  const production =
    input.employees * (1 + input.scannerBonus) * input.cartMultiplier * safeTickRate
  return new PackagesPerSecond(production)
}

export function computeMoneyPerSecond(input: EconomyComputationInput): number {
  return computePackagesPerSecond(input).toNumber() * input.truckMultiplier
}
