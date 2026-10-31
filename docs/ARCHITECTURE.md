# Architecture

## Current repository baseline
- React + Vite + TypeScript frontend under `src/`.
- Existing UI areas include components, context, hooks, pages, data, and utilities.
- 18-phase content is in `src/data/playbook.ts`.
- Existing Express/SQLite backend and root server files are preserved and out of scope for this phase.
- Package scripts and lockfile conventions need audit; do not assume README commands are accurate.

## Target direction
The frontend architecture will be recommended after an audit. Feature-oriented organization is a candidate, not an approved migration plan.

Future components:
- **React frontend:** Navigation, views, accessible interaction, user-facing state.
- **Frontend service boundary:** Typed request/response handling and API error normalization.
- **Spring Boot API:** Future business rules, authorization, validation, persistence access.
- **PostgreSQL:** Future relational storage.
- **GitHub adapter:** Future controlled GitHub integration; permissions and operations [TBD].

## Future data flow
1. User interacts with a frontend feature.
2. Feature calls a typed frontend service.
3. Service sends HTTPS request to versioned Spring Boot API.
4. API validates request and applies approved authentication/authorization.
5. Domain service applies approved rules.
6. Repository persists data in PostgreSQL.
7. API returns documented response or RFC 9457 Problem Details.
8. Frontend maps result to visible state.

## Sync and async
- **Synchronous:** Ordinary project, task, lifecycle, and portfolio reads/writes.
- **Asynchronous candidates:** GitHub webhook processing, scheduled synchronization, long-running imports, future notifications. Exact use cases and queue technology [TBD].
- **Current setup:** No API calls, jobs, or integrations are implemented.

## External service failure modes

| Service | Timeout | Retry | Fallback |
|---|---|---|---|
| GitHub API (future) | Bounded timeout [TBD] | Retry transient 429/5xx with backoff; respect rate-limit headers | Show last successful sync/stale state [TBD] |
| Future Spring Boot API | Client timeout [TBD] | Retry only safe/idempotent requests | Show actionable error; never imply failed write succeeded |
| Future PostgreSQL | Connection/query timeout [TBD] | Bounded retry for transient connection failures only | Controlled service error; no ephemeral local substitute |
| Future file storage | Request timeout [TBD] | Retry transient failures when safe | Report unavailable file; provider [TBD] |
| Vercel frontend hosting | Provider-managed request failure | Provider behavior | Existing deployment unchanged during setup |

## Failure handling
- No silent catch blocks.
- Never expose stack traces, secrets, or infrastructure details to users.
- Add request IDs when backend observability is implemented.
- Do not retry non-idempotent mutations without an idempotency strategy.
