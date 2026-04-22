export class UpgradeLevel {
  private readonly value: number

  constructor(value: number) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error('UpgradeLevel must be an integer >= 0')
    }
    this.value = value
  }

  toNumber(): number {
    return this.value
  }
}
