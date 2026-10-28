import crypto from 'node:crypto';
import express, { type Request, type Response } from 'express';
import {
  clearSessionCookie,
  hashPassword,
  requireAuth,
  setSessionCookie,
  verifyPassword,
} from './auth';
import { db } from './db';

export const apiRouter = express.Router();

/**
 * Valid Task ID set generated from the 18 phases of the Engineering Lifecycle Playbook.
 * Tasks are p0-1 through p17-6, plus p0-x1 through p0-x8 for existing project intake.
 */
const VALID_TASK_IDS = new Set<string>();
for (let i = 0; i <= 17; i++) {
  const maxTasks = [4, 6, 7, 8, 9, 10, 17].includes(i) ? 6 : 5;
  for (let t = 1; t <= maxTasks; t++) {
    VALID_TASK_IDS.add(`p${i}-${t}`);
  }
}
for (let x = 1; x <= 8; x++) {
  VALID_TASK_IDS.add(`p0-x${x}`);
}

/**
 * RFC 9457 Problem Details error response generator.
 */
function sendProblem(res: Response, status: number, title: string, detail: string, instance?: string) {
  return res.status(status).type('application/problem+json').json({
    type: 'https://datatracker.ietf.org/doc/html/rfc9457',
    title,
    status,
    detail,
    instance,
  });
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    sendProblem(res, 400, 'Invalid Email', 'A valid email address is required.', '/api/auth/register');
    return;
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    sendProblem(res, 400, 'Invalid Password', 'Password must be at least 6 characters long.', '/api/auth/register');
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    sendProblem(res, 409, 'User Exists', 'An account with this email already exists.', '/api/auth/register');
    return;
  }

  const userId = `usr_${crypto.randomUUID()}`;
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
    userId,
    normalizedEmail,
    passwordHash,
    now
  );

  setSessionCookie(res, userId);
  res.status(201).json({
    user: { id: userId, email: normalizedEmail },
    message: 'Account registered successfully.',
  });
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    sendProblem(res, 400, 'Missing Credentials', 'Email and password are required.', '/api/auth/login');
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(normalizedEmail) as
    | { id: string; email: string; password_hash: string }
    | undefined;

  if (!user || !(await verifyPassword(String(password), user.password_hash))) {
    sendProblem(res, 401, 'Invalid Credentials', 'Invalid email or password.', '/api/auth/login');
    return;
  }

  setSessionCookie(res, user.id);
  res.json({
    user: { id: user.id, email: user.email },
    message: 'Signed in successfully.',
  });
});

apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  clearSessionCookie(res);
  res.json({ message: 'Signed out successfully.' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const token = req.cookies?.swlp_session;
  if (!token) {
    res.json({ user: null });
    return;
  }
  const { verifyToken } = require('./auth');
  const userId = verifyToken(token);
  if (!userId) {
    res.json({ user: null });
    return;
  }

  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId) as
    | { id: string; email: string }
    | undefined;

  res.json({ user: user || null });
});

apiRouter.delete('/auth/me', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  clearSessionCookie(res);
  res.json({ message: 'Account and all associated project data have been permanently deleted.' });
});

// ==========================================
// PROJECTS & TASKS ENDPOINTS (ALL FILTER BY user_id)
// ==========================================

interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  mode: string;
  fields_json: string;
  dates_json: string;
  blocks_json: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

apiRouter.get('/projects', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;

  const projects = db
    .prepare('SELECT * FROM projects WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC')
    .all(userId) as ProjectRow[];

  const result = projects.map((proj) => {
    // Tasks progress
    const progressRows = db
      .prepare('SELECT task_id, checked FROM project_progress WHERE project_id = ?')
      .all(proj.id) as { task_id: string; checked: number }[];
    const checkedTasks: Record<string, boolean> = {};
    for (const r of progressRows) {
      if (r.checked) checkedTasks[r.task_id] = true;
    }

    // Notes
    const noteRows = db
      .prepare('SELECT phase_id, text FROM phase_notes WHERE project_id = ?')
      .all(proj.id) as { phase_id: number; text: string }[];
    const notes: Record<number, string> = {};
    for (const r of noteRows) {
      notes[r.phase_id] = r.text;
    }

    // Snapshots
    const snapshots = db
      .prepare('SELECT date, percent, done_count, total_count FROM project_snapshots WHERE project_id = ? ORDER BY date ASC')
      .all(proj.id) as { date: string; percent: number; done_count: number; total_count: number }[];

    return {
      id: proj.id,
      name: proj.name,
      mode: proj.mode,
      fields: JSON.parse(proj.fields_json || '{}'),
      dates: JSON.parse(proj.dates_json || '{}'),
      phaseBlocks: JSON.parse(proj.blocks_json || '{}'),
      checkedTasks,
      notes,
      weeklySnapshots: snapshots.map((s) => ({
        date: s.date,
        percent: s.percent,
        doneCount: s.done_count,
        totalCount: s.total_count,
      })),
      createdAt: proj.created_at,
      updatedAt: proj.updated_at,
    };
  });

  res.json({ projects: result });
});

apiRouter.put('/projects/:id', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const projectId = req.params.id;
  const { name, mode, fields, dates, phaseBlocks, updatedAt } = req.body || {};

  if (!projectId || typeof projectId !== 'string' || projectId.length > 64) {
    sendProblem(res, 400, 'Invalid Project ID', 'Project ID must be a valid string.', req.originalUrl);
    return;
  }

  const cleanName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 100) : 'Untitled Project';
  const cleanMode = mode === 'existing' ? 'existing' : 'new';
  const cleanFields = fields && typeof fields === 'object' ? fields : {};
  const cleanDates = dates && typeof dates === 'object' ? dates : {};
  const cleanBlocks = phaseBlocks && typeof phaseBlocks === 'object' ? phaseBlocks : {};
  const now = updatedAt || new Date().toISOString();

  // Check if project exists and belongs to this user
  const existing = db
    .prepare('SELECT id, user_id, updated_at FROM projects WHERE id = ?')
    .get(projectId) as { id: string; user_id: string; updated_at: string } | undefined;

  if (existing && existing.user_id !== userId) {
    sendProblem(res, 403, 'Forbidden', 'You do not have permission to access this project.', req.originalUrl);
    return;
  }

  if (existing) {
    db.prepare(`
      UPDATE projects
      SET name = ?, mode = ?, fields_json = ?, dates_json = ?, blocks_json = ?, updated_at = ?, deleted_at = NULL
      WHERE id = ? AND user_id = ?
    `).run(
      cleanName,
      cleanMode,
      JSON.stringify(cleanFields),
      JSON.stringify(cleanDates),
      JSON.stringify(cleanBlocks),
      now,
      projectId,
      userId
    );
  } else {
    db.prepare(`
      INSERT INTO projects (id, user_id, name, mode, fields_json, dates_json, blocks_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      userId,
      cleanName,
      cleanMode,
      JSON.stringify(cleanFields),
      JSON.stringify(cleanDates),
      JSON.stringify(cleanBlocks),
      now,
      now
    );
  }

  res.json({
    project: {
      id: projectId,
      name: cleanName,
      mode: cleanMode,
      fields: cleanFields,
      dates: cleanDates,
      phaseBlocks: cleanBlocks,
      updatedAt: now,
    },
  });
});

apiRouter.put('/projects/:id/tasks/:taskId', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id: projectId, taskId } = req.params;
  const { checked, updatedAt } = req.body || {};

  if (!VALID_TASK_IDS.has(taskId)) {
    sendProblem(res, 400, 'Unknown Task ID', `Task ID '${taskId}' does not exist in the playbook.`, req.originalUrl);
    return;
  }

  const project = db
    .prepare('SELECT id FROM projects WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
    .get(projectId, userId);

  if (!project) {
    sendProblem(res, 404, 'Project Not Found', 'Project does not exist or belongs to another user.', req.originalUrl);
    return;
  }

  const now = updatedAt || new Date().toISOString();
  db.prepare(`
    INSERT INTO project_progress (project_id, task_id, checked, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(project_id, task_id) DO UPDATE SET
      checked = excluded.checked,
      updated_at = excluded.updated_at
  `).run(projectId, taskId, checked ? 1 : 0, now);

  db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(now, projectId);

  res.json({ projectId, taskId, checked: Boolean(checked), updatedAt: now });
});

apiRouter.put('/projects/:id/notes/:phaseId', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id: projectId, phaseId } = req.params;
  const phaseNum = parseInt(phaseId, 10);
  const { text, updatedAt } = req.body || {};

  if (isNaN(phaseNum) || phaseNum < 0 || phaseNum > 17) {
    sendProblem(res, 400, 'Invalid Phase ID', 'Phase ID must be an integer between 0 and 17.', req.originalUrl);
    return;
  }

  const noteText = typeof text === 'string' ? text.slice(0, 5000) : '';

  const project = db
    .prepare('SELECT id FROM projects WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
    .get(projectId, userId);

  if (!project) {
    sendProblem(res, 404, 'Project Not Found', 'Project does not exist or belongs to another user.', req.originalUrl);
    return;
  }

  const now = updatedAt || new Date().toISOString();
  db.prepare(`
    INSERT INTO phase_notes (project_id, phase_id, text, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(project_id, phase_id) DO UPDATE SET
      text = excluded.text,
      updated_at = excluded.updated_at
  `).run(projectId, phaseNum, noteText, now);

  db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(now, projectId);

  res.json({ projectId, phaseId: phaseNum, text: noteText, updatedAt: now });
});

apiRouter.delete('/projects/:id', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const projectId = req.params.id;

  const project = db
    .prepare('SELECT id FROM projects WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
    .get(projectId, userId);

  if (!project) {
    sendProblem(res, 404, 'Project Not Found', 'Project does not exist or belongs to another user.', req.originalUrl);
    return;
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE projects SET deleted_at = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(
    now,
    now,
    projectId,
    userId
  );

  res.json({ message: 'Project deleted successfully.', id: projectId });
});

// ==========================================
// SYNC ENDPOINTS (BIDIRECTIONAL LWW SYNC)
// ==========================================

/**
 * CONFLICT RESOLUTION RULE:
 * Synchronization implements granular Last-Write-Wins (LWW) based on ISO-8601 updated_at timestamps.
 * 1. For project fields/metadata: If the incoming update has a newer timestamp than the server record,
 *    it updates the server. Otherwise, the server state is preserved.
 * 2. For individual task checkboxes: The row with the latest updated_at timestamp wins.
 *    Because each task checkbox is stored as its own row (project_id, task_id, checked, updated_at),
 *    changes made concurrently on two different devices (e.g. Device A checks p1-1 while Device B checks p1-2)
 *    merge losslessly without conflicts or lost updates.
 * 3. For phase notes: The latest note text by updated_at timestamp wins.
 */

apiRouter.get('/sync', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const since = typeof req.query.since === 'string' ? req.query.since : '1970-01-01T00:00:00.000Z';

  const projects = db
    .prepare('SELECT * FROM projects WHERE user_id = ? AND updated_at > ?')
    .all(userId, since) as ProjectRow[];

  const syncProjects = projects.map((p) => {
    const progress = db
      .prepare('SELECT task_id, checked, updated_at FROM project_progress WHERE project_id = ? AND updated_at > ?')
      .all(p.id, since) as { task_id: string; checked: number; updated_at: string }[];

    const notes = db
      .prepare('SELECT phase_id, text, updated_at FROM phase_notes WHERE project_id = ? AND updated_at > ?')
      .all(p.id, since) as { phase_id: number; text: string; updated_at: string }[];

    const snapshots = db
      .prepare('SELECT date, percent, done_count, total_count FROM project_snapshots WHERE project_id = ?')
      .all(p.id) as { date: string; percent: number; done_count: number; total_count: number }[];

    return {
      id: p.id,
      name: p.name,
      mode: p.mode,
      fields: JSON.parse(p.fields_json || '{}'),
      dates: JSON.parse(p.dates_json || '{}'),
      phaseBlocks: JSON.parse(p.blocks_json || '{}'),
      progress: progress.map((pr) => ({ taskId: pr.task_id, checked: Boolean(pr.checked), updatedAt: pr.updated_at })),
      notes: notes.map((n) => ({ phaseId: n.phase_id, text: n.text, updatedAt: n.updated_at })),
      snapshots: snapshots.map((s) => ({ date: s.date, percent: s.percent, doneCount: s.done_count, totalCount: s.total_count })),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      deletedAt: p.deleted_at,
    };
  });

  res.json({
    syncTime: new Date().toISOString(),
    projects: syncProjects,
  });
});

apiRouter.post('/sync', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projects: incomingProjects } = req.body || {};

  if (!Array.isArray(incomingProjects)) {
    sendProblem(res, 400, 'Invalid Batch Payload', 'Expected an array of projects in "projects".', req.originalUrl);
    return;
  }

  const transaction = db.transaction(() => {
    for (const proj of incomingProjects) {
      if (!proj.id || typeof proj.id !== 'string') continue;

      const serverProj = db
        .prepare('SELECT id, user_id, updated_at, deleted_at FROM projects WHERE id = ?')
        .get(proj.id) as { id: string; user_id: string; updated_at: string; deleted_at: string | null } | undefined;

      // Ensure multi-tenant isolation
      if (serverProj && serverProj.user_id !== userId) {
        continue; // Skip foreign projects
      }

      const clientUpdated = proj.updatedAt || new Date().toISOString();
      const serverUpdated = serverProj?.updated_at || '1970-01-01T00:00:00.000Z';

      // LWW on project record
      if (!serverProj || clientUpdated > serverUpdated) {
        const name = typeof proj.name === 'string' ? proj.name.slice(0, 100) : 'Untitled Project';
        const mode = proj.mode === 'existing' ? 'existing' : 'new';
        const fieldsJson = JSON.stringify(proj.fields || {});
        const datesJson = JSON.stringify(proj.dates || {});
        const blocksJson = JSON.stringify(proj.phaseBlocks || {});
        const createdAt = proj.createdAt || clientUpdated;
        const deletedAt = proj.deletedAt || null;

        if (serverProj) {
          db.prepare(`
            UPDATE projects
            SET name = ?, mode = ?, fields_json = ?, dates_json = ?, blocks_json = ?, updated_at = ?, deleted_at = ?
            WHERE id = ? AND user_id = ?
          `).run(name, mode, fieldsJson, datesJson, blocksJson, clientUpdated, deletedAt, proj.id, userId);
        } else {
          db.prepare(`
            INSERT INTO projects (id, user_id, name, mode, fields_json, dates_json, blocks_json, created_at, updated_at, deleted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(proj.id, userId, name, mode, fieldsJson, datesJson, blocksJson, createdAt, clientUpdated, deletedAt);
        }
      }

      // Merge task checkboxes granularly by task_id and timestamp
      if (proj.checkedTasks && typeof proj.checkedTasks === 'object') {
        for (const [taskId, checked] of Object.entries(proj.checkedTasks)) {
          if (!VALID_TASK_IDS.has(taskId)) continue;

          const taskTimestamp = clientUpdated; // or task-specific timestamp if present
          const existingTask = db
            .prepare('SELECT checked, updated_at FROM project_progress WHERE project_id = ? AND task_id = ?')
            .get(proj.id, taskId) as { checked: number; updated_at: string } | undefined;

          if (!existingTask || taskTimestamp >= existingTask.updated_at) {
            db.prepare(`
              INSERT INTO project_progress (project_id, task_id, checked, updated_at)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(project_id, task_id) DO UPDATE SET
                checked = excluded.checked,
                updated_at = excluded.updated_at
            `).run(proj.id, taskId, checked ? 1 : 0, taskTimestamp);
          }
        }
      }

      // Merge phase notes
      if (proj.notes && typeof proj.notes === 'object') {
        for (const [phaseKey, noteContent] of Object.entries(proj.notes)) {
          const pNum = Number(phaseKey);
          if (isNaN(pNum) || pNum < 0 || pNum > 17 || typeof noteContent !== 'string') continue;

          const noteText = noteContent.slice(0, 5000);
          const noteTimestamp = clientUpdated;
          const existingNote = db
            .prepare('SELECT text, updated_at FROM phase_notes WHERE project_id = ? AND phase_id = ?')
            .get(proj.id, pNum) as { text: string; updated_at: string } | undefined;

          if (!existingNote || noteTimestamp >= existingNote.updated_at) {
            db.prepare(`
              INSERT INTO phase_notes (project_id, phase_id, text, updated_at)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(project_id, phase_id) DO UPDATE SET
                text = excluded.text,
                updated_at = excluded.updated_at
            `).run(proj.id, pNum, noteText, noteTimestamp);
          }
        }
      }

      // Merge weekly snapshots
      if (Array.isArray(proj.weeklySnapshots)) {
        for (const snap of proj.weeklySnapshots) {
          if (!snap.date) continue;
          db.prepare(`
            INSERT OR IGNORE INTO project_snapshots (project_id, date, percent, done_count, total_count)
            VALUES (?, ?, ?, ?, ?)
          `).run(proj.id, snap.date, snap.percent || 0, snap.doneCount || 0, snap.totalCount || 0);
        }
      }
    }
  });

  transaction();

  // Return the complete updated state for all user projects
  const allUserProjects = db
    .prepare('SELECT * FROM projects WHERE user_id = ? AND deleted_at IS NULL')
    .all(userId) as ProjectRow[];

  const merged = allUserProjects.map((p) => {
    const progress = db
      .prepare('SELECT task_id, checked FROM project_progress WHERE project_id = ?')
      .all(p.id) as { task_id: string; checked: number }[];
    const checkedTasks: Record<string, boolean> = {};
    for (const r of progress) {
      if (r.checked) checkedTasks[r.task_id] = true;
    }

    const notes = db
      .prepare('SELECT phase_id, text FROM phase_notes WHERE project_id = ?')
      .all(p.id) as { phase_id: number; text: string }[];
    const notesMap: Record<number, string> = {};
    for (const r of notes) {
      notesMap[r.phase_id] = r.text;
    }

    const snapshots = db
      .prepare('SELECT date, percent, done_count, total_count FROM project_snapshots WHERE project_id = ? ORDER BY date ASC')
      .all(p.id) as { date: string; percent: number; done_count: number; total_count: number }[];

    return {
      id: p.id,
      name: p.name,
      mode: p.mode,
      fields: JSON.parse(p.fields_json || '{}'),
      dates: JSON.parse(p.dates_json || '{}'),
      phaseBlocks: JSON.parse(p.blocks_json || '{}'),
      checkedTasks,
      notes: notesMap,
      weeklySnapshots: snapshots.map((s) => ({
        date: s.date,
        percent: s.percent,
        doneCount: s.done_count,
        totalCount: s.total_count,
      })),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  });

  res.json({
    syncTime: new Date().toISOString(),
    projects: merged,
  });
});
