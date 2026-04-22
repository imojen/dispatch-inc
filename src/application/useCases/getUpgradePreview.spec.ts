import { describe, expect, it } from 'vitest'
import { createGetUpgradePreviewUseCase } from '@/application/useCases/getUpgradePreview'
import { LocalBalanceCatalogRepository } from '@/infrastructure/balance/catalog/localCatalog'

describe('getUpgradePreview use-case', () => {
  it('returns preview with increasing cost/effect', async () => {
    const useCase = createGetUpgradePreviewUseCase(new LocalBalanceCatalogRepository())

    const result = await useCase({
      upgradeId: 'employees',
      currentLevel: 1,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    const preview = result.value
    expect(preview.nextCost).toBeGreaterThan(preview.currentCost)
    expect(preview.nextEffect).toBeGreaterThan(preview.currentEffect)
  })
})
