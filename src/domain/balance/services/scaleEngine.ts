import type { ScaleSpecDto } from '@/application/dto/balance'

function requireFinite(name: string, value: number | undefined): number {
  if (value === undefined || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new Error(`${name} is required and must be a finite number`)
  }
  return value
}

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined
  }

  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric string: ${value}`)
  }
  return parsed
}

function applyRounding(value: number, mode: ScaleSpecDto['rounding']): number {
  switch (mode) {
    case 'floor':
      return Math.floor(value)
    case 'ceil':
      return Math.ceil(value)
    case 'nearest':
      return Math.round(value * 1000) / 1000
    default:
      return value
  }
}

function applyBounds(value: number, min?: number, max?: number): number {
  let bounded = value
  if (min !== undefined) {
    bounded = Math.max(min, bounded)
  }
  if (max !== undefined) {
    bounded = Math.min(max, bounded)
  }
  return bounded
}

function evaluatePiecewise(spec: ScaleSpecDto, level: number): number {
  if (!spec.steps || spec.steps.length === 0) {
    throw new Error(`Piecewise scale ${spec.id} requires at least one step`)
  }

  const sorted = [...spec.steps].sort((a, b) => a.levelFrom - b.levelFrom)
  let chosen = sorted[0]

  for (const step of sorted) {
    if (step.levelFrom <= level) {
      chosen = step
    }
  }

  const localLevel = Math.max(0, level - chosen.levelFrom)
  const base = requireFinite('step.base', parseNumber(chosen.base))
  const growth = parseNumber(chosen.growth)
  const exponent = parseNumber(chosen.exponent)

  if (growth !== undefined && exponent !== undefined) {
    return base * Math.pow(growth, localLevel) * Math.pow(Math.max(localLevel, 1), exponent)
  }

  if (growth !== undefined) {
    return base * Math.pow(growth, localLevel)
  }

  if (exponent !== undefined) {
    return base * Math.pow(Math.max(localLevel, 1), exponent)
  }

  return base
}

export function evaluateScale(spec: ScaleSpecDto, level: number): number {
  if (!Number.isInteger(level) || level < 0) {
    throw new Error('level must be an integer >= 0')
  }

  const base = requireFinite('base', parseNumber(spec.base))
  const growth = parseNumber(spec.growth)
  const exponent = parseNumber(spec.exponent)
  const softcapAt = parseNumber(spec.softcapAt)
  const softcapPower = parseNumber(spec.softcapPower)

  let raw: number

  switch (spec.curve) {
    case 'linear': {
      raw = base + requireFinite('growth', growth) * level
      break
    }

    case 'exponential': {
      raw = base * Math.pow(requireFinite('growth', growth), level)
      break
    }

    case 'power': {
      raw = base * Math.pow(level, requireFinite('exponent', exponent))
      break
    }

    case 'piecewise': {
      raw = evaluatePiecewise(spec, level)
      break
    }

    case 'softcap': {
      // Base progression defaults to exponential if growth exists, otherwise linear.
      const baseline =
        growth !== undefined ? base * Math.pow(growth, level) : base + level

      if (softcapAt === undefined || softcapPower === undefined) {
        raw = baseline
      } else if (baseline <= softcapAt) {
        raw = baseline
      } else {
        raw = softcapAt + Math.pow(baseline - softcapAt, softcapPower)
      }
      break
    }

    default:
      throw new Error(`Unsupported curve kind: ${spec.curve}`)
  }

  const rounded = applyRounding(raw, spec.rounding)
  const min = parseNumber(spec.min)
  const max = parseNumber(spec.max)
  return applyBounds(rounded, min, max)
}
