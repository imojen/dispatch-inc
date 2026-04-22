import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUiStore } from '@/presentation/stores/uiStore'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
})

afterEach(() => {
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
})

describe('uiStore toast notifications', () => {
  it('auto-dismisses a toast after its duration', () => {
    const ui = useUiStore()

    ui.notifySuccess('save.success.created', 1200)
    expect(ui.toasts).toHaveLength(1)

    vi.advanceTimersByTime(1199)
    expect(ui.toasts).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(ui.toasts).toHaveLength(0)
  })

  it('keeps only the latest five toasts', () => {
    const ui = useUiStore()

    for (let index = 0; index < 7; index += 1) {
      ui.notify(`toast.test.${index}`, 'info', 0)
    }

    expect(ui.toasts).toHaveLength(5)
    expect(ui.toasts.map((toast) => toast.messageKey)).toEqual([
      'toast.test.2',
      'toast.test.3',
      'toast.test.4',
      'toast.test.5',
      'toast.test.6',
    ])
  })
})
