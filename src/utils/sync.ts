import { ProjectData, SyncStatus } from '../types';

const SYNC_QUEUE_KEY = 'swlp_sync_queue';

export interface SyncQueueItem {
  type: 'project_upsert' | 'task_toggle' | 'note_update' | 'project_delete';
  projectId: string;
  data?: any;
  timestamp: string;
}

/**
 * Loads pending sync queue from localStorage.
 */
export function getSyncQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore corrupt queue
  }
  return [];
}

/**
 * Saves sync queue to localStorage.
 */
export function saveSyncQueue(queue: SyncQueueItem[]): void {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage quota or private window
  }
}

/**
 * Enqueues a change to be sent to the server.
 */
export function enqueueSync(item: SyncQueueItem): void {
  const queue = getSyncQueue();
  queue.push(item);
  saveSyncQueue(queue);
}

/**
 * Clears the sync queue.
 */
export function clearSyncQueue(): void {
  try {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  } catch {}
}

/**
 * Synchronization Client Engine with Exponential Backoff
 */
export class SyncManager {
  private backoffDelayMs = 1000;
  private maxBackoffMs = 60000;
  private retryTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private onStatusChange?: (status: SyncStatus) => void;
  private onMergedProjects?: (mergedProjects: ProjectData[]) => void;

  constructor(
    onStatusChange?: (status: SyncStatus) => void,
    onMergedProjects?: (mergedProjects: ProjectData[]) => void
  ) {
    this.onStatusChange = onStatusChange;
    this.onMergedProjects = onMergedProjects;
  }

  public setCallbacks(
    onStatusChange: (status: SyncStatus) => void,
    onMergedProjects: (mergedProjects: ProjectData[]) => void
  ) {
    this.onStatusChange = onStatusChange;
    this.onMergedProjects = onMergedProjects;
  }

  /**
   * Triggers a sync attempt with the backend server.
   */
  public async sync(projects: ProjectData[], isAuthenticated: boolean): Promise<boolean> {
    if (!isAuthenticated) {
      this.onStatusChange?.('saved-local');
      return true;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.onStatusChange?.('offline');
      this.scheduleRetry(projects, isAuthenticated);
      return false;
    }

    if (this.isSyncing) return false;
    this.isSyncing = true;
    this.onStatusChange?.('syncing');

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // sends httpOnly session cookie
        body: JSON.stringify({ projects }),
      });

      if (!res.ok) {
        throw new Error(`Sync failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      this.isSyncing = false;
      this.backoffDelayMs = 1000; // Reset backoff on success
      clearSyncQueue();
      this.onStatusChange?.('saved-cloud');

      if (data.projects && Array.isArray(data.projects)) {
        this.onMergedProjects?.(data.projects);
      }

      return true;
    } catch {
      this.isSyncing = false;
      this.onStatusChange?.('offline');
      this.scheduleRetry(projects, isAuthenticated);
      return false;
    }
  }

  /**
   * Schedules a retry with exponential backoff (1s, 2s, 4s, ..., max 60s).
   */
  private scheduleRetry(projects: ProjectData[], isAuthenticated: boolean): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);

    this.retryTimer = setTimeout(() => {
      this.sync(projects, isAuthenticated);
      // Double the delay up to 60 seconds
      this.backoffDelayMs = Math.min(this.backoffDelayMs * 2, this.maxBackoffMs);
    }, this.backoffDelayMs);
  }

  public stop(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }
}
