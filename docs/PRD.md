# Product Requirements

## Problem
The owner and team need one place for projects, engineering lifecycle evidence, tasks, activities, and progress. The existing repository is an engineering playbook; the target extends it to general project/activity tracking while preserving the 18-phase lifecycle.

## Personas
**Project owner:** Creates and oversees projects and activities, needs portfolio visibility, and wants consistent execution without forcing every activity through the engineering lifecycle.

**Team member:** Collaborates on project work and needs to understand relevant work, status, blockers, and context. Specific permissions and assignment rules are [TBD].

## Must-have functional requirements

### PRD-FR-001 — Preserve lifecycle content
Given the playbook contains 18 phases, when the frontend is cleaned or reorganized, then all 18 phases and their existing content remain available and regression tests continue to pass.

### PRD-FR-002 — Support general projects and activities
Given work may not use the engineering lifecycle, when it is tracked, then the product must not require it to complete all 18 phases. Exact project/activity types are [TBD].

### PRD-FR-003 — Project progress
Given a project has tracked work, when a team member reviews it, then the interface presents recorded progress and its source. Calculation and aggregation rules are [TBD] unless already implemented and approved.

### PRD-FR-004 — Lifecycle tracking
Given a project uses the engineering lifecycle, when a team member opens its lifecycle, then relevant phases and existing playbook guidance are available. Project-specific phase fields are [TBD].

### PRD-FR-005 — Portfolio visibility
Given multiple projects exist, when the owner opens the portfolio view, then a consolidated view is available. Filters, sorting, and status definitions are [TBD].

### PRD-FR-006 — API integration boundary
Given the future backend is Java Spring Boot, when frontend data access is refactored, then network access is isolated behind a documented service/API boundary.

### PRD-FR-007 — Prepare authentication integration
Given authentication is not part of this phase, when the frontend is structured, then future authenticated API integration can be added without embedding credentials or inventing an auth flow.

### PRD-FR-008 — Plan GitHub integration
Given GitHub is the confirmed integration, when requirements are refined, then repository scope, permissions, synchronization, and user actions are agreed before implementation.

### PRD-FR-009 — Preserve behavior
Given the current application has working screens and tracking behavior, when cleanup occurs, then intended behavior remains intact unless explicitly approved for change.

### PRD-FR-010 — Responsive and accessible UI
Given users access supported desktop and mobile viewports, when they use core navigation and project views, then controls remain operable and content readable. Supported viewport range is [TBD].

## Should-have
- Reusable project templates [TBD].
- Cross-project activity timeline [TBD].
- Project documentation and decision records [TBD].
- GitHub repository/issue/PR linking [TBD].
- Export and backup experience [TBD].
- Notifications and reminders [TBD].

## Out of scope for this setup
1. Spring Boot backend implementation.
2. Authentication implementation or changes.
3. PostgreSQL schema or migrations.
4. GitHub OAuth, webhooks, or API synchronization.
5. AI product features or autonomous agents.
6. Rewriting the 18 lifecycle phases/content.
7. Migrating or deleting SQLite data.
8. Git history rewrite or force-push.
9. Production deployment or environment changes.
10. Billing, payments, customer records, or public SaaS tenancy.

## Non-functional targets
Targets are proposals, not measured results.

| Measure | Target | Source |
|---|---:|---|
| LCP | < 2.5 s at p75 | Setup protocol |
| INP | < 200 ms at p75 | Setup protocol |
| CLS | < 0.1 at p75 | Setup protocol |
| Future API p95 | < 300 ms for ordinary reads under agreed load | [ASSUMED] |
| Future API availability | 99.5% monthly | [ASSUMED] |
| Project/task retention | [TBD] | Owner decision |
| Backup RPO | 24 hours | [ASSUMED] |
| Recovery RTO | 8 hours | [ASSUMED] |
| Supported browsers | [TBD] | Owner decision |

## Acceptance notes
- Existing tests and 18-phase content assertions are regression safeguards.
- Targets are not achieved until measured in the relevant environment.
- Requirements with unresolved policy/schema decisions must not be implemented by guessing.
