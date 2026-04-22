import type { BalanceCatalogDto } from '@/application/dto/balance'
import type { BalanceCatalogRepository } from '@/application/ports/BalanceCatalogRepository'
import { balanceCatalogV1 } from '@/data/balance/catalog.v1'
import { mapBalanceCatalog } from '@/infrastructure/balance/mappers/catalogMapper'
import { validateBalanceCatalog } from '@/infrastructure/balance/validators/balanceSchema'

export class LocalBalanceCatalogRepository implements BalanceCatalogRepository {
  async getCatalog(): Promise<BalanceCatalogDto> {
    const catalog = mapBalanceCatalog(balanceCatalogV1)
    validateBalanceCatalog(catalog)
    return catalog
  }
}
