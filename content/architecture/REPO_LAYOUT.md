# Canonical Monorepo Layout Specification

This document details the standardized repository layout for `my-product`, providing a one-line purpose for every file and folder in the structure.

---

## Directory Hierarchy & Purpose Index

```text
my-product/
├── AGENTS.md                          # Operating rules, scope limits, and verification instructions for coding agents.
├── CLAUDE.md                          # Claude Code specific tool configuration, memory hooks, and project commands.
├── README.md                          # High-level product overview, quick-start setup, and stakeholder documentation links.
├── .env.example                       # Documented template of required environment variable keys with no real secrets.
├── docker-compose.yml                 # Local development orchestration for database, cache, and supporting services.
│
├── .github/                           # Repository hosting configuration, continuous integration, and community templates.
│   └── workflows/                     # Automated GitHub Actions pipelines for CI, linting, testing, and deployment.
│
├── infra/                             # Infrastructure-as-code definitions (Terraform/OpenTofu, Dockerfiles, cloud configs).
│
├── apps/                              # Deployable application entrypoints and user-facing clients.
│   ├── web/                           # Frontend web application (React, Next.js, UI components, client state).
│   └── api/                           # Backend API server application (HTTP routing, controllers, middleware, server entry).
│
├── packages/                          # Shared reusable internal libraries, schemas, and utility modules.
│
└── docs/                              # Project documentation library and living architectural knowledge base.
    ├── PROJECT.md                     # High-level vision, business problem statement, target persona, and core metrics.
    ├── PRD.md                         # Product requirements document with functional stories and Gherkin acceptance criteria.
    ├── ARCHITECTURE.md                # System component topology, C4 container models, and service boundary definitions.
    ├── PROJECT_PLAN.md                # Milestone schedules, delivery phases, and MoSCoW scope allocations.
    ├── PROJECT_STATUS.md              # Living log of current phase, recent commits, and prioritized next tasks.
    ├── API.md                         # API design conventions, OpenAPI 3.1 specification, and RFC 9457 error contracts.
    ├── DATA_MODEL.md                  # Entity relationship definitions, indexing strategies, and database constraints.
    ├── SECURITY.md                    # STRIDE threat model, vulnerability reporting policy, and security headers guide.
    ├── DEVELOPMENT.md                 # Single-command local environment setup guide, prerequisites, and debug steps.
    ├── DEPLOYMENT.md                  # Release execution playbook, zero-downtime migration steps, and rollback commands.
    └── adr/                           # Architecture Decision Records capturing historical technical trade-offs.
```

---

## Folder Responsibility Matrix

| Path | Purpose & Ownership |
| :--- | :--- |
| `my-product/` | Root repository boundary containing top-level orchestrations, monorepo configs, and guidelines. |
| `AGENTS.md` | Authoritative rules of engagement for autonomous AI coding agents working in the repository. |
| `CLAUDE.md` | Claude Code specific tool integration file setting up environment-specific shell and test triggers. |
| `README.md` | The front door of the repository introducing the product, key links, and team maintainers. |
| `.env.example` | Canonical manifest of all runtime environment variables with dummy values; never contains secrets. |
| `docker-compose.yml` | Spins up local instances of PostgreSQL, Redis, and local mock services with a single command. |
| `.github/workflows/` | Automated CI/CD pipelines enforcing linting, unit tests, security scans, and deployment steps. |
| `infra/` | Cloud provisioning definitions (Terraform/OpenTofu, ECS/Cloud Run task definitions, IAM roles). |
| `apps/web/` | Presentation layer housing responsive user interfaces, accessible forms, and client routing. |
| `apps/api/` | Stateless backend server exposing OpenAPI REST endpoints, auth guards, and transaction wrappers. |
| `packages/` | Internal shared monorepo modules such as shared TypeScript types, validation schemas, and utils. |
| `docs/` | Authoritative documentation directory tracking all requirements, architecture, and living status. |
| `docs/PROJECT.md` | Foundational project charter specifying goals, non-goals, and measurable success outcomes. |
| `docs/PRD.md` | Detailed product specifications with testable Given-When-Then acceptance scenarios for each story. |
| `docs/ARCHITECTURE.md` | Comprehensive system design document outlining C4 models, protocol boundaries, and data flows. |
| `docs/PROJECT_PLAN.md` | Roadmap tracking delivery milestones, weekly sprint targets, and drop-scope fallbacks. |
| `docs/PROJECT_STATUS.md` | Real-time status tracker updated at the end of every agent session to maintain team alignment. |
| `docs/API.md` | REST/RPC interface guide documenting endpoints, parameters, rate limits, and problem detail errors. |
| `docs/DATA_MODEL.md` | Complete database schema documentation with tables, foreign keys, indexes, and nullability rules. |
| `docs/SECURITY.md` | Application security architecture covering authentication, CSP headers, CORS, and threat models. |
| `docs/DEVELOPMENT.md` | Developer onboarding manual with prerequisites, environment setup, and test execution commands. |
| `docs/DEPLOYMENT.md` | Production release runbook covering rolling updates, health check probes, and rollback drills. |
| `docs/adr/` | Immutable log of Architecture Decision Records documenting context, options, and consequences. |
