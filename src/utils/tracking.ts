import { GATES, PHASES } from '../data/playbook';
import { Phase, ProjectData, ProjectDates, ProjectStatus, WeeklySnapshot } from '../types';
import { calculateOverallProgress, calculatePhaseProgress } from './metrics';

export interface TrackingResult {
  status: ProjectStatus;
  statusLabel: string;
  expectedPercent: number | null;
  actualPercent: number;
  difference: number | null;
  daysRemaining: number | null;
  explanation: string;
  ruleText: string;
  nextGate: {
    id: string;
    title: string;
    targetDate: string | null;
    isPassed: boolean;
  } | null;
  blockedPhases: Array<{
    phaseId: number;
    phaseTitle: string;
    reason: string;
    daysBlocked: number;
  }>;
}

/**
 * Calculates expected progress percentage based on elapsed time from start date to target date.
 * Rules:
 * - Expected percent is 0 before start date
 * - Expected percent is 100 after target date
 * - Linear interpolation in between, capped at 100
 */
export function calculateExpectedPercent(
  startDateStr?: string,
  targetDateStr?: string,
  nowInput: string | Date = new Date()
): number | null {
  if (!startDateStr || !targetDateStr) return null;

  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  const now = typeof nowInput === 'string' ? new Date(nowInput) : nowInput;

  if (isNaN(start.getTime()) || isNaN(target.getTime()) || isNaN(now.getTime())) {
    return null;
  }

  // Set to midnight UTC or local day for date-only comparison
  const startTime = start.getTime();
  const targetTime = target.getTime();
  const nowTime = now.getTime();

  if (targetTime <= startTime) {
    return nowTime >= targetTime ? 100 : 0;
  }

  if (nowTime <= startTime) {
    return 0;
  }

  if (nowTime >= targetTime) {
    return 100;
  }

  const elapsed = nowTime - startTime;
  const total = targetTime - startTime;
  const percent = Math.round((elapsed / total) * 100);

  return Math.min(100, Math.max(0, percent));
}

/**
 * Returns ISO week string format 'YYYY-Www' (e.g. '2026-W44') for duplicate prevention.
 */
export function getISOWeekString(dInput: string | Date): string {
  const date = typeof dInput === 'string' ? new Date(dInput) : new Date(dInput.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Appends a weekly snapshot if one has not already been recorded in the same calendar week.
 */
export function recordWeeklySnapshot(
  existingSnapshots: WeeklySnapshot[] = [],
  percent: number,
  doneCount: number,
  totalCount: number,
  nowInput: string | Date = new Date()
): { snapshots: WeeklySnapshot[]; added: boolean } {
  const now = typeof nowInput === 'string' ? new Date(nowInput) : nowInput;
  const currentWeek = getISOWeekString(now);
  const dateStr = now.toISOString().slice(0, 10);

  // Check if any existing snapshot belongs to the same week
  const hasSnapshotThisWeek = existingSnapshots.some((s) => getISOWeekString(s.date) === currentWeek);

  if (hasSnapshotThisWeek) {
    return { snapshots: existingSnapshots, added: false };
  }

  const newSnapshot: WeeklySnapshot = {
    date: dateStr,
    percent,
    doneCount,
    totalCount,
  };

  return {
    snapshots: [...existingSnapshots, newSnapshot].sort((a, b) => a.date.localeCompare(b.date)),
    added: true,
  };
}

/**
 * Calculates project status based on dates, checkboxes, gates, and blocks.
 */
export function calculateProjectStatus(
  project: ProjectData,
  phases: Phase[] = PHASES,
  nowInput: string | Date = new Date()
): TrackingResult {
  const now = typeof nowInput === 'string' ? new Date(nowInput) : nowInput;
  const nowTime = now.getTime();

  const { percent: actualPercent } = calculateOverallProgress(
    phases,
    project.checkedTasks,
    project.mode
  );

  const dates: ProjectDates = project.dates || {};
  const hasDates = Boolean(dates.startDate && dates.targetDate);

  // Check blocked phases
  const blockedPhases: TrackingResult['blockedPhases'] = [];
  let hasCriticalBlock = false; // Blocked for > 7 days

  if (project.phaseBlocks) {
    for (const [pKey, block] of Object.entries(project.phaseBlocks)) {
      if (block && block.isBlocked) {
        const pId = Number(pKey);
        const targetPhase = phases.find((p) => p.id === pId);
        const phaseTitle = targetPhase ? `Phase ${pId}: ${targetPhase.short}` : `Phase ${pId}`;

        let daysBlocked = 0;
        if (block.blockedSince) {
          const blockedSinceMs = new Date(block.blockedSince).getTime();
          if (!isNaN(blockedSinceMs)) {
            daysBlocked = Math.max(0, Math.floor((nowTime - blockedSinceMs) / (24 * 60 * 60 * 1000)));
          }
        }

        if (daysBlocked > 7) {
          hasCriticalBlock = true;
        }

        blockedPhases.push({
          phaseId: pId,
          phaseTitle,
          reason: block.reason || 'Blocked',
          daysBlocked,
        });
      }
    }
  }

  // Check gates target dates
  let hasOverdueGate = false;
  let overdueGateName = '';
  let nextGateInfo: TrackingResult['nextGate'] = null;

  for (const gate of GATES) {
    const targetPhase = phases.find((p) => p.id === gate.after);
    const { percent: gatePercent } = targetPhase
      ? calculatePhaseProgress(targetPhase, project.checkedTasks, project.mode)
      : { percent: 0 };
    const isGatePassed = gatePercent === 100;
    const gateTargetDate = dates.gateDates?.[gate.id as 'G1' | 'G2' | 'G3' | 'G4'] || null;

    if (gateTargetDate) {
      const gateTime = new Date(gateTargetDate).getTime();
      if (!isNaN(gateTime) && nowTime > gateTime && !isGatePassed) {
        hasOverdueGate = true;
        overdueGateName = gate.id;
      }
    }

    if (!isGatePassed && !nextGateInfo) {
      nextGateInfo = {
        id: gate.id,
        title: gate.title,
        targetDate: gateTargetDate,
        isPassed: false,
      };
    }
  }

  if (!hasDates) {
    return {
      status: 'no-dates',
      statusLabel: 'No dates set',
      expectedPercent: null,
      actualPercent,
      difference: null,
      daysRemaining: null,
      explanation: 'No dates set. Add dates to see whether you are on track.',
      ruleText: 'Add a start date and target launch date to track progress against your timeline.',
      nextGate: nextGateInfo,
      blockedPhases,
    };
  }

  const expectedPercent = calculateExpectedPercent(dates.startDate, dates.targetDate, now);
  if (expectedPercent === null) {
    return {
      status: 'no-dates',
      statusLabel: 'No dates set',
      expectedPercent: null,
      actualPercent,
      difference: null,
      daysRemaining: null,
      explanation: 'No dates set. Add dates to see whether you are on track.',
      ruleText: 'Invalid or missing dates. Check start and target launch dates.',
      nextGate: nextGateInfo,
      blockedPhases,
    };
  }

  const diff = actualPercent - expectedPercent;

  let daysRemaining = 0;
  if (dates.targetDate) {
    const targetTime = new Date(dates.targetDate).getTime();
    daysRemaining = Math.ceil((targetTime - nowTime) / (24 * 60 * 60 * 1000));
  }

  // AT RISK conditions:
  // 1. More than 25 points below expected (diff < -25)
  // 2. A gate target date has passed with gate incomplete
  // 3. Any phase is blocked for more than 7 days
  if (diff < -25 || hasOverdueGate || hasCriticalBlock) {
    let reason = '';
    if (diff < -25) {
      reason = `Actual progress (${actualPercent}%) is ${Math.abs(diff)} points behind expected (${expectedPercent}%).`;
    } else if (hasOverdueGate) {
      reason = `Target date for Gate ${overdueGateName} has passed with the gate incomplete.`;
    } else if (hasCriticalBlock) {
      reason = 'One or more project phases have been blocked for more than 7 days.';
    }

    return {
      status: 'at-risk',
      statusLabel: 'At risk',
      expectedPercent,
      actualPercent,
      difference: diff,
      daysRemaining,
      explanation: reason,
      ruleText: 'At risk: >25 points below expected, overdue gate, or phase blocked >7 days.',
      nextGate: nextGateInfo,
      blockedPhases,
    };
  }

  // BEHIND: 10 to 25 points below expected (-25 <= diff <= -10)
  if (diff <= -10) {
    return {
      status: 'behind',
      statusLabel: 'Behind',
      expectedPercent,
      actualPercent,
      difference: diff,
      daysRemaining,
      explanation: `Actual progress (${actualPercent}%) is ${Math.abs(diff)} points below expected (${expectedPercent}%).`,
      ruleText: 'Behind: 10 to 25 points below expected.',
      nextGate: nextGateInfo,
      blockedPhases,
    };
  }

  // AHEAD: at least 10 points above expected (diff >= 10)
  if (diff >= 10) {
    return {
      status: 'ahead',
      statusLabel: 'Ahead',
      expectedPercent,
      actualPercent,
      difference: diff,
      daysRemaining,
      explanation: `Actual progress (${actualPercent}%) is ${diff} points ahead of expected (${expectedPercent}%).`,
      ruleText: 'Ahead: at least 10 points above expected.',
      nextGate: nextGateInfo,
      blockedPhases,
    };
  }

  // ON TRACK: within 10 points of expected (-10 < diff < 10)
  return {
    status: 'on-track',
    statusLabel: 'On track',
    expectedPercent,
    actualPercent,
    difference: diff,
    daysRemaining,
    explanation: `Actual progress (${actualPercent}%) is aligned with expected pace (${expectedPercent}%).`,
    ruleText: 'On track: within 10 points of expected.',
    nextGate: nextGateInfo,
    blockedPhases,
  };
}
