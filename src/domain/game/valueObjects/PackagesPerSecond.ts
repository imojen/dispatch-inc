export class PackagesPerSecond {
  private readonly value: number

  constructor(value: number) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error('PackagesPerSecond must be a finite non-negative number')
    }
    this.value = value
  }

  toNumber(): number {
    return this.value
  }
}
