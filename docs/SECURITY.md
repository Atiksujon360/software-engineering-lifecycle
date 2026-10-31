# Security

## Scope and target
Initial product scope stores project and task information only. Authentication is not implemented in this frontend setup. The existing Express/SQLite backend is preserved and requires separate review before being used for team production data.

[ASSUMED] Target OWASP ASVS Level 1 for the future general project-management application. Reassess if sensitive personal, health, payment, or regulated data is proposed; such data is currently out of scope.

## Threat model (STRIDE)

| Feature / boundary | Threat | Example | Baseline mitigation |
|---|---|---|---|
| Frontend external input | Tampering | Malicious project title or URL | Validate and encode input; imported content is untrusted |
| Future authentication | Spoofing / Elevation | Stolen or replayed session | Approved auth design, secure cookies, rotation, server-side checks |
| Future team access | Elevation | Member accesses another team's project | Server-side authorization on every object; deny by default |
| Project/task content | Tampering | Unauthorized modification | Authorization, validation, audit events for material changes |
| GitHub integration | Spoofing / Information disclosure | Over-scoped or leaked token | Least privilege, secure secret storage, revoke/disconnect flow |
| GitHub webhooks | Spoofing / Tampering | Forged webhook request | Verify signatures, replay protection, bounded payload validation |
| API errors/logging | Information disclosure | Tokens or project data in logs | Structured redacted logs; no secrets or personal content |
| Dependencies/build pipeline | Tampering / DoS | Compromised package or vulnerable dependency | Lockfile, dependency scanning, pinned CI actions, review updates |
| Availability | Denial of service | Excessive API or GitHub requests | Rate limits, quotas, bounded timeouts, controlled retries |

## Secrets handling
- Never commit secrets, tokens, credentials, or populated environment files.
- Keep `.env.example` keys empty with a one-line purpose comment.
- Use deployment-provider secret storage for runtime secrets.
- Never expose server-only secrets through client-exposed variables.
- Do not store GitHub tokens in browser local storage.
- Never log secret values.
- Rotation schedule for future credentials: [TBD].
- Previously reported exposed session secret and committed SQLite account database are separate security blockers. This documentation change does not resolve them.

## Browser and API controls
Future implementation must define CSP, HSTS on HTTPS, X-Content-Type-Options, Referrer-Policy, frame protection, CORS allowlist, CSRF strategy where cookie auth is used, and rate limits. Test headers and policies rather than disabling functionality to make them pass.

## Data handling
- Project/task information only in initial scope.
- Do not put passwords, API keys, production credentials, customer data, or health information in project notes.
- Retention, export, deletion, and backup access controls are [TBD].
- Future multi-user access must be enforced by the backend, not frontend filtering alone.
