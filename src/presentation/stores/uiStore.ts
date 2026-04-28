import { defineStore } from 'pinia'
import type { SupportedLocale, UiTextCatalogDto, UiTextKey } from '@/application/dto/content'
import { appContainer } from '@/app/di'

const PROD_FALLBACK_TEXT = 'Texte indisponible'
const DEFAULT_TOAST_DURATION_MS = 3600
const MAX_TOAST_COUNT = 5

export type UiToastTone = 'success' | 'error' | 'info'

export interface UiToast {
  id: number
  messageKey: UiTextKey
  tone: UiToastTone
  durationMs: number
}

interface UiState {
  locale: SupportedLocale
  catalog: UiTextCatalogDto | null
  isLoading: boolean
  hasLoaded: boolean
  toasts: UiToast[]
  nextToastId: number
}

const toastTimers = new Map<number, ReturnType<typeof globalThis.setTimeout>>()

function clearToastTimer(toastId: number): void {
  const timer = toastTimers.get(toastId)
  if (timer !== undefined) {
    globalThis.clearTimeout(timer)
    toastTimers.delete(toastId)
  }
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    locale: 'fr-FR',
    catalog: null,
    isLoading: false,
    hasLoaded: false,
    toasts: [],
    nextToastId: 1,
  }),

  actions: {
    async initialize(locale: SupportedLocale = 'fr-FR'): Promise<void> {
      if (this.isLoading) {
        return
      }

      this.isLoading = true
      try {
        const getUiTextBundle = appContainer.useCases.createGetUiTextBundle()
        this.catalog = await getUiTextBundle(locale)
        this.locale = locale
        this.hasLoaded = true
      } finally {
        this.isLoading = false
      }
    },

    t(key: UiTextKey): string {
      const value = this.catalog?.entries[key]
      if (typeof value === 'string' && value.length > 0) {
        return value
      }

      if (import.meta.env.DEV) {
        return `[missing:${key}]`
      }

      return PROD_FALLBACK_TEXT
    },

    notify(messageKey: UiTextKey, tone: UiToastTone = 'info', durationMs = DEFAULT_TOAST_DURATION_MS): void {
      const toast: UiToast = {
        id: this.nextToastId,
        messageKey,
        tone,
        durationMs: Math.max(0, Math.round(durationMs)),
      }

      this.nextToastId += 1
      this.toasts.push(toast)

      if (this.toasts.length > MAX_TOAST_COUNT) {
        const removed = this.toasts.shift()
        if (removed) {
          clearToastTimer(removed.id)
        }
      }

      if (toast.durationMs > 0) {
        const timeoutId = globalThis.setTimeout(() => {
          this.dismissToast(toast.id)
        }, toast.durationMs)
        toastTimers.set(toast.id, timeoutId)
      }
    },

    notifySuccess(messageKey: UiTextKey, durationMs = DEFAULT_TOAST_DURATION_MS): void {
      this.notify(messageKey, 'success', durationMs)
    },

    notifyError(messageKey: UiTextKey, durationMs = DEFAULT_TOAST_DURATION_MS): void {
      this.notify(messageKey, 'error', durationMs)
    },

    dismissToast(toastId: number): void {
      clearToastTimer(toastId)
      this.toasts = this.toasts.filter((toast) => toast.id !== toastId)
    },

    clearToasts(): void {
      for (const toast of this.toasts) {
        clearToastTimer(toast.id)
      }
      this.toasts = []
    },
  },
})
