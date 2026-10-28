import { describe, expect, it } from 'vitest';
import { db } from '../server/db';
import { hashPassword, signToken } from '../server/auth';
import { createServerApp } from '../server/index';
import { ProjectData } from '../src/types';

describe('Server API and Multi-Tenant Isolation', () => {
  const app = createServerApp();

  // Helper to make mock requests to express app without needing network port
  async function callApp(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    cookieToken?: string,
    body?: any
  ): Promise<{ status: number; body: any; headers: any }> {
    return new Promise((resolve) => {
      const http = require('node:http');
      const server = http.createServer(app);
      server.listen(0, async () => {
        const port = (server.address() as any).port;
        const headers: Record<string, string> = {};
        if (cookieToken) {
          headers['Cookie'] = `swlp_session=${cookieToken}`;
        }
        if (body) {
          headers['Content-Type'] = 'application/json';
        }

        const res = await fetch(`http://127.0.0.1:${port}${path}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

        const resBody = await res.json().catch(() => null);
        server.close(() => {
          resolve({ status: res.status, body: resBody, headers: res.headers });
        });
      });
    });
  }

  it('1. Multi-tenant isolation: User A cannot read or modify User B\'s projects', async () => {
    const userAId = `user-a-${Date.now()}`;
    const userBId = `user-b-${Date.now()}`;
    const now = new Date().toISOString();

    // Insert User A and User B
    const passHash = await hashPassword('password123');
    db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
      userAId,
      `${userAId}@example.com`,
      passHash,
      now
    );
    db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
      userBId,
      `${userBId}@example.com`,
      passHash,
      now
    );

    const tokenA = signToken(userAId);
    const tokenB = signToken(userBId);

    // User A creates project 'Project Alpha'
    const projAId = `proj-a-${Date.now()}`;
    const createRes = await callApp('PUT', `/api/projects/${projAId}`, tokenA, {
      name: 'Project Alpha',
      mode: 'new',
      fields: { PROJECT_NAME: 'Project Alpha' },
    });
    expect(createRes.status).toBe(200);

    // User A lists projects: sees 'Project Alpha'
    const listResA = await callApp('GET', '/api/projects', tokenA);
    expect(listResA.status).toBe(200);
    const userAProjects = listResA.body.projects.map((p: any) => p.id);
    expect(userAProjects).toContain(projAId);

    // User B lists projects: CANNOT see 'Project Alpha'
    const listResB = await callApp('GET', '/api/projects', tokenB);
    expect(listResB.status).toBe(200);
    const userBProjects = listResB.body.projects.map((p: any) => p.id);
    expect(userBProjects).not.toContain(projAId);

    // User B tries to update User A's project: returns 403 Forbidden (Problem Details)
    const updateResB = await callApp('PUT', `/api/projects/${projAId}`, tokenB, {
      name: 'Hacked by B',
    });
    expect(updateResB.status).toBe(403);
    expect(updateResB.body.type).toBe('https://datatracker.ietf.org/doc/html/rfc9457');

    // User B tries to check a task on User A's project: returns 404
    const taskResB = await callApp('PUT', `/api/projects/${projAId}/tasks/p0-1`, tokenB, {
      checked: true,
    });
    expect(taskResB.status).toBe(404);

    // User B tries to soft-delete User A's project: returns 404
    const deleteResB = await callApp('DELETE', `/api/projects/${projAId}`, tokenB);
    expect(deleteResB.status).toBe(404);
  });

  it('2. Sync merge resolves conflicts by last-write-wins (LWW)', async () => {
    const userId = `user-sync-${Date.now()}`;
    const now = new Date().toISOString();
    const passHash = await hashPassword('password123');
    db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
      userId,
      `${userId}@example.com`,
      passHash,
      now
    );
    const token = signToken(userId);

    const projId = `proj-sync-${Date.now()}`;

    // Step 1: Initial sync with older timestamp T1
    const t1 = new Date('2026-05-01T10:00:00Z').toISOString();
    const initialSync = await callApp('POST', '/api/sync', token, {
      projects: [
        {
          id: projId,
          name: 'Original Title',
          mode: 'new',
          fields: { PROJECT_NAME: 'Original Title' },
          checkedTasks: { 'p0-1': true },
          notes: {},
          createdAt: t1,
          updatedAt: t1,
        },
      ],
    });
    expect(initialSync.status).toBe(200);

    // Step 2: Client A sends a newer update T3 (2026-05-01T12:00:00Z)
    const t3 = new Date('2026-05-01T12:00:00Z').toISOString();
    const updateSync = await callApp('POST', '/api/sync', token, {
      projects: [
        {
          id: projId,
          name: 'Client A Newest Title',
          mode: 'new',
          fields: { PROJECT_NAME: 'Client A Newest Title' },
          checkedTasks: { 'p0-1': true, 'p0-2': true },
          notes: {},
          createdAt: t1,
          updatedAt: t3,
        },
      ],
    });
    expect(updateSync.status).toBe(200);
    const projA = updateSync.body.projects.find((p: any) => p.id === projId);
    expect(projA.name).toBe('Client A Newest Title');
    expect(projA.checkedTasks['p0-2']).toBe(true);

    // Step 3: Client B sends an older update T2 (2026-05-01T11:00:00Z)
    // Because T2 < T3, Client A's newer write wins, Client B's stale title is ignored
    const t2 = new Date('2026-05-01T11:00:00Z').toISOString();
    const staleSync = await callApp('POST', '/api/sync', token, {
      projects: [
        {
          id: projId,
          name: 'Client B Stale Title',
          mode: 'new',
          fields: { PROJECT_NAME: 'Client B Stale Title' },
          checkedTasks: { 'p0-1': false }, // older uncheck
          notes: {},
          createdAt: t1,
          updatedAt: t2,
        },
      ],
    });
    expect(staleSync.status).toBe(200);
    const mergedProj = staleSync.body.projects.find((p: any) => p.id === projId);

    // Last write wins: 'Client A Newest Title' should be preserved
    expect(mergedProj.name).toBe('Client A Newest Title');
  });
});
