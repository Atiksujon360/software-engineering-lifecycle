# Project

## Identity
- **Name:** Engineering Lifecycle
- **Repository:** `Atiksujon360/software-engineering-lifecycle`
- **Purpose:** Collaborative project and activity management combining general project execution tracking with an 18-phase software engineering lifecycle playbook.
- **Users:** Project owner and team.
- **Current frontend:** React + Vite + TypeScript.
- **Future backend direction:** Java 21 + Spring Boot 4.x.
- **Future database direction:** PostgreSQL.
- **Current deployment:** Existing Vercel frontend; no deployment change in this setup.

## Core flow
Create/select a project, organize work and activities, use the 18-phase lifecycle where applicable, record progress and deliverables, and review project status across a portfolio.

The product must support both lifecycle-managed software projects and general projects/activities that should not be forced through all 18 phases.

## Success measure
[ASSUMED] A team member can locate a project, understand its current status, identify next actionable work, and review relevant lifecycle evidence in one place. Numeric adoption/productivity target: [TBD].

## Constraints
- Existing repository, not a greenfield rewrite.
- Preserve all 18 lifecycle phases and content.
- Current setup is frontend governance/documentation only.
- Preserve existing Express/SQLite backend; do not modify it in this phase.
- No authentication implementation yet; prepare an integration boundary only.
- GitHub is the only confirmed future integration; exact capabilities [TBD].
- Initial data scope is project/task information only. No customer, health, payment, or secret data.
- No production deployment, push to main, or history rewrite authorized.

## Known unknowns
- Team roles, permissions, invitations, workspace boundaries: [TBD].
- Project/activity types and required fields: [TBD].
- GitHub permissions and workflows: [TBD].
- Authentication provider/session model: [TBD].
- Canonical package manager and lockfile: [TBD].
- Frontend architecture after code audit: [TBD].
- Future backend/database providers: [TBD].
- Data retention, backup, recovery policy: [TBD].
