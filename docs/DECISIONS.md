# Decision Register

| ID | Decision | Status | Source |
|---|---|---|---|
| DEC-001 | Retain existing React + Vite + TypeScript frontend during cleanup | Accepted | User / repository |
| DEC-002 | Preserve all 18 engineering lifecycle phases and content | Accepted | User / repository |
| DEC-003 | Support general projects and activities as well as lifecycle-managed projects | Accepted | User |
| DEC-004 | Initial users are owner and team | Accepted | User |
| DEC-005 | Preserve existing authentication (bcrypt + session cookies) and prepare for future backend integration | Accepted (updated) | User / TASK-001 review |
| DEC-006 | Preserve existing backend; current phase is frontend-only | Accepted | User |
| DEC-007 | GitHub is the only confirmed external integration for planning | Accepted | User |
| DEC-008 | Future backend direction is Java 21 + Spring Boot 4.x | Accepted direction; detailed ADR required | Prior user decision |
| DEC-009 | Future database direction is PostgreSQL | Accepted direction; provider/schema TBD | Prior user decision |
| DEC-010 | Frontend architecture must be recommended after audit | Accepted | User |
| DEC-011 | Work on setup/initial-scaffold; no push to main or production deploy | Accepted | Setup protocol |
| DEC-012 | GitHub integration capabilities and scopes | [TBD] | Owner decision |
| DEC-013 | Team roles and permissions | [TBD] | Owner decision |
| DEC-014 | Canonical package manager and lockfile | [TBD] | Repository audit |
| DEC-015 | Authentication contradiction resolved: existing auth is preserved, not removed | Accepted | TASK-001 review approval |
| DEC-016 | Switch to setup/initial-scaffold branch for setup work | Accepted | TASK-001 review approval |
| DEC-017 | Git history remediation authorized for committed database | Approved (proceed to TASK-002) | TASK-001 review approval |
| DEC-018 | Session secret rotation authorized (move to environment variable) | Approved (proceed to TASK-002) | TASK-001 review approval |
| DEC-019 | Package manager decision pending (npm vs bun reconciliation) | [TBD] | Owner decision |
| DEC-020 | Frontend architecture audit (TASK-003) approved as next step | Approved | TASK-001 review approval |
