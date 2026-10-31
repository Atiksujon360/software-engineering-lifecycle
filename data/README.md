# Data Directory

This directory contains project progress and status data. It is versioned in Git and serves as the single source of truth for project tracking.

## ⚠️ Security Rule

**NEVER store secrets, passwords, tokens, API keys, email addresses, phone numbers, or personal data in this directory.**

All files are committed to the repository and will be public.

## Folder Layout

```
data/
  README.md                       # This file
  index.json                      # Generated summary of all projects (do not edit manually)
  projects/
    <project-slug>/
      project.json                # Project metadata
      progress.json               # Task completion state
      history.jsonl               # Append-only change log
  templates/
    project.template.json         # Empty project template
```

## Adding a New Project

Use the CLI script:

```bash
npm run data:new -- --slug my-project --name "My Project" --mode new
```

The slug must:
- Be lowercase
- Use hyphens for word separators
- Match the pattern: `^[a-z0-9]+(-[a-z0-9]+)*$`
- Be max 40 characters

## Updating Progress

1. Open the dashboard
2. Check or uncheck tasks as you complete them
3. Tools → Export progress
4. Save the exported file as `data/projects/<slug>/progress.json`
5. Run `npm run data:summary` to regenerate `index.json`
6. Run `npm run check:data` to verify security
7. Commit the changes

## File Schemas

### project.json

```json
{
  "schemaVersion": 1,
  "slug": "clinic-queue",
  "name": "Clinic queue app",
  "mode": "new",
  "oneLine": "",
  "users": "",
  "stack": "",
  "timeframe": "",
  "repoPath": "",
  "createdAt": "2026-10-31T09:00:00Z",
  "updatedAt": "2026-10-31T09:00:00Z"
}
```

### progress.json

```json
{
  "schemaVersion": 1,
  "slug": "clinic-queue",
  "tasks": {
    "p0-1": { "checked": true, "checkedAt": "2026-10-31T09:05:00Z", "by": "owner" },
    "p0-2": { "checked": false }
  },
  "phaseNotes": {
    "0": "Scope agreed with owner on 31 Oct.",
    "2": ""
  }
}
```

### history.jsonl

Append-only log, one JSON line per change:

```json
{"at":"2026-10-31T09:05:00Z","action":"check","task":"p0-1","by":"owner"}
{"at":"2026-10-31T09:07:00Z","action":"uncheck","task":"p0-1","by":"owner"}
{"at":"2026-10-31T09:10:00Z","action":"note","phase":"0","chars":42}
```

## Regenerating index.json

```bash
npm run data:summary
```

This reads all project files, validates them, calculates percentages, and generates `data/index.json`.

## Security Checks

```bash
npm run check:data
```

This verifies:
- No `.db`, `.sqlite`, `.sqlite3`, or `.log` files
- No forbidden keys (password, token, secret, apiKey, api_key, email, phone)
- No credential-bearing repository paths (user:pass@ pattern)
- All JSON files are valid
- All task IDs are recognized

Run this before committing.
