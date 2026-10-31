import { Phase, ProjectMode, Task } from '../types';

/**
 * Returns the list of tasks applicable for a given phase and project mode.
 * Phase 0 in 'existing' mode includes both regular tasks and existing[] intake tasks.
 */
export function getApplicableTasks(phase: Phase, mode: ProjectMode): Task[] {
  if (phase.id === 0 && mode === 'existing' && phase.existing && phase.existing.length > 0) {
    return [...phase.tasks, ...phase.existing];
  }
  return phase.tasks;
}

/**
 * Collects all valid task IDs across all phases given a mode or all modes.
 */
export function getAllValidTaskIds(phases: Phase[], mode?: ProjectMode): Set<string> {
  const ids = new Set<string>();
  for (const phase of phases) {
    for (const t of phase.tasks) {
      ids.add(t.id);
    }
    if (phase.existing && (!mode || mode === 'existing')) {
      for (const t of phase.existing) {
        ids.add(t.id);
      }
    }
  }
  return ids;
}

/**
 * Calculates progress for a single phase.
 */
export function calculatePhaseProgress(
  phase: Phase,
  checkedTasks: Record<string, boolean> = {},
  mode: ProjectMode = 'new'
): { total: number; done: number; percent: number } {
  const tasks = getApplicableTasks(phase, mode);
  const total = tasks.length;
  if (total === 0) return { total: 0, done: 0, percent: 0 };

  let done = 0;
  for (const t of tasks) {
    if (checkedTasks[t.id]) {
      done++;
    }
  }

  const percent = Math.round((done / total) * 100);
  return { total, done, percent };
}

/**
 * Calculates total progress across all phases.
 */
export function calculateOverallProgress(
  phases: Phase[],
  checkedTasks: Record<string, boolean> = {},
  mode: ProjectMode = 'new'
): { total: number; done: number; percent: number } {
  let total = 0;
  let done = 0;

  for (const phase of phases) {
    const tasks = getApplicableTasks(phase, mode);
    total += tasks.length;
    for (const t of tasks) {
      if (checkedTasks[t.id]) {
        done++;
      }
    }
  }

  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, percent };
}

/**
 * Determines current phase: the first phase with open tasks.
 * If all tasks are completed, returns the last phase with nextTask: null.
 */
export function getCurrentPhaseInfo(
  phases: Phase[],
  checkedTasks: Record<string, boolean> = {},
  mode: ProjectMode = 'new'
): { currentPhase: Phase; nextTask: Task | null; isAllCompleted: boolean } {
  for (const phase of phases) {
    const tasks = getApplicableTasks(phase, mode);
    for (const task of tasks) {
      if (!checkedTasks[task.id]) {
        return { currentPhase: phase, nextTask: task, isAllCompleted: false };
      }
    }
  }

  // All done
  const lastPhase = phases[phases.length - 1];
  return { currentPhase: lastPhase, nextTask: null, isAllCompleted: true };
}
