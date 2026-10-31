# ADR-001: Existing Frontend Stack

- **Status:** Accepted for preservation; cleanup recommendation pending audit.
- **Date:** 2026-10-31.

## Context
The existing product is a React + Vite + TypeScript application. The user wants it cleaned and prepared for AI-assisted engineering without an unnecessary rewrite.

## Decision
Retain React, Vite, and TypeScript. Audit the current implementation and recommend maintainable frontend architecture before moving or deleting code. Preserve the 18-phase playbook content.

## Options considered
1. Keep existing React/Vite/TypeScript and improve its structure.
2. Rewrite using a different frontend framework.
3. Replace the application with a new template.

## Rejected options
Options 2 and 3 are rejected for this setup because they introduce unnecessary migration risk and are not requested.

## Consequences
- Existing UI and lifecycle behavior remain the baseline.
- Package manager and dependency hygiene require audit.
- No new frontend dependency is approved by this ADR.
- Component/state architecture remains [TBD] until the audit.
