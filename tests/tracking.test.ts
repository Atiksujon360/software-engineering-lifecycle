import { describe, expect, it } from 'vitest';
import { PHASES } from '../src/data/playbook';
import { ProjectData } from '../src/types';
import {
  calculateExpectedPercent,
  calculateProjectStatus,
  recordWeeklySnapshot,
} from '../src/utils/tracking';

function makeMockProject(overrides: Partial<ProjectData> = {}): ProjectData {
  return {
    id: 'test-proj-1',
    name: 'Test Project',
    mode: 'new',
    checkedTasks: {},
    notes: {},
    fields: {},
    dates: {},
    phaseBlocks: {},
    weeklySnapshots: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('On-Track Tracking Logic', () => {
  it('1. No dates set produces "No dates set"', () => {
    const project = makeMockProject({ dates: {} });
    const result = calculateProjectStatus(project, PHASES);
    expect(result.status).toBe('no-dates');
    expect(result.statusLabel).toBe('No dates set');
    expect(result.expectedPercent).toBeNull();
  });

  it('2. Expected % calculation handles start, midpoint, and target dates correctly', () => {
    const start = '2026-01-01';
    const target = '2026-01-11'; // 10 days total

    // Before start: 0%
    const beforeStart = calculateExpectedPercent(start, target, new Date('2025-12-31'));
    expect(beforeStart).toBe(0);

    // At start: 0%
    const atStart = calculateExpectedPercent(start, target, new Date('2026-01-01T00:00:00Z'));
    expect(atStart).toBe(0);

    // At exact midpoint (5 days elapsed of 10): 50%
    const atMidpoint = calculateExpectedPercent(start, target, new Date('2026-01-06T00:00:00Z'));
    expect(atMidpoint).toBe(50);

    // At target: 100%
    const atTarget = calculateExpectedPercent(start, target, new Date('2026-01-11T00:00:00Z'));
    expect(atTarget).toBe(100);

    // Past target: capped at 100%
    const pastTarget = calculateExpectedPercent(start, target, new Date('2026-02-01'));
    expect(pastTarget).toBe(100);
  });

  it('3. Status boundaries: exactly 10 points ahead is Ahead, 10 points behind is Behind, 25 points behind is Behind, 26 points behind is At risk', () => {
    const start = '2026-01-01';
    const target = '2026-01-11';
    const midDate = new Date('2026-01-06T00:00:00Z'); // expected is 50%

    // Calculate total applicable tasks for new mode (97 tasks)
    const totalTasks = 97;

    // Helper to generate N checked tasks across phases
    const createChecked = (count: number) => {
      const checked: Record<string, boolean> = {};
      let remaining = count;
      for (const p of PHASES) {
        for (const t of p.tasks) {
          if (remaining > 0) {
            checked[t.id] = true;
            remaining--;
          }
        }
      }
      return checked;
    };

    // Exactly 10 points ahead: Expected = 50%, Actual = 60% (diff = +10) -> Ahead
    const count60Percent = Math.round(0.60 * totalTasks); // 58 tasks = 60%
    const projAhead = makeMockProject({
      dates: { startDate: start, targetDate: target },
      checkedTasks: createChecked(count60Percent),
    });
    const statusAhead = calculateProjectStatus(projAhead, PHASES, midDate);
    expect(statusAhead.actualPercent).toBe(60);
    expect(statusAhead.expectedPercent).toBe(50);
    expect(statusAhead.difference).toBe(10);
    expect(statusAhead.status).toBe('ahead');

    // Exactly 10 points behind: Expected = 50%, Actual = 40% (diff = -10) -> Behind
    const count40Percent = Math.round(0.40 * totalTasks); // 39 tasks = 40%
    const projBehind10 = makeMockProject({
      dates: { startDate: start, targetDate: target },
      checkedTasks: createChecked(count40Percent),
    });
    const statusBehind10 = calculateProjectStatus(projBehind10, PHASES, midDate);
    expect(statusBehind10.actualPercent).toBe(40);
    expect(statusBehind10.expectedPercent).toBe(50);
    expect(statusBehind10.difference).toBe(-10);
    expect(statusBehind10.status).toBe('behind');

    // Exactly 25 points behind: Expected = 50%, Actual = 25% (diff = -25) -> Behind
    const count25Percent = Math.round(0.25 * totalTasks); // 24 tasks = 25%
    const projBehind25 = makeMockProject({
      dates: { startDate: start, targetDate: target },
      checkedTasks: createChecked(count25Percent),
    });
    const statusBehind25 = calculateProjectStatus(projBehind25, PHASES, midDate);
    expect(statusBehind25.actualPercent).toBe(25);
    expect(statusBehind25.expectedPercent).toBe(50);
    expect(statusBehind25.difference).toBe(-25);
    expect(statusBehind25.status).toBe('behind');

    // Exactly 26 points behind: Expected = 50%, Actual = 24% (diff = -26) -> At risk
    const count24Percent = Math.round(0.24 * totalTasks); // 23 tasks = 24%
    const projRisk = makeMockProject({
      dates: { startDate: start, targetDate: target },
      checkedTasks: createChecked(count24Percent),
    });
    const statusRisk = calculateProjectStatus(projRisk, PHASES, midDate);
    expect(statusRisk.actualPercent).toBe(24);
    expect(statusRisk.expectedPercent).toBe(50);
    expect(statusRisk.difference).toBe(-26);
    expect(statusRisk.status).toBe('at-risk');
  });

  it('4. An overdue gate target date gives At risk even when progress % is on track', () => {
    const start = '2026-01-01';
    const target = '2026-01-21';
    const now = new Date('2026-01-11T00:00:00Z'); // expected is 50%

    // Gate G1 target date was yesterday (2026-01-10) and is incomplete
    // Check 49 tasks from Phase 4 onward (leaving Phase 3 incomplete)
    const tasksFromPhase4 = PHASES.filter((p) => p.id >= 4).flatMap((p) => p.tasks).slice(0, 49);
    const projOverdueGate = makeMockProject({
      dates: {
        startDate: start,
        targetDate: target,
        gateDates: { G1: '2026-01-10' },
      },
      checkedTasks: Object.fromEntries(tasksFromPhase4.map((t) => [t.id, true])),
    });

    const status = calculateProjectStatus(projOverdueGate, PHASES, now);
    expect(status.actualPercent).toBe(51);
    expect(status.expectedPercent).toBe(50);
    // Overdue gate overrides and escalates to At risk!
    expect(status.status).toBe('at-risk');
    expect(status.explanation).toContain('Gate G1');
  });

  it('5. Weekly snapshot records once per week and does not duplicate', () => {
    const initialSnapshots = [
      { date: '2026-10-01', percent: 10, doneCount: 10, totalCount: 97 },
    ];

    // Same calendar week (e.g., 2026-10-02): should NOT add duplicate
    const sameWeekTry = recordWeeklySnapshot(
      initialSnapshots,
      15,
      15,
      97,
      new Date('2026-10-02T12:00:00Z')
    );
    expect(sameWeekTry.added).toBe(false);
    expect(sameWeekTry.snapshots.length).toBe(1);

    // Next calendar week (e.g., 2026-10-12): should add
    const nextWeekTry = recordWeeklySnapshot(
      initialSnapshots,
      25,
      25,
      97,
      new Date('2026-10-12T12:00:00Z')
    );
    expect(nextWeekTry.added).toBe(true);
    expect(nextWeekTry.snapshots.length).toBe(2);
    expect(nextWeekTry.snapshots[1].percent).toBe(25);
  });
});
