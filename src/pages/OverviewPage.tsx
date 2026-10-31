import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Info,
  Layers,
  Lock,
  Milestone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { DatesModal, PhaseBlockModal } from '../components/Modals';
import { useProject } from '../context/ProjectContext';
import { GATES, PHASES, VARIABLES } from '../data/playbook';
import {
  calculateOverallProgress,
  calculatePhaseProgress,
  getCurrentPhaseInfo,
} from '../utils/metrics';
import { calculateProjectStatus } from '../utils/tracking';

interface OverviewPageProps {
  onNavigate: (hash: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const {
    activeProject,
    updateField,
    setMode,
    storageBlocked,
    corruptNotice,
    user,
  } = useProject();

  const [isDatesModalOpen, setIsDatesModalOpen] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [blockModalPhaseId, setBlockModalPhaseId] = useState<number | null>(null);

  const { done, total, percent } = calculateOverallProgress(
    PHASES,
    activeProject.checkedTasks,
    activeProject.mode
  );

  const { currentPhase, nextTask, isAllCompleted } = getCurrentPhaseInfo(
    PHASES,
    activeProject.checkedTasks,
    activeProject.mode
  );

  const tracking = calculateProjectStatus(activeProject, PHASES);

  const definePhases = PHASES.filter((p) => p.group === 'define');
  const buildPhases = PHASES.filter((p) => p.group === 'build');
  const shipPhases = PHASES.filter((p) => p.group === 'ship');

  // Status badge styling helper
  const getStatusBadge = () => {
    switch (tracking.status) {
      case 'ahead':
        return {
          bg: 'bg-[var(--green-soft)] text-[var(--green)] border-[var(--green)]/30',
          dot: 'bg-[var(--green)]',
          label: 'Ahead',
        };
      case 'on-track':
        return {
          bg: 'bg-[var(--cobalt-soft)] text-[var(--cobalt)] border-[var(--cobalt)]/30',
          dot: 'bg-[var(--cobalt)]',
          label: 'On track',
        };
      case 'behind':
        return {
          bg: 'bg-[var(--amber-soft)] text-[var(--amber)] border-[var(--amber)]/30',
          dot: 'bg-[var(--amber)]',
          label: 'Behind',
        };
      case 'at-risk':
        return {
          bg: 'bg-[var(--red-soft)] text-[var(--red)] border-[var(--red)]/30',
          dot: 'bg-[var(--red)]',
          label: 'At risk',
        };
      case 'no-dates':
      default:
        return {
          bg: 'bg-[var(--surface-raised)] text-[var(--muted)] border-[var(--line)]',
          dot: 'bg-[var(--muted)]',
          label: 'No dates set',
        };
    }
  };

  const statusBadge = getStatusBadge();

  // Render weekly snapshots sparkline
  const renderSparkline = () => {
    const snapshots = activeProject.weeklySnapshots || [];
    if (snapshots.length < 2) {
      return (
        <div className="h-16 flex items-center justify-center text-[11px] text-[var(--muted)] bg-[var(--paper)] rounded-lg border border-[var(--line)]">
          <span>Weekly progress trend will appear after recording multiple weekly snapshots.</span>
        </div>
      );
    }

    const width = 320;
    const height = 64;
    const padding = 12;

    const points = snapshots.map((s, idx) => {
      const x = padding + (idx / (snapshots.length - 1)) * (width - 2 * padding);
      const y = height - padding - (s.percent / 100) * (height - 2 * padding);
      return { x, y, percent: s.percent, date: s.date };
    });

    const pathD = points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    return (
      <div className="p-3 bg-[var(--paper)] rounded-xl border border-[var(--line)] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--cobalt)]" />
            <span>Weekly Progress Pace ({snapshots.length} snapshots)</span>
          </span>
          <span className="font-mono text-[var(--muted)] text-[10px]">
            Latest: {snapshots[snapshots.length - 1].percent}% on {snapshots[snapshots.length - 1].date}
          </span>
        </div>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16">
            {/* Guide line at 50% */}
            <line
              x1={padding}
              y1={height / 2}
              x2={width - padding}
              y2={height / 2}
              stroke="var(--line)"
              strokeDasharray="2 2"
            />
            {/* Area fill */}
            <path
              d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
              fill="var(--cobalt)"
              fillOpacity="0.1"
            />
            {/* Trend line */}
            <path
              d={pathD}
              fill="none"
              stroke="var(--cobalt)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dots */}
            {points.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="3"
                className="fill-[var(--surface)] stroke-[var(--cobalt)] stroke-2"
              >
                <title>{`${pt.date}: ${pt.percent}%`}</title>
              </circle>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  // If user is not logged in, show login prompt instead of project data
  if (!user) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        <div className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <Lock className="w-16 h-16 mx-auto text-(--muted)" />
            <h2 className="text-2xl font-bold">Sign In Required</h2>
            <p className="text-(--muted) max-w-md">
              Please sign in to view your projects and track your progress through the engineering lifecycle.
            </p>
            <button
              onClick={() => onNavigate('#signin')}
              className="px-6 py-3 bg-(--brand) text-white rounded-lg hover:bg-(--brand-hover)"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Storage and Corrupt Data Notices */}
      {storageBlocked && (
        <div
          role="alert"
          className="flex items-center gap-3 p-4 rounded-xl border border-[var(--amber)] bg-[var(--amber-soft)] text-[var(--amber)] text-xs font-medium"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <strong>Storage Warning:</strong> Local storage is disabled or blocked in this browser context (e.g. strict private mode). Any changes made will not persist across browser refreshes.
          </div>
        </div>
      )}

      {corruptNotice && (
        <div
          role="alert"
          className="flex items-center gap-3 p-4 rounded-xl border border-[var(--red)] bg-[var(--red-soft)] text-[var(--red)] text-xs font-medium"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <strong>Notice:</strong> {corruptNotice}
          </div>
        </div>
      )}

      {/* Privacy Note Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] text-[var(--muted)] text-xs">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[var(--cobalt)] shrink-0" />
          <span>
            <strong className="text-[var(--ink)]">Privacy and secrets:</strong> Never store passwords, API keys, tokens, or customer personal data in this dashboard, its notes, or prompt templates.
          </span>
        </div>
        <a
          href="#templates"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('templates');
          }}
          className="hidden sm:inline-flex items-center gap-1 text-[var(--cobalt)] font-semibold hover:underline"
        >
          View Governance
        </a>
      </div>

      {/* Hero Header & Quick Stats */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--cobalt-soft)] text-[var(--cobalt)] border border-[var(--cobalt)]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Engineering Lifecycle</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)]">
              {activeProject.fields.PROJECT_NAME || activeProject.name}
            </h1>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {activeProject.fields.ONE_LINE ||
                'Configure your project parameters below to inject live context into all 18 lifecycle phases and copyable agent prompts.'}
            </p>
          </div>

          {/* Quick Metrics Card */}
          <div className="flex items-center gap-4 bg-[var(--surface-raised)] p-4 rounded-xl border border-[var(--line)] shrink-0">
            {/* Circular Progress Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[var(--line)] stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[var(--green)] stroke-current transition-all duration-500"
                  strokeWidth="3.5"
                  strokeDasharray={`${percent}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-extrabold text-[var(--ink)] tabular-nums">{percent}%</span>
              </div>
            </div>

            <div className="space-y-0.5 text-xs">
              <div className="font-bold text-[var(--ink)]">
                {done} of {total} Tasks Done
              </div>
              <div className="text-[var(--muted)]">
                Mode: <strong className="text-[var(--ink)] capitalize">{activeProject.mode}</strong> ({total} applicable)
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate(`phase-${currentPhase.id}`)}
                  className="text-[11px] font-semibold text-[var(--cobalt)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Next: Phase {currentPhase.id}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ON-TRACK TRACKING DASHBOARD */}
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-[var(--ink)]">On-Track Delivery Tracking</h2>
              {/* Status Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                <span>{statusBadge.label}</span>
              </div>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Velocity and status are calculated objectively from your target timeline dates and completed tasks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDatesModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-xs font-semibold text-[var(--ink)] inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-[var(--cobalt)]" />
              <span>{activeProject.dates?.startDate ? 'Edit Timeline Dates' : 'Configure Dates'}</span>
            </button>
          </div>
        </div>

        {/* Tracking Grid: Velocity Bar, Days Remaining, Next Gate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Progress Comparison */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[var(--ink)]">Actual vs. Expected Progress</span>
              {tracking.difference !== null && (
                <span
                  className={`font-mono text-[11px] font-bold ${
                    tracking.difference >= 0 ? 'text-[var(--green)]' : 'text-[var(--amber)]'
                  }`}
                >
                  {tracking.difference >= 0 ? `+${tracking.difference}%` : `${tracking.difference}%`}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-[var(--muted)]">
                <span>Actual: <strong className="text-[var(--ink)]">{tracking.actualPercent}%</strong></span>
                <span>Expected: <strong className="text-[var(--ink)]">{tracking.expectedPercent !== null ? `${tracking.expectedPercent}%` : '—'}</strong></span>
              </div>
              <div className="relative w-full h-3 rounded-full bg-[var(--line)] overflow-hidden">
                {/* Expected progress marker */}
                {tracking.expectedPercent !== null && (
                  <div
                    className="absolute top-0 bottom-0 bg-[var(--cobalt)]/40 transition-all duration-300"
                    style={{ width: `${tracking.expectedPercent}%` }}
                    title={`Expected progress: ${tracking.expectedPercent}%`}
                  />
                )}
                {/* Actual progress bar */}
                <div
                  className="absolute top-0 bottom-0 bg-[var(--green)] transition-all duration-300"
                  style={{ width: `${tracking.actualPercent}%` }}
                  title={`Actual progress: ${tracking.actualPercent}%`}
                />
              </div>
            </div>

            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              {tracking.explanation}
            </p>
          </div>

          {/* Days Remaining Card */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] flex flex-col justify-between space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Target Launch Timeline
            </span>

            <div className="space-y-1">
              {activeProject.dates?.targetDate ? (
                <div>
                  <div className="text-2xl font-extrabold text-[var(--ink)] tabular-nums">
                    {tracking.daysRemaining !== null && tracking.daysRemaining >= 0
                      ? `${tracking.daysRemaining} Days`
                      : 'Launch Date Passed'}
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">
                    Target: <strong className="text-[var(--ink)]">{activeProject.dates.targetDate}</strong>
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-semibold text-[var(--muted)] italic">
                    No launch date configured
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">
                    Add a target launch date to track days remaining.
                  </p>
                </div>
              )}
            </div>

            <div className="text-[10px] text-[var(--muted)] font-mono">
              Start: {activeProject.dates?.startDate || 'Not set'}
            </div>
          </div>

          {/* Next Gate Card */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] flex flex-col justify-between space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Next Upcoming Gate
            </span>

            <div className="space-y-1">
              {tracking.nextGate ? (
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                      {tracking.nextGate.id}
                    </span>
                    <span className="font-bold text-xs text-[var(--ink)] truncate">
                      {tracking.nextGate.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Target Date:{' '}
                    <strong className="text-[var(--ink)]">
                      {tracking.nextGate.targetDate || 'None set'}
                    </strong>
                  </p>
                </div>
              ) : (
                <div className="text-xs font-semibold text-[var(--green)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All Quality Gates Passed!</span>
                </div>
              )}
            </div>

            <a
              href="#templates"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('templates');
              }}
              className="text-[11px] font-semibold text-[var(--cobalt)] hover:underline inline-flex items-center gap-1"
            >
              <span>Gate Sign-off Rules</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Blocked Phases Alert List (if any) */}
        {tracking.blockedPhases.length > 0 && (
          <div className="p-4 rounded-xl bg-[var(--amber-soft)] border border-[var(--amber)]/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--amber)]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                Active Phase Blockers ({tracking.blockedPhases.length} phase
                {tracking.blockedPhases.length > 1 ? 's' : ''} blocked)
              </span>
            </div>
            <div className="space-y-1.5">
              {tracking.blockedPhases.map((b) => (
                <div
                  key={b.phaseId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded bg-[var(--surface)] text-xs border border-[var(--line)] gap-2"
                >
                  <div>
                    <span className="font-bold text-[var(--ink)]">{b.phaseTitle}: </span>
                    <span className="text-[var(--muted)]">{b.reason}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                        b.daysBlocked > 7
                          ? 'bg-[var(--red-soft)] text-[var(--red)] border border-[var(--red)]/30 font-bold'
                          : 'bg-[var(--surface-raised)] text-[var(--muted)]'
                      }`}
                    >
                      Blocked for {b.daysBlocked} day{b.daysBlocked === 1 ? '' : 's'}
                      {b.daysBlocked > 7 && ' (Critical)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBlockModalPhaseId(b.phaseId)}
                      className="text-[11px] text-[var(--cobalt)] hover:underline cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sparkline & Formula Explanation Toggle */}
        <div className="space-y-3">
          {renderSparkline()}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="text-xs text-[var(--muted)] hover:text-[var(--ink)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-[var(--cobalt)]" />
              <span>{showFormulaDetails ? 'Hide Status Formula Details' : 'How is On-Track Status Calculated?'}</span>
            </button>
          </div>

          {showFormulaDetails && (
            <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--line)] text-xs space-y-2 text-[var(--muted)] animate-in fade-in">
              <h4 className="font-bold text-[var(--ink)]">Objective Status Bands Formula</h4>
              <p className="leading-relaxed">
                Expected progress % is 0 before the start date, 100 after the target launch date, and linearly interpolated based on elapsed days in between.
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li><strong className="text-[var(--green)]">Ahead:</strong> Actual % is at least 10 percentage points above expected.</li>
                <li><strong className="text-[var(--cobalt)]">On track:</strong> Actual % is within 10 percentage points of expected (-10 &lt; diff &lt; +10).</li>
                <li><strong className="text-[var(--amber)]">Behind:</strong> Actual % is between 10 and 25 percentage points below expected (-25 &le; diff &le; -10).</li>
                <li><strong className="text-[var(--red)]">At risk:</strong> Actual % is &gt;25 points below expected, OR any quality gate target date has passed with the gate incomplete, OR any phase has been blocked for over 7 days.</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Six Project Field Inputs */}
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">Project Parameters</h2>
            <p className="text-xs text-[var(--muted)]">
              These variables populate all copyable AI-agent prompts and checklist documents live.
            </p>
          </div>
          <div className="inline-flex items-center p-1 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] shrink-0">
            <span className="text-[11px] font-semibold text-[var(--muted)] px-2">Project Mode:</span>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeProject.mode === 'new'
                  ? 'bg-[var(--cobalt)] text-white shadow-xs font-semibold'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              New Project
            </button>
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeProject.mode === 'existing'
                  ? 'bg-[var(--cobalt)] text-white shadow-xs font-semibold'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              Existing Project
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VARIABLES.map((v) => {
            const val = activeProject.fields[v.key] || '';
            const inputId = `field-input-${v.key}`;

            return (
              <div key={v.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor={inputId} className="text-xs font-semibold text-[var(--ink)]">
                    {v.label}
                  </label>
                  <span className="text-[10px] text-[var(--muted)] font-mono">
                    {val.length}/300
                  </span>
                </div>
                <input
                  id={inputId}
                  type="text"
                  maxLength={300}
                  value={val}
                  onChange={(e) => updateField(v.key, e.target.value)}
                  placeholder={v.hint}
                  className="w-full text-xs px-3 py-2 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] placeholder-[var(--muted)]/60 focus:outline-hidden focus:ring-2 focus:ring-[var(--focus-ring)] transition-all"
                />
                <p className="text-[10px] text-[var(--muted)] truncate">{v.hint}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Gate Summary Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">Human Quality Gates</h2>
            <p className="text-xs text-[var(--muted)]">
              Formal verification checkpoints locking boundaries before advancing to next stages.
            </p>
          </div>
          <a
            href="#templates"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('templates');
            }}
            className="text-xs font-semibold text-[var(--cobalt)] hover:underline inline-flex items-center gap-1"
          >
            Approvals Matrix
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GATES.map((g) => {
            const targetPhase = PHASES.find((p) => p.id === g.after);
            const { percent: phasePercent } = targetPhase
              ? calculatePhaseProgress(targetPhase, activeProject.checkedTasks, activeProject.mode)
              : { percent: 0 };
            const isPassed = phasePercent === 100;
            const gateTargetDate = activeProject.dates?.gateDates?.[g.id as 'G1' | 'G2' | 'G3' | 'G4'];

            return (
              <div
                key={g.id}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 flex flex-col justify-between shadow-xs space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                      {g.id}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isPassed
                          ? 'bg-[var(--green-soft)] text-[var(--green)] border border-[var(--green)]/20'
                          : 'bg-[var(--surface-raised)] text-[var(--muted)] border border-[var(--line)]'
                      }`}
                    >
                      {isPassed ? 'Passed' : 'Pending'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--ink)]">{g.title}</h3>
                  <p className="text-[11px] text-[var(--muted)] line-clamp-3 leading-relaxed">
                    {g.text}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--line)] space-y-1 text-[11px]">
                  {gateTargetDate && (
                    <div className="text-[10px] text-[var(--muted)] font-mono">
                      Target: {gateTargetDate}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted)]">After Phase {g.after}</span>
                    <button
                      type="button"
                      onClick={() => onNavigate(`phase-${g.after}`)}
                      className="font-semibold text-[var(--cobalt)] hover:underline cursor-pointer"
                    >
                      View Checklist
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The 18 Lifecycle Phases Route Map */}
      <section className="space-y-6">
        <div>
          <h2 className="text-base font-bold text-[var(--ink)]">18-Phase Lifecycle Route Map</h2>
          <p className="text-xs text-[var(--muted)]">
            Explore and track checklists from Phase 0 (Orientation) to Phase 17 (Handover).
          </p>
        </div>

        {/* Define Group */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--cobalt)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Stage 1: Define (Phases 0–6)
            </h3>
            <span className="text-[11px] text-[var(--muted)]">Ideation, Scoping & Architecture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {definePhases.map((phase) => renderPhaseCard(phase))}
          </div>
        </div>

        {/* Build Group */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--amber)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Stage 2: Build (Phases 7–12)
            </h3>
            <span className="text-[11px] text-[var(--muted)]">Implementation & Quality Engineering</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {buildPhases.map((phase) => renderPhaseCard(phase))}
          </div>
        </div>

        {/* Ship Group */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--green)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Stage 3: Ship (Phases 13–17)
            </h3>
            <span className="text-[11px] text-[var(--muted)]">Deployment, Reliability & Knowledge Transfer</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shipPhases.map((phase) => renderPhaseCard(phase))}
          </div>
        </div>
      </section>

      {/* Dates Modal */}
      <DatesModal isOpen={isDatesModalOpen} onClose={() => setIsDatesModalOpen(false)} />

      {/* Phase Block Modal */}
      {blockModalPhaseId !== null && (
        <PhaseBlockModal
          isOpen={blockModalPhaseId !== null}
          onClose={() => setBlockModalPhaseId(null)}
          phaseId={blockModalPhaseId}
          phaseTitle={PHASES[blockModalPhaseId]?.title || `Phase ${blockModalPhaseId}`}
        />
      )}
    </div>
  );

  function renderPhaseCard(phase: (typeof PHASES)[0]) {
    const { done: pDone, total: pTotal, percent: pPercent } = calculatePhaseProgress(
      phase,
      activeProject.checkedTasks,
      activeProject.mode
    );
    const isComplete = pTotal > 0 && pDone === pTotal;
    const isPhaseBlocked = Boolean(activeProject.phaseBlocks?.[phase.id]?.isBlocked);

    return (
      <div
        key={phase.id}
        onClick={() => onNavigate(`phase-${phase.id}`)}
        className="group relative rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 hover:border-[var(--cobalt)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[var(--muted)] group-hover:text-[var(--cobalt)]">
              Phase {phase.id}
            </span>
            <div className="flex items-center gap-1.5">
              {isPhaseBlocked && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300/40">
                  Blocked
                </span>
              )}
              {phase.gate && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                  {phase.gate.id}
                </span>
              )}
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  isComplete
                    ? 'bg-[var(--green-soft)] text-[var(--green)] border border-[var(--green)]/30'
                    : 'bg-[var(--surface-raised)] text-[var(--muted)]'
                }`}
              >
                {pPercent}%
              </span>
            </div>
          </div>

          <h4 className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--cobalt)] transition-colors">
            {phase.title}
          </h4>

          <p className="text-[11px] text-[var(--muted)] line-clamp-2 leading-relaxed">
            {phase.tagline}
          </p>
        </div>

        <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px]">
          <span className="text-[var(--muted)]">
            {pDone}/{pTotal} Tasks
          </span>
          <span className="font-semibold text-[var(--cobalt)] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Checklist</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    );
  }
};
