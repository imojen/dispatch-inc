import { describe, expect, it } from 'vitest'
import { LocalBalanceCatalogRepository } from '@/infrastructure/balance/catalog/localCatalog'

describe('LocalBalanceCatalogRepository', () => {
  it('returns validated catalog', async () => {
    const repository = new LocalBalanceCatalogRepository()
    const catalog = await repository.getCatalog()

    expect(catalog.version).toBe(1)
    expect(catalog.scales.length).toBeGreaterThan(0)
    expect(catalog.upgrades.length).toBeGreaterThanOrEqual(5)
    expect(catalog.skills.length).toBeGreaterThan(0)
    expect(catalog.warehouses.length).toBeGreaterThan(0)
  })
})
