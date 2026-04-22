# IA Agent Rules

This file defines the baseline rules for any AI contribution in this project.

## Source of truth

- Project drafts are in `doc/draft/`.
- Style and Design rules are in `doc/draft/ui_design_spec.md`
- Always read and align with these drafts before proposing architecture or implementation changes.

## Engineering constraints

- Always use DTOs/objects when possible, especially at module boundaries.
- Stay within a Domain Driven Development approach with strict border controls:
  - keep clear boundaries between domain, application, infrastructure, and UI
  - do not leak UI or infrastructure concerns into domain logic
- Everything must be typed:
  - no untyped payloads
  - no implicit `any`
  - typed state, typed contracts, typed function signatures

## Mandatory quality gate after each code change

1. Run ESLint.
2. Run the full test suite.
3. Fix all reported issues before considering the task complete.

Default commands:

```bash
npm run lint
npm run test
```

If command names differ in this repo, use the equivalent lint and test commands.

## Global plan tracking (mandatory)

- `GLOBAL_PLAN.md` is the execution source of truth for implementation progress.
- After each meaningful progress step, check whether one or more plan checkboxes can be marked done.
- Update checkbox states immediately so the plan always reflects reality.
- Never mark a checkbox as done without concrete implementation evidence (code/tests/docs update).
