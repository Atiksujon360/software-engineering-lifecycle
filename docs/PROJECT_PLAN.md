# Project Plan

## M1 — Foundation
Exit criterion: approved project documentation, audited frontend architecture, reproducible local setup, agreed tooling, baseline CI, and a passing verification report.

- [ ] TASK-001: Review and approve scope, unresolved requirements, and proposed non-functional targets. (PRD-FR-001, PRD-FR-002, PRD-FR-008; S)
- [ ] TASK-002: Resolve public repository security blockers: verify secret rotation and plan Git history remediation for committed data and .aistudio content. (PRD-FR-009; M)
- [ ] TASK-003: Audit frontend routes, components, state, styling, assets, dependencies, tests, and API coupling; recommend architecture without rewriting. (PRD-FR-006, PRD-FR-009; M)
- [ ] TASK-004: Confirm package manager, lockfile, runtime versions, and reproducible development commands. (PRD-FR-009; S)
- [ ] TASK-005: Agree project/activity concepts, team permissions, and data lifecycle before schema design. (PRD-FR-002, PRD-FR-003, PRD-FR-005; M)
- [ ] TASK-006: Approve GitHub integration capabilities, authentication model, and least-privilege permissions. (PRD-FR-007, PRD-FR-008; M)
- [ ] TASK-007: Approve frontend architecture and cleanup plan. (PRD-FR-006, PRD-FR-009; S)
- [ ] TASK-008: Implement approved frontend cleanup and API integration boundary without backend changes. (PRD-FR-006, PRD-FR-009; L)
- [ ] TASK-009: Add approved formatter, lint, typecheck, unit, integration, and E2E tooling. (PRD-FR-009, PRD-FR-010; M)
- [ ] TASK-010: Add CI security and quality gates, PR template, and CODEOWNERS. (PRD-FR-009; M)
- [ ] TASK-011: Verify clean install, checks, smoke tests, secret scan, and Git status. (PRD-FR-001, PRD-FR-009; M)

## M2 — Core flow
Exit criterion: approved project/activity workflows and lifecycle tracking work against an approved API contract and persistence design.

- [ ] TASK-012: Approve project/activity requirements and lifecycle applicability rules. (PRD-FR-002, PRD-FR-004; M)
- [ ] TASK-013: Design and approve team access, authentication, and authorization. (PRD-FR-007; L)
- [ ] TASK-014: Design and approve PostgreSQL data model and migrations. (PRD-FR-003, PRD-FR-004, PRD-FR-005; L)
- [ ] TASK-015: Implement Spring Boot API and persistence baseline after backend scope approval. (PRD-FR-003, PRD-FR-004, PRD-FR-005, PRD-FR-006; L)
- [ ] TASK-016: Integrate frontend project/activity workflows with approved API. (PRD-FR-002, PRD-FR-003, PRD-FR-005, PRD-FR-006; L)

## M3 — Polish
Exit criterion: approved collaboration, GitHub integration, accessibility, performance, and operational requirements are verified.

- [ ] TASK-017: Implement approved GitHub integration with least-privilege scopes. (PRD-FR-008; L)
- [ ] TASK-018: Improve portfolio reporting, usability, and responsive behavior against approved requirements. (PRD-FR-005, PRD-FR-010; M)
- [ ] TASK-019: Verify performance budgets and accessibility expectations. (PRD-FR-010; M)

## M4 — Launch
Exit criterion: production readiness, recovery, security, release ownership, and explicit launch approval are complete.

- [ ] TASK-020: Approve hosting, backup, retention, monitoring, and incident ownership. (PRD-FR-003, PRD-FR-005; M)
- [ ] TASK-021: Complete security review, recovery test, release rehearsal, and production approval. (PRD-FR-007, PRD-FR-008, PRD-FR-009; L)
