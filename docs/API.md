# API Contract

## Status
No new API is implemented or approved in this frontend setup phase. The existing Express/SQLite backend is preserved and out of scope. Future backend direction is Java/Spring Boot.

## Future conventions
- Base path: `/api/v1`; HTTPS outside local development.
- JSON bodies unless an endpoint explicitly requires another media type.
- Errors use RFC 9457 Problem Details and `Content-Type: application/problem+json`.
- Cursor-based pagination for collections; cursor encoding and page-size limits [TBD].
- Validate all input at the API boundary. Never expose stack traces or secret values.
- Additive compatible changes remain in v1; breaking contract changes require a new major API version.
- Authentication and role authorization are not implemented in this phase. Allowed roles are [TBD].
- Idempotency keys are required for future POST operations that send messages or move money; neither capability is in current scope.

## Candidate endpoints (not implemented)
| Method | Path | Purpose | Future access | Expected status codes |
|---|---|---|---|---|
| GET | `/api/v1/health` | Health check | Public, no sensitive data | 200, 503 |
| GET | `/api/v1/projects` | List projects | [TBD] | 200, 400, 401, 403, 500 |
| POST | `/api/v1/projects` | Create project | [TBD] | 201, 400, 401, 403, 409, 422 |
| GET | `/api/v1/projects/{projectId}` | Project detail | [TBD] | 200, 401, 403, 404 |
| PATCH | `/api/v1/projects/{projectId}` | Update project | [TBD] | 200, 400, 401, 403, 404, 422 |
| GET | `/api/v1/projects/{projectId}/phases` | List lifecycle phases | [TBD] | 200, 401, 403, 404 |
| GET | `/api/v1/projects/{projectId}/tasks` | List project tasks | [TBD] | 200, 400, 401, 403, 404 |
| POST | `/api/v1/projects/{projectId}/tasks` | Create task | [TBD] | 201, 400, 401, 403, 404, 422 |
| GET | `/api/v1/projects/{projectId}/activities` | List project activities | [TBD] | 200, 400, 401, 403, 404 |
| GET | `/api/v1/integrations/github/status` | GitHub connection status | [TBD] | 200, 401, 403, 404, 503 |

These routes are candidates for discovery, not a commitment to implement every route. Schemas, role names, and detailed error codes remain [TBD].

## Authorization
The platform is intended for the owner and team, but role and permission models are undecided. Do not assume every team member can read or edit every project. Approve access policy before implementing protected endpoints.

## GitHub integration
Connection model (GitHub App, OAuth App, or fine-grained PAT), repository selection, read/write scopes, webhook events, and disconnect behavior are [TBD]. Do not request broad scopes by default.
