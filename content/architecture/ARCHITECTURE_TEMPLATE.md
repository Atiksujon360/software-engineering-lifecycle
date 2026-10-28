# System Architecture Reference: Generic Full-Stack Product

This document provides both a reusable architecture specification template and a complete, production-grade example for a modern full-stack web product.

---

## Part A: Architecture Document Template

```markdown
# Architecture Specification: [System Name]

## 1. System Context (C4 Level 1)
- **Users & Personas**: [Who interacts with the system?]
- **External Dependencies**: [Third-party systems, identity providers, notification services]
- **System Boundary**: [What is inside the boundary vs outside?]

## 2. Container Diagram (C4 Level 2)
- **Web App**: [Client application technology, runtime, distribution]
- **API Server**: [Backend application runtime, communication protocols]
- **Database**: [Primary transactional persistence engine]
- **Cache**: [In-memory transient cache and rate limiter]
- **Queue / Message Broker**: [Asynchronous job processing system]
- **Object Storage**: [Blob / media asset storage]
- **Identity Provider (IdP)**: [Authentication token issuer]

## 3. Component Diagram: API Server (C4 Level 3)
- **HTTP / Gateway Layer**: [Routing, CORS, rate limiting, request validation]
- **Authentication & Authorization**: [JWT token verification, RBAC enforcement]
- **Domain Services**: [Pure business logic pipelines]
- **Persistence / Data Access Layer**: [Repositories, ORM/query builders, transaction boundaries]
- **Integration Clients**: [External HTTP/RPC adapters with circuit breakers]

## 4. Primary User Journey Data Flow
- Step-by-step sequence of network requests, validations, cache checks, and database mutations.

## 5. Deployment Topology
- Network isolation, load balancers, container orchestration, multi-AZ reliability.
```

---

## Part B: Filled Example (Acme Cloud Services Platform)

### 1. System Context (C4 Level 1)

The platform provides authenticated business users with automated workflow execution and reporting.

```
[Business Users / Operators]
             │
             ▼ (HTTPS / TLS 1.3)
┌────────────────────────────────────────────────────────┐
│  Acme Cloud Platform (System Boundary)                 │
│                                                        │
│  - Interactive Web Dashboard                           │
│  - Headless REST / JSON API Gateway                    │
│  - Background Asynchronous Workers                     │
│  - Transactional Datastores & Cache                    │
└────────────────────────────────────────────────────────┘
       │                              │
       ▼ (OIDC / OAuth 2.0)           ▼ (S3 API / SMTP)
[External Identity Provider]     [External Object Storage & Mail]
(Auth0 / Okta / Google Workspace) (AWS S3, SendGrid)
```

- **Users**: Operations teams, finance administrators, and end-users.
- **External Dependencies**: OIDC Provider for single sign-on; Object Storage for generated report artifacts; Payment Gateway for billing reconciliation.
- **System Boundary**: Everything inside the Virtual Private Cloud (VPC) network perimeter.

---

### 2. Container Diagram (C4 Level 2)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Virtual Private Cloud (VPC)                                                  │
│                                                                              │
│   ┌─────────────────────┐             ┌───────────────────────────────────┐  │
│   │ Web App             │             │ API Server                        │  │
│   │ (Next.js / React)   │──[HTTPS]───▶│ (Node.js / Express / TypeScript)  │  │
│   │ Edge CDN + SSR Host │             │ Port 3000 / Stateless Containers  │  │
│   └─────────────────────┘             └───────────────────────────────────┘  │
│                                                  │             │             │
│                        ┌─────────────────────────┼─────────────┴────────┐    │
│                        ▼                         ▼                      ▼    │
│             ┌─────────────────────┐    ┌──────────────────┐  ┌─────────────┐ │
│             │ Relational Database │    │ In-Memory Cache  │  │ Task Queue  │ │
│             │ (PostgreSQL 16)     │    │ (Redis 7)        │  │ (BullMQ)    │ │
│             │ Multi-AZ / Port 5432│    │ Cluster / P6379  │  │ Background  │ │
│             └─────────────────────┘    └──────────────────┘  └─────────────┘ │
│                                                                      │       │
│                                                                      ▼       │
│                                                            ┌───────────────┐ │
│                                                            │ Worker Daemon │ │
│                                                            │ (Node.js/TS)  │ │
│                                                            └───────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

1. **Web App (apps/web)**: Next.js with React 19 and TypeScript, deployed behind a global Content Delivery Network. Handles client routing, server-rendered landing pages, and authenticated single-page views.
2. **API Server (apps/api)**: Node.js 22 LTS running TypeScript. Stateless HTTP service mounted behind an Application Load Balancer. Exposes OpenAPI 3.1 REST endpoints.
3. **Database**: PostgreSQL 16 managed database instance with automated failover replica, point-in-time recovery (PITR), and encrypted storage volumes.
4. **Cache & Rate Limiting**: Redis 7 cluster used for session caching, token blacklists, and distributed rate limiting (`RateLimit-Limit`).
5. **Background Task Queue**: Redis-backed BullMQ message queue distributing non-blocking long jobs (PDF rendering, batch reconciliation, webhooks).
6. **Object Storage**: S3-compatible encrypted bucket for user uploads, exports, and immutable audit logs.
7. **Identity Provider**: Central OIDC identity issuer providing signed RS256 JSON Web Tokens (JWT).

---

### 3. Component Diagram: API Server (C4 Level 3)

```
[Incoming HTTP Request: POST /api/v1/orders]
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ 1. Perimeter Security & Routing Layer                  │
│    - Helmet (CSP, HSTS, X-Content-Type-Options)        │
│    - CORS allowlist validation                         │
│    - Global Rate Limiter middleware                    │
└────────────────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ 2. Authentication & Guard Layer                        │
│    - Verify JWT signature against IdP JWKS             │
│    - Extract Tenant ID and User Role                   │
│    - Enforce RBAC permissions matrix                   │
└────────────────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ 3. Request Boundary Validator                          │
│    - Schema validation (Zod/TypeBox)                   │
│    - Rejects malformed payloads with RFC 9457 errors   │
└────────────────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ 4. Order Domain Service (Pure Logic)                   │
│    - Enforce business rules and invariant checks       │
│    - Calculate pricing and tax allocations             │
└────────────────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ 5. Transactional Data Repository                       │
│    - Open ACID Transaction Boundary                    │
│    - Insert order & order_items with foreign keys      │
│    - Enqueue background job to Redis Task Queue        │
│    - Commit Transaction / Automatic Rollback on Error  │
└────────────────────────────────────────────────────────┘
                     │
                     ▼
[HTTP 201 Created + JSON Response]
```

---

### 4. Primary User Journey Data Flow: Create and Process Order

1. **Client Submission**: User submits order form in the Next.js frontend (`apps/web`).
2. **Edge Ingestion**: Request reaches Cloud CDN, terminates TLS 1.3, and routes to API Load Balancer.
3. **Perimeter Inspection**: API Server applies security headers, validates CORS origin, and checks client IP against Redis rate limits.
4. **Authentication**: Auth middleware checks `Authorization: Bearer <token>` against cached JWKS public keys.
5. **Payload Validation**: Zod schema validates incoming request body. If invalid, the handler terminates immediately with an `HTTP 400 Problem Details` (RFC 9457) JSON response.
6. **Domain Execution & Persistence**:
   - `OrderService` opens a PostgreSQL transaction.
   - Calculates totals and writes records to `orders` and `order_items`.
   - Enqueues an `order.created` event payload onto BullMQ Redis queue.
   - Commits PostgreSQL transaction.
7. **Response Returned**: HTTP 201 response with generated order ID and self-referential resource link returned to client in under 80ms.
8. **Asynchronous Fulfillment**: Background worker daemon picks up `order.created` job from Redis queue, generates a PDF invoice, and saves it to Object Storage.

---

### 5. Deployment Topology

- **Network Isolation**: Three-tier subnet architecture (Public DMZ for Load Balancer, Private App Subnet for API and Worker containers, Isolated Database Subnet for PostgreSQL and Redis).
- **Compute Orchestration**: Multi-Availability Zone (Multi-AZ) container deployment with minimum two healthy instances per zone.
- **Zero-Downtime Releases**: Rolling updates using container health probes (`/healthz` and `/readyz`). If newly deployed containers fail readiness probes within 30 seconds, traffic is held on existing instances.
- **Observability**: OpenTelemetry SDK exports traces, metrics, and structured logs to centralized monitoring backend.
