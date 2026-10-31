# ADR-003: Future Relational Database

- **Status:** Accepted direction; provider and schema deferred.
- **Date:** 2026-10-31.

## Context
The planned Spring Boot backend needs durable relational persistence for projects, activities, lifecycle progress, and team collaboration.

## Decision
PostgreSQL is the selected future database direction. Managed provider is [TBD]. No PostgreSQL schema or migration is created in this phase.

## Options considered
1. PostgreSQL.
2. Continue with embedded SQLite.
3. A document database.

## Rejected options
SQLite is not selected as the future primary database direction because the intended team-oriented platform needs a managed relational database and future Spring Boot integration. This does not authorize deletion or migration of the existing SQLite database.

## Consequences
- Data model and tenancy boundaries must be approved before migrations.
- Retention, backup, restore, and provider selection remain [TBD].
- Existing SQLite backend remains preserved until a separately approved migration/decommission plan exists.
