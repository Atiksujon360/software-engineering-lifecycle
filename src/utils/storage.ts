import { PHASES } from '../data/playbook';
import {
  AppStorageV2,
  ExportDataV1,
  ExportDataV2,
  PortfolioProjectSummary,
  ProjectData,
  ProjectMode,
} from '../types';
import { getAllValidTaskIds, getCurrentPhaseInfo } from './metrics';

export const STORAGE_KEY_V2 = 'swlp.v2';
export const STORAGE_KEY_V1 = 'swlp.v1';
export const APP_NAME = 'Engineering Lifecycle Playbook';

export const MAX_NOTE_LENGTH = 5000;
export const MAX_FIELD_LENGTH = 300;

export interface StorageLoadResult {
  data: AppStorageV2;
  corruptNotice?: string;
  storageBlocked: boolean;
}

/**
 * Creates a blank project with initial default state.
 */
export function createDefaultProject(id = 'proj-default', name = 'Default Project'): ProjectData {
  const now = new Date().toISOString();
  return {
    id,
    name,
    mode: 'new',
    checkedTasks: {},
    notes: {},
    fields: {
      PROJECT_NAME: name,
      ONE_LINE: '',
      USERS: '',
      STACK: '',
      REPO_PATH: '',
      TIMEFRAME: '',
    },
    dates: {},
    phaseBlocks: {},
    weeklySnapshots: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates default v2 storage structure.
 */
export function createDefaultStorage(): AppStorageV2 {
  const defaultProj = createDefaultProject();
  return {
    version: 2,
    appName: APP_NAME,
    activeProjectId: defaultProj.id,
    projects: [defaultProj],
    theme: 'auto',
  };
}

/**
 * Sanitizes and validates a ProjectData object:
 * - Drops unknown task IDs
 * - Truncates notes to 5000 chars
 * - Truncates fields to 300 chars
 * - Preserves dates, phase blocks (reason <= 200 chars), and weekly snapshots
 */
export function sanitizeProject(raw: Partial<ProjectData>, validTaskIds: Set<string>): ProjectData {
  const id = typeof raw.id === 'string' && raw.id ? raw.id : `proj-${Date.now()}`;
  const name = typeof raw.name === 'string' && raw.name ? raw.name.slice(0, 100) : 'Untitled Project';
  const mode: ProjectMode = raw.mode === 'existing' ? 'existing' : 'new';

  const checkedTasks: Record<string, boolean> = {};
  if (raw.checkedTasks && typeof raw.checkedTasks === 'object') {
    for (const [taskId, isChecked] of Object.entries(raw.checkedTasks)) {
      if (validTaskIds.has(taskId) && Boolean(isChecked)) {
        checkedTasks[taskId] = true;
      }
    }
  }

  const notes: Record<number, string> = {};
  if (raw.notes && typeof raw.notes === 'object') {
    for (const [phaseKey, noteContent] of Object.entries(raw.notes)) {
      const phaseNum = Number(phaseKey);
      if (!isNaN(phaseNum) && phaseNum >= 0 && phaseNum <= 17 && typeof noteContent === 'string') {
        notes[phaseNum] = noteContent.slice(0, MAX_NOTE_LENGTH);
      }
    }
  }

  const fields: Record<string, string> = {};
  if (raw.fields && typeof raw.fields === 'object') {
    for (const [fieldKey, val] of Object.entries(raw.fields)) {
      if (typeof val === 'string') {
        fields[fieldKey] = val.slice(0, MAX_FIELD_LENGTH);
      }
    }
  }

  // Sanitize phase blocks (reason up to 200 chars)
  const phaseBlocks: Record<number, any> = {};
  if (raw.phaseBlocks && typeof raw.phaseBlocks === 'object') {
    for (const [pKey, block] of Object.entries(raw.phaseBlocks)) {
      const pNum = Number(pKey);
      if (!isNaN(pNum) && block && typeof block === 'object') {
        phaseBlocks[pNum] = {
          isBlocked: Boolean(block.isBlocked),
          reason: typeof block.reason === 'string' ? block.reason.slice(0, 200) : '',
          blockedSince: block.blockedSince || new Date().toISOString(),
        };
      }
    }
  }

  const weeklySnapshots = Array.isArray(raw.weeklySnapshots) ? raw.weeklySnapshots : [];

  return {
    id,
    name,
    mode,
    checkedTasks,
    notes,
    fields,
    dates: raw.dates || {},
    phaseBlocks,
    weeklySnapshots,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

/**
 * Checks if localStorage is available and writable.
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__swlp_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Saves current app storage to localStorage.
 */
export function saveStorage(storage: AppStorageV2): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(storage));
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

/**
 * Loads storage with v1 migration and corrupt data fallback.
 */
export function loadStorage(): StorageLoadResult {
  const validTaskIds = getAllValidTaskIds(PHASES);

  if (!isStorageAvailable()) {
    return {
      data: createDefaultStorage(),
      storageBlocked: true,
      corruptNotice: 'Browser storage is blocked (e.g. private mode or disabled cookies). Progress will not be saved across page reloads.',
    };
  }

  // 1. Check for V2 storage
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
        const sanitizedProjects = parsed.projects.map((p: Partial<ProjectData>) =>
          sanitizeProject(p, validTaskIds)
        );

        let activeId = parsed.activeProjectId;
        if (!sanitizedProjects.some((p: ProjectData) => p.id === activeId)) {
          activeId = sanitizedProjects[0].id;
        }

        const validThemes = ['auto', 'light', 'dark'];
        const theme = validThemes.includes(parsed.theme) ? parsed.theme : 'auto';

        return {
          data: {
            version: 2,
            appName: APP_NAME,
            activeProjectId: activeId,
            projects: sanitizedProjects,
            theme,
          },
          storageBlocked: false,
        };
      } else {
        throw new Error('Malformed V2 data structure');
      }
    }
  } catch (err) {
    console.warn('Corrupt V2 storage detected:', err);
    const fallback = createDefaultStorage();
    return {
      data: fallback,
      storageBlocked: false,
      corruptNotice: 'Saved data was corrupted or malformed. A fresh project has been initialized without crashing.',
    };
  }

  // 2. Check for V1 migration
  try {
    const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1);
      const migratedProject: ProjectData = {
        id: `proj-migrated-${Date.now()}`,
        name: 'My project',
        mode: parsedV1.mode === 'existing' ? 'existing' : 'new',
        checkedTasks: {},
        notes: {},
        fields: {
          PROJECT_NAME: 'My project',
          ONE_LINE: parsedV1.oneLine || '',
          USERS: parsedV1.users || '',
          STACK: parsedV1.stack || '',
          REPO_PATH: parsedV1.repoPath || '',
          TIMEFRAME: parsedV1.timeframe || '',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (parsedV1.checkedTasks && typeof parsedV1.checkedTasks === 'object') {
        for (const [k, v] of Object.entries(parsedV1.checkedTasks)) {
          if (validTaskIds.has(k) && Boolean(v)) {
            migratedProject.checkedTasks[k] = true;
          }
        }
      }

      if (parsedV1.notes && typeof parsedV1.notes === 'object') {
        for (const [k, v] of Object.entries(parsedV1.notes)) {
          const pNum = Number(k);
          if (!isNaN(pNum) && typeof v === 'string') {
            migratedProject.notes[pNum] = v.slice(0, MAX_NOTE_LENGTH);
          }
        }
      }

      const migratedStorage: AppStorageV2 = {
        version: 2,
        appName: APP_NAME,
        activeProjectId: migratedProject.id,
        projects: [migratedProject],
        theme: 'auto',
      };

      saveStorage(migratedStorage);
      return {
        data: migratedStorage,
        storageBlocked: false,
      };
    }
  } catch (err) {
    console.warn('Failed to parse V1 storage for migration:', err);
  }

  // 3. Fallback default
  const defaultStorage = createDefaultStorage();
  saveStorage(defaultStorage);
  return {
    data: defaultStorage,
    storageBlocked: false,
  };
}

/**
 * Creates export payload for a project:
 * NOTE: Project fields are strictly omitted per requirements!
 */
export function createProjectExport(project: ProjectData): ExportDataV2 {
  return {
    version: 2,
    appName: APP_NAME,
    projectId: project.id,
    name: project.name,
    mode: project.mode,
    checkedTasks: { ...project.checkedTasks },
    notes: { ...project.notes },
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Downloads a JSON file in the browser.
 */
export function triggerFileDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Result of validating an imported progress file.
 */
export interface ImportValidationResult {
  valid: boolean;
  error?: string;
  data?: {
    name: string;
    mode: ProjectMode;
    checkedTasks: Record<string, boolean>;
    notes: Record<number, string>;
    exportedAt: string;
  };
}

/**
 * Validates an import JSON file (accepts v1 and v2 formats).
 */
export function validateImportJSON(rawText: string): ImportValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { valid: false, error: 'File is not valid JSON.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'JSON content is not an object.' };
  }

  const obj = parsed as Record<string, unknown>;
  const validTaskIds = getAllValidTaskIds(PHASES);

  // Check V2 format
  if (obj.version === 2) {
    if (obj.appName && obj.appName !== APP_NAME) {
      return { valid: false, error: `Invalid app name "${obj.appName}". Expected "${APP_NAME}".` };
    }

    const name = typeof obj.name === 'string' && obj.name.trim() ? obj.name.trim() : 'Imported Project';
    const mode: ProjectMode = obj.mode === 'existing' ? 'existing' : 'new';

    const checkedTasks: Record<string, boolean> = {};
    if (obj.checkedTasks && typeof obj.checkedTasks === 'object') {
      for (const [k, v] of Object.entries(obj.checkedTasks as Record<string, unknown>)) {
        if (validTaskIds.has(k) && Boolean(v)) {
          checkedTasks[k] = true;
        }
      }
    }

    const notes: Record<number, string> = {};
    if (obj.notes && typeof obj.notes === 'object') {
      for (const [k, v] of Object.entries(obj.notes as Record<string, unknown>)) {
        const pNum = Number(k);
        if (!isNaN(pNum) && pNum >= 0 && pNum <= 17 && typeof v === 'string') {
          notes[pNum] = v.slice(0, MAX_NOTE_LENGTH);
        }
      }
    }

    const exportedAt = typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString();

    return {
      valid: true,
      data: { name, mode, checkedTasks, notes, exportedAt },
    };
  }

  // Check V1 or legacy format
  if (obj.version === 1 || (!obj.version && (obj.checkedTasks || obj.tasks))) {
    const name = typeof obj.name === 'string' && obj.name.trim() ? obj.name.trim() : 'Imported V1 Project';
    const mode: ProjectMode = obj.mode === 'existing' ? 'existing' : 'new';

    const rawTasks = (obj.checkedTasks || obj.tasks || {}) as Record<string, unknown>;
    const checkedTasks: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(rawTasks)) {
      if (validTaskIds.has(k) && Boolean(v)) {
        checkedTasks[k] = true;
      }
    }

    const rawNotes = (obj.notes || {}) as Record<string, unknown>;
    const notes: Record<number, string> = {};
    for (const [k, v] of Object.entries(rawNotes)) {
      const pNum = Number(k);
      if (!isNaN(pNum) && pNum >= 0 && pNum <= 17 && typeof v === 'string') {
        notes[pNum] = v.slice(0, MAX_NOTE_LENGTH);
      }
    }

    const exportedAt = typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString();

    return {
      valid: true,
      data: { name, mode, checkedTasks, notes, exportedAt },
    };
  }

  return {
    valid: false,
    error: 'Unrecognized format. File must be a valid Engineering Lifecycle Playbook progress file (v1 or v2).',
  };
}

/**
 * Parses and computes summary for a portfolio file.
 */
export function parsePortfolioFile(
  fileName: string,
  rawText: string
): { summary?: PortfolioProjectSummary; error?: string } {
  const result = validateImportJSON(rawText);
  if (!result.valid || !result.data) {
    return { error: `File "${fileName}" was skipped: ${result.error || 'Invalid file format'}` };
  }

  const { name, mode, checkedTasks, notes, exportedAt } = result.data;
  const { currentPhase, nextTask, isAllCompleted } = getCurrentPhaseInfo(PHASES, checkedTasks, mode);

  let totalCount = 0;
  let doneCount = 0;
  for (const phase of PHASES) {
    const tasks = phase.id === 0 && mode === 'existing' && phase.existing
      ? [...phase.tasks, ...phase.existing]
      : phase.tasks;
    totalCount += tasks.length;
    for (const t of tasks) {
      if (checkedTasks[t.id]) doneCount++;
    }
  }

  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const currentPhaseTitle = `Phase ${currentPhase.id}: ${currentPhase.short}`;
  const nextAction = isAllCompleted
    ? 'All applicable tasks completed'
    : nextTask
    ? `${nextTask.id}: ${nextTask.text}`
    : 'None';

  const rawExport: ExportDataV2 = {
    version: 2,
    appName: APP_NAME,
    projectId: `imported-${Date.now()}`,
    name,
    mode,
    checkedTasks,
    notes,
    exportedAt,
  };

  return {
    summary: {
      name,
      mode,
      percent,
      doneCount,
      totalCount,
      currentPhase: currentPhaseTitle,
      nextAction,
      lastExported: exportedAt.slice(0, 10),
      raw: rawExport,
    },
  };
}
