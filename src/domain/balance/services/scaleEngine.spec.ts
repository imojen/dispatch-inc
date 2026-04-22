import { describe, expect, it } from 'vitest'
import type { ScaleSpecDto } from '@/application/dto/balance'
import { evaluateScale } from '@/domain/balance/services/scaleEngine'

function baseSpec(overrides: Partial<ScaleSpecDto>): ScaleSpecDto {
  return {
    id: 'test',
    curve: 'linear',
    base: '0',
    rounding: 'nearest',
    ...overrides,
  }
}

describe('scaleEngine', () => {
  it('evaluates linear curve', () => {
    const value = evaluateScale(baseSpec({ curve: 'linear', base: '10', growth: '2' }), 3)
    expect(value).toBe(16)
  })

  it('evaluates exponential curve', () => {
    const value = evaluateScale(baseSpec({ curve: 'exponential', base: '10', growth: '1.5' }), 2)
    expect(value).toBe(22.5)
  })

  it('evaluates power curve', () => {
    const value = evaluateScale(baseSpec({ curve: 'power', base: '3', exponent: '2' }), 4)
    expect(value).toBe(48)
  })

  it('evaluates piecewise curve with matching step', () => {
    const value = evaluateScale(
      baseSpec({
        curve: 'piecewise',
        steps: [
          { levelFrom: 0, base: '1', growth: '2' },
          { levelFrom: 3, base: '10', growth: '3' },
        ],
      }),
      4,
    )

    expect(value).toBe(30)
  })

  it('evaluates softcap curve with attenuation', () => {
    const value = evaluateScale(
      baseSpec({
        curve: 'softcap',
        base: '10',
        growth: '2',
        softcapAt: '20',
        softcapPower: '0.5',
      }),
      3,
    )

    expect(value).toBeLessThan(80)
    expect(value).toBeGreaterThan(20)
  })

  it('applies rounding policies', () => {
    const floor = evaluateScale(baseSpec({ curve: 'linear', base: '1.7', growth: '0.2', rounding: 'floor' }), 1)
    const ceil = evaluateScale(baseSpec({ curve: 'linear', base: '1.1', growth: '0.2', rounding: 'ceil' }), 1)

    expect(floor).toBe(1)
    expect(ceil).toBe(2)
  })

  it('applies min max bounds', () => {
    const minValue = evaluateScale(baseSpec({ curve: 'linear', base: '0', growth: '0', min: '5' }), 0)
    const maxValue = evaluateScale(baseSpec({ curve: 'linear', base: '100', growth: '0', max: '10' }), 0)

    expect(minValue).toBe(5)
    expect(maxValue).toBe(10)
  })

  it('is monotonic on increasing exponential curve', () => {
    const spec = baseSpec({ curve: 'exponential', base: '5', growth: '1.2' })
    const values = Array.from({ length: 8 }, (_, index) => evaluateScale(spec, index))

    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })
})
