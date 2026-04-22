export class SkillLevel {
  private readonly value: number

  constructor(value: number) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error('SkillLevel must be an integer >= 0')
    }
    this.value = value
  }

  toNumber(): number {
    return this.value
  }
}
