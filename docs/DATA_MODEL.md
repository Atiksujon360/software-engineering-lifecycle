# Data Model

## Scope and authority
This is a conceptual inventory, not an approved PostgreSQL schema. The current README documents parts of an existing SQLite model. Inspect exact SQL definitions before migration or schema changes.

## Known current logical records
The README refers to:
- `projects`, scoped by `user_id`.
- `project_progress` with `project_id`, `task_id`, `checked`, `updated_at`.
- `phase_notes`, scoped by project/user.
- `project_snapshots`, scoped by project/user.

Exact SQL definitions, column types, nullability, indexes, and foreign keys must be inspected; do not infer them here.

| Entity | Known fields | Types / nullability | Constraints / indexes | Relationships / delete rules |
|---|---|---|---|---|
| Project | `project_id`, `user_id` referenced in README | [TBD] | User scoping described; exact constraints [TBD] | Owner/workspace and delete rules [TBD] |
| Project progress | `project_id`, `task_id`, `checked`, `updated_at` | [TBD] | Per-task progress described; unique key/index [TBD] | Project/task references; delete rules [TBD] |
| Phase note | Project and phase note referenced | [TBD] | [TBD] | Project/phase relationship and delete rule [TBD] |
| Project snapshot | Project snapshot referenced | [TBD] | [TBD] | Project relationship and delete rule [TBD] |
| Workspace | Needed only if approved team model requires it | [TBD] | [TBD] | Membership/ownership [TBD] |
| Team membership | Needed only if approved collaboration model requires it | [TBD] | Roles/uniqueness [TBD] | Workspace/user relationship [TBD] |
| GitHub connection | Future integration concept | [TBD] | Token storage/encryption [TBD] | User/workspace ownership [TBD] |

## Future data rules
- Persist timestamps in UTC; convert timezone at presentation boundaries.
- Identifier type (UUID or other) is [TBD].
- If money is introduced in a separately approved scope, use integer minor units plus ISO currency code. Money is out of scope now.
- Never store access tokens in ordinary project/document records.
- Do not store passwords, production secrets, customer data, or health information in this product scope.
- Do not add personal-data fields without purpose, retention period, and access policy.

## Retention and deletion
- Project/task information: [TBD].
- Account identifiers and membership data, if introduced: [TBD].
- GitHub connection metadata/tokens: [TBD].
- Audit/activity history: [TBD].
- Deletion cascade, archival, export: [TBD].

No database migration or seed data is authorized in this phase.
