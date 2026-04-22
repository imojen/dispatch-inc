import { describe, expect, it } from 'vitest'
import { mapGameErrorToUiTextKey, type GameErrorCode } from '@/application/useCases/game/contracts'

describe('chapter 6 - game error mapping', () => {
  it('maps all recoverable game error codes to ui text keys', () => {
    const allCodes: GameErrorCode[] = [
      'INVALID_STATE',
      'UNKNOWN_UPGRADE',
      'UNKNOWN_SKILL',
      'MAX_LEVEL_REACHED',
      'INSUFFICIENT_FUNDS',
      'CAPACITY_REACHED',
      'SAVE_SCHEMA_INVALID',
      'SAVE_WRITE_FAILED',
    ]

    const mapped = allCodes.map((code) => mapGameErrorToUiTextKey(code))

    for (const key of mapped) {
      expect(key.startsWith('errors.')).toBe(true)
      expect(key.length).toBeGreaterThan('errors.'.length)
    }
  })
})
