# Project Status

- **Mode:** Existing project — setup and governance.
- **Date:** 2026-10-31.
- **Current milestone:** M1 — Foundation.
- **Current phase:** Phase 2 documentation prepared; awaiting owner review.
- **Repository:** `Atiksujon360/software-engineering-lifecycle`.
- **Setup branch:** `setup/initial-scaffold`.
- **Production deployment:** Not authorized.
- **Push to main:** Not authorized.

## Last session summary
- Confirmed team users, all-project/activity scope, combined lifecycle and project management workflow, project/task-only initial data scope, no auth implementation yet, GitHub as confirmed integration, audit-first frontend architecture, and preservation of existing backend.
- Inspected public `main`: React/Vite/TypeScript frontend, Express/SQLite backend, Bun lockfile, and 18-phase source at `src/data/playbook.ts`.
- Public `main` still lists `data/` and `.aistudio/`; earlier local cleanup is not reflected on this branch.
- Created setup branch from inspected main commit. No application code or backend files were changed.

## Next action
TASK-001: Review and approve project scope, unresolved requirements, and proposed non-functional targets.

## Open [TBD] items
- Project/activity types, fields, and lifecycle applicability.
- Team roles, permissions, invitations, and workspace boundaries.
- Authentication provider and future session model.
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

## Security blockers (not resolved here)
- Public main still contains `data/` and `.aistudio/` paths.
- Prior handover reported a committed SQLite account database and exposed session secret. Confirm rotation and history remediation before using current public repository state for sensitive project data.
- Existing Express/SQLite backend is preserved and not reviewed or changed by this documentation-only phase.

## Verification status
- Documentation branch created.
- Documentation files prepared in this commit.
- No frontend build, tests, lint, secret scan, or deployment checks were run in this documentation-only phase.
