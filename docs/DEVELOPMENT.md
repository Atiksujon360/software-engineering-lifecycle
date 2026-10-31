# Development Guide

## Repository
`Atiksujon360/software-engineering-lifecycle`
Setup branch: `setup/initial-scaffold`.

## Current observed toolchain
- React + Vite + TypeScript frontend.
- Existing Express/SQLite backend (preserved; not part of frontend setup).
- A `bun.lock` file exists.
- `package.json` declares `dev`, `build`, `start`, `preview`, `clean`, `lint`, and `test`.
- Canonical package manager is [TBD]. README npm instructions and the Bun lockfile need reconciliation before scaffold/tooling work.

## Existing package scripts (from current package.json)
```sh
npm run build
npm run lint
npm test
```

These scripts are declared; their current execution has not been verified in this documentation phase.

The following scripts are declared but need runtime verification:
```sh
npm run dev
npm run start
npm run preview
```

Important: current `dev` and `start` scripts invoke `tsx server.ts`; do not assume they start the Vite frontend. Frontend development command and backend startup workflow must be clarified in the audit.

## Planned quality commands
These are target scripts for a later approved tooling phase, not verified current scripts:
```sh
npm run format:check
npm run typecheck
npm run test:e2e
```

Do not report them as passing until configured and run.

## Environment
- Inspect `.env.example` and actual runtime config before starting services.
- Never commit populated `.env` files or copy production secrets into local development.
- Exact required frontend environment keys and safe local values are [TBD].
- API base URL variable and proxy behavior are [TBD].

## Data and seeds
No database, migration, or seed command is approved for this frontend-only documentation phase. Never run seeds against a non-disposable database.

## Branch protection
After CI workflow and required check names are agreed and enabled, the repository owner should configure main-branch protection to require one approving review, dismiss stale approvals, require up-to-date branches, and require the agreed CI checks. The exact CLI command is recorded in the project handoff checklist after CI job names are finalized. Do not change branch protection from an agent during Phase 2.
