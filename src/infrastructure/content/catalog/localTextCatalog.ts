import type {
  SupportedLocale,
  UiTextCatalogDto,
} from '@/application/dto/content'
import type { TextCatalogRepository } from '@/application/ports/TextCatalogRepository'
import { frFrCatalog } from '@/infrastructure/content/catalog/fr-FR.v1'

const catalogs: Partial<Record<SupportedLocale, UiTextCatalogDto>> = {
  'fr-FR': frFrCatalog,
}

export class LocalTextCatalogRepository implements TextCatalogRepository {
  async getCatalog(locale: SupportedLocale): Promise<UiTextCatalogDto> {
    const catalog = catalogs[locale]
    if (!catalog) {
      throw new Error(`Unsupported locale: ${locale}`)
    }
    return catalog
  }
}
