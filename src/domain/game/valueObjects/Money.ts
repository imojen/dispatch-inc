export class Money {
  private readonly value: number

  constructor(value: number) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error('Money must be a finite non-negative number')
    }
    this.value = value
  }

  static zero(): Money {
    return new Money(0)
  }

  toNumber(): number {
    return this.value
  }

  add(other: Money): Money {
    return new Money(this.value + other.value)
  }

  subtract(other: Money): Money {
    return new Money(Math.max(0, this.value - other.value))
  }
}
