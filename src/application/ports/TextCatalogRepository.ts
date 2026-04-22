import type {
  SupportedLocale,
  UiTextCatalogDto,
} from '@/application/dto/content'

export interface TextCatalogRepository {
  getCatalog(locale: SupportedLocale): Promise<UiTextCatalogDto>
}
