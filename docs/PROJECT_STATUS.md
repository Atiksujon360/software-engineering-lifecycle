# Project Status

- **Mode:** Existing project — setup and governance.
- **Date:** 2026-10-31.
- **Current milestone:** M1 — Foundation.
- **Current phase:** Phase 2 documentation completed; TASK-001 approved and complete.
- **Repository:** `Atiksujon360/software-engineering-lifecycle`.
- **Setup branch:** `setup/initial-scaffold` (active branch).
- **Production deployment:** Not authorized.
- **Push to main:** Not authorized.

## Last session summary
- TASK-001 completed: Reviewed and approved project scope, unresolved requirements, and proposed non-functional targets.
- Authentication contradiction resolved: Existing bcrypt + session cookie authentication is preserved (not removed) per owner approval.
- Switched to `setup/initial-scaffold` branch for setup work per AGENTS.md.
- Confirmed team users, all-project/activity scope, combined lifecycle and project management workflow, project/task-only initial data scope, existing authentication preserved, GitHub as confirmed integration, audit-first frontend architecture, and preservation of existing backend.
- Inspected public `main`: React/Vite/TypeScript frontend, Express/SQLite backend with authentication, Bun lockfile, and 18-phase source at `src/data/playbook.ts`.
- Public `main` still lists `data/` and `.aistudio/`; earlier local cleanup is not reflected on this branch.
- Created setup branch from inspected main commit. No application code or backend files were changed.
- Updated docs/PRD.md and docs/DECISIONS.md to reflect authentication reality and approved decisions.

## Next action
TASK-002: Resolve public repository security blockers: verify secret rotation and plan Git history remediation for committed data and .aistudio content.

## Open [TBD] items
- Project/activity types, fields, and lifecycle applicability.
- Team roles, permissions, invitations, and workspace boundaries.
- Future session model integration with new backend (existing auth preserved for now).
- GitHub integration type, repository scope, read/write permissions, webhook needs, supported actions.
- Canonical package manager, lockfile, Node/Bun versions, correct frontend dev command.
- Frontend architecture recommendation after full code audit.
- API request/response schemas and authorization rules.
- Data retention, export, deletion, backup, restore policy.
- Hosting provider for future Spring Boot API and PostgreSQL.
- Browser support matrix and numeric adoption/success measure.
- Owners for local, preview, staging, and production environments.

## Open [ASSUMED] proposals
- Future API p95: < 300 ms for ordinary reads under agreed load.
- Future service availability: 99.5% monthly.
- Future RPO: 24 hours; RTO: 8 hours.
- Future OWASP ASVS Level 1 baseline.
- Feature-oriented frontend structure is a candidate only; final recommendation waits for audit.

## Security blockers (approved for remediation in TASK-002)
- Public main still contains `data/` and `.aistudio/` paths.
- Prior handover reported a committed SQLite account database and exposed session secret.
- Git history remediation and session secret rotation are authorized per TASK-001 approval (DEC-017, DEC-018).
- TASK-002 will execute the remediation plan.
- Existing Express/SQLite backend is preserved and not reviewed or changed by this documentation-only phase.

## Verification status
- Documentation branch created.
- Documentation files prepared in this commit.
- No frontend build, tests, lint, secret scan, or deployment checks were run in this documentation-only phase.
