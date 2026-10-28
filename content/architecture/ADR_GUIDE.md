# Architecture Decision Records (ADR) Guide & Canonical Examples

This document contains the standard Architecture Decision Record (ADR) template and three canonical example ADRs for a modern web product:
1. **ADR-001**: Choice of Primary Database
2. **ADR-002**: Choice of Authentication & Identity Provider
3. **ADR-003**: Choice of Deployment Runtime & Cloud Host

---

## Part A: Standard ADR Template

```markdown
# ADR-[NUMBER]: [SHORT DESCRIPTIVE TITLE]

- **Status**: [ Proposed | Accepted | Deprecated | Superseded ]
- **Date**: YYYY-MM-DD
- **Authors**: [Author Name, Role]
- **Reviewers**: [Reviewer Names]

### Context & Problem Statement
What is the business and technical context driving this decision? What are the key constraints, service level objectives, and non-functional requirements?

### Options Considered
1. **Option A: [Approach Name]**
   - Pros: [Key advantages]
   - Cons: [Key drawbacks and trade-offs]
2. **Option B: [Approach Name]**
   - Pros: [Key advantages]
   - Cons: [Key drawbacks and trade-offs]
3. **Option C: [Approach Name]**
   - Pros: [Key advantages]
   - Cons: [Key drawbacks and trade-offs]

### Decision
We chose **Option [X]** because [state primary rationale based on constraints].

### Consequences
- **Positive Impacts**: [Tangible improvements to reliability, velocity, or cost]
- **Negative Trade-offs**: [Accepted technical debt or limitations]
- **Mitigation Strategy**: [Concrete steps to defend against trade-offs]
```

---

## Part B: Canonical Example ADRs

### ADR-001: Choice of Primary Transactional Database

- **Status**: Accepted
- **Date**: 2026-10-15
- **Authors**: Staff Systems Architect
- **Reviewers**: Lead Database Engineer, Backend Tech Lead

#### Context & Problem Statement
The platform requires a primary persistent datastore to handle customer accounts, transactional workflows, billing records, and audit logs. The system must guarantee ACID compliance, support complex relational queries with foreign key constraints, scale to millions of records, and provide zero-downtime migration capabilities.

#### Options Considered
1. **Option A: PostgreSQL 16 (Relational / SQL)**
   - *Pros*: Industry standard for ACID guarantees, mature ecosystem, JSONB document querying, rich index types (B-Tree, GIN, GiST), and strong open-source tooling.
   - *Cons*: Horizontal scaling across multiple geographic regions requires complex read-replica setups.
2. **Option B: MongoDB 7 (Document / NoSQL)**
   - *Pros*: Flexible document schemas, horizontal sharding out of the box, fast developer prototyping for unstructured objects.
   - *Cons*: Weak relational join performance, lack of native strict foreign key referential integrity, and higher risk of schema drift over time.
3. **Option C: DynamoDB (Managed NoSQL Key-Value Store)**
   - *Pros*: Highly available, automatic partition scaling with consistent single-digit millisecond latency.
   - *Cons*: Extreme vendor lock-in to AWS, severe query limitations (no ad-hoc aggregations without complex secondary indexes), and complex multi-table transaction mechanics.

#### Decision
We chose **PostgreSQL 16** as our primary datastore.
Our core domain involves strict financial and workflow invariants that demand relational integrity and ACID transactions. PostgreSQL also provides JSONB support for semi-structured payloads, eliminating the need for a secondary document store.

#### Consequences
- **Positive Impacts**: High data integrity, deterministic transaction isolation, and extensive ecosystem tooling (pgAdmin, Prisma, Drizzle, PgBouncer).
- **Negative Trade-offs**: Vertical scaling limits on single-primary writes; requires active connection pooling.
- **Mitigation Strategy**: Implement PgBouncer connection pooling and enforce read replicas for high-volume analytics queries.

---

### ADR-002: Choice of Authentication & Identity Provider

- **Status**: Accepted
- **Date**: 2026-10-18
- **Authors**: Principal Security Architect
- **Reviewers**: Engineering Manager, Compliance Officer

#### Context & Problem Statement
The application requires user authentication, password hashing, multi-factor authentication (MFA), role-based access control (RBAC), and enterprise Single Sign-On (SSO via SAML/OIDC). Storing credentials in-house introduces severe security risks and substantial regulatory compliance overhead (SOC2, GDPR).

#### Options Considered
1. **Option A: Managed OIDC Provider (e.g. Auth0 / Okta)**
   - *Pros*: Outsourced credential security, out-of-the-box MFA, turnkey SAML/OIDC enterprise federation, and built-in brute-force protection.
   - *Cons*: Ongoing per-MAU subscription costs, vendor dependency during IdP outages.
2. **Option B: Self-Hosted Auth (Custom bcrypt + JWT service in PostgreSQL)**
   - *Pros*: Zero subscription fees, total control over user tables and authentication flows.
   - *Cons*: Massive development and maintenance burden; high risk of cryptographic flaws; team is fully liable for password leaks, reset token race conditions, and compliance audits.
3. **Option C: Firebase Authentication**
   - *Pros*: Rapid setup, generous free tier, seamless client SDK integration.
   - *Cons*: Limited enterprise SAML support without costly upgrade tiers; difficult to integrate with custom self-hosted relational roles without custom claims scripting.

#### Decision
We chose a **Managed OIDC Provider** issuing RS256 signed JSON Web Tokens (JWT).
Outsourcing authentication removes our biggest security vulnerability surface. Backend APIs will verify JWT signatures statelessly using public keys (JWKS) cached in memory.

#### Consequences
- **Positive Impacts**: Immediate SOC2 compliance readiness, turnkey MFA, zero database exposure to hashed passwords, and fast stateless API validation.
- **Negative Trade-offs**: Monthly recurring cost scaling with active users; localized reliance on external IdP token issuance.
- **Mitigation Strategy**: Cache JWKS keys in Redis for 24 hours to insulate API validation from transient IdP network blips; structure user database records using external `sub` identity pointers.

---

### ADR-003: Choice of Deployment Runtime & Cloud Host

- **Status**: Accepted
- **Date**: 2026-10-22
- **Authors**: Principal DevOps Engineer
- **Reviewers**: Staff Architect, Lead Site Reliability Engineer

#### Context & Problem Statement
We need an immutable, cost-effective hosting platform for running our containerized web frontend, API service, and background workers. The environment must support zero-downtime rolling updates, automated TLS certificates, horizontal autoscaling, and private network peering with PostgreSQL and Redis.

#### Options Considered
1. **Option A: Managed Container Platform (Google Cloud Run / AWS ECS Fargate)**
   - *Pros*: Serverless container abstraction; scales to zero during idle periods; zero cluster management toil (no Kubernetes control plane upgrades); native rolling updates and health probe integrations.
   - *Cons*: Cold starts on initial scale-up (< 1.5s); limited custom kernel or network driver tweaks.
2. **Option B: Full Kubernetes Cluster (EKS / GKE)**
   - *Pros*: Complete control over network topologies, service meshes (Istio), daemonsets, and custom ingress controllers.
   - *Cons*: High operational toil requiring dedicated platform engineers; fixed cluster control-plane costs ($70–$150/mo minimum before worker nodes); excessive complexity for our current team size.
3. **Option C: Traditional Virtual Machines (EC2 / Compute Engine with systemd)**
   - *Pros*: Familiar traditional administration, predictable compute costs.
   - *Cons*: High maintenance burden (manual OS patching, custom AMI baking); slow scaling; lack of standardized blue/green deployment orchestration.

#### Decision
We chose **Managed Containers (AWS ECS Fargate / Cloud Run)**.
Fully managed containers give us the immutability of Docker without the immense operational burden and cost of maintaining a dedicated Kubernetes cluster.

#### Consequences
- **Positive Impacts**: Fast deployment cycles, automated health checks and rollbacks, automated multi-AZ distribution, and zero OS patching toil.
- **Negative Trade-offs**: Container cold starts must be monitored and minimized.
- **Mitigation Strategy**: Maintain a minimum replica count of two warmed containers per service in production; optimize Dockerfile multi-stage builds to produce lightweight runner images (< 150MB).
