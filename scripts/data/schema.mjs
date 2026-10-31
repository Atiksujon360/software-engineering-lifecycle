import { z } from 'zod';

// Slug validation: lowercase, hyphen-separated, max 40 chars
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Forbidden keys that must never appear in data files
const FORBIDDEN_KEYS = ['password', 'token', 'secret', 'apiKey', 'api_key', 'email', 'phone'];

// Recursive check for forbidden keys in an object
function checkForbiddenKeys(obj, path = '') {
  if (obj === null || typeof obj !== 'object') return;
  
  for (const key in obj) {
    const keyLower = key.toLowerCase();
    if (FORBIDDEN_KEYS.includes(keyLower)) {
      throw new Error(`Forbidden key "${key}" found at ${path ? path + '.' + key : key}`);
    }
    checkForbiddenKeys(obj[key], path ? path + '.' + key : key);
  }
}

// Project JSON schema
export const ProjectSchema = z.object({
  schemaVersion: z.literal(1),
  slug: z.string().regex(SLUG_REGEX).max(40),
  name: z.string().min(1).max(300),
  mode: z.enum(['new', 'existing']),
  oneLine: z.string().max(500),
  users: z.string().max(300),
  stack: z.string().max(500),
  timeframe: z.string().max(300),
  repoPath: z.string().max(500).refine(
    (val) => !val.includes('://') || !val.includes('@'),
    'repoPath must not contain credentials (user:pass@ pattern)'
  ),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Progress JSON schema
export const ProgressSchema = z.object({
  schemaVersion: z.literal(1),
  slug: z.string().regex(SLUG_REGEX).max(40),
  tasks: z.record(z.object({
    checked: z.boolean(),
    checkedAt: z.string().datetime().optional(),
    by: z.string().optional(),
  })),
  phaseNotes: z.record(z.string().max(5000)),
});

// History JSONL line schema
export const HistoryLineSchema = z.object({
  at: z.string().datetime(),
  action: z.enum(['check', 'uncheck', 'note', 'mode', 'create']),
  task: z.string().optional(),
  phase: z.string().optional(),
  chars: z.number().optional(),
  value: z.string().optional(),
  by: z.string().optional(),
});

// Template schema (same as project but without required fields)
export const ProjectTemplateSchema = ProjectSchema.partial();

export { checkForbiddenKeys, FORBIDDEN_KEYS, SLUG_REGEX };
