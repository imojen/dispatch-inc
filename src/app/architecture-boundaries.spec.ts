import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC_ROOT = path.resolve(process.cwd(), 'src')

function collectFiles(dir: string, extension: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry)
    const stats = statSync(fullPath)

    if (stats.isDirectory()) {
      collectFiles(fullPath, extension, acc)
      continue
    }

    if (fullPath.endsWith(extension)) {
      acc.push(fullPath)
    }
  }

  return acc
}

function extractImports(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf8')
  const matches = content.matchAll(/(?:from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"])/g)
  const imports: string[] = []

  for (const match of matches) {
    const specifier = match[1] ?? match[2]
    if (specifier) {
      imports.push(specifier)
    }
  }

  return imports
}

function hasForbiddenImport(imports: string[], forbidden: string[]): string | null {
  for (const specifier of imports) {
    if (forbidden.some((prefix) => specifier.startsWith(prefix))) {
      return specifier
    }
  }
  return null
}

describe('architecture boundaries', () => {
  it('domain layer does not import presentation/app/infrastructure/framework modules', () => {
    const domainRoot = path.join(SRC_ROOT, 'domain')
    const files = collectFiles(domainRoot, '.ts')

    for (const file of files) {
      const imports = extractImports(file)
      const invalid = hasForbiddenImport(imports, [
        '@/presentation/',
        '@/app/',
        '@/infrastructure/',
        'vue',
        'pinia',
      ])

      expect(invalid, `Forbidden import in ${file}`).toBeNull()
    }
  })

  it('application layer does not import presentation layer', () => {
    const applicationRoot = path.join(SRC_ROOT, 'application')
    const files = collectFiles(applicationRoot, '.ts')

    for (const file of files) {
      const imports = extractImports(file)
      const invalid = hasForbiddenImport(imports, ['@/presentation/'])

      expect(invalid, `Forbidden import in ${file}`).toBeNull()
    }
  })
})
