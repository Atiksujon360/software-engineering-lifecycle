# Project Status

- **Mode:** Existing project — setup and governance.
- **Date:** 2026-11-01.
- **Current milestone:** M1 — Foundation.
- **Current phase:** Phase 2 documentation completed; TASK-001 approved and complete.
- **Repository:** `Atiksujon360/software-engineering-lifecycle`.
- **Setup branch:** `setup/initial-scaffold` (active branch).
- **Production deployment:** Not authorized.
- **Push to main:** Not authorized.

## Last session summary (2026-11-01)
- Frontend vibe-coding environment setup initiated on `setup/initial-scaffold` branch.
- AGENTS.md updated with test-first workflow requirement and PROJECT_STATUS.md update requirement.
- Verified MCP servers: context7 (library docs) and github-mcp-server (GitHub integration) are operational.
- Test-first workflow validated: Created failing test for AGENTS.md rules, applied changes, verified tests pass.
- docs/PROJECT.md exists in frontend repo; no changes made to application code or backend.
- Backend setup will be on separate branch `setup/backend-status` after frontend approval.
- Pending: Step 2 (MCP server configuration), Step 3 (VS Code extensions), Step 4 (security checks).

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
- AGENTS.md test-first workflow: ✅ PASS (vitest run tests/agents-rules.test.ts)
- MCP server context7: ✅ OPERATIONAL (resolve-library-id, query-docs tools available)
- MCP server github-mcp-server: ✅ OPERATIONAL (issues, PRs, CI tools available)
- docs/PROJECT.md: ✅ EXISTS
- Pending: VS Code extensions check, security tools verification (Gitleaks, Semgrep).
