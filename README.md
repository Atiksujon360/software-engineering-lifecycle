# Engineering Lifecycle Playbook

An interactive checklist, manual, and delivery-tracking engine that guides software projects from idea validation to handover. It tracks progress per project, provides copyable context-injected AI-agent prompts, enables cross-device database synchronization, calculates objective on-track delivery status, and aggregates multi-project portfolios.

---

## Quick Start (Run Locally with One Command)

Run the entire application (Node.js API, SQLite database, and frontend app) with Docker Compose:

```bash
docker compose up
```

Open your browser at `http://localhost:3000`.

To run natively during development:
```bash
npm install
npm run dev
```

To run all automated test suites (Vitest tracking & API isolation suites + Node.js content assertions):
```bash
npm test
```

---

## 1. Synchronization Architecture & Conflict Resolution

### Conflict Rule: Last-Write-Wins (LWW)
- **Granular Task Checkboxes**: In the database table `project_progress`, each task completion check is recorded as its own row `(project_id, task_id, checked, updated_at)`. When two devices sync changes to different tasks in the same project, the updates merge cleanly without overwriting each other. If the same task is toggled on two devices, the write with the later ISO-8601 timestamp (`updated_at`) wins.
- **Project Fields & Notes**: Stored per project and per phase note with an ISO-8601 `updated_at` timestamp. On conflict, the payload with the later timestamp wins.

### When Sync Triggers
1. **On Authentication**: When a user signs in, an immediate two-way merge sync is executed between the device's local state and the cloud database.
2. **On Local State Mutation**: Any task check, field edit, note entry, timeline date update, or phase block automatically queues a sync with the backend.
3. **Manual Trigger**: Clicking "Sync Now" in the Account menu forces an immediate synchronization.

### Offline Queue Behavior & Exponential Backoff
- The application is **local-first and offline-resilient**: all data is instantly written to `localStorage` under key `swlp.v2`.
- When offline or when the server is unreachable, outgoing changes are queued in an offline sync queue (`swlp_sync_queue`).
- A background exponential backoff retry loop attempts synchronization starting at 1 second, doubling up to a maximum interval of 60 seconds (1s, 2s, 4s, 8s, 16s, 32s, 60s).
- The top-bar indicator displays `"Offline: changes will sync when you reconnect"`, preventing user confusion and eliminating error popups. When network connectivity restores, all queued changes automatically merge.

---

## 2. On-Track Tracking Formula & Status Boundaries

The playbook never guesses dates; if neither start nor target date is configured, status is displayed as **"No dates set"**.

### Expected Progress Formula
- If current time $\le$ start date: $\text{Expected \%} = 0\%$
- If current time $\ge$ target launch date: $\text{Expected \%} = 100\%$
- Between start date and target date:
  $$\text{Expected \%} = \min\left(100, \max\left(0, \operatorname{round}\left(\frac{\text{now} - \text{start}}{\text{target} - \text{start}} \times 100\right)\right)\right)$$

### Status Bands: $\Delta = \text{Actual \%} - \text{Expected \%}$
- **Ahead** ($\Delta \ge +10$ percentage points): Project completion rate exceeds planned timeline pace.
- **On track** ($-10 < \Delta < +10$ percentage points): Progress is within 10 points of expected delivery pace.
- **Behind** ($-25 \le \Delta \le -10$ percentage points): Progress is 10 to 25 points below schedule.
- **At risk** ($\Delta < -25$ points, OR Overdue Gate, OR Blocked Phase):
  1. Progress is more than 25 points below expected pace ($\Delta < -25$).
  2. Any Human Quality Gate (G1, G2, G3, G4) has an assigned target date that has passed while the gate is incomplete.
  3. Any lifecycle phase has been marked blocked for more than 7 days.

---

## 3. Server Storage & Multi-Tenancy

- **Database Engine**: Embedded SQLite using `better-sqlite3` with Write-Ahead Logging (`PRAGMA journal_mode = WAL`) and foreign key enforcement (`PRAGMA foreign_keys = ON`).
- **File Location**: The SQLite database file is stored at `/app/data/playbook.db` inside the container (or `./data/playbook.db` locally).
- **Volume Mount**: In `docker-compose.yml`, a persistent named volume `playbook-data` is mounted to `/app/data` to guarantee zero data loss across container restarts and redeployments.
- **Multi-Tenant Isolation**: Every database query on `projects`, `project_progress`, `phase_notes`, and `project_snapshots` enforces strict scoping by `user_id`. Unauthorized cross-tenant access returns an RFC 9457 Problem Details error with HTTP 403 Forbidden.

---

## 4. Data Privacy & Secrets Notice

> **IMPORTANT PRIVACY NOTICE**:
> **Do not put customer personal data, secrets, passwords, or production API keys into this tool.**
> All project parameters, prompt variables, and phase notes are saved in your browser's storage and synchronized to your account database. Always use designated environment secret stores (e.g. AWS Secrets Manager, Google Secret Manager) for credentials.

---

## 5. Known Limitations

1. **No Simultaneous Real-Time Collaborative Editing**: The sync model uses asynchronous Last-Write-Wins (LWW) conflict resolution. It does not use Operational Transformation (OT) or CRDTs for character-by-character live typing collaboration between two users editing the same note field at the exact same second.
2. **Local Self-Contained Auth (No External SMTP Delivery)**: Authentication uses cryptographic salted `bcrypt` password hashing with `httpOnly` signed session cookies. The application does not require external SMTP email infrastructure, which means automated "forgot password" email reset links require administrative password reset or database re-seeding.
3. **No Database-Level Row Encryption at Rest**: SQLite stores records in standard binary WAL database format on disk. For deployments requiring compliance standards (e.g., HIPAA, SOC2), volume-level disk encryption (such as LUKS, AWS EBS encrypted volumes, or Cloud KMS) should be configured on the host storage volume.
