export class TickRate {
  private readonly value: number

  constructor(value: number) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('TickRate must be a finite positive number')
    }
    this.value = value
  }

  toNumber(): number {
    return this.value
  }

  intervalSeconds(): number {
    return 1 / this.value
  }
}
