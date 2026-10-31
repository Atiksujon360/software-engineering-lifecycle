# Quality Gates

## Definition of done
- [ ] Change maps to approved requirement IDs.
- [ ] Task is scoped to one branch and expected files were listed before edits.
- [ ] No unapproved dependency, schema, authentication, or integration change.
- [ ] No secret, credential, or populated environment file added.
- [ ] Input is validated at every relevant boundary.
- [ ] Errors are handled consistently; no silent catch blocks.
- [ ] Tests cover changed behavior and existing regression-sensitive behavior.
- [ ] Documentation is updated in the same change.
- [ ] Lint, typecheck, format check, tests, and build pass where configured.
- [ ] Security and dependency checks pass with no unresolved high/critical findings.
- [ ] UI changes include screenshots or review evidence.
- [ ] Git diff contains only intended changes.
- [ ] PR includes risk, rollback plan, test output, and unverified items.
- [ ] No push to main, production deployment, destructive data operation, or history rewrite without approval.

## Performance budgets
| Metric | Budget |
|---|---:|
| LCP | < 2.5 s at p75 |
| INP | < 200 ms at p75 |
| CLS | < 0.1 at p75 |
| Future API p95 | < 300 ms [ASSUMED] |

## Before merge
- Locked dependency install.
- Lint, typecheck, and format check.
- Unit and integration tests.
- Production build.
- E2E smoke test.
- Secret scan, SAST, and dependency scan.
- Review approval and completed PR template.

## Before release
- All merge checks green.
- Preview/staging smoke test passed.
- No unresolved high/critical security finding.
- Environment and rollback steps reviewed.
- Backup and restore readiness confirmed for persistent data.
- Explicit release approval recorded.

These are target gates. Tooling and CI are not created or verified in this documentation-only phase.
