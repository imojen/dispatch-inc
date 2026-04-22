export class SaveVersion {
  private readonly value: number

  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error('SaveVersion must be an integer >= 1')
    }
    this.value = value
  }

  toNumber(): number {
    return this.value
  }
}
