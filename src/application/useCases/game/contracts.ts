export type GameErrorCode =
  | 'INVALID_STATE'
  | 'UNKNOWN_UPGRADE'
  | 'UNKNOWN_SKILL'
  | 'MAX_LEVEL_REACHED'
  | 'INSUFFICIENT_FUNDS'
  | 'INSUFFICIENT_PACKAGES'
  | 'UPGRADE_LOCKED'
  | 'CAPACITY_REACHED'
  | 'SAVE_SCHEMA_INVALID'
  | 'SAVE_WRITE_FAILED'

export interface GameUseCaseError<Code extends GameErrorCode = GameErrorCode> {
  code: Code
  message: string
  cause?: unknown
}

export type GameUseCaseResult<
  T,
  Code extends GameErrorCode = GameErrorCode,
> =
  | {
      ok: true
      value: T
    }
  | {
      ok: false
      error: GameUseCaseError<Code>
    }

export function gameSuccess<T>(value: T): GameUseCaseResult<T> {
  return {
    ok: true,
    value,
  }
}

export function gameFailure<Code extends GameErrorCode>(
  code: Code,
  message: string,
  cause?: unknown,
): GameUseCaseResult<never, Code> {
  return {
    ok: false,
    error: {
      code,
      message,
      cause,
    },
  }
}

export function mapGameErrorToUiTextKey(code: GameErrorCode): string {
  const mapping: Record<GameErrorCode, string> = {
    INVALID_STATE: 'errors.invalidState',
    UNKNOWN_UPGRADE: 'errors.unknownUpgrade',
    UNKNOWN_SKILL: 'errors.unknownSkill',
    MAX_LEVEL_REACHED: 'errors.maxLevelReached',
    INSUFFICIENT_FUNDS: 'errors.insufficientFunds',
    INSUFFICIENT_PACKAGES: 'errors.insufficientPackages',
    UPGRADE_LOCKED: 'errors.upgradeLocked',
    CAPACITY_REACHED: 'errors.capacityReached',
    SAVE_SCHEMA_INVALID: 'errors.saveSchemaInvalid',
    SAVE_WRITE_FAILED: 'errors.saveWriteFailed',
  }

  return mapping[code]
}
