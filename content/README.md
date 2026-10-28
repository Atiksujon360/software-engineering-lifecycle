# Engineering Lifecycle Playbook — Content Library

This content library provides the structured datasets, copyable AI agent prompts, skills catalogue, architectural specifications, and Mermaid diagrams governing the 18 phases of the software engineering lifecycle.

> **Environment Note on Skill Names**: The skill names in this catalogue describe concrete operational capabilities. In specific agent environments (such as Claude Code, Cursor, Codex, or Gemini CLI), these capabilities may be implemented as internal tool calls, system prompts, CLI integrations, or human review workflows.

---

## Phase-to-Skills Mapping Matrix

| Phase | Phase Name | Primary Applicable Skills |
| :---: | :--- | :--- |
| **0** | **Orientation** | `deep-research`, `file-reading`, `Claude Code (CLAUDE.md, AGENTS.md)`, `GitHub Actions`, `token-efficiency-audit`, `humanizer`, `docx`, `pptx`, `pdf`, `artifact-diagramming`, `skill-creator` |
| **1** | **Idea validation** | `user-research`, `research-synthesis`, `deep-research`, `design-critique`, `xlsx` |
| **2** | **Requirements** | `user-research`, `research-synthesis`, `accessibility-review`, `ux-copy`, `humanizer`, `docx`, `pdf` |
| **3** | **MVP planning** | `research-synthesis`, `design-handoff`, `xlsx`, `pptx` |
| **4** | **System architecture** | `deep-research`, `artifact-diagramming`, `file-reading`, `token-efficiency-audit`, `Claude Code` |
| **5** | **Database design** | `Testcontainers`, `artifact-diagramming` |
| **6** | **API design** | `ux-copy`, `artifact-diagramming` |
| **7** | **Frontend** | `frontend-design`, `accessibility-review`, `design-handoff`, `design-critique`, `ux-copy` |
| **8** | **Backend** | `file-reading`, `Testcontainers` |
| **9** | **Security** | `deep-research` |
| **10** | **Testing** | `accessibility-review`, `GitHub Actions`, `Testcontainers` |
| **11** | **Code review** | `accessibility-review`, `design-critique`, `humanizer`, `token-efficiency-audit`, `file-reading`, `Claude Code`, `GitHub Actions` |
| **12** | **Performance** | `xlsx` |
| **13** | **CI/CD** | `GitHub Actions` |
| **14** | **Deployment** | `artifact-diagramming`, `GitHub Actions` |
| **15** | **Monitoring** | `artifact-diagramming`, `deep-research` |
| **16** | **Maintenance** | `token-efficiency-audit`, `skill-creator`, `xlsx`, `Claude Code` |
| **17** | **Handover** | `design-handoff`, `humanizer`, `skill-creator`, `docx`, `pptx`, `pdf` |

---

## File Manifest & Directory Structure

```text
content/
├── README.md                          # Content library guide, phase-to-skills matrix, and file index.
├── prompts.json                       # 41 copyable agent prompts covering phases 0-17 and general tasks.
├── skills.json                        # 20 skill definitions with classification, phase mappings, and prompts.
│
├── architecture/                      # Full-stack architectural specifications and operating guidelines.
│   ├── ARCHITECTURE_TEMPLATE.md       # C4 Level 1-3 architecture template with complete filled reference example.
│   ├── STACK_RECOMMENDATION.md        # Default stack rationale and trade-offs (React/Next.js, Node/Java, Postgres, etc.).
│   ├── REPO_LAYOUT.md                 # Standardized monorepo hierarchy with one-line purpose for every file.
│   ├── AGENTS.md                      # Complete rules of engagement for autonomous coding agents (<150 lines).
│   ├── ADR_GUIDE.md                   # ADR template and three canonical ADR examples (database, auth, hosting).
│   ├── DEFINITION_OF_DONE.md          # Release gate checklist (tests, docs, secrets, accessibility, migration, monitoring).
│   └── COST_RULES.md                  # Five fundamental rules for controlling agent token costs and context sprawl.
│
└── diagrams/                          # Mermaid source diagrams with plain-text architectural descriptions.
    ├── lifecycle-route.mmd            # 18 phases grouped into Define, Build, Ship with Gates G1-G4.
    ├── agent-loop.mmd                 # 6-step agent cycle: plan, read, edit, test, report, update status.
    ├── context-budget.mmd             # Token context distribution and explicit exclusion boundaries.
    ├── reference-architecture.mmd     # End-to-end full-stack component topology from edge to datastore.
    ├── cicd-pipeline.mmd              # Automated CI/CD progression with testing and rollback verification.
    ├── security-layers.mmd            # Defense-in-depth across edge, identity, app, data, secrets, and supply chain.
    ├── migration-expand-contract.mmd  # 4-stage zero-downtime database migration pattern with rollback trigger.
    ├── test-pyramid.mmd               # 70/20/10 testing pyramid distribution and speed benchmarks.
    └── existing-project-intake.mmd    # 8-step brownfield legacy codebase intake protocol.
```

---

## Standard Placeholders in Prompts

All prompts in `content/prompts.json` use only these six standard variables:
- `{{PROJECT_NAME}}`: Short human-readable title or code-name (e.g., Phoenix Billing, Atlas API).
- `{{ONE_LINE}}`: Single-sentence summary of the core problem being solved.
- `{{USERS}}`: Target persona or customer group (e.g., Site reliability engineers, Small business finance).
- `{{STACK}}`: Concrete technical stack (e.g., Next.js, Node.js, TypeScript, PostgreSQL, Docker).
- `{{REPO_PATH}}`: Repository path or URL (e.g., `github.com/acme/my-product`).
- `{{TIMEFRAME}}`: Delivery window or milestone target (e.g., 6-week MVP, Q4 release).

---

## Canonical Standards & Documentation Links

All external standards referenced in prompts and architecture documents adhere to canonical, stable HTTPS sources:
- **OWASP Top 10 & API Security**: https://owasp.org/www-project-top-ten/
- **RFC 9457 (Problem Details for HTTP APIs)**: https://datatracker.ietf.org/doc/html/rfc9457
- **W3C Web Content Accessibility Guidelines (WCAG) 2.2**: https://www.w3.org/TR/WCAG22/
- **Google Site Reliability Engineering (SRE) Book**: https://sre.google/sre-book/table-of-contents/
- **DORA (DevOps Research and Assessment)**: https://dora.dev/research/
- **The Twelve-Factor App**: https://12factor.net/
- **Conventional Commits**: https://www.conventionalcommits.org/en/v1.0.0/
- **MDN Web Docs**: https://developer.mozilla.org/

---

## Known Limitations

- **Simulated Third-Party Agent Execution**: Prompt templates and skill definitions are optimized for modern autonomous coding agents (Claude Code, Cursor, Codex, Gemini CLI). Live execution of third-party external agents against private proprietary codebases must be verified locally by the engineering team within their specific CLI environments.
- **External Outbound Network Access**: While all URLs point to stable, canonical documentation hubs (OWASP, IETF, W3C, Google SRE), automated sandbox validation does not execute live HTTP requests to external third-party hosts.
