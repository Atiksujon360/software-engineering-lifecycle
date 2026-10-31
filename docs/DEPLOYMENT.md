# Deployment

## Environments

| Environment | Purpose | Owner | Release steps | Rollback |
|---|---|---|---|---|
| Local | Developer verification | [TBD] | Install approved dependencies, run checks, start app | Revert local branch or reset disposable data |
| Preview | Review frontend changes | [TBD] | Pull-request preview after CI and approval | Redeploy previous successful preview or close preview |
| Staging | Pre-production verification | [TBD] | [TBD] | [TBD] |
| Production | Existing public Vercel frontend | Project owner | No production release is authorized by this setup | Verify provider rollback procedure before use |

## Deployment boundaries
- Existing Vercel deployment is not changed during documentation setup.
- No production deploy, domain change, environment-variable change, or provider migration is authorized.
- Future Spring Boot API hosting provider: [TBD].
- Future PostgreSQL provider: [TBD].
- Frontend and backend are intended to be independently deployable, subject to architecture approval.

## Reliability objectives
[ASSUMED] Future data service RPO: 24 hours.
[ASSUMED] Future data service RTO: 8 hours.
Backup frequency, retention, restore-test cadence, and accountable owner are [TBD].

## Release process (future)
1. Open a pull request from a task branch.
2. Run required CI checks.
3. Review changed files, requirements, tests, risks, and rollback plan.
4. Obtain required approval.
5. Deploy to preview/staging as configured.
6. Obtain explicit production release approval.
7. Monitor health and errors; rollback if release criteria fail.

No automated production deployment job may be enabled without explicit approval.
