import type { Clock } from '@/application/ports/Clock'

export class BrowserClock implements Clock {
  nowMs(): number {
    return Date.now()
  }
}
