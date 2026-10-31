# AI Agent Operating Rules

## Required reading
Before every change, read `docs/PROJECT.md`, `docs/PROJECT_STATUS.md`, the relevant spec, and applicable decisions/ADRs.

## Task protocol
- State the task in one sentence and list expected files before editing.
- Work on `setup/initial-scaffold` for this setup. Never push to `main`.
- One task per branch. Stop and record new findings as tasks when scope grows.
- Do not start feature work during foundation setup.
- Do not modify the existing backend during frontend-only work.
- Preserve all 18 lifecycle phases and content.
- No production deploy, data deletion, or Git history rewrite without explicit approval.

## Engineering constraints
- No new dependencies, schema changes, auth changes, or integrations without approval.
- Never hard-code secrets, credentials, or environment values. Use empty values in `.env.example`.
- Validate input at every boundary; use parameterised queries if database work is approved.
- No silent catch blocks. Never log passwords, tokens, session identifiers, or personal data.
- Keep changes minimal, reviewable, and reversible.
- Do not invent business rules, roles, data fields, or retention policies. Mark unknowns [TBD] and proposals [ASSUMED].

## Quality and reporting
- Update tests and docs in the same change.
- Never disable tests, lint, type checks, or security checks to get a green build.
- Show exact command output; do not claim checks passed without evidence.
- Use Conventional Commits.
- Do not commit, push, merge, or deploy unless explicitly authorized.
- Report blockers and unverified behavior honestly.
