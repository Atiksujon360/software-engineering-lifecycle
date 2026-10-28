# Agent Instructions & Operating Rules

You are an autonomous senior software engineer working in this repository. Follow these strict operating rules.

## 1. Scope Limits & Single-Task Rule
- Execute exactly one task per session.
- Never refactor unrelated files or edit files outside the immediate scope of the assigned task.
- Do not introduce new third-party dependencies without an approved Architecture Decision Record.
- Write complete, working code in full. Never write placeholder comments like `// TODO: implement later`.

## 2. Local Environment Commands
- **Install dependencies**: `npm install` (or `pnpm install`)
- **Start local infrastructure**: `docker compose up -d`
- **Start dev servers**: `npm run dev` (starts web at http://localhost:3000, API at http://localhost:4000)
- **Run fast unit tests**: `npm test`
- **Run all integration tests**: `npm run test:integration`
- **Lint and type-check**: `npm run lint && npm run typecheck`
- **Build production assets**: `npm run build`

## 3. What Must Never Be Committed
- Never commit secrets, tokens, API keys, private certificates, or passwords.
- Never commit raw `.env` files containing credentials (only `.env.example` with dummy values).
- Never commit production database dumps or customer personally identifiable information (PII).
- Never commit temporary files, coverage folders (`coverage/`), or build artifacts (`dist/`, `.next/`).

## 4. Database Migration Rules
- Follow the expand-and-contract pattern for schema changes.
- Never drop or rename a column in the same release as application code changes using it.
- Phase 1: Add new column (nullable or with default) and dual-write.
- Phase 2: Backfill existing rows via batched background worker.
- Phase 3: Switch application reads to the new column.
- Phase 4: Contract and drop legacy column in a subsequent release.
- Every migration must have an associated and tested rollback script.

## 5. Commit Message Format
Follow the Conventional Commits specification:
`<type>(<scope>): <short description in imperative mood>`

Allowed types:
- `feat`: A new user-facing feature or API endpoint
- `fix`: A bug fix
- `test`: Adding or correcting automated tests
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `docs`: Documentation updates only
- `chore`: Tooling, dependency updates, or configuration changes

Examples:
- `feat(api): add RFC 9457 problem details middleware`
- `test(order): add boundary validation unit tests`
- `fix(web): resolve keyboard focus trap in modal dialog`

## 6. End-of-Session Verification & Status Update
Before reporting completion, you MUST:
1. Run the test suite and verify 100% pass rate: `npm test`.
2. Run linter and type-check: `npm run lint`.
3. Check git status to ensure only relevant files were modified: `git status`.
4. Update `docs/PROJECT_STATUS.md` recording:
   - Date and session timestamp
   - The completed task ID and brief description
   - Current lifecycle phase
   - The immediate next prioritized task for the next session
5. Conclude your turn with a brief 3-part report:
   - What was changed (files touched)
   - What was verified (tests run with results)
   - What was not verified (external APIs, manual UX flows)
