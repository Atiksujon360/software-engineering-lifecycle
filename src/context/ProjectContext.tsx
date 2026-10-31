import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { PHASES } from '../data/playbook';
import {
  AppStorageV2,
  AuthUser,
  PhaseBlock,
  ProjectData,
  ProjectDates,
  ProjectMode,
  SyncStatus,
  WeeklySnapshot,
} from '../types';
import { calculateOverallProgress } from '../utils/metrics';
import {
  createDefaultProject,
  loadStorage,
  MAX_FIELD_LENGTH,
  MAX_NOTE_LENGTH,
  saveStorage,
  StorageLoadResult,
} from '../utils/storage';
import { SyncManager } from '../utils/sync';
import { recordWeeklySnapshot } from '../utils/tracking';
import { apiClient } from '../lib/api-client';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ProjectContextValue {
  storage: AppStorageV2;
  activeProject: ProjectData;
  storageBlocked: boolean;
  corruptNotice?: string;
  toasts: ToastMessage[];
  addToast: (text: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  setActiveProject: (projectId: string) => void;
  updateField: (key: string, value: string) => void;
  toggleTask: (taskId: string) => void;
  updateNote: (phaseId: number, content: string) => void;
  setMode: (mode: ProjectMode) => void;
  createProject: (name: string) => void;
  renameProject: (projectId: string, newName: string) => void;
  deleteProject: (projectId: string) => boolean;
  resetProgress: () => void;
  importProgress: (data: {
    name: string;
    mode: ProjectMode;
    checkedTasks: Record<string, boolean>;
    notes: Record<number, string>;
  }) => void;
  setTheme: (theme: 'auto' | 'light' | 'dark') => void;
  cycleTheme: () => void;

  // On-track Tracking Actions
  updateDates: (projectId: string, dates: ProjectDates) => void;
  setPhaseBlock: (projectId: string, phaseId: number, isBlocked: boolean, reason?: string) => void;
  recordSnapshot: (projectId: string) => void;

  // Cloud Sync & Auth
  user: AuthUser | null;
  authLoading: boolean;
  syncStatus: SyncStatus;
  syncNow: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

type Action =
  | { type: 'SET_ACTIVE_PROJECT'; payload: string }
  | { type: 'UPDATE_FIELD'; payload: { key: string; value: string } }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'UPDATE_NOTE'; payload: { phaseId: number; content: string } }
  | { type: 'SET_MODE'; payload: ProjectMode }
  | { type: 'CREATE_PROJECT'; payload: string }
  | { type: 'RENAME_PROJECT'; payload: { id: string; name: string } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'RESET_PROGRESS' }
  | {
      type: 'IMPORT_PROGRESS';
      payload: {
        name: string;
        mode: ProjectMode;
        checkedTasks: Record<string, boolean>;
        notes: Record<number, string>;
      };
    }
  | { type: 'SET_THEME'; payload: 'auto' | 'light' | 'dark' }
  | { type: 'UPDATE_DATES'; payload: { projectId: string; dates: ProjectDates } }
  | {
      type: 'SET_PHASE_BLOCK';
      payload: { projectId: string; phaseId: number; isBlocked: boolean; reason?: string };
    }
  | {
      type: 'RECORD_SNAPSHOT';
      payload: { projectId: string; snapshot: WeeklySnapshot };
    }
  | { type: 'MERGE_PROJECTS'; payload: ProjectData[] };

function projectReducer(state: AppStorageV2, action: Action): AppStorageV2 {
  const now = new Date().toISOString();

  switch (action.type) {
    case 'SET_ACTIVE_PROJECT': {
      if (state.projects.some((p) => p.id === action.payload)) {
        return { ...state, activeProjectId: action.payload };
      }
      return state;
    }

    case 'UPDATE_FIELD': {
      const { key, value } = action.payload;
      const sanitized = value.slice(0, MAX_FIELD_LENGTH);
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== state.activeProjectId) return p;
        return {
          ...p,
          fields: { ...p.fields, [key]: sanitized },
          updatedAt: now,
        };
      });
      return { ...state, projects: updatedProjects };
    }

    case 'TOGGLE_TASK': {
      const taskId = action.payload;
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== state.activeProjectId) return p;
        const current = Boolean(p.checkedTasks[taskId]);
        const nextTasks = { ...p.checkedTasks };
        if (current) {
          delete nextTasks[taskId];
        } else {
          nextTasks[taskId] = true;
        }
        return { ...p, checkedTasks: nextTasks, updatedAt: now };
      });
      return { ...state, projects: updatedProjects };
    }

    case 'UPDATE_NOTE': {
      const { phaseId, content } = action.payload;
      const sanitized = content.slice(0, MAX_NOTE_LENGTH);
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== state.activeProjectId) return p;
        return {
          ...p,
          notes: { ...p.notes, [phaseId]: sanitized },
          updatedAt: now,
        };
      });
      return { ...state, projects: updatedProjects };
    }

    case 'SET_MODE': {
      const mode = action.payload;
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== state.activeProjectId) return p;
        return { ...p, mode, updatedAt: now };
      });
      return { ...state, projects: updatedProjects };
    }

    case 'CREATE_PROJECT': {
      const name = action.payload.trim() || 'New Project';
      const newProj = createDefaultProject(`proj-${Date.now()}`, name);
      return {
        ...state,
        projects: [...state.projects, newProj],
        activeProjectId: newProj.id,
      };
    }

    case 'RENAME_PROJECT': {
      const { id, name } = action.payload;
      const cleanName = name.trim() || 'Untitled Project';
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          name: cleanName,
          fields: { ...p.fields, PROJECT_NAME: cleanName },
          updatedAt: now,
        };
      });
      return { ...state, projects: updatedProjects };
    }

    case 'DELETE_PROJECT': {
      if (state.projects.length <= 1) {
        return state; // Never delete last project
      }
      const filtered = state.projects.filter((p) => p.id !== action.payload);
      let nextActive = state.activeProjectId;
      if (nextActive === action.payload) {
        nextActive = filtered[0].id;
      }
      return { ...state, projects: filtered, activeProjectId: nextActive };
    }

    case 'RESET_PROGRESS': {
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== state.activeProjectId) return p;
        return {
          ...p,
          checkedTasks: {},
          notes: {},
          updatedAt: now,
        };
      });
      return { ...state, projects: updatedProjects };
    }

    case 'IMPORT_PROGRESS': {
      const { name, mode, checkedTasks, notes } = action.payload;
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== state.activeProjectId) return p;
        return {
          ...p,
          name,
          mode,
          checkedTasks,
          notes,
          fields: { ...p.fields, PROJECT_NAME: name },
          updatedAt: now,
        };
      });
      return { ...state, projects: updatedProjects };
    }

    case 'SET_THEME': {
      return { ...state, theme: action.payload };
    }

    case 'UPDATE_DATES': {
      const { projectId, dates } = action.payload;
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          dates: { ...p.dates, ...dates },
          updatedAt: now,
        };
      });
      return { ...state, projects: updatedProjects };
    }

    case 'SET_PHASE_BLOCK': {
      const { projectId, phaseId, isBlocked, reason } = action.payload;
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const currentBlocks = p.phaseBlocks || {};
        const newBlock: PhaseBlock = {
          isBlocked,
          reason: (reason || '').slice(0, 200),
          blockedSince: isBlocked
            ? currentBlocks[phaseId]?.blockedSince || now
            : '',
        };
        return {
          ...p,
          phaseBlocks: {
            ...currentBlocks,
            [phaseId]: newBlock,
          },
          updatedAt: now,
        };
      });
      return { ...state, projects: updatedProjects };
    }

    case 'RECORD_SNAPSHOT': {
      const { projectId, snapshot } = action.payload;
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const currentSnapshots = p.weeklySnapshots || [];
        return {
          ...p,
          weeklySnapshots: [...currentSnapshots, snapshot],
          updatedAt: now,
        };
      });
      return { ...state, projects: updatedProjects };
    }

    case 'MERGE_PROJECTS': {
      const cloudProjects = action.payload;
      if (!cloudProjects || cloudProjects.length === 0) return state;

      // Merge cloud projects with local projects using LWW (last write wins)
      const mergedMap = new Map<string, ProjectData>();
      for (const lp of state.projects) {
        mergedMap.set(lp.id, lp);
      }

      for (const cp of cloudProjects) {
        const local = mergedMap.get(cp.id);
        if (!local) {
          mergedMap.set(cp.id, cp);
        } else {
          // LWW based on updatedAt
          const localTime = new Date(local.updatedAt).getTime();
          const cloudTime = new Date(cp.updatedAt).getTime();
          if (cloudTime >= localTime) {
            mergedMap.set(cp.id, cp);
          }
        }
      }

      const mergedList = Array.from(mergedMap.values());
      const activeExists = mergedList.some((p) => p.id === state.activeProjectId);
      const nextActive = activeExists ? state.activeProjectId : mergedList[0]?.id || state.activeProjectId;

      return {
        ...state,
        projects: mergedList,
        activeProjectId: nextActive,
      };
    }

    default:
      return state;
  }
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadResult] = useState<StorageLoadResult>(() => loadStorage());
  const [storage, dispatch] = useReducer(projectReducer, loadResult.data);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved-local');
  const [projectLoading, setProjectLoading] = useState(false);

  // Sync Manager ref
  const syncManagerRef = useRef<SyncManager | null>(null);

  // Initialize Sync Manager
  useEffect(() => {
    const sm = new SyncManager(
      (status) => setSyncStatus(status),
      (merged) => {
        dispatch({ type: 'MERGE_PROJECTS', payload: merged });
      }
    );
    syncManagerRef.current = sm;

    return () => {
      sm.stop();
    };
  }, []);

  // Check auth session on mount (optional - don't block app if offline)
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const me = await apiClient.me();
        if (isMounted) {
          setUser({ id: String(me.id), email: 'owner@playbook.local' });
          setSyncStatus('saved-cloud');
          
          // Load projects from backend (SQLite is authoritative)
          try {
            setProjectLoading(true);
            const projects = await apiClient.getProjects();
            if (projects.length > 0) {
              // Load complete state for each project
              const backendProjects = await Promise.all(
                projects.map(async (p: any) => {
                  const fullState = await apiClient.getProjectWithState(p.slug);
                  const checkedTasks: Record<string, boolean> = {};
                  fullState.taskStates.forEach((ts: any) => {
                    if (ts.checked) checkedTasks[ts.taskId] = true;
                  });
                  
                  const notes: Record<number, string> = {};
                  fullState.notes.forEach((n: any) => {
                    notes[n.phaseId] = n.body;
                  });
                  
                  return {
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    mode: p.mode,
                    checkedTasks,
                    notes,
                    fields: {
                      PROJECT_NAME: p.name,
                      ONE_LINE: p.oneLine || '',
                      USERS: p.users || '',
                      STACK: p.stack || '',
                      REPO_PATH: p.repoPath || '',
                      TIMEFRAME: p.timeframe || '',
                    },
                    dates: p.dates ? JSON.parse(p.dates) : undefined,
                    phaseBlocks: p.phaseBlocks ? JSON.parse(p.phaseBlocks) : undefined,
                    weeklySnapshots: p.weeklySnapshots ? JSON.parse(p.weeklySnapshots) : undefined,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                  };
                })
              );
              
              dispatch({ type: 'MERGE_PROJECTS', payload: backendProjects });
              
              // Set active project to first backend project
              if (backendProjects.length > 0) {
                dispatch({ type: 'SET_ACTIVE_PROJECT', payload: backendProjects[0].id });
              }
            }
          } catch (e) {
            console.error('Failed to load projects from backend:', e);
          } finally {
            setProjectLoading(false);
          }
        }
      } catch {
        // Server unreachable or offline - use localStorage only
        if (isMounted) {
          setUser(null);
          setSyncStatus('saved-local');
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    }
    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Trigger sync when projects change and user is logged in
  useEffect(() => {
    if (user && syncManagerRef.current) {
      syncManagerRef.current.sync(storage.projects, true);
    }
  }, [storage.projects, user]);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (storage.theme === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', storage.theme);
    }
  }, [storage.theme]);

  // Save to localStorage on state changes
  useEffect(() => {
    saveStorage(storage);
  }, [storage]);

  // Check and record weekly snapshot for active project
  useEffect(() => {
    const active = storage.projects.find((p) => p.id === storage.activeProjectId);
    if (!active) return;

    const { percent, done, total } = calculateOverallProgress(
      PHASES,
      active.checkedTasks,
      active.mode
    );

    const { snapshots, added } = recordWeeklySnapshot(
      active.weeklySnapshots || [],
      percent,
      done,
      total
    );

    if (added && snapshots.length > 0) {
      const latest = snapshots[snapshots.length - 1];
      dispatch({
        type: 'RECORD_SNAPSHOT',
        payload: { projectId: active.id, snapshot: latest },
      });
    }
  }, [storage.activeProjectId, storage.projects]);

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const activeProject =
    storage.projects.find((p) => p.id === storage.activeProjectId) || storage.projects[0];

  const setActiveProject = async (projectId: string) => {
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: projectId });
    
    // If authenticated, load complete state from backend
    if (user) {
      const project = storage.projects.find((p) => p.id === projectId);
      if (project?.slug) {
        try {
          const fullState = await apiClient.getProjectWithState(project.slug);
          // Merge task states and notes
          const checkedTasks: Record<string, boolean> = {};
          fullState.taskStates.forEach((ts: any) => {
            if (ts.checked) checkedTasks[ts.taskId] = true;
          });
          
          const notes: Record<number, string> = {};
          fullState.notes.forEach((n: any) => {
            notes[n.phaseId] = n.body;
          });
          
          dispatch({ type: 'IMPORT_PROGRESS', payload: {
            name: project.name,
            mode: project.mode,
            checkedTasks,
            notes,
          }});
        } catch (e) {
          console.error('Failed to load project state:', e);
        }
      }
    }
  };

  const updateField = (key: string, value: string) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { key, value } });
  };

  const toggleTask = async (taskId: string) => {
    const project = activeProject;
    if (!project) return;

    const newChecked = !project.checkedTasks[taskId];
    
    // If not authenticated, only use localStorage
    if (!user) {
      dispatch({ type: 'TOGGLE_TASK', payload: taskId });
      return;
    }

    // Optimistic update when authenticated
    dispatch({ type: 'TOGGLE_TASK', payload: taskId });

    try {
      const slug = project.slug || project.id;
      await apiClient.toggleTask(slug, taskId, newChecked);
    } catch (error) {
      // Revert on error and show warning
      dispatch({ type: 'TOGGLE_TASK', payload: taskId });
      addToast('Failed to save task to server. Changes not saved.', 'error');
    }
  };

  const updateNote = async (phaseId: number, content: string) => {
    const project = activeProject;
    if (!project) return;

    // If not authenticated, only use localStorage
    if (!user) {
      dispatch({ type: 'UPDATE_NOTE', payload: { phaseId, content } });
      return;
    }

    // Optimistic update when authenticated
    dispatch({ type: 'UPDATE_NOTE', payload: { phaseId, content } });

    try {
      const slug = project.slug || project.id;
      await apiClient.updateNote(slug, phaseId, content);
    } catch (error) {
      // Revert on error and show warning
      dispatch({ type: 'UPDATE_NOTE', payload: { phaseId, content: project.notes[phaseId] || '' } });
      addToast('Failed to save note to server. Changes not saved.', 'error');
    }
  };

  const setMode = (mode: ProjectMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  };

  const createProject = async (name: string) => {
    // If not authenticated, only use localStorage
    if (!user) {
      dispatch({ type: 'CREATE_PROJECT', payload: name });
      addToast(`Created project "${name}" (local only)`, 'warning');
      return;
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    try {
      const project = await apiClient.createProject({
        slug,
        name,
        mode: 'new',
      });
      // Add to local state
      const newProj = createDefaultProject(project.id, name);
      newProj.slug = slug;
      dispatch({ type: 'CREATE_PROJECT', payload: name });
      // Replace with actual project data
      dispatch({ type: 'MERGE_PROJECTS', payload: [newProj] });
      addToast(`Created project "${name}"`, 'success');
    } catch (error) {
      // Show error but don't create local copy when authenticated
      addToast(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const renameProject = (projectId: string, newName: string) => {
    dispatch({ type: 'RENAME_PROJECT', payload: { id: projectId, name: newName } });
    addToast(`Renamed project to "${newName}"`, 'success');
  };

  const deleteProject = (projectId: string): boolean => {
    if (storage.projects.length <= 1) {
      addToast('Cannot delete the only remaining project.', 'warning');
      return false;
    }
    const proj = storage.projects.find((p) => p.id === projectId);
    dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    addToast(`Deleted project "${proj?.name || projectId}"`, 'info');
    return true;
  };

  const resetProgress = () => {
    dispatch({ type: 'RESET_PROGRESS' });
    addToast('Project progress and notes reset. Fields retained.', 'info');
  };

  const importProgress = (data: {
    name: string;
    mode: ProjectMode;
    checkedTasks: Record<string, boolean>;
    notes: Record<number, string>;
  }) => {
    dispatch({ type: 'IMPORT_PROGRESS', payload: data });
    addToast(`Imported progress for "${data.name}"`, 'success');
  };

  const setTheme = (theme: 'auto' | 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const cycleTheme = () => {
    const cycleMap: Record<'auto' | 'light' | 'dark', 'auto' | 'light' | 'dark'> = {
      auto: 'light',
      light: 'dark',
      dark: 'auto',
    };
    const next = cycleMap[storage.theme];
    dispatch({ type: 'SET_THEME', payload: next });
    addToast(`Theme set to ${next}`, 'info');
  };

  // Tracking actions
  const updateDates = (projectId: string, dates: ProjectDates) => {
    dispatch({ type: 'UPDATE_DATES', payload: { projectId, dates } });
    addToast('Updated project target timeline', 'success');
  };

  const setPhaseBlock = (
    projectId: string,
    phaseId: number,
    isBlocked: boolean,
    reason?: string
  ) => {
    dispatch({
      type: 'SET_PHASE_BLOCK',
      payload: { projectId, phaseId, isBlocked, reason },
    });
    addToast(
      isBlocked ? `Phase ${phaseId} marked as blocked` : `Phase ${phaseId} unblocked`,
      isBlocked ? 'warning' : 'success'
    );
  };

  const recordSnapshot = (projectId: string) => {
    const proj = storage.projects.find((p) => p.id === projectId);
    if (!proj) return;

    const { percent, done, total } = calculateOverallProgress(
      PHASES,
      proj.checkedTasks,
      proj.mode
    );

    const { snapshots, added } = recordWeeklySnapshot(
      proj.weeklySnapshots || [],
      percent,
      done,
      total
    );

    if (added && snapshots.length > 0) {
      dispatch({
        type: 'RECORD_SNAPSHOT',
        payload: { projectId, snapshot: snapshots[snapshots.length - 1] },
      });
    }
  };

  // Auth actions
  const login = async (email: string, password: string) => {
    try {
      const { id, email: userEmail } = await apiClient.login(email, password);
      setUser({ id: String(id), email: userEmail });
      addToast('Welcome back!', 'success');
      // Trigger initial cloud sync
      syncManagerRef.current?.sync(storage.projects, true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign-in failed.' };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const { id, email: userEmail } = await apiClient.register(email, password);
      setUser({ id: String(id), email: userEmail });
      addToast('Account created successfully!', 'success');
      // Trigger initial cloud sync
      syncManagerRef.current?.sync(storage.projects, true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed.' };
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch {}
    setUser(null);
    setSyncStatus('saved-local');
    addToast('Signed out. Local progress retained on this device.', 'info');
  };

  const deleteAccount = async () => {
    // Account deletion is not implemented yet
    addToast('Account deletion will be available in a future update.', 'info');
  };

  const syncNow = async () => {
    if (!user) {
      addToast('Sign in to sync your projects across devices.', 'info');
      return;
    }
    setSyncStatus('syncing');
    const success = await syncManagerRef.current?.sync(storage.projects, true);
    if (success) {
      addToast('Project sync complete.', 'success');
    } else {
      addToast('Sync delayed: offline or server unavailable.', 'warning');
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        storage,
        activeProject,
        storageBlocked: loadResult.storageBlocked,
        corruptNotice: loadResult.corruptNotice,
        toasts,
        addToast,
        removeToast,
        setActiveProject,
        updateField,
        toggleTask,
        updateNote,
        setMode,
        createProject,
        renameProject,
        deleteProject,
        resetProgress,
        importProgress,
        setTheme,
        cycleTheme,
        updateDates,
        setPhaseBlock,
        recordSnapshot,
        user,
        authLoading,
        syncStatus,
        syncNow,
        login,
        register,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return ctx;
}
