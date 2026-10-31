export type PhaseGroup = 'define' | 'build' | 'ship';

export type ProjectMode = 'new' | 'existing';

export interface ProjectVariable {
  key: 'PROJECT_NAME' | 'ONE_LINE' | 'USERS' | 'STACK' | 'REPO_PATH' | 'TIMEFRAME';
  label: string;
  hint: string;
}

export interface Gate {
  id: string; // 'G1' | 'G2' | 'G3' | 'G4'
  after: number; // phase index after which gate applies
  title: string;
  text: string;
}

export interface Task {
  id: string; // e.g. "p0-1", "p0-x1"
  text: string;
  doneWhen: string; // must be >= 15 characters
}

export interface PromptItem {
  id: string;
  title: string;
  role: string;
  template: string; // contains {{VARIABLE}} tokens
  expectedOutput: string;
}

export interface ResourceItem {
  title: string;
  url: string; // must be https://
  source: string; // e.g. "OWASP", "RFC 9457", "W3C WCAG 2.2", "Google SRE", etc.
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: 'Core' | 'Advanced' | 'Specialist';
  description: string;
}

export interface Phase {
  id: number; // 0 to 17
  group: PhaseGroup;
  title: string;
  short: string;
  tagline: string;
  goal: string;
  outputs: string[];
  gate?: Gate;
  tasks: Task[];
  existing?: Task[]; // Phase 0 only: 8 tasks (p0-x1 to p0-x8)
  prompts: PromptItem[];
  notes: string[];
  resources: ResourceItem[];
  skills: SkillItem[];
}

export interface ProjectDates {
  startDate?: string;
  targetDate?: string;
  gateDates?: Partial<Record<'G1' | 'G2' | 'G3' | 'G4', string>>;
  phaseDates?: Partial<Record<number, string>>;
}

export interface PhaseBlock {
  isBlocked: boolean;
  reason: string;
  blockedSince: string;
}

export interface WeeklySnapshot {
  date: string;
  percent: number;
  doneCount: number;
  totalCount: number;
}

export type ProjectStatus = 'ahead' | 'on-track' | 'behind' | 'at-risk' | 'no-dates';

export type SyncStatus = 'saved-local' | 'syncing' | 'saved-cloud' | 'offline';

export interface AuthUser {
  id: string;
  email: string;
}

export interface ProjectData {
  id: string;
  slug?: string;
  name: string;
  mode: ProjectMode;
  checkedTasks: Record<string, boolean>;
  notes: Record<number, string>; // phase id -> note string (max 5000 chars)
  fields: Record<string, string>; // key -> value (max 300 chars)
  dates?: ProjectDates;
  phaseBlocks?: Record<number, PhaseBlock>;
  weeklySnapshots?: WeeklySnapshot[];
  createdAt: string;
  updatedAt: string;
}

export interface AppStorageV2 {
  version: 2;
  appName: string;
  activeProjectId: string;
  projects: ProjectData[];
  theme: 'auto' | 'light' | 'dark';
}

export interface ExportDataV2 {
  version: 2;
  appName: string;
  projectId: string;
  name: string;
  mode: ProjectMode;
  checkedTasks: Record<string, boolean>;
  notes: Record<number, string>;
  exportedAt: string;
}

export interface ExportDataV1 {
  version?: 1;
  name?: string;
  mode?: ProjectMode;
  checkedTasks?: Record<string, boolean>;
  notes?: Record<number, string>;
  exportedAt?: string;
}

export interface PortfolioProjectSummary {
  name: string;
  mode: ProjectMode;
  status?: ProjectStatus;
  statusLabel?: string;
  percent: number;
  doneCount: number;
  totalCount: number;
  currentPhase: string;
  nextAction: string;
  lastExported: string;
  raw: ExportDataV2;
}
