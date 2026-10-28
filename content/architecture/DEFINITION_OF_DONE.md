# Universal Definition of Done (DoD)

Every pull request, vertical feature slice, and milestone release must satisfy this checklist before being merged or deployed to production.

---

## 1. Automated Testing & Verification
- [ ] **Unit Tests Passing**: All new domain business logic is covered by deterministic, fast-running unit tests (`npm test` passes 100%).
- [ ] **Integration Tests Verified**: Database mutations, repository interactions, and API routes are tested against real or containerized test instances (`npm run test:integration`).
- [ ] **Negative & Edge Cases Handled**: Explicit assertions verify 400 Bad Request, 401 Unauthorized, 404 Not Found, and rate limit exceptions.
- [ ] **No Regression in Coverage**: Code coverage meets or exceeds team thresholds (>= 80% line coverage on domain services).

## 2. Documentation & Status Updating
- [ ] **PRD Acceptance Met**: Every Given-When-Then scenario specified in `docs/PRD.md` is demonstrated to be passing.
- [ ] **API Contract Updated**: Any new or updated endpoint is documented in `docs/api/openapi.yaml` adhering to RFC 9457 error contracts.
- [ ] **Living Status Logged**: `docs/PROJECT_STATUS.md` is updated with session timestamps, task completion notes, and immediate next steps.
- [ ] **ADR Authored for Invariants**: Any significant structural or dependency change is documented in an approved ADR in `docs/adr/`.

## 3. Zero Secrets & Security Compliance
- [ ] **Zero Secrets in Code**: Automated secret scanner (`gitleaks` / `trufflehog`) passes with zero findings; no tokens, private keys, or passwords in diffs.
- [ ] **No Secret Logging**: Sensitive payload fields (tokens, credit cards, passwords) are masked or omitted from application logs.
- [ ] **Input Sanitization**: All incoming request parameters, headers, and request bodies are validated at perimeter boundaries using strict schemas.
- [ ] **Dependency CVE Check**: `npm audit` or automated vulnerability scanner passes with zero high or critical CVEs.

## 4. Accessibility & Mobile Responsiveness
- [ ] **WCAG 2.2 AA Compliance**: Automated axe-core check passes with zero critical violations.
- [ ] **Color Contrast Verified**: All text meets minimum contrast ratio of 4.5:1 against background colors.
- [ ] **Keyboard Operability**: All interactive controls are navigable via Tab, Enter, Space, and Escape with visible focus rings.
- [ ] **Mobile Viewport Tested**: Verified at 390px viewport with zero horizontal scrolling and accessible tap targets (minimum 44x44px).

## 5. Safe Database Migrations
- [ ] **Expand-and-Contract Followed**: No columns or tables dropped in the same release that changes application query logic.
- [ ] **Rollback Tested**: The migration runner executes both UP and DOWN directions successfully in staging.
- [ ] **Indexes Applied**: Foreign keys and high-frequency filter columns have compound or B-tree indexes defined.
- [ ] **Zero Table Locks**: No migration operations execute exclusive table locks on large tables during peak traffic.

## 6. Observability & Monitoring
- [ ] **Structured Logging**: Every incoming request logs structured JSON with correlation trace ID, method, route, and duration.
- [ ] **Golden Signals Instrumented**: Endpoint latency and HTTP error rates are tracked and published to telemetry collectors.
- [ ] **Actionable Alerts Defined**: Critical errors route to on-call alerting with linked runbook documentation.
- [ ] **Health Probes Operational**: Liveness (`/healthz`) and readiness (`/readyz`) endpoints verify process and database pool health.
