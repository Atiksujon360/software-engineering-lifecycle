# ADR-002: Future Backend Platform

- **Status:** Accepted direction; implementation deferred.
- **Date:** 2026-10-31.

## Context
The user selected Java Spring Boot instead of Express.js for the future backend and wants practical enterprise backend engineering experience.

## Decision
The future backend direction is Java 21 LTS with Spring Boot 4.x. Module boundaries, build tooling, security configuration, API contracts, and deployment architecture require separate design approval.

## Options considered
1. Java 21 + Spring Boot 4.x.
2. Node.js + Express.js.
3. Other Java frameworks.

## Rejected options
Express.js is not selected for the future backend because the user chose Spring Boot. No backend implementation is authorized in the current frontend documentation phase.

## Consequences
- Existing Express/SQLite files remain untouched.
- Frontend should avoid coupling to Express-specific behavior.
- Future API contracts should be framework-neutral REST/JSON.
- Spring Boot 4.x compatibility, dependencies, and runtime requirements must be verified at implementation time.
