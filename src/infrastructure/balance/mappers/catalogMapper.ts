import type { BalanceCatalogDto } from '@/application/dto/balance'

export function mapBalanceCatalog(input: BalanceCatalogDto): BalanceCatalogDto {
  return {
    version: input.version,
    scales: [...input.scales],
    upgrades: [...input.upgrades],
    skills: [...input.skills],
    warehouses: [...input.warehouses],
  }
}
