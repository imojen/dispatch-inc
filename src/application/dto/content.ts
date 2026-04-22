export type SupportedLocale = 'fr-FR' | 'en-US'

export type UiTextKey = string

export interface UiTextCatalogDto {
  locale: SupportedLocale
  version: number
  entries: Record<UiTextKey, string>
}
