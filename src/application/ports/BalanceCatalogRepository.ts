import type { BalanceCatalogDto } from '@/application/dto/balance'

export interface BalanceCatalogRepository {
  getCatalog(): Promise<BalanceCatalogDto>
}
