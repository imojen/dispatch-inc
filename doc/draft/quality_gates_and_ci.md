# Quality Gates & CI --- Dispatch Inc.

## Purpose

Definir les controles qualite obligatoires en local et en CI.

## Mandatory Local Checks (after each code change)

- `npm run lint`
- `npm run test`
- `npm run coverage`

If available in scripts:
- `npm run typecheck`

## CI Pipeline (v1)

1. Install dependencies (`npm ci`)
2. Lint (`npm run lint`)
3. Typecheck (`npm run typecheck` or `tsc --noEmit`)
4. Unit + integration tests (`npm run test`)
5. Coverage (`npm run coverage`)
6. Publish artifacts and summary

## Blocking Rules (hard)

- Any lint error blocks merge
- Any type error blocks merge
- Any test failure blocks merge
- Coverage under threshold blocks merge

## Coverage Thresholds (v1)

- Domain (`src/domain/**`): 100%
- Application (`src/application/**`): 100%
- Global lines: >= 90%
- Global branches: >= 85%

## PR Rules

- PR must include updated tests for changed behavior
- PR must mention impacted drafts/docs if architecture contract changed
- No direct merge on red pipeline

## Branch Protection

- Require CI success before merge
- Require at least one approval
- Dismiss stale approvals on new commits

## Reporting

- CI summary in PR
- Coverage artifact retained
- Failing test names surfaced directly in summary

## Local Developer Experience

- Optional pre-commit hook for lint on staged files
- Optional pre-push hook for tests on changed scope
- Hook failures never bypass mandatory CI checks

## Responsibility Rule

- Author owns fixing CI failures introduced by the branch.
- If failure is flaky/infra, create issue and rerun with trace.
