import { Gate, Phase, ProjectVariable, Task } from '../types';

export const VARIABLES: ProjectVariable[] = [
  {
    key: 'PROJECT_NAME',
    label: 'Project Name',
    hint: 'Short human-readable title or code-name (e.g. Phoenix Billing, Atlas API)',
  },
  {
    key: 'ONE_LINE',
    label: 'One-line Description',
    hint: 'What problem does this solve in a single, crisp sentence?',
  },
  {
    key: 'USERS',
    label: 'Target Users',
    hint: 'Primary persona or audience (e.g. Site reliability engineers, Small business finance)',
  },
  {
    key: 'STACK',
    label: 'Tech Stack',
    hint: 'Frontend, backend, database and cloud (e.g. React 19, TypeScript, PostgreSQL, Docker)',
  },
  {
    key: 'REPO_PATH',
    label: 'Repository Path',
    hint: 'Git repository URL or local monorepo directory (e.g. github.com/acme/phoenix)',
  },
  {
    key: 'TIMEFRAME',
    label: 'Timeframe & Milestones',
    hint: 'Delivery schedule, target release date or sprint duration (e.g. 6-week MVP, Q4 release)',
  },
];

export const GATES: Gate[] = [
  {
    id: 'G1',
    after: 3,
    title: 'Scope locked',
    text: 'MVP boundaries, core user journeys, non-goals, and measurable success criteria are formally signed off. No unapproved features may enter development.',
  },
  {
    id: 'G2',
    after: 8,
    title: 'Build complete',
    text: 'Frontend components and backend services are fully implemented, connected via contracts, and verified working locally without mocked data.',
  },
  {
    id: 'G3',
    after: 12,
    title: 'Production readiness',
    text: 'Security audits, automated test suites (unit, integration, e2e), code reviews, and performance load budgets all meet release acceptance thresholds.',
  },
  {
    id: 'G4',
    after: 14,
    title: 'Deployment verified',
    text: 'CI/CD pipelines pass automatically, production deployment executed, health checks green, and smoke test suites verify live environments.',
  },
];

export const PHASES: Phase[] = [
  // ===================== DEFINE GROUP =====================
  {
    id: 0,
    group: 'define',
    title: 'Orientation',
    short: 'Orientation',
    tagline: 'Set boundaries, align stakeholders, and baseline repository hygiene.',
    goal: 'Establish the project scope, technical ground rules, team ownership, and baseline repository workspace before drafting requirements.',
    outputs: [
      'Project charter with explicit scope bounds and non-goals',
      'Team ownership and stakeholder roster with approval matrix',
      'Repository initialized with licensing, contributing guide, and toolchain versions',
    ],
    tasks: [
      {
        id: 'p0-1',
        text: 'Draft the project charter stating target audience, core problem, and hard non-goals',
        doneWhen: 'Charter is documented in docs/charter.md and approved by engineering and product leads.',
      },
      {
        id: 'p0-2',
        text: 'Initialize Git repository with standard branch protection rules and .gitignore',
        doneWhen: 'Main branch requires pull requests, status checks pass, and secret patterns are ignored.',
      },
      {
        id: 'p0-3',
        text: 'Document runtime prerequisites, node/compiler engine pins, and package manager lockfile',
        doneWhen: 'engines field in package.json and .tool-versions or .nvmrc match team environment.',
      },
      {
        id: 'p0-4',
        text: 'Define stakeholder contact roster and decision escalation pathways',
        doneWhen: 'RACI matrix or team README lists product owner, tech lead, and security reviewer.',
      },
      {
        id: 'p0-5',
        text: 'Establish development environment setup guide and single-command local bootstrap',
        doneWhen: 'A new engineer can clone and successfully execute bootstrap script within 15 minutes.',
      },
    ],
    existing: [
      {
        id: 'p0-x1',
        text: 'Audit existing git history, active branches, and stale unmerged pull requests',
        doneWhen: 'Stale branches older than 60 days are cataloged and dead code branches archived.',
      },
      {
        id: 'p0-x2',
        text: 'Run automated dependency vulnerability audit on inherited package manifests',
        doneWhen: 'Critical and high CVE vulnerabilities are identified with documented mitigation plans.',
      },
      {
        id: 'p0-x3',
        text: 'Map legacy codebase architecture, undocumented dependencies, and undocumented runtime services',
        doneWhen: 'Architecture diagram reflects actual running components, cron jobs, and shared data stores.',
      },
      {
        id: 'p0-x4',
        text: 'Verify local build and test execution from a fresh checkout without developer overrides',
        doneWhen: 'Clean repository clone compiles and existing test suite executes with zero failures.',
      },
      {
        id: 'p0-x5',
        text: 'Inventory third-party API keys, environment credentials, and production secret sprawl',
        doneWhen: 'All credentials identified, moved to a secure vault, and removed from commit history.',
      },
      {
        id: 'p0-x6',
        text: 'Check license compliance of inherited dependencies and proprietary dependencies',
        doneWhen: 'Dependency license report generated and verified against organization legal policy.',
      },
      {
        id: 'p0-x7',
        text: 'Benchmark baseline test coverage and identify critical untracked business paths',
        doneWhen: 'Baseline coverage report generated and top three untested high-risk workflows documented.',
      },
      {
        id: 'p0-x8',
        text: 'Document legacy technical debt backlog with severity rankings and migration impact',
        doneWhen: 'Technical debt catalog created with estimated effort and priority in project tracker.',
      },
    ],
    prompts: [
      {
        id: 'pr-0-1',
        title: 'Project Kickoff & Charter Generator',
        role: 'Staff Systems Architect',
        template: `You are a Staff Systems Architect planning "{{PROJECT_NAME}}".
Context:
- One-line summary: {{ONE_LINE}}
- Target users: {{USERS}}
- Technology stack: {{STACK}}
- Target timeframe: {{TIMEFRAME}}

Generate a formal engineering project charter including:
1. Executive Problem Statement
2. Target Persona & User Pain Points
3. Primary Technical Objectives (SMART criteria)
4. Explicit Out-of-Scope (Non-Goals) list
5. High-level Architecture Tenets
6. Initial Risk & Mitigation Matrix`,
        expectedOutput: 'A structured markdown document ready for docs/charter.md with clear boundary definitions.',
      },
      {
        id: 'pr-0-2',
        title: 'Existing Codebase Triage Prompt',
        role: 'Principal Refactoring Engineer',
        template: `You are reviewing an existing legacy codebase for "{{PROJECT_NAME}}" located at {{REPO_PATH}}.
Stack: {{STACK}}.
Users: {{USERS}}.

Analyze the codebase intake checklist and create a triage report detailing:
1. Recommended dependency modernization strategy
2. Secret scanning and credential rotation sequence
3. Critical regression test strategy before making any modifications
4. Phased technical debt remediation roadmap`,
        expectedOutput: 'A 4-step triage and stabilization plan prioritizing business continuity and safety.',
      },
    ],
    notes: [
      'Resist the temptation to start coding before writing down non-goals; scope creep is cheapest to kill during Orientation.',
      'Always enforce branch protection rules immediately on repository creation. It prevents accidental pushes to main.',
    ],
    resources: [
      {
        title: 'The Twelve-Factor App Methodology',
        url: 'https://12factor.net/',
        source: '12factor.net',
        description: 'Foundational principles for building clean, maintainable, cloud-native applications.',
      },
      {
        title: 'Conventional Commits Specification',
        url: 'https://www.conventionalcommits.org/en/v1.0.0/',
        source: 'Conventional Commits',
        description: 'Standard convention for commit messages to automate semantic versioning and changelogs.',
      },
    ],
    skills: [
      {
        id: 'sk-0',
        name: 'Technical Governance & Scope Triage',
        level: 'Core',
        description: 'Ability to define project boundaries, evaluate legacy technical debt, and enforce repository standards.',
      },
    ],
  },

  {
    id: 1,
    group: 'define',
    title: 'Idea validation',
    short: 'Validation',
    tagline: 'Confirm user demand, evaluate alternatives, and quantify problem urgency.',
    goal: 'Validate that the proposed software solves a genuine, painful problem with real demand before committing engineering resources.',
    outputs: [
      'Problem validation summary with quotes from target users',
      'Competitive landscape analysis matrix with differentiation points',
      'Feasibility evaluation report confirming technical viability',
    ],
    tasks: [
      {
        id: 'p1-1',
        text: 'Conduct at least 5 discovery interviews with real prospective users representing {{USERS}}',
        doneWhen: 'User interview transcripts and synthesis synthesis matrix documented in docs/research/.',
      },
      {
        id: 'p1-2',
        text: 'Map current user workarounds and evaluate the financial or operational cost of inaction',
        doneWhen: 'Calculated cost-of-delay or manual effort quantification written in validation memo.',
      },
      {
        id: 'p1-3',
        text: 'Create competitive alternative matrix comparing 3 direct or indirect competitors',
        doneWhen: 'Matrix compares feature sets, pricing models, and key architectural limitations.',
      },
      {
        id: 'p1-4',
        text: 'Draft high-level value proposition and elevator pitch tied to measurable outcomes',
        doneWhen: 'Elevator pitch articulates target persona, distinct differentiator, and primary metric.',
      },
      {
        id: 'p1-5',
        text: 'Conduct technical feasibility spike to de-risk any unproven third-party APIs or libraries',
        doneWhen: 'Spike proof-of-concept repository branch confirms viable latency and pricing viability.',
      },
    ],
    prompts: [
      {
        id: 'pr-1-1',
        title: 'Customer Discovery Script & Question Generator',
        role: 'Product Discovery Specialist',
        template: `You are designing a customer discovery protocol for "{{PROJECT_NAME}}".
Target audience: {{USERS}}
Problem context: {{ONE_LINE}}

Generate a structured 30-minute user interview guide with:
1. Non-leading warmup questions to establish user context
2. Five open-ended questions exploring their existing workflow and painful friction points
3. Questions measuring current financial/time costs of manual workarounds
4. Red flags and false positives to watch for during responses`,
        expectedOutput: 'A clean interview guide prioritizing Mom Test principles (no pitching, focus on past actions).',
      },
      {
        id: 'pr-1-2',
        title: 'Competitive Differentiator Matrix',
        role: 'Competitive Strategy Analyst',
        template: `Analyze the market landscape for "{{PROJECT_NAME}}" serving {{USERS}}.
One-line summary: {{ONE_LINE}}
Tech stack: {{STACK}}

Identify the 3 closest alternative products or standard manual workflows.
Provide a comparison table detailing:
- Strengths and core target persona
- Friction points and user complaints
- Pricing/cost friction
- The "unfair advantage" or unique value proposition {{PROJECT_NAME}} must exploit`,
        expectedOutput: 'A structured markdown comparison table and summary of defensible product moats.',
      },
    ],
    notes: [
      'Never ask users "Would you use an app that does X?". Ask "Tell me about the last time you dealt with X and how you handled it."',
      'If users currently solve the problem with spreadsheets or ad-hoc scripts, that is proof of demand—build on their mental model.',
    ],
    resources: [
      {
        title: 'DORA Research & Accelerate State of DevOps',
        url: 'https://dora.dev/research/',
        source: 'DORA',
        description: 'Rigorous data on product alignment, delivery velocity, and software outcome measurement.',
      },
      {
        title: 'GitHub Search for Open Source Prototypes',
        url: 'https://github.com/search?q=open+source+product+validation+template',
        source: 'GitHub',
        description: 'Explore existing open-source approaches and community tools addressing similar challenges.',
      },
    ],
    skills: [
      {
        id: 'sk-1',
        name: 'User Research & Problem Formulation',
        level: 'Core',
        description: 'Interviewing practitioners, identifying behavioral signals, and avoiding confirmation bias.',
      },
    ],
  },

  {
    id: 2,
    group: 'define',
    title: 'Requirements',
    short: 'Requirements',
    tagline: 'Translate user needs into precise, unambiguous functional and non-functional specifications.',
    goal: 'Specify clear user stories with testable acceptance criteria, explicit system constraints, and non-functional service level expectations.',
    outputs: [
      'Product Requirements Document (PRD) with user stories',
      'Acceptance criteria written in Gherkin Given-When-Then format',
      'Non-Functional Requirements (NFR) specification covering performance and security',
    ],
    tasks: [
      {
        id: 'p2-1',
        text: 'Document end-to-end user journeys for primary persona in {{USERS}}',
        doneWhen: 'User journey diagrams or step-by-step workflow maps checked into docs/requirements/.',
      },
      {
        id: 'p2-2',
        text: 'Author functional user stories with explicit Given-When-Then acceptance criteria',
        doneWhen: 'All core epics have acceptance criteria that QA or automated tests can directly assert.',
      },
      {
        id: 'p2-3',
        text: 'Establish quantifiable Non-Functional Requirements for latency, uptime, and throughput',
        doneWhen: 'Target 99th percentile response time, target availability, and peak concurrent users documented.',
      },
      {
        id: 'p2-4',
        text: 'Define internationalization, accessibility tier (WCAG 2.2 AA), and browser support matrix',
        doneWhen: 'Supported screen viewports, accessibility standard, and evergreen browser list specified.',
      },
      {
        id: 'p2-5',
        text: 'Review requirements with engineering, design, and business stakeholders for ambiguity',
        doneWhen: 'Sign-off recorded in PRD change history with zero unresolved open questions.',
      },
    ],
    prompts: [
      {
        id: 'pr-2-1',
        title: 'Gherkin User Story Specifier',
        role: 'Senior Product Requirements Engineer',
        template: `For "{{PROJECT_NAME}}" ({{ONE_LINE}}), target audience {{USERS}}:
Break down the primary user workflow into 3 detailed user stories.
For each story specify:
1. Title and Story statement: "As a [role], I want to [action], so that [outcome]"
2. Preconditions and edge cases
3. At least 3 scenarios formatted in strict Gherkin syntax:
   Scenario: [Happy path / Validation error / Failure recovery]
   Given [precondition]
   When [user action]
   Then [expected verifiable system response]`,
        expectedOutput: 'Executable Gherkin scenarios ready for automated test specifications or engineering tickets.',
      },
      {
        id: 'pr-2-2',
        title: 'Non-Functional Requirements (NFR) Generator',
        role: 'Principal Reliability Architect',
        template: `Generate a Non-Functional Requirements (NFR) contract for "{{PROJECT_NAME}}" built with {{STACK}}.
Users: {{USERS}}.
Target timeframe: {{TIMEFRAME}}.

Specify concrete numeric thresholds for:
1. Performance: P50, P95, and P99 API latency limits
2. Availability & Reliability: SLA/SLO percentages, MTBF, MTTR
3. Security & Compliance: Authentication rules, encryption in transit and at rest
4. Accessibility: WCAG 2.2 Level AA compliance checkpoints
5. Scalability: Initial capacity vs 10x surge expectations`,
        expectedOutput: 'A formal NFR document table with metric, target threshold, measurement tool, and alert trigger.',
      },
    ],
    notes: [
      'Ambiguity in requirements multiplies in cost by 10x in development and 100x in production. Clarify edge cases now.',
      'Always specify error states and empty states in requirements; apps spend substantial user time in zero-data states.',
    ],
    resources: [
      {
        title: 'W3C Web Content Accessibility Guidelines (WCAG) 2.2',
        url: 'https://www.w3.org/TR/WCAG22/',
        source: 'W3C WCAG 2.2',
        description: 'Authoritative web accessibility standard covering contrast, keyboard navigation, and aria semantics.',
      },
      {
        title: 'RFC 9457: Problem Details for HTTP APIs',
        url: 'https://datatracker.ietf.org/doc/html/rfc9457',
        source: 'RFC 9457',
        description: 'Standardized format for carrying machine-readable details of errors in HTTP response messages.',
      },
    ],
    skills: [
      {
        id: 'sk-2',
        name: 'Specification & Acceptance Engineering',
        level: 'Core',
        description: 'Writing unambiguous user stories, formalizing Gherkin scenarios, and setting numeric NFR targets.',
      },
    ],
  },

  {
    id: 3,
    group: 'define',
    title: 'MVP planning',
    short: 'MVP Plan',
    tagline: 'Ruthlessly cut non-essentials to create a razor-sharp, deliverable first version.',
    goal: 'Establish the minimal feature set required to prove value, lock scope against inflation, and pass Gate G1.',
    outputs: [
      'MoSCoW feature prioritization breakdown (Must, Should, Could, Wont)',
      'Milestone breakdown aligned with {{TIMEFRAME}}',
      'Signed Gate G1 scope lock agreement',
    ],
    gate: GATES[0],
    tasks: [
      {
        id: 'p3-1',
        text: 'Classify all proposed features into strict MoSCoW tiers (Must have vs Won’t have)',
        doneWhen: 'Feature list contains no more than 3 to 5 Must-have epics for the initial release.',
      },
      {
        id: 'p3-2',
        text: 'Define the "Happy Path" that delivers the core value proposition in under 3 minutes',
        doneWhen: 'End-to-end critical user flow is visually diagrammed with step counts minimized.',
      },
      {
        id: 'p3-3',
        text: 'Establish delivery milestones, weekly demo check-ins, and fallback drop-scope candidates',
        doneWhen: 'Milestone roadmap published with designated buffer sprints before target launch.',
      },
      {
        id: 'p3-4',
        text: 'Calculate team capacity, eliminate single-point-of-failure skill bottlenecks, and assign leads',
        doneWhen: 'Every critical epic has a designated primary engineer and secondary peer reviewer.',
      },
      {
        id: 'p3-5',
        text: 'Formally review and lock MVP scope to complete Gate G1 requirements',
        doneWhen: 'Tech lead and product sponsor approve scope lock; any new requests require formal change log.',
      },
    ],
    prompts: [
      {
        id: 'pr-3-1',
        title: 'MVP Ruthless Scope Cutter',
        role: 'Veteran Lean Startup CTO',
        template: `Review the scope for "{{PROJECT_NAME}}".
Description: {{ONE_LINE}}
Target users: {{USERS}}
Target timeframe: {{TIMEFRAME}}

You must aggressively cut scope to guarantee on-time delivery.
1. Identify the ONE core job-to-be-done that justifies this app's existence.
2. List 5 features that seem tempting but must be labeled "WON'T HAVE FOR MVP".
3. Provide the minimal viable workflow that delivers measurable utility.
4. Establish the fallback plan if development runs 25% behind schedule.`,
        expectedOutput: 'A concise scope triage document defining the minimal atomic MVP and explicit deferred features.',
      },
      {
        id: 'pr-3-2',
        title: 'Milestone & Sprint Cadence Planner',
        role: 'Agile Delivery Lead',
        template: `Design a milestone schedule for "{{PROJECT_NAME}}" fitting into timeframe: {{TIMEFRAME}}.
Tech stack: {{STACK}}.

Structure the roadmap into 4 milestone checkpoints:
- Milestone 1: Core domain logic & data storage proof
- Milestone 2: Interactive end-to-end user journey
- Milestone 3: Hardening, security review & edge cases
- Milestone 4: Release dry-run & production handover
For each milestone, define the demoable deliverable and pass criteria.`,
        expectedOutput: 'A 4-stage delivery plan with concrete demonstration criteria for each sprint review.',
      },
    ],
    notes: [
      'If you are not slightly embarrassed by the first version of your product, you launched too late.',
      'Gate G1 is a firewall: once scope is locked, any new feature request requires dropping an equivalent-effort Must-have.',
    ],
    resources: [
      {
        title: 'Google SRE Book - Managing Risk & Service Objectives',
        url: 'https://sre.google/sre-book/table-of-contents/',
        source: 'Google SRE',
        description: 'Industry-standard guidelines on defining service expectations, risk budgets, and release criteria.',
      },
      {
        title: 'GitHub Search for MVP Planning Templates',
        url: 'https://github.com/search?q=mvp+planning+checklist+software+engineering',
        source: 'GitHub',
        description: 'Templates and open tools for engineering sprint planning and milestone governance.',
      },
    ],
    skills: [
      {
        id: 'sk-3',
        name: 'Scope Triage & MoSCoW Prioritization',
        level: 'Core',
        description: 'Balancing time-to-market constraints against engineering perfectionism and user value.',
      },
    ],
  },

  {
    id: 4,
    group: 'define',
    title: 'System architecture',
    short: 'Architecture',
    tagline: 'Design modular, decoupled components with resilient boundaries and clear communication contracts.',
    goal: 'Formulate an architecture that balances simplicity, operational cost, fault tolerance, and developer velocity.',
    outputs: [
      'Architecture Decision Records (ADRs) for top technical choices',
      'System component diagram illustrating boundaries, protocols, and data flow',
      'Failure mode and threat modeling analysis for distributed boundaries',
    ],
    tasks: [
      {
        id: 'p4-1',
        text: 'Document high-level component topology (clients, edge, services, workers, persistent storage)',
        doneWhen: 'Component diagram committed in docs/architecture/diagrams with protocol labels.',
      },
      {
        id: 'p4-2',
        text: 'Draft Architecture Decision Records (ADRs) for stack selection ({{STACK}}) and state handling',
        doneWhen: 'ADRs follow the Michael Nygard format detailing context, decision, and consequences.',
      },
      {
        id: 'p4-3',
        text: 'Define authentication, authorization, and tenant isolation architecture',
        doneWhen: 'Auth boundary, token lifecycle, and permission enforcement points are documented.',
      },
      {
        id: 'p4-4',
        text: 'Establish error handling standards, timeout budgets, and exponential backoff strategies',
        doneWhen: 'Network clients implement uniform timeouts, circuit breakers, and idempotency keys.',
      },
      {
        id: 'p4-5',
        text: 'Audit third-party SaaS and external library dependencies for operational risk and lock-in',
        doneWhen: 'All external integrations have documented fallback behaviors for vendor outages.',
      },
      {
        id: 'p4-6',
        text: 'Conduct architecture peer review session with senior engineers outside the immediate team',
        doneWhen: 'Review notes logged in docs/architecture/review.md with all action items closed.',
      },
    ],
    prompts: [
      {
        id: 'pr-4-1',
        title: 'Architecture Decision Record (ADR) Drafter',
        role: 'Principal Software Architect',
        template: `Draft a formal Architecture Decision Record (ADR) for "{{PROJECT_NAME}}".
Tech stack: {{STACK}}
System context: {{ONE_LINE}}

Structure the ADR following standard format:
1. Title: [e.g. ADR-001: Adoption of Client-side State vs Server State]
2. Status: Proposed / Accepted
3. Context: What technical and operational constraints drove this choice?
4. Options Considered: (List at least 3 alternatives with pros/cons)
5. Decision: What is the chosen path and why?
6. Consequences: Positive impacts, negative trade-offs, and mitigation strategies.`,
        expectedOutput: 'A complete, production-ready markdown ADR formatted for the repository docs/adr/ folder.',
      },
      {
        id: 'pr-4-2',
        title: 'Failure Mode & System Resilience Analyzer',
        role: 'Site Reliability Engineering Specialist',
        template: `Analyze potential systemic failure modes for "{{PROJECT_NAME}}" with stack {{STACK}}.
Users: {{USERS}}.

Map out failure scenarios for:
1. Database connectivity loss or sudden 10x read replica lag
2. External 3rd party API outage or 5-second latency spikes
3. Client network disconnection and reconnection reconciliation
4. Memory exhaustion under unexpected payload sizes
For each failure mode, prescribe the exact architectural defensive pattern to prevent cascading collapse.`,
        expectedOutput: 'A resilience matrix pairing failure points with specific defensive design patterns.',
      },
    ],
    notes: [
      'Choose boring technology where possible; save novelty budget for the core domain value of the application.',
      'Document not just what you decided, but the alternatives you rejected and why. Future teams will thank you.',
    ],
    resources: [
      {
        title: 'Architecture Decision Records (ADR) Standard',
        url: 'https://github.com/search?q=architecture+decision+record+template+nygard',
        source: 'GitHub',
        description: 'Standard repository patterns for capturing architecture decisions and architectural evolution.',
      },
      {
        title: 'Google SRE Book - Distributed Systems Reliability',
        url: 'https://sre.google/sre-book/addressing-cascading-failures/',
        source: 'Google SRE',
        description: 'Strategies for preventing cascading failures, managing deadlines, and shedding load gracefully.',
      },
    ],
    skills: [
      {
        id: 'sk-4',
        name: 'Distributed Architecture & Fault Modeling',
        level: 'Advanced',
        description: 'Structuring decoupled software systems, designing resilient boundaries, and authoring ADRs.',
      },
    ],
  },

  {
    id: 5,
    group: 'define',
    title: 'Database design',
    short: 'Database',
    tagline: 'Model clean entities, define indexing strategies, and establish migration protocols.',
    goal: 'Create an optimized, normalized data model that enforces referential integrity, scales gracefully, and supports schema evolution.',
    outputs: [
      'Entity Relationship Diagram (ERD) or schema specification',
      'Database migration scripts with forward and backward compatibility',
      'Index strategy plan and query performance benchmarks',
    ],
    tasks: [
      {
        id: 'p5-1',
        text: 'Design entity schema with primary keys, foreign key constraints, and nullability rules',
        doneWhen: 'Schema DDL or ORM schema file passes validation without circular dependencies.',
      },
      {
        id: 'p5-2',
        text: 'Analyze query access patterns and design compound indexes for high-frequency filters',
        doneWhen: 'Index strategy documented with EXPLAIN ANALYZE verification plans for top queries.',
      },
      {
        id: 'p5-3',
        text: 'Establish automated database migration tooling with forward and backward rollbacks',
        doneWhen: 'Migration runner executes up and down scripts in test suite with zero data corruption.',
      },
      {
        id: 'p5-4',
        text: 'Define soft-deletion, audit logging, and temporal tracking columns (created_at, updated_at)',
        doneWhen: 'Audit trail strategy is standardized across all business-critical domain tables.',
      },
      {
        id: 'p5-5',
        text: 'Implement realistic seed data scripts for local development and continuous integration',
        doneWhen: 'Running the db seed command populates realistic fixtures representing {{USERS}}.',
      },
    ],
    prompts: [
      {
        id: 'pr-5-1',
        title: 'Relational Schema & DDL Generator',
        role: 'Principal Database Architect',
        template: `Design the production database schema for "{{PROJECT_NAME}}".
Context: {{ONE_LINE}}
Stack: {{STACK}}
Key user types: {{USERS}}

Generate the complete schema specification including:
1. SQL DDL or ORM models with types, primary keys (UUID vs BigInt), foreign keys, and indexes
2. Cascade delete vs restrict rules
3. Indexes for top 3 read queries (with multi-column index ordering explained)
4. Timestamps and audit trail columns
5. Recommended database migration strategy for zero-downtime updates`,
        expectedOutput: 'Production-grade SQL or ORM schema with complete column constraints and index annotations.',
      },
      {
        id: 'pr-5-2',
        title: 'Zero-Downtime Migration Guide',
        role: 'Data Platform Engineer',
        template: `For "{{PROJECT_NAME}}" running on {{STACK}}:
Explain how to execute a zero-downtime database migration for:
- Renaming a high-traffic column
- Adding a NOT NULL constraint with default value on a large table
- Splitting a table into two without taking the application offline
Provide the step-by-step expand-and-contract deployment sequence.`,
        expectedOutput: 'A phased expand-contract migration playbook preventing table locks and downtime.',
      },
    ],
    notes: [
      'Every foreign key should almost certainly have an index on the referencing table to prevent table scans on joins and deletes.',
      'Never run schema migrations that drop or rename columns in the same release that changes the application code using them.',
    ],
    resources: [
      {
        title: 'OWASP SQL Injection Prevention Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
        source: 'OWASP',
        description: 'Parameterized queries and security hardening rules for database operations.',
      },
      {
        title: 'PostgreSQL Official Documentation',
        url: 'https://www.postgresql.org/docs/current/index.html',
        source: 'Official Docs',
        description: 'Definitive reference for transactions, indexing, concurrency, and constraint enforcement.',
      },
    ],
    skills: [
      {
        id: 'sk-5',
        name: 'Relational Modeling & Query Optimization',
        level: 'Core',
        description: 'Data normalization, index design, transaction isolation levels, and migration safety.',
      },
    ],
  },

  {
    id: 6,
    group: 'define',
    title: 'API design',
    short: 'API Design',
    tagline: 'Craft consistent, self-describing interfaces following modern protocol standards.',
    goal: 'Standardize API endpoints, error payloads, pagination, authentication headers, and OpenAPI documentation.',
    outputs: [
      'OpenAPI 3.1 specification or type-safe RPC contract',
      'RFC 9457 compliant error handling schema',
      'API versioning and breaking change governance document',
    ],
    tasks: [
      {
        id: 'p6-1',
        text: 'Author OpenAPI 3.1 contract covering all MVP endpoints, parameters, and payloads',
        doneWhen: 'OpenAPI specification passes linter (Spectral) with zero errors or warnings.',
      },
      {
        id: 'p6-2',
        text: 'Standardize error payloads using RFC 9457 Problem Details format (type, title, status, detail, instance)',
        doneWhen: 'All non-2xx responses conform to application/problem+json schema with field error arrays.',
      },
      {
        id: 'p6-3',
        text: 'Implement uniform cursor-based pagination and sorting conventions for list endpoints',
        doneWhen: 'List endpoints use limit and cursor query params and return next_cursor pointers.',
      },
      {
        id: 'p6-4',
        text: 'Define idempotency key header protocol (Idempotency-Key) for mutating operations',
        doneWhen: 'POST/PATCH endpoints store and honor cached responses for duplicate client keys.',
      },
      {
        id: 'p6-5',
        text: 'Establish API rate limiting headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)',
        doneWhen: 'Rate limit middleware returns 429 Too Many Requests with retry-after header.',
      },
      {
        id: 'p6-6',
        text: 'Generate client TypeScript bindings directly from the API schema contract',
        doneWhen: 'Client application imports auto-generated types without manual type duplication.',
      },
    ],
    prompts: [
      {
        id: 'pr-6-1',
        title: 'OpenAPI 3.1 Contract Author',
        role: 'Principal API Architect',
        template: `Author an OpenAPI 3.1 specification for "{{PROJECT_NAME}}".
Context: {{ONE_LINE}}
Tech stack: {{STACK}}

Generate API specs for the core resources:
1. RESTful URL conventions using plural nouns and nested relationships
2. RFC 9457 Problem Details error schema component
3. Cursor-based pagination metadata schema
4. Request and response schema examples for GET, POST, and PATCH
5. Bearer JWT security scheme definition`,
        expectedOutput: 'A clean, valid OpenAPI 3.1 YAML document adhering strictly to REST best practices.',
      },
      {
        id: 'pr-6-2',
        title: 'RFC 9457 Error Response Implementer',
        role: 'API Standards Specialist',
        template: `Write an RFC 9457 Problem Details error handling utility for "{{PROJECT_NAME}}" in {{STACK}}.
Requirements:
- HTTP 400 Bad Request with field-level validation errors
- HTTP 401 Unauthorized / 403 Forbidden
- HTTP 404 Not Found
- HTTP 429 Rate Limit Exceeded
- HTTP 500 Internal Error (with sanitized trace ID, no leak of stack traces)
Provide both the TypeScript interfaces and the Express/Fastify/Next middleware handler.`,
        expectedOutput: 'Production-ready error middleware returning application/problem+json payloads.',
      },
    ],
    notes: [
      'Use nouns for resource paths and HTTP verbs for actions. Avoid verbs in URLs like /api/create-user.',
      'Never leak database stack traces or SQL errors in client API responses; use internal correlation IDs.',
    ],
    resources: [
      {
        title: 'RFC 9457 - Problem Details for HTTP APIs',
        url: 'https://datatracker.ietf.org/doc/html/rfc9457',
        source: 'RFC 9457',
        description: 'Standardized format for carrying machine-readable details of errors in HTTP response messages.',
      },
      {
        title: 'MDN Web Docs - HTTP Status Codes',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status',
        source: 'MDN',
        description: 'Comprehensive guide to HTTP semantics, cache headers, and status code behavior.',
      },
    ],
    skills: [
      {
        id: 'sk-6',
        name: 'RESTful API & Contract-First Design',
        level: 'Core',
        description: 'OpenAPI authoring, RFC 9457 error contracts, idempotency, and semantic versioning.',
      },
    ],
  },

  // ===================== BUILD GROUP =====================
  {
    id: 7,
    group: 'build',
    title: 'Frontend',
    short: 'Frontend',
    tagline: 'Build accessible, responsive, high-performance user interfaces with clean state separation.',
    goal: 'Implement the user interface with semantic markup, robust accessibility, responsive mobile viewports, and predictable state management.',
    outputs: [
      'Responsive UI component library matching design tokens',
      'Accessible navigation with keyboard and screen reader support',
      'Client-side state architecture with offline or error recovery',
    ],
    tasks: [
      {
        id: 'p7-1',
        text: 'Configure design tokens (paper, surface, ink, muted, line, cobalt, green, amber, red)',
        doneWhen: 'CSS custom properties are centralized and support light, dark, and auto themes.',
      },
      {
        id: 'p7-2',
        text: 'Implement semantic HTML structure with landmark regions (<header>, <nav>, <main>, <footer>)',
        doneWhen: 'Lighthouse accessibility audit passes with score >= 95 with zero missing landmarks.',
      },
      {
        id: 'p7-3',
        text: 'Enforce visible keyboard focus rings and skip-to-content navigation links',
        doneWhen: 'Every interactive element is fully operable via Tab key with distinct focus outline.',
      },
      {
        id: 'p7-4',
        text: 'Build responsive layouts verified down to 390px mobile viewport without horizontal scrolling',
        doneWhen: 'Mobile viewport test at 390x844 renders clean stacked layouts with zero overflow.',
      },
      {
        id: 'p7-5',
        text: 'Wire up client forms with explicit <label> associations and live validation error feedback',
        doneWhen: 'All form inputs have matching htmlFor attributes and aria-describedby for errors.',
      },
      {
        id: 'p7-6',
        text: 'Implement optimistic UI updates, loading skeletons, and empty state fallbacks',
        doneWhen: 'Zero jarring layout shifts (CLS < 0.05) during asynchronous data fetching.',
      },
    ],
    prompts: [
      {
        id: 'pr-7-1',
        title: 'Accessible Component & Keyboard Navigation Builder',
        role: 'Staff Frontend Engineer & A11y Advocate',
        template: `Build an accessible, responsive dashboard view for "{{PROJECT_NAME}}".
Stack: {{STACK}}
Audience: {{USERS}}

Requirements:
1. Strict semantic HTML5 without gratuitous <div> nesting
2. WCAG 2.2 Level AA compliance: contrast ratios >= 4.5:1, aria-expanded on disclosures
3. Responsive design adapting gracefully from 390px to 1440px+
4. Full keyboard navigation (Tab, Enter, Space, Escape)
5. Plain CSS using CSS custom properties (--paper, --surface, --ink, --line, --cobalt)`,
        expectedOutput: 'Production-ready React TypeScript components with clean accessibility hooks.',
      },
      {
        id: 'pr-7-2',
        title: 'Client State & Optimistic Mutation Flow',
        role: 'Frontend Systems Architect',
        template: `Design the client-side state and caching layer for "{{PROJECT_NAME}}" using {{STACK}}.
Explain:
1. How to handle local optimistic updates with automatic rollback on server error
2. Global toast notification queue with aria-live="polite"
3. Offline recovery and localStorage synchronizer
4. Preventing race conditions when rapid search queries are typed`,
        expectedOutput: 'A clean state management architecture pattern with code samples and error boundaries.',
      },
    ],
    notes: [
      'Never rely solely on color to convey state or validation errors; always pair color with text icons or labels.',
      'Test your UI with keyboard only: unplug your mouse and verify you can navigate and submit every screen.',
    ],
    resources: [
      {
        title: 'W3C Web Accessibility Initiative (WAI-ARIA) Practices',
        url: 'https://www.w3.org/WAI/ARIA/apg/',
        source: 'W3C WCAG 2.2',
        description: 'Design patterns and implementation guidelines for accessible keyboard navigation and ARIA widgets.',
      },
      {
        title: 'MDN Web Docs - Responsive Web Design Basics',
        url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design',
        source: 'MDN',
        description: 'Modern viewport meta rules, CSS grid, flexbox, and fluid typography.',
      },
    ],
    skills: [
      {
        id: 'sk-7',
        name: 'Accessible UI & Frontend Performance',
        level: 'Core',
        description: 'Semantic HTML, WCAG 2.2 compliance, responsive CSS layouts, and client state machines.',
      },
    ],
  },

  {
    id: 8,
    group: 'build',
    title: 'Backend',
    short: 'Backend',
    tagline: 'Develop robust, scalable server services with input validation and transaction safety.',
    goal: 'Build server-side endpoints, business logic pipelines, database integrations, and pass Gate G2 Build Complete.',
    outputs: [
      'Production API server implementation with route handlers',
      'Validation middleware guarding all incoming payloads',
      'Signed Gate G2 Build Complete milestone',
    ],
    gate: GATES[1],
    tasks: [
      {
        id: 'p8-1',
        text: 'Implement route controllers and business domain logic for all MVP endpoints',
        doneWhen: 'All endpoints return correct HTTP status codes and payloads per OpenAPI specification.',
      },
      {
        id: 'p8-2',
        text: 'Enforce strict runtime input validation on all request bodies, params, and headers',
        doneWhen: 'Schema validation rejects malformed payloads with RFC 9457 error messages before logic executes.',
      },
      {
        id: 'p8-3',
        text: 'Implement database transaction wrappers for multi-table mutation workflows',
        doneWhen: 'Database transactions roll back cleanly on any internal failure, preventing orphan rows.',
      },
      {
        id: 'p8-4',
        text: 'Add structured JSON logging with request ID tracing and duration metrics',
        doneWhen: 'Every incoming request outputs a structured log line containing correlation trace ID.',
      },
      {
        id: 'p8-5',
        text: 'Implement graceful shutdown handler trapping SIGTERM and SIGINT signals',
        doneWhen: 'Server completes in-flight requests and closes database connection pools before exit.',
      },
      {
        id: 'p8-6',
        text: 'Verify full frontend-to-backend integration and pass Gate G2 Build Complete review',
        doneWhen: 'End-to-end user journeys execute in local environment without any mock stubs.',
      },
    ],
    prompts: [
      {
        id: 'pr-8-1',
        title: 'Domain Service & Transactional Handler Generator',
        role: 'Principal Backend Engineer',
        template: `Implement the core business domain service for "{{PROJECT_NAME}}" on {{STACK}}.
One-line purpose: {{ONE_LINE}}
Target users: {{USERS}}

Generate the backend implementation including:
1. Controller layer with strict input validation schema
2. Service layer handling business rules and invariant checks
3. Repository/database layer with ACID transaction boundaries
4. Uniform error throwing mapping directly to HTTP status codes`,
        expectedOutput: 'Production-ready backend controller and service code with strict typing and transactions.',
      },
      {
        id: 'pr-8-2',
        title: 'Graceful Shutdown & Connection Pool Manager',
        role: 'Systems Infrastructure Engineer',
        template: `Write a production-grade graceful shutdown and lifecycle manager for {{STACK}} in "{{PROJECT_NAME}}".
Address:
1. Intercepting SIGTERM and SIGINT from container orchestrators
2. Stopping new incoming connections while allowing active requests to finish (with timeout budget)
3. Closing database connection pools and Redis cache clients cleanly
4. Flushing telemetry and log buffers before process exit`,
        expectedOutput: 'A bulletproof Node.js/Go/Python lifecycle handler code snippet.',
      },
    ],
    notes: [
      'Always validate and sanitize input at the perimeter; never trust that frontend validation was executed.',
      'Pass Gate G2 only when the actual frontend talks to the actual backend with real database queries.',
    ],
    resources: [
      {
        title: 'OWASP REST Security Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html',
        source: 'OWASP',
        description: 'Input validation, transport security, HTTP methods, and status code best practices.',
      },
      {
        title: '12-Factor App - Process Concurrency & Disposability',
        url: 'https://12factor.net/disposability',
        source: '12factor.net',
        description: 'Maximize robustness with fast startup and graceful shutdown handling.',
      },
    ],
    skills: [
      {
        id: 'sk-8',
        name: 'Backend Architecture & Transaction Safety',
        level: 'Core',
        description: 'REST/RPC servers, request validation, transaction isolation, and graceful lifecycle management.',
      },
    ],
  },

  {
    id: 9,
    group: 'build',
    title: 'Security',
    short: 'Security',
    tagline: 'Hardening defenses, preventing OWASP Top 10 risks, and enforcing least privilege.',
    goal: 'Identify vulnerabilities, secure secrets, enforce authentication headers, and audit third-party dependency supply chains.',
    outputs: [
      'OWASP Top 10 threat model and vulnerability audit report',
      'Security headers configuration (CSP, HSTS, CORS)',
      'Automated secret scanning and Software Bill of Materials (SBOM)',
    ],
    tasks: [
      {
        id: 'p9-1',
        text: 'Configure strict HTTP security headers (Content-Security-Policy, HSTS, X-Content-Type-Options)',
        doneWhen: 'SecurityHeaders.com audit returns an A or A+ rating on staging environment.',
      },
      {
        id: 'p9-2',
        text: 'Audit codebase for OWASP Top 10 risks (SQLi, XSS, CSRF, SSRF, Broken Access Control)',
        doneWhen: 'Static analysis security testing (SAST) tool runs in CI with zero high or critical flags.',
      },
      {
        id: 'p9-3',
        text: 'Implement tight Cross-Origin Resource Sharing (CORS) allowlists with no wildcards on credentials',
        doneWhen: 'CORS config explicitly restricts origins to trusted domains and forbids Access-Control-Allow-Origin: *.',
      },
      {
        id: 'p9-4',
        text: 'Automate dependency supply chain scanning and Dependabot alerts',
        doneWhen: 'Automated scanner blocks CI pipelines if dependencies contain unpatched critical CVEs.',
      },
      {
        id: 'p9-5',
        text: 'Verify secret zero-leak policy (pre-commit git hooks, environment variable isolation)',
        doneWhen: 'TruffleHog / git-secrets hook prevents commits containing API keys, private keys, or tokens.',
      },
      {
        id: 'p9-6',
        text: 'Conduct automated and manual privilege escalation penetration testing on role-based routes',
        doneWhen: 'Attempted access with unauthorized user tokens returns HTTP 403 and logs security alert.',
      },
    ],
    prompts: [
      {
        id: 'pr-9-1',
        title: 'OWASP Threat Modeling & Attack Surface Reviewer',
        role: 'Principal Application Security Architect',
        template: `Perform an OWASP Top 10 security audit for "{{PROJECT_NAME}}".
Tech stack: {{STACK}}
Description: {{ONE_LINE}}
Users: {{USERS}}

Analyze the attack surface across:
1. Broken Object Level Authorization (BOLA/IDOR): Can User A access User B's resource?
2. Injection vulnerabilities (SQL, NoSQL, command injection)
3. Cross-Site Scripting (XSS) & Content Security Policy (CSP) directives
4. Cross-Site Request Forgery (CSRF) & SameSite cookie attributes
5. Security misconfiguration and exposed debug routes
Provide concrete remediation code snippets for each risk.`,
        expectedOutput: 'A prioritized vulnerability mitigation plan with exact header and code patches.',
      },
      {
        id: 'pr-9-2',
        title: 'Strict Content-Security-Policy (CSP) Generator',
        role: 'Web Security Specialist',
        template: `Generate a strict Content-Security-Policy (CSP) and security headers configuration for "{{PROJECT_NAME}}" on {{STACK}}.
Directives needed:
- default-src, script-src, style-src, img-src, connect-src, frame-ancestors
- Strict-Transport-Security (HSTS) with max-age=31536000 and includeSubDomains
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy`,
        expectedOutput: 'Production HTTP response header middleware ready to drop into the web server.',
      },
    ],
    notes: [
      'Never store sensitive tokens or API credentials in localStorage where client XSS scripts can exfiltrate them.',
      'Security is not a checkbox at the end of the sprint; it is an invariant baked into every architectural boundary.',
    ],
    resources: [
      {
        title: 'OWASP Top 10 Web Application Security Risks',
        url: 'https://owasp.org/www-project-top-ten/',
        source: 'OWASP',
        description: 'Industry consensus standard on the most critical security vulnerabilities facing web applications.',
      },
      {
        title: 'OWASP Cross-Site Scripting (XSS) Prevention Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
        source: 'OWASP',
        description: 'Guidelines for context-aware encoding, DOM sanitization, and CSP defense-in-depth.',
      },
    ],
    skills: [
      {
        id: 'sk-9',
        name: 'Application Security & Threat Modeling',
        level: 'Advanced',
        description: 'Defensive coding, CSP construction, authentication hardening, and SAST/DAST automation.',
      },
    ],
  },

  {
    id: 10,
    group: 'build',
    title: 'Testing',
    short: 'Testing',
    tagline: 'Automate fast unit tests, deterministic integration tests, and end-to-end smoke verification.',
    goal: 'Construct a resilient testing pyramid that catches regressions early and provides fast feedback during development.',
    outputs: [
      'Automated test suite (unit, integration, e2e)',
      'Code coverage report with quality gate thresholds',
      'Continuous Integration test runner configuration',
    ],
    tasks: [
      {
        id: 'p10-1',
        text: 'Decouple pure domain business logic and write fast-running unit tests',
        doneWhen: 'Unit test suite runs in under 3 seconds using built-in test runners without external services.',
      },
      {
        id: 'p10-2',
        text: 'Build integration tests verifying database interactions and API route contracts',
        doneWhen: 'Integration tests run against isolated test containers with fresh transaction rollbacks.',
      },
      {
        id: 'p10-3',
        text: 'Implement end-to-end (E2E) smoke tests covering the critical user journey for {{USERS}}',
        doneWhen: 'Headless browser automation executes key workflow in CI and passes consistently.',
      },
      {
        id: 'p10-4',
        text: 'Add negative test cases asserting proper error codes on invalid inputs and auth failures',
        doneWhen: 'All edge cases and 4xx status codes are explicitly asserted in automated test suites.',
      },
      {
        id: 'p10-5',
        text: 'Establish minimum coverage threshold (>= 80% line coverage on core business logic)',
        doneWhen: 'CI pipeline automatically fails pull requests that drop domain test coverage.',
      },
      {
        id: 'p10-6',
        text: 'Implement deterministic test fixtures and mock external payment/email third parties',
        doneWhen: 'Test runs are 100% deterministic and never hit live production external networks.',
      },
    ],
    prompts: [
      {
        id: 'pr-10-1',
        title: 'Fast Unit Test Suite Generator',
        role: 'Test-Driven Development Specialist',
        template: `Write comprehensive unit tests for the domain rules of "{{PROJECT_NAME}}" using {{STACK}}.
One-line summary: {{ONE_LINE}}

Requirements:
1. Pure calculation/logic decoupling from UI and network
2. Node:test or Vitest test runner assertions
3. Boundary value analysis (zero values, max limits, negative values, null/undefined)
4. Deterministic tests executing in under 100ms total`,
        expectedOutput: 'Clean TypeScript test suite with zero external mock flakiness.',
      },
      {
        id: 'pr-10-2',
        title: 'End-to-End User Journey Test Plan',
        role: 'Quality Assurance Architect',
        template: `Design an end-to-end testing script using Playwright for "{{PROJECT_NAME}}".
Users: {{USERS}}.
Happy Path: {{ONE_LINE}}.

Specify:
1. Page navigation and authentication flow
2. Form filling and submission assertions
3. Accessibility checks during flow execution
4. Visual snapshot or DOM state assertions confirming success`,
        expectedOutput: 'Executable Playwright test script covering the critical end-to-end user journey.',
      },
    ],
    notes: [
      'Flaky tests are worse than no tests because they erode team trust; delete or quarantine flaky tests immediately.',
      'Test behaviors and business outcomes, not internal implementation details or private component methods.',
    ],
    resources: [
      {
        title: 'Playwright Browser Automation & Testing Documentation',
        url: 'https://playwright.dev/docs/intro',
        source: 'Official Docs',
        description: 'Modern end-to-end testing, visual regression, and accessibility testing framework.',
      },
      {
        title: 'DORA Metric - Automated Testing Velocity',
        url: 'https://dora.dev/capabilities/continuous-testing/',
        source: 'DORA',
        description: 'Research insights on how continuous automated testing drives delivery performance and stability.',
      },
    ],
    skills: [
      {
        id: 'sk-10',
        name: 'Test Pyramid Design & Automated Verification',
        level: 'Core',
        description: 'Unit testing, API contract tests, mock management, and E2E browser automation.',
      },
    ],
  },

  {
    id: 11,
    group: 'build',
    title: 'Code review',
    short: 'Code Review',
    tagline: 'Maintain team standards, catch blind spots, and foster shared codebase ownership.',
    goal: 'Establish structured peer review practices, pull request templates, and automated linter quality gates.',
    outputs: [
      'Standard Pull Request (PR) checklist and GitHub template',
      'Automated linting and formatting configuration in CI',
      'Team code review etiquette and response time SLA',
    ],
    tasks: [
      {
        id: 'p11-1',
        text: 'Configure automated linting, formatting (Prettier/Biome), and TypeScript strict checking',
        doneWhen: 'Pre-commit hooks and CI reject any code with lint errors or unformatted files.',
      },
      {
        id: 'p11-2',
        text: 'Deploy GitHub pull request template with checklist for tests, security, and docs',
        doneWhen: '.github/pull_request_template.md prompts authors for risk assessments and test proof.',
      },
      {
        id: 'p11-3',
        text: 'Establish PR size rule: limit PRs to under 400 lines of code to preserve review depth',
        doneWhen: 'Team handbook documents PR sizing guidelines and incremental commit practices.',
      },
      {
        id: 'p11-4',
        text: 'Conduct review focusing on architecture, edge cases, error handling, and performance',
        doneWhen: 'Reviewers check algorithmic complexity, database queries, and accessibility impact.',
      },
      {
        id: 'p11-5',
        text: 'Enforce two-person review sign-off on security-critical or database migration PRs',
        doneWhen: 'GitHub CODEOWNERS file designates mandatory approvals for sensitive directory paths.',
      },
    ],
    prompts: [
      {
        id: 'pr-11-1',
        title: 'Senior Engineer Code Review Checklist Generator',
        role: 'Staff Quality Engineer',
        template: `Generate a comprehensive Pull Request review checklist for "{{PROJECT_NAME}}" on {{STACK}}.
Include criteria across 5 pillars:
1. Correctness: Does it solve the stated requirements without side-effects?
2. Security: Injection, authorization checks, secret exposure, data validation.
3. Performance: N+1 queries, memory leaks, unneeded re-renders, bundle size impact.
4. Maintainability: Clear naming, test coverage, self-documenting code.
5. Observability: Structured logs, error propagation, metrics.`,
        expectedOutput: 'A markdown PR template ready for .github/pull_request_template.md.',
      },
      {
        id: 'pr-11-2',
        title: 'AI Code Review Prompt for Pull Requests',
        role: 'Automated Code Auditor',
        template: `You are reviewing a pull request for "{{PROJECT_NAME}}" located at {{REPO_PATH}}.
Review the diff and report:
1. Potential race conditions or concurrency issues
2. Unhandled null, undefined, or promise rejection errors
3. Deviations from clean architecture and domain separation
4. Missing unit tests for newly introduced branching paths
Format feedback constructively with clear code patch recommendations.`,
        expectedOutput: 'Structured, constructive code review comments with inline diff suggestions.',
      },
    ],
    notes: [
      'Automate everything that can be automated (linting, types, format) so human reviewers can focus on logic and architecture.',
      'Small PRs are reviewed thoroughly; huge PRs receive a rubber-stamp LGTM. Keep changes bite-sized.',
    ],
    resources: [
      {
        title: 'Google Engineering Practices - Code Review Developer Guide',
        url: 'https://google.github.io/eng-practices/review/',
        source: 'Official Docs',
        description: 'Google standard guide for conducting and receiving effective software code reviews.',
      },
      {
        title: 'Conventional Commits Standard',
        url: 'https://www.conventionalcommits.org/en/v1.0.0/',
        source: 'Conventional Commits',
        description: 'Standardized commit format enabling automated semantic versioning and changelog generation.',
      },
    ],
    skills: [
      {
        id: 'sk-11',
        name: 'Peer Review & Code Hygiene',
        level: 'Core',
        description: 'Constructive review etiquette, identifying subtle logic bugs, and enforcing style standards.',
      },
    ],
  },

  {
    id: 12,
    group: 'build',
    title: 'Performance',
    short: 'Performance',
    tagline: 'Benchmark load capacity, optimize bundle weight, and eliminate latency bottlenecks.',
    goal: 'Audit system performance under load, minimize bundle payloads, optimize database queries, and pass Gate G3.',
    outputs: [
      'Lighthouse performance and Web Vitals audit report',
      'Load testing results under expected peak concurrent traffic',
      'Signed Gate G3 Production Readiness milestone',
    ],
    gate: GATES[2],
    tasks: [
      {
        id: 'p12-1',
        text: 'Benchmark Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms) on target devices',
        doneWhen: 'Lighthouse desktop and mobile audits score >= 90 across all Web Vitals metrics.',
      },
      {
        id: 'p12-2',
        text: 'Analyze production client bundle size and implement code-splitting and tree-shaking',
        doneWhen: 'Initial JavaScript bundle size over the wire is under 150KB gzipped/brotli.',
      },
      {
        id: 'p12-3',
        text: 'Audit database queries with EXPLAIN ANALYZE to identify and eliminate slow table scans',
        doneWhen: 'Top 10 most frequent database queries execute in under 10ms at P95 in staging.',
      },
      {
        id: 'p12-4',
        text: 'Execute load test simulating 2x peak expected concurrent users from {{USERS}}',
        doneWhen: 'Load test report confirms zero 5xx errors and P99 latency within NFR thresholds.',
      },
      {
        id: 'p12-5',
        text: 'Audit memory usage, leak indicators, and garbage collection pauses under continuous traffic',
        doneWhen: 'Sustained 60-minute stress test shows flat memory profile with no unbounded heap growth.',
      },
    ],
    prompts: [
      {
        id: 'pr-12-1',
        title: 'Web Vitals & Bundle Optimization Plan',
        role: 'Principal Web Performance Engineer',
        template: `Analyze the frontend performance profile of "{{PROJECT_NAME}}" on {{STACK}}.
Provide a concrete optimization strategy for:
1. Largest Contentful Paint (LCP): Font preloading, critical CSS, hero image compression
2. Cumulative Layout Shift (CLS): Explicit image dimensions, font display swaps
3. Interaction to Next Paint (INP): Debouncing high-frequency events, task chunking
4. Bundle size reduction: Code-splitting routes, dynamic imports for heavy modal dialogs.`,
        expectedOutput: 'A prioritized performance checklist with code examples for Vite and modern bundlers.',
      },
      {
        id: 'pr-12-2',
        title: 'Load Testing Script & Capacity Modeling',
        role: 'Performance Testing Specialist',
        template: `Create a load testing plan using k6 for "{{PROJECT_NAME}}".
Context: {{ONE_LINE}}
Target user volume: {{USERS}}

Generate a k6 testing script that:
1. Simulates realistic user ramp-up (50 -> 250 -> 500 virtual users)
2. Executes authenticated browsing, search, and form mutation
3. Asserts threshold criteria: P95 latency < 400ms and HTTP failure rate < 0.1%
4. Logs custom metric rates for business-critical transactions.`,
        expectedOutput: 'An executable k6 JavaScript script ready for automated load benchmarking.',
      },
    ],
    notes: [
      'Premature optimization is the root of all evil, but late optimization of unindexed queries is the root of production outages.',
      'Always test performance on throttled CPU and 4G network profiles, not just your high-end development machine.',
    ],
    resources: [
      {
        title: 'Google Web Vitals Documentation',
        url: 'https://web.dev/explore/metrics',
        source: 'Official Docs',
        description: 'Google official guidance for measuring LCP, CLS, INP, and real-user performance.',
      },
      {
        title: 'Google SRE Book - Managing Load & Throttling',
        url: 'https://sre.google/sre-book/handling-overload/',
        source: 'Google SRE',
        description: 'Principles for graceful degradation, client-side throttling, and load shedding.',
      },
    ],
    skills: [
      {
        id: 'sk-12',
        name: 'Performance Profiling & Capacity Engineering',
        level: 'Advanced',
        description: 'Core Web Vitals tuning, heap memory analysis, k6 load testing, and query optimization.',
      },
    ],
  },

  // ===================== SHIP GROUP =====================
  {
    id: 13,
    group: 'ship',
    title: 'CI/CD',
    short: 'CI/CD',
    tagline: 'Automate build verification, test pipelines, and continuous deployment workflows.',
    goal: 'Establish fully automated Continuous Integration and Continuous Delivery pipelines that release code with high confidence.',
    outputs: [
      'GitHub Actions or CI pipeline workflow configuration',
      'Automated preview environments for pull requests',
      'Container image build and vulnerability scanning pipeline',
    ],
    tasks: [
      {
        id: 'p13-1',
        text: 'Configure automated CI pipeline running linting, type checks, and unit tests on every PR',
        doneWhen: 'CI pipeline executes in under 5 minutes with parallel job matrix and caching.',
      },
      {
        id: 'p13-2',
        text: 'Implement automated preview environments (ephemeral URLs) for each pull request',
        doneWhen: 'Pull requests post an active, isolated preview URL for stakeholder acceptance testing.',
      },
      {
        id: 'p13-3',
        text: 'Build container images with multi-stage Dockerfiles and minimal unprivileged base images',
        doneWhen: 'Container builds run as non-root user and pass Trivy vulnerability scan in CI.',
      },
      {
        id: 'p13-4',
        text: 'Automate semantic versioning and changelog generation using Conventional Commits',
        doneWhen: 'Merging to main automatically cuts GitHub releases and tags semver versions.',
      },
      {
        id: 'p13-5',
        text: 'Configure secret injection into deployment runners without exposing credentials in logs',
        doneWhen: 'CI runner uses short-lived OIDC tokens or IAM workload identity without long-lived keys.',
      },
    ],
    prompts: [
      {
        id: 'pr-13-1',
        title: 'Production GitHub Actions Workflow Generator',
        role: 'DevOps & CI/CD Architect',
        template: `Generate a production GitHub Actions CI/CD workflow for "{{PROJECT_NAME}}" on {{STACK}}.
Workflow requirements:
1. Trigger on pull requests and pushes to main
2. Parallel jobs: lint/typecheck, unit tests, and security dependency scan
3. Dependency caching for fast turnaround (< 3 minutes)
4. Multi-stage container build and push to container registry
5. Automatic deployment trigger to staging/production on merge.`,
        expectedOutput: 'A complete, hardened .github/workflows/deploy.yml file adhering to GitHub security best practices.',
      },
      {
        id: 'pr-13-2',
        title: 'Multi-Stage Dockerfile Generator',
        role: 'Container Security Specialist',
        template: `Write a hardened, multi-stage Dockerfile for "{{PROJECT_NAME}}" using {{STACK}}.
Requirements:
1. Builder stage with compilation and devDependencies
2. Production runner stage with minimal distroless or alpine base image
3. Non-root user execution (USER node or nonroot)
4. dumb-init or proper signal forwarding
5. Minimal image footprint and Docker layer caching optimization.`,
        expectedOutput: 'An optimized Dockerfile and matching .dockerignore file ready for production.',
      },
    ],
    notes: [
      'Never store long-lived cloud provider credentials in CI secrets; use OpenID Connect (OIDC) identity federation.',
      'Keep CI pipeline duration under 10 minutes; longer feedback loops cause engineers to context-switch away.',
    ],
    resources: [
      {
        title: 'DORA Metric - Deployment Frequency & Lead Time',
        url: 'https://dora.dev/capabilities/continuous-delivery/',
        source: 'DORA',
        description: 'Proven strategies for high-performing software delivery teams adopting continuous delivery.',
      },
      {
        title: 'GitHub Search for Production CI/CD Actions',
        url: 'https://github.com/search?q=github+actions+production+ci+cd+template',
        source: 'GitHub',
        description: 'Production-tested workflow examples for web and backend deployment pipelines.',
      },
    ],
    skills: [
      {
        id: 'sk-13',
        name: 'CI/CD Pipelines & Infrastructure as Code',
        level: 'Core',
        description: 'GitHub Actions, multi-stage containerization, OIDC authentication, and preview deployments.',
      },
    ],
  },

  {
    id: 14,
    group: 'ship',
    title: 'Deployment',
    short: 'Deployment',
    tagline: 'Execute zero-downtime releases, verify health probes, and complete Gate G4.',
    goal: 'Deploy software to staging and production environments safely with automated health checks, rollbacks, and Gate G4 sign-off.',
    outputs: [
      'Staging and Production environments provisioned and verified',
      'Automated health check probes (/healthz, /readyz)',
      'Signed Gate G4 Deployment Verified milestone',
    ],
    gate: GATES[3],
    tasks: [
      {
        id: 'p14-1',
        text: 'Provision production infrastructure using Infrastructure as Code (Terraform/CloudFormation)',
        doneWhen: 'Infrastructure definitions committed in repo and reproducible with zero manual clicks.',
      },
      {
        id: 'p14-2',
        text: 'Implement liveness (/healthz) and readiness (/readyz) HTTP health probe endpoints',
        doneWhen: 'Readiness probe checks database connection and returns 503 during warm-up.',
      },
      {
        id: 'p14-3',
        text: 'Configure blue/green or rolling zero-downtime deployment strategy',
        doneWhen: 'Deployments swap traffic without dropping a single active customer HTTP connection.',
      },
      {
        id: 'p14-4',
        text: 'Verify SSL/TLS certificates, DNS propagation, and CDN edge caching rules',
        doneWhen: 'HTTPS is enforced with A+ SSL Labs rating and custom domain resolves worldwide.',
      },
      {
        id: 'p14-5',
        text: 'Execute automated post-deployment smoke tests and verify Gate G4 acceptance criteria',
        doneWhen: 'Live production smoke tests pass completely and Gate G4 deployment milestone is locked.',
      },
    ],
    prompts: [
      {
        id: 'pr-14-1',
        title: 'Production Readiness Health Probe Implementer',
        role: 'Infrastructure & Kubernetes Engineer',
        template: `Implement liveness and readiness probe endpoints for "{{PROJECT_NAME}}" on {{STACK}}.
Specifications:
1. /healthz (Liveness): Quick check ensuring process is alive and responsive
2. /readyz (Readiness): Deep check verifying database pool connectivity, cache availability, and queue readiness
3. Timeout handling to prevent probe deadlocks
4. Security: Hide internal database credentials while exposing actionable status.`,
        expectedOutput: 'Production-ready health check controller with proper status codes and error insulation.',
      },
      {
        id: 'pr-14-2',
        title: 'Zero-Downtime Rollout & Rollback Playbook',
        role: 'Site Reliability Engineering Lead',
        template: `Author a zero-downtime rollout and rollback procedure for "{{PROJECT_NAME}}".
Tech stack: {{STACK}}
Audience: {{USERS}}

Detail:
1. Pre-flight verification checklist before initiating deployment
2. Rolling update or blue/green switch traffic protocol
3. Immediate automated rollback triggers (e.g. 5xx rate > 1% over 2 minutes)
4. Step-by-step manual abort sequence for on-call engineers.`,
        expectedOutput: 'A concise, battle-tested deployment runbook ready for operations teams.',
      },
    ],
    notes: [
      'A release is not complete when code lands on the server; it is complete when smoke tests pass and metrics are steady.',
      'Always have an automated rollback plan tested in staging before triggering production deployment.',
    ],
    resources: [
      {
        title: 'Google SRE Book - Release Engineering Principles',
        url: 'https://sre.google/sre-book/release-engineering/',
        source: 'Google SRE',
        description: 'Best practices for reproducible builds, rapid release cadence, and safe deployment strategies.',
      },
      {
        title: '12-Factor App - Admin Processes and Environment Parity',
        url: 'https://12factor.net/dev-prod-parity',
        source: '12factor.net',
        description: 'Keep development, staging, and production as similar as possible to eliminate environment bugs.',
      },
    ],
    skills: [
      {
        id: 'sk-14',
        name: 'Cloud Infrastructure & Zero-Downtime Releases',
        level: 'Advanced',
        description: 'IaC provisioning, blue/green deployments, DNS management, and health probe design.',
      },
    ],
  },

  {
    id: 15,
    group: 'ship',
    title: 'Monitoring',
    short: 'Monitoring',
    tagline: 'Track Golden Signals, configure alerting thresholds, and establish incident triage.',
    goal: 'Instrument full-stack observability with structured metrics, distributed tracing, alerting, and on-call runbooks.',
    outputs: [
      'Golden Signals dashboard (Latency, Traffic, Errors, Saturation)',
      'Alerting policy with PagerDuty / notification channels',
      'Incident management runbook and escalation directory',
    ],
    tasks: [
      {
        id: 'p15-1',
        text: 'Instrument the Four Golden Signals (Latency, Traffic, Errors, and Saturation)',
        doneWhen: 'Real-time telemetry dashboard displays live metrics broken down by endpoint and status.',
      },
      {
        id: 'p15-2',
        text: 'Configure centralized error reporting (Sentry/Bugsnag) with source maps uploaded',
        doneWhen: 'Client and server exceptions capture stack traces, breadcrumbs, and release tags.',
      },
      {
        id: 'p15-3',
        text: 'Establish high-severity alerting rules (P1: site down, P2: elevated 5xx error rate)',
        doneWhen: 'Alerts route to on-call paging service with actionable runbook URLs attached.',
      },
      {
        id: 'p15-4',
        text: 'Set up synthetic uptime monitoring pinging the application every 60 seconds from multiple regions',
        doneWhen: 'Public uptime monitor confirms 99.9% availability and notifies channel on downtime.',
      },
      {
        id: 'p15-5',
        text: 'Document incident response runbook and on-call rotation roster',
        doneWhen: 'Runbook outlines triage steps, severity definitions, and customer communication templates.',
      },
    ],
    prompts: [
      {
        id: 'pr-15-1',
        title: 'Observability & Golden Signals Metric Architect',
        role: 'Site Reliability Engineering Architect',
        template: `Design the observability and telemetry dashboard for "{{PROJECT_NAME}}" on {{STACK}}.
Users: {{USERS}}
Purpose: {{ONE_LINE}}

Specify exact metrics for the Four Golden Signals:
1. Latency: P50, P95, P99 by route and external dependency
2. Traffic: Requests per second (RPS) and concurrent active connections
3. Errors: HTTP 5xx error rate percentage and unhandled promise rejections
4. Saturation: CPU, memory utilization, and database connection pool saturation
Include Prometheus query examples or cloud metric definitions.`,
        expectedOutput: 'A complete dashboard specification and alert threshold configuration.',
      },
      {
        id: 'pr-15-2',
        title: 'Incident Response & On-Call Runbook Generator',
        role: 'Incident Management Commander',
        template: `Create an emergency incident response runbook for "{{PROJECT_NAME}}".
Include:
1. Incident Severity Definitions (SEV-1 Critical Outage vs SEV-2 Degraded Performance)
2. Immediate triage protocol (Assessment, Containment, Communication, Remediation)
3. Internal stakeholder and customer status page notification templates
4. Post-Incident Review (PIR) blameless post-mortem framework.`,
        expectedOutput: 'A battle-ready incident runbook formatted for docs/runbooks/incident-response.md.',
      },
    ],
    notes: [
      'Alert on symptoms that affect users (e.g. high 5xx error rates, high latency), not underlying causes (e.g. CPU spikes).',
      'Every alert that rings an engineer at night must be actionable; if an alert requires no action, delete it.',
    ],
    resources: [
      {
        title: 'Google SRE Book - Monitoring Distributed Systems',
        url: 'https://sre.google/sre-book/monitoring-distributed-systems/',
        source: 'Google SRE',
        description: 'The definitive guide to the Four Golden Signals, alerting design, and monitoring philosophy.',
      },
      {
        title: 'Google SRE Book - Being On-Call',
        url: 'https://sre.google/sre-book/being-on-call/',
        source: 'Google SRE',
        description: 'Guidelines for sustainable on-call shifts, incident mitigation, and operational health.',
      },
    ],
    skills: [
      {
        id: 'sk-15',
        name: 'Full-Stack Observability & Incident Response',
        level: 'Core',
        description: 'Golden Signals, Prometheus/OpenTelemetry instrumentation, alerting rules, and runbook triage.',
      },
    ],
  },

  {
    id: 16,
    group: 'ship',
    title: 'Maintenance',
    short: 'Maintenance',
    tagline: 'Manage routine updates, security patches, backup restorations, and technical debt.',
    goal: 'Ensure long-term operational sustainability through regular patching, backup validation, and performance hygiene.',
    outputs: [
      'Automated database backup and tested restore verification',
      'Dependency upgrade and deprecation schedule',
      'Technical debt prioritization backlog',
    ],
    tasks: [
      {
        id: 'p16-1',
        text: 'Automate daily database snapshots with point-in-time recovery (PITR)',
        doneWhen: 'Backups are stored in an isolated, encrypted bucket with lifecycle retention policies.',
      },
      {
        id: 'p16-2',
        text: 'Conduct end-to-end backup disaster recovery restore drill to a staging database',
        doneWhen: 'Restore drill completes within recovery time objective (RTO < 60 min) with zero data loss.',
      },
      {
        id: 'p16-3',
        text: 'Establish monthly dependency update cadence and automate patch pull requests',
        doneWhen: 'Renovate/Dependabot PRs are reviewed and merged on regular scheduled maintenance days.',
      },
      {
        id: 'p16-4',
        text: 'Review cloud infrastructure cost reports and optimize idle or overprovisioned resources',
        doneWhen: 'Unused disks, unattached IPs, and oversized compute instances are resized or deleted.',
      },
      {
        id: 'p16-5',
        text: 'Maintain living technical debt backlog with dedicated 20% engineering budget allocation',
        doneWhen: 'Technical debt items are groomed into regular sprint cycles alongside new features.',
      },
    ],
    prompts: [
      {
        id: 'pr-16-1',
        title: 'Disaster Recovery (DR) Plan & Drill Guide',
        role: 'Business Continuity & Data Lead',
        template: `Author a Disaster Recovery (DR) plan for "{{PROJECT_NAME}}" on {{STACK}}.
Define:
1. Recovery Point Objective (RPO) and Recovery Time Objective (RTO) targets
2. Step-by-step restoration process from encrypted database snapshot
3. Data integrity validation script to run before switching traffic back
4. Quarterly simulation drill procedure to ensure team familiarity.`,
        expectedOutput: 'A step-by-step disaster recovery protocol with exact CLI restoration commands.',
      },
      {
        id: 'pr-16-2',
        title: 'Cloud Cost Optimization & Cleanup Audit',
        role: 'FinOps Specialist',
        template: `Analyze infrastructure spend efficiency for "{{PROJECT_NAME}}".
Tech stack: {{STACK}}
Timeframe: {{TIMEFRAME}}

Provide a cost hygiene audit checklist:
1. Compute right-sizing and spot/preemptible instance evaluation
2. Database connection pooling and storage auto-scaling limits
3. CDN caching hit ratios to minimize outbound egress costs
4. Log retention lifecycle (move debug logs to cold archive after 14 days).`,
        expectedOutput: 'A FinOps optimization report targeting 20-30% infrastructure bill savings.',
      },
    ],
    notes: [
      'An untested backup is not a backup; it is merely an unverified hope. Always test restore procedures.',
      'Allocate at least 20% of every engineering cycle to maintenance and technical debt to prevent system stagnation.',
    ],
    resources: [
      {
        title: 'Google SRE Book - Eliminating Toil',
        url: 'https://sre.google/sre-book/eliminating-toil/',
        source: 'Google SRE',
        description: 'How to automate repetitive manual operations and protect engineering capacity for strategic work.',
      },
      {
        title: 'GitHub Search for Maintenance Automation Scripts',
        url: 'https://github.com/search?q=database+backup+restore+automation+script',
        source: 'GitHub',
        description: 'Open-source automation scripts for backup verification and infrastructure maintenance.',
      },
    ],
    skills: [
      {
        id: 'sk-16',
        name: 'System Maintenance & Disaster Recovery',
        level: 'Core',
        description: 'Automated backup drills, RTO/RPO calculation, dependency patching, and cloud cost optimization.',
      },
    ],
  },

  {
    id: 17,
    group: 'ship',
    title: 'Handover',
    short: 'Handover',
    tagline: 'Document operational knowledge, transfer ownership, and ensure seamless ongoing maintenance.',
    goal: 'Transfer operational ownership cleanly with architecture documentation, runbooks, credential access, and knowledge transfer sessions.',
    outputs: [
      'Comprehensive system handover dossier',
      'Recorded technical walkthrough and operational FAQ',
      'Ownership transfer sign-off and access audit',
    ],
    tasks: [
      {
        id: 'p17-1',
        text: 'Compile production operations manual in docs/handover/ covering all critical paths',
        doneWhen: 'Manual covers system overview, architecture diagrams, common bugs, and debug commands.',
      },
      {
        id: 'p17-2',
        text: 'Record video walkthrough demonstrations of codebase structure and operational runbooks',
        doneWhen: 'Walkthrough recordings indexed in documentation with timestamped topical links.',
      },
      {
        id: 'p17-3',
        text: 'Audit and transfer administrative access, DNS controls, and billing accounts',
        doneWhen: 'Receiving team administrators verified as owners on cloud, git, and monitoring platforms.',
      },
      {
        id: 'p17-4',
        text: 'Conduct live reverse-shadowing session where receiving team handles release operations',
        doneWhen: 'Receiving team successfully deploys a release and executes rollback drill unassisted.',
      },
      {
        id: 'p17-5',
        text: 'Document third-party vendor contracts, SLAs, support tiers, and billing renewal dates',
        doneWhen: 'Vendor catalog documented with enterprise support contact numbers and contract IDs.',
      },
      {
        id: 'p17-6',
        text: 'Sign off on formal handover completion and transition project to steady-state operations',
        doneWhen: 'Sign-off agreement signed by outgoing lead and incoming engineering manager.',
      },
    ],
    prompts: [
      {
        id: 'pr-17-1',
        title: 'Comprehensive Engineering Handover Dossier Generator',
        role: 'Staff Handover & Knowledge Transfer Lead',
        template: `Generate the final Engineering Handover Dossier for "{{PROJECT_NAME}}".
Context:
- Summary: {{ONE_LINE}}
- Stack: {{STACK}}
- Users: {{USERS}}
- Repository: {{REPO_PATH}}
- Timeframe delivered: {{TIMEFRAME}}

Draft the complete handover document covering:
1. Executive System Overview & Architecture Summary
2. Key Operational Contacts & Escalation Pathways
3. Critical Routine Maintenance & Weekly Operations Checklist
4. Top 5 Known Gotchas / Edge Cases & Their Workarounds
5. Credential & Access Matrix (Vault references only, no raw secrets)
6. Formal Ownership Acceptance Sign-off Section.`,
        expectedOutput: 'A polished, executive-ready handover document formatted for docs/handover/README.md.',
      },
      {
        id: 'pr-17-2',
        title: 'Reverse-Shadowing & Knowledge Transfer Checklist',
        role: 'Engineering Enablement Specialist',
        template: `Create a 5-day reverse-shadowing schedule for transitioning "{{PROJECT_NAME}}" to the incoming team.
Stack: {{STACK}}.
Outline day-by-day activities:
- Day 1: Architecture review and local environment bootstrap
- Day 2: Codebase tour, domain models, and key user flows
- Day 3: CI/CD release execution and staging smoke tests
- Day 4: Simulated failure injection and incident triage
- Day 5: Final administrative ownership swap and sign-off.`,
        expectedOutput: 'A structured 5-day handover curriculum ensuring zero downtime during ownership transfer.',
      },
    ],
    notes: [
      'The true test of great software engineering is how smoothly the next team operates the system when you are gone.',
      'Never put passwords or API keys in the handover document; point exclusively to secure password manager or vault records.',
    ],
    resources: [
      {
        title: 'Google SRE Book - Accelerating SREs to On-Call',
        url: 'https://sre.google/sre-book/accelerating-sre-on-call/',
        source: 'Google SRE',
        description: 'Curriculums and training workflows for onboarding new engineers to complex production systems.',
      },
      {
        title: 'Conventional Commits Specification & Semver',
        url: 'https://www.conventionalcommits.org/en/v1.0.0/',
        source: 'Conventional Commits',
        description: 'Standardized release guidelines ensuring reproducible version histories across team transitions.',
      },
    ],
    skills: [
      {
        id: 'sk-17',
        name: 'Technical Documentation & Knowledge Transfer',
        level: 'Core',
        description: 'Operational runbook authoring, reverse-shadowing, access transfer governance, and system onboarding.',
      },
    ],
  },
];

// ===================== REFERENCE DATA =====================

export const COST_RULES = [
  {
    id: 'cost-1',
    category: 'Compute & Runtime',
    rule: 'Right-size container allocations based on real 95th percentile metrics rather than guesswork.',
    impact: 'Prevents 40-60% overspending on idle reserved RAM and CPU cores.',
  },
  {
    id: 'cost-2',
    category: 'Storage & Database',
    rule: 'Establish cold-storage lifecycle policies for application logs and database snapshots older than 30 days.',
    impact: 'Reduces long-term cloud storage costs by up to 75%.',
  },
  {
    id: 'cost-3',
    category: 'Network & Egress',
    rule: 'Serve static assets and cached API endpoints behind a global CDN with aggressive cache-control headers.',
    impact: 'Drastically cuts egress bandwidth fees while boosting end-user performance.',
  },
  {
    id: 'cost-4',
    category: 'Third-Party SaaS',
    rule: 'Audit automated CI/CD build minutes and parallel workers; enforce aggressive caching for node_modules and layers.',
    impact: 'Cuts unnecessary runner minutes and keeps build pipelines fast and economical.',
  },
  {
    id: 'cost-5',
    category: 'Budgets & Alerts',
    rule: 'Configure budget alerts in cloud console at 50%, 80%, and 100% of forecast spend with automatic escalation.',
    impact: 'Eliminates surprise billing anomalies caused by runaway background loops or DDoS events.',
  },
];

export const HUMAN_APPROVALS = [
  {
    id: 'appr-1',
    phase: 'Phase 3 (MVP planning)',
    gate: 'Gate G1 (Scope locked)',
    approvers: 'Product Lead, Tech Lead',
    criteria: 'Must-have feature list agreed upon; non-goals documented; budget and timeline signed off.',
  },
  {
    id: 'appr-2',
    phase: 'Phase 8 (Backend)',
    gate: 'Gate G2 (Build complete)',
    approvers: 'Tech Lead, QA Lead',
    criteria: 'All core endpoints integrated; frontend end-to-end verified with live database; zero mock data in core flow.',
  },
  {
    id: 'appr-3',
    phase: 'Phase 12 (Performance)',
    gate: 'Gate G3 (Production readiness)',
    approvers: 'Security Lead, Staff Architect',
    criteria: 'Security vulnerability audit clean; automated test suite passes with >= 80% coverage; P99 latency within NFR.',
  },
  {
    id: 'appr-4',
    phase: 'Phase 14 (Deployment)',
    gate: 'Gate G4 (Deployment verified)',
    approvers: 'Release Manager, Operations Lead',
    criteria: 'Zero-downtime deployment verified in staging; production smoke test green; automated rollback tested.',
  },
  {
    id: 'appr-5',
    phase: 'Phase 17 (Handover)',
    gate: 'Final Handover Sign-off',
    approvers: 'Outgoing Lead, Incoming Engineering Manager',
    criteria: 'Operations manual delivered; access credentials transferred; reverse-shadowing completed.',
  },
];

export const ADR_TEMPLATE = `# Architecture Decision Record (ADR)
## Title: ADR-[NUMBER]: [SHORT DESCRIPTIVE TITLE]

- **Status**: [ Proposed | Accepted | Deprecated | Superseded ]
- **Date**: YYYY-MM-DD
- **Authors**: [Author Name, Role]
- **Reviewers**: [Reviewer Names]

### Context & Problem Statement
What is the business and technical problem we are trying to solve? What are the key constraints, non-functional requirements, and operational drivers?

### Options Considered
1. **Option A: [Approach Name]**
   - *Pros*: Fast implementation, standard ecosystem support.
   - *Cons*: Higher long-term vendor lock-in.
2. **Option B: [Approach Name]**
   - *Pros*: Full control, zero licensing fees.
   - *Cons*: High upfront development and maintenance cost.
3. **Option C: [Approach Name]**
   - *Pros*: Best scalability and fault isolation.
   - *Cons*: Added architectural complexity.

### Decision
We chose **Option [X]** because [state the primary compelling rationale].

### Consequences
- **Positive Impacts**: [Clear wins for velocity, reliability, cost, or security]
- **Negative Trade-offs**: [Known limitations or maintenance burdens accepted]
- **Mitigation Strategy**: [How we will defend against the accepted trade-offs]
`;

export const DEFINITION_OF_DONE = [
  'Code compiles with zero errors, warnings, or TypeScript "any" bypasses.',
  'Unit test suite passes with all new domain logic covered by deterministic assertions.',
  'Integration tests verify API contracts and database transaction rollbacks.',
  'Linter, formatter, and security vulnerability scanners pass with zero critical flags.',
  'Accessibility tested: semantic HTML, WCAG 2.2 AA contrast, and full keyboard operability.',
  'Responsive design verified down to 390px mobile viewport without horizontal scrolling.',
  'Peer code review completed with at least one approved review by a senior engineer.',
  'Documentation updated (README, OpenAPI specification, or relevant ADR).',
  'Deployment preview verified in staging environment with live database.',
];

export const STATUS_TEMPLATE = `# Project Status Report: {{PROJECT_NAME}}
**Date**: [YYYY-MM-DD] | **Reporter**: [Lead Name] | **Cadence**: Weekly

### 1. Executive Summary
- **Current Phase**: [Phase Name and Index]
- **Overall Progress**: [X]% complete ([Done]/[Total] tasks checked)
- **Status RAG**: 🟢 On Track | 🟡 At Risk | 🔴 Blocked
- **Target Release**: {{TIMEFRAME}}

### 2. Accomplishments This Period
- [Key milestone completed or PR merged]
- [User discovery interview insights or architecture decision locked]
- [Security audit or performance benchmark milestone achieved]

### 3. Immediate Next Actions (Next Sprint)
- [Next prioritized task from checklist]
- [Upcoming Gate approval milestone]

### 4. Blockers & Help Needed
- [Describe any technical, staffing, or vendor blockers with explicit asks]
`;

export const HANDOFF_TEMPLATE = `# Engineering Handover Manual: {{PROJECT_NAME}}
**System One-liner**: {{ONE_LINE}}
**Repository**: {{REPO_PATH}}
**Tech Stack**: {{STACK}}

## 1. System Architecture Overview
High-level description of system topology, client interfaces, microservices/monolith boundaries, and primary datastore.

## 2. Environment & Credential Access
- Cloud Console: [Project Name / Account ID]
- Secret Vault: [Vault Path / Password Manager folder]
- CI/CD Runner: [GitHub Actions / Pipeline URL]
- DNS & Domain: [Registrar and CDN Provider]

## 3. Routine Operational Runbook
- How to start local development: \`npm install && npm run dev\`
- How to run test suites: \`npm test\`
- How to trigger a staging deployment: [CI command or merge to main]
- How to execute zero-downtime production release: [Runbook instructions]

## 4. Top 5 Known Gotchas
1. [Gotcha 1 and workaround]
2. [Gotcha 2 and workaround]
3. [Gotcha 3 and workaround]

## 5. Sign-off Matrix
- **Outgoing Tech Lead**: ____________________ Date: ____________
- **Incoming Tech Lead**: ____________________ Date: ____________
`;

export const AGENTS_TEMPLATE = `# AI Agent Engineering Guildlines & Conventions
**Project**: {{PROJECT_NAME}} | **Tech Stack**: {{STACK}}

## 1. Operating Rules for AI Coding Agents
1. **Never generate placeholder stubs**: Write complete, working code in full. Avoid \`// TODO: implement later\`.
2. **Strict type safety**: Never use \`any\` or suppress TypeScript diagnostics unless strictly required by an external untyped library.
3. **Decouple pure logic from UI**: Keep domain business rules, parsers, and calculations in testable helper modules.
4. **Never leak secrets**: Do not hardcode credentials, private tokens, or customer PII in source files or prompt responses.
5. **Honor accessibility by default**: Always use native semantic elements (<button>, <input>, <label>), ensure visible focus rings, and test keyboard accessibility.

## 2. Context Prompt Structure
When prompting an AI assistant for a specific task in this codebase, provide:
- Role definition (e.g. Senior Backend Engineer)
- High-level project context: {{ONE_LINE}}
- Strict constraints: {{STACK}}
- Concrete acceptance criteria (Given-When-Then)
- Request full-file output or surgical unified diffs.
`;

export const PROJECT_CONTEXT_TEMPLATE = `# AI Context Prompt for {{PROJECT_NAME}}

You are acting as a Senior Staff Software Engineer working on "{{PROJECT_NAME}}".
System summary: {{ONE_LINE}}
Target users: {{USERS}}
Primary tech stack: {{STACK}}
Repository path: {{REPO_PATH}}
Current delivery timeframe: {{TIMEFRAME}}

When writing code or designing components for this project:
- Adhere strictly to the defined tech stack without introducing unnecessary third-party dependencies.
- Ensure all database queries prevent injection and implement proper transaction boundaries.
- Ensure all API endpoints adhere to RFC 9457 Problem Details error schemas.
- Ensure all user interfaces meet WCAG 2.2 AA accessibility standards and support mobile viewports at 390px.
`;

export const AGENT_PROMPT_TEMPLATE = `You are a Senior Software Engineer specializing in {{STACK}}.
Project: {{PROJECT_NAME}} ({{ONE_LINE}})
Audience: {{USERS}}

Task:
[State the exact requirement or user story here]

Acceptance Criteria:
1. Complete, production-ready code with no truncation or placeholder comments.
2. Fully typed with TypeScript strict checking.
3. Accessible according to WCAG 2.2 AA (semantic HTML, proper label associations).
4. Unit tests asserting both happy path and edge case failure handling.
`;

export const REPO_TREE = `{{PROJECT_NAME}}/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Lint, type-check, test, build
│   │   └── deploy.yml             # Zero-downtime deployment pipeline
│   ├── pull_request_template.md   # Standard PR checklist
│   └── CODEOWNERS                 # Mandatory reviewers for critical paths
├── docs/
│   ├── adr/                       # Architecture Decision Records
│   ├── architecture/              # Component diagrams and threat models
│   ├── charter.md                 # Project scope, goals, non-goals
│   ├── handover/                  # Operations manual and runbooks
│   └── research/                  # User interview synthesis and discovery
├── src/
│   ├── api/                       # API clients and route handlers
│   ├── components/                # Accessible, reusable UI components
│   ├── data/                      # Playbook and domain datasets
│   ├── hooks/                     # Custom React hooks
│   ├── services/                  # Business domain logic & transactions
│   ├── utils/                     # Pure helpers, storage, metrics, formatting
│   ├── App.tsx                    # Main root component & hash routing
│   ├── index.css                  # Theme tokens and global stylesheets
│   └── main.tsx                   # Application DOM entry point
├── tests/
│   ├── unit/                      # Fast deterministic unit tests
│   ├── integration/               # Database and API route tests
│   └── e2e/                       # Playwright browser automation
├── .env.example                   # Sample environment variable keys (no secrets)
├── .gitignore                     # Ignored files, dependencies, build output
├── index.html                     # HTML shell and metadata
├── package.json                   # Dependency manifests and scripts
├── tsconfig.json                  # Strict TypeScript compiler options
└── vite.config.ts                 # Vite bundler configuration`;

export const REPO_FILES = [
  { path: '.env.example', description: 'Template of required runtime environment variables (never contains secrets).' },
  { path: '.gitignore', description: 'Excludes node_modules, build artifacts, temporary files, and local .env files.' },
  { path: '.github/workflows/ci.yml', description: 'Automated CI workflow executing linting, unit tests, and security scans.' },
  { path: '.github/pull_request_template.md', description: 'PR template prompting authors for test proof, risk notes, and ticket links.' },
  { path: 'docs/charter.md', description: 'Project charter documenting problem statement, scope boundaries, and non-goals.' },
  { path: 'docs/adr/0001-record-architecture-decisions.md', description: 'Initial Architecture Decision Record template.' },
  { path: 'docs/handover/README.md', description: 'Operations runbook and handover documentation for receiving engineering teams.' },
  { path: 'package.json', description: 'Manifest of application dependencies, scripts, and engine specifications.' },
  { path: 'tsconfig.json', description: 'TypeScript compiler configuration enforcing strict typing and module resolution.' },
  { path: 'vite.config.ts', description: 'Vite build tool configuration, plugins, and path aliases.' },
  { path: 'index.html', description: 'HTML5 entry point declaring viewport, responsive meta, and web fonts.' },
  { path: 'src/main.tsx', description: 'React application entry point mounting root component to DOM.' },
  { path: 'src/App.tsx', description: 'Main application shell, hash router, and layout management.' },
  { path: 'src/index.css', description: 'Design tokens, theme custom properties, and responsive styles.' },
  { path: 'src/data/playbook.ts', description: 'Core domain dataset: phases, tasks, gates, prompts, resources, and templates.' },
  { path: 'src/utils/storage.ts', description: 'Robust localStorage persistence, v1-to-v2 migration, and error resilience.' },
  { path: 'src/utils/metrics.ts', description: 'Progress calculations, current phase tracking, and portfolio CSV exports.' },
  { path: 'src/utils/prompts.ts', description: 'Live placeholder substitution and multi-tier clipboard copying logic.' },
];
