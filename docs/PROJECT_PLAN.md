# Project Plan: Engineering Lifecycle Playbook

Repo: `Atiksujon360/software-engineering-lifecycle`
Mode: Existing project. Work is in a local clone. Nothing is pushed until the owner approves.
Last updated: 2026-10-31

**Stack:** React + Vite + TypeScript frontend. Express server with SQLite (the only database) in `/server`. Content in `/content` and `src/data/playbook.ts`.

**Known blockers:**
- A SQLite database with user accounts was committed under `/data`.
- `SESSION_SECRET` was hard-coded in `docker-compose.yml`.
- The local cleanup (2026-10-28) is not committed. Git history still contains the old data and needs rewriting.

Gate definitions: G1 Scope locked, G2 Build complete, G3 Release ready, G4 Live and stable.

---

## M1: Baseline and security (Phase 0, Orientation)

**Goal:** Know the current state exactly, remove the exposed secrets and data, and commit a clean baseline.
**Exit criterion:** Secrets rotated, history rewritten, baseline notes committed as a docs-only change, and the test baseline recorded.

- [ ] **TASK-001** [S] Record the Git state: branch, uncommitted changes (the 2026-10-28 cleanup), last 10 commits, remote.
  - *Done when:* Notes list each item. No files changed to get this.
- [ ] **TASK-002** [M] Map the structure: entry points, folders, build tool, Node version.
  - *Done when:* `docs/ARCHITECTURE.md` lists every app or service and how it starts.
- [ ] **TASK-003** [S] Audit dependencies: versions, known vulnerabilities, lockfile committed.
  - *Done when:* Audit saved to `docs/audits/` with the date. Nothing upgraded yet.
- [ ] **TASK-004** [S] Record the test baseline: `tsc`, 7 unit tests, `vite build`. Note pass, fail and skip counts.
  - *Done when:* Numbers in `docs/PROJECT_STATUS.md`. Failures listed, not fixed.
- [ ] **TASK-005** [M] **Human approval:** Rotate `SESSION_SECRET` and every credential that appeared in the repo. Record the rotation date.
  - *Done when:* Rotation log entry in `docs/security/`. The old value is confirmed invalid. Owner approves.
- [ ] **TASK-006** [M] **Human approval:** Remove the committed `/data` SQLite file and `.aistudio` content from Git history (for example `git filter-repo`). Confirm the new history contains no secret or user data.
  - *Done when:* Secret scan of full history passes. Owner has reviewed the rewrite plan before it runs. Collaborators know to re-clone.
- [ ] **TASK-007** [S] Record the risk register: history rewrite, hard-coded values, the file-based SQLite store, and any unknown areas. One row per risk with an owner.
  - *Done when:* `docs/audits/risk-register.md` has one row per risk.
- [ ] **TASK-008** [S] Commit the cleanup and baseline notes as separate commits: (a) security and gitignore fixes, (b) docs only.
  - *Done when:* Each commit touches only its stated files. Commit messages use Conventional Commits.

---

## M2: Requirements and design (Phases 1 to 6)

**Goal:** Define what the playbook must do for its users and fix the content model before more code changes.
**Exit criterion:** Gate G1 passed. Requirements and API contract approved.

- [ ] **TASK-009** [M] Write the problem statement in two sentences naming a specific user (for example: a small software team lead who needs a repeatable checklist for AI-assisted delivery).
  - *Done when:* Two sentences in `docs/PROJECT.md`. Owner confirms.
- [ ] **TASK-010** [M] Interview at least five target users, or run a manual pilot with the current playbook.
  - *Done when:* Dated notes in `docs/research/`. Each claim marked observed or assumed.
- [ ] **TASK-011** [S] Check the terms and data rules of platforms the playbook links to or depends on (Google AI Studio, GitHub).
  - *Done when:* `docs/research/platform-rules.md` lists each platform, its rule and the check date.
- [ ] **TASK-012** [M] Write `docs/PRD.md`: must-have, should-have and not-now features, each with an ID (`PRD-FR-###`) and a Given/When/Then acceptance criterion.
  - *Done when:* Every must-have has an ID and a testable criterion. At least five out-of-scope items.
- [ ] **TASK-013** [S] Set non-functional targets with numbers: LCP, CLS, bundle size, offline behaviour of the local progress store, and SQLite backup window.
  - *Done when:* No adjectives such as "fast" without a number. Targets in `docs/QUALITY_GATES.md`.
- [ ] **TASK-014** [M] Decide whether user accounts stay. Options: keep SQLite-backed accounts, or make the playbook a public read-only reference with progress kept in the browser. Write an ADR with the rejected option and why.
  - *Done when:* `docs/adr/ADR-001-accounts.md` exists. Owner approves.
- [ ] **TASK-015** [M] If accounts stay, decide who can read and change content. Write the permissions table.
  - *Done when:* Table in `docs/PRD.md`. Each row has a role and an allowed action.
- [ ] **TASK-016** [S] Write the API contract for each endpoint that will remain (auth, health, content if served).
  - *Done when:* `docs/API.md` lists each endpoint, its role check and its error format (RFC 9457).
- [ ] **TASK-017** [S] Define the SQLite schema, migration approach and backup procedure (file copy with `VACUUM INTO` or the `.backup` command, with a tested restore).
  - *Done when:* `docs/DATA_MODEL.md` lists every table and constraint. A restore from backup is tested and timed.
- [ ] **TASK-018** [S] **Gate G1:** Owner signs off the v1 scope and the out-of-scope list.
  - *Done when:* Sign-off recorded in `docs/DECISIONS.md` with the date.

---

## M3: Build and harden (Phases 7 to 12)

**Goal:** Fix the known defects, make the frontend and server match the approved design, and build the test and CI gates.
**Exit criterion:** Gate G2 passed. Must-have requirements pass their tests on a staging-like setup.

### Frontend and content

- [ ] **TASK-019** [M] Fix the phone top-bar layout and confirm no horizontal scroll at 390 px.
  - *Done when:* Screenshot at 390 px and a 320 px check attached to the PR.
- [ ] **TASK-020** [S] Fix `{{TIMEFRAME}}` rendering so it shows as `[fill: TIMEFRAME]` on every phase page where it appears.
  - *Done when:* A test covers each phase page that uses the variable.
- [ ] **TASK-021** [M] Define design tokens for colour, type, spacing and radius in one file. Replace raw values in components.
  - *Done when:* A check fails if a component uses a raw hex value.
- [ ] **TASK-022** [M] Check keyboard use, focus order, contrast and reduced motion across all views.
  - *Done when:* axe reports no serious violations. Main path works by keyboard only.
- [ ] **TASK-023** [M] Validate the content (phases, tasks, prompts) against a schema at build time, so a broken entry fails the build.
  - *Done when:* A deliberately broken entry fails `vite build` or the test suite.

### Server and security

- [ ] **TASK-024** [S] Require `SESSION_SECRET` at startup in production. Fail with a clear message if missing. Remove any default.
  - *Done when:* A test covers startup with and without the variable.
- [ ] **TASK-025** [M] Add the security baseline: security headers, CORS locked to configured origins, rate limiting on login and write endpoints.
  - *Done when:* curl checks show the headers and a 429 after the limit.
- [ ] **TASK-026** [M] Hash passwords with a current algorithm (argon2 or bcrypt with a cost factor). Plan the migration for existing accounts.
  - *Done when:* A test proves stored passwords are not plaintext and login still works. Migration path documented.
- [ ] **TASK-027** [S] Confirm parameterised queries for every SQLite call. Add a lint rule or review check.
  - *Done when:* No string-concatenated SQL remains. Check output attached.
- [ ] **TASK-028** [S] Structured logs with a request ID. No tokens or passwords in logs.
  - *Done when:* A test proves the request ID is present and the redaction works.

### Tests and CI

- [ ] **TASK-029** [M] Add ESLint, Prettier and a typecheck script. Fix or document each existing finding (do not disable rules).
  - *Done when:* `lint`, `typecheck` and `format:check` pass.
- [ ] **TASK-030** [M] Add integration tests for the server routes (auth, health, content) against a SQLite file in a temp directory.
  - *Done when:* Tests run in CI and pass three runs in a row.
- [ ] **TASK-031** [M] Add Playwright E2E tests for the critical paths: open a phase, check a task, copy a prompt (with clipboard fallback), export and import progress.
  - *Done when:* One E2E test per path, passing locally and in CI.
- [ ] **TASK-032** [M] Build the CI workflow: lint, typecheck, unit, integration, build, Gitleaks, Semgrep or CodeQL, `npm audit`. Pin actions to commit SHAs. Least-privilege `permissions:`.
  - *Done when:* A pull request runs every stage. The pipeline fails on high or critical findings.
- [ ] **TASK-033** [S] Add the PR template, CODEOWNERS and a Renovate or Dependabot config.
  - *Done when:* Files committed. Owner named for weekly dependency triage.
- [ ] **TASK-034** [S] Record the coverage and test baseline trend in `PROJECT_STATUS.md`. Treat coverage as a signal, not a target.
  - *Done when:* Numbers recorded.

- [ ] **Gate G2:** Must-have requirements pass their acceptance tests on a staging-like setup (local Docker Compose with the secret from the environment).

---

## M4: Release and run (Phases 13 to 17)

**Goal:** Ship a secure, reproducible release, document how to run and recover it, and hand it over.
**Exit criterion:** Gate G3 and G4 passed. Production serves users, SLOs are measured, rollback has been rehearsed.

- [ ] **TASK-035** [M] Fix `docker-compose.yml` so every secret comes from the environment, and `.env.example` lists keys with no values.
  - *Done when:* `docker compose config` shows no secret value. Secret scan passes.
- [ ] **TASK-036** [M] Build one immutable image per commit, tagged with the commit SHA. Promote the same digest to production.
  - *Done when:* Staging and production digests match in the deploy log.
- [ ] **TASK-037** [S] Protect `main`: required checks, one approval, no force push. Export the settings to `docs/audits/`.
  - *Done when:* Settings output saved. **Owner runs the `gh api` command.**
- [ ] **TASK-038** [M] Write `docs/DEPLOYMENT.md`: environments with owners, release steps, rollback steps, RPO and RTO. Include the SQLite backup and restore steps.
  - *Done when:* A second person reads it and confirms the steps.
- [ ] **TASK-039** [M] Rehearse the rollback on staging, including a SQLite restore, and time it.
  - *Done when:* Time recorded and under the RTO target.
- [ ] **TASK-040** [M] **Gate G3 prerequisite:** DAST (OWASP ZAP) baseline scan on staging. Fix or accept each high finding in writing.
  - *Done when:* Scan report in `docs/audits/`. No open high findings without an accepted-risk entry.
- [ ] **TASK-041** [S] Define SLOs for the top user journeys (for example: content loads within the LCP budget for 99% of page views) and a log query or dashboard for each.
  - *Done when:* SLOs in `docs/QUALITY_GATES.md`. Links recorded in `PROJECT_STATUS.md`.
- [ ] **TASK-042** [S] Error tracking (Sentry or equivalent) with source maps uploaded in CI. A deliberate test error shows the original line.
  - *Done when:* Test error visible in the tool.
- [ ] **TASK-043** [M] Write `docs/RUNBOOK.md` for the top failure modes: server down, SQLite file corrupt or missing, secret leaked, bad content deploy. Each with symptom, diagnosis, mitigation and rollback.
  - *Done when:* Each failure mode has all four sections.
- [ ] **TASK-044** [S] Verify the README works from a clean machine: setup, test, run, deploy, rollback.
  - *Done when:* A second person follows it and reports time taken and gaps.
- [ ] **TASK-045** [S] Set the maintenance routine: monthly risk review, dependency triage owner, secret rotation schedule, SQLite restore-test date.
  - *Done when:* Schedule in `docs/PROJECT_STATUS.md`. Owner named.
- [ ] **TASK-046** [S] **Gate G4:** Owner approves production launch and records the decision.
  - *Done when:* Entry in `docs/DECISIONS.md` with the date and the SLO baseline.

---

## Definition of done (every task)

- [ ] Acceptance criteria met and shown, not claimed.
- [ ] Tests written first for new behaviour, and they pass. Output attached to the PR.
- [ ] Lint, typecheck and security scan clean.
- [ ] Changed files match the task's expected files.
- [ ] Docs describing changed behaviour updated in the same PR.
- [ ] A human has reviewed and approved the diff.
- [ ] `PROJECT_STATUS.md` records what changed, the test result and the next action.

## Open questions for the owner

1. **Scope mismatch:** The plan you sent earlier described a different product (project and activity tracking, team permissions, GitHub integration, PostgreSQL, Spring Boot). This plan follows the playbook repo. If that product needs its own plan, tell me and I'll write it separately.
2. **Do you want user accounts at all** (TASK-014)? A public read-only reference with browser-only progress removes most of the M3 security work.
3. **Is the 2026-10-28 cleanup still uncommitted?** Confirm before TASK-001 so I don't assume the state.