export class ScaleId {
  private readonly value: string

  constructor(value: string) {
    if (!value.trim()) {
      throw new Error('ScaleId must be a non-empty string')
    }
    this.value = value
  }

  toString(): string {
    return this.value
  }
}
