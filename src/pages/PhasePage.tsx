import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  GraduationCap,
  HelpCircle,
  Lock,
  MessageSquare,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ManualCopyModal, PhaseBlockModal } from '../components/Modals';
import { useProject } from '../context/ProjectContext';
import { PHASES } from '../data/playbook';
import { calculatePhaseProgress, getApplicableTasks } from '../utils/metrics';
import { copyToClipboard, substituteVariables } from '../utils/prompts';
import { MAX_NOTE_LENGTH } from '../utils/storage';
import { calculateProjectStatus } from '../utils/tracking';

interface PhasePageProps {
  phaseId: number;
  onNavigate: (hash: string) => void;
}

export const PhasePage: React.FC<PhasePageProps> = ({ phaseId, onNavigate }) => {
  const { activeProject, toggleTask, updateNote, addToast } = useProject();
  const [manualCopyText, setManualCopyText] = useState<string | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const phase = PHASES.find((p) => p.id === phaseId) || PHASES[0];
  const { total, done, percent } = calculatePhaseProgress(
    phase,
    activeProject.checkedTasks,
    activeProject.mode
  );

  const applicableTasks = getApplicableTasks(phase, activeProject.mode);
  const firstOpenTask = applicableTasks.find((t) => !activeProject.checkedTasks[t.id]);

  const userNote = activeProject.notes[phase.id] || '';

  const handleCopyPrompt = async (template: string) => {
    const substituted = substituteVariables(template, activeProject.fields);
    const result = await copyToClipboard(substituted);

    if (result.success) {
      addToast('Prompt copied to clipboard!', 'success');
    } else if (result.needsManualDialog) {
      setManualCopyText(result.copiedText);
    } else {
      addToast('Failed to copy prompt.', 'error');
    }
  };

  const handleCopyNote = async (text: string) => {
    const result = await copyToClipboard(text);
    if (result.success) {
      addToast('Note copied to clipboard!', 'success');
    } else {
      setManualCopyText(text);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Manual Copy Dialog Fallback */}
      {manualCopyText && (
        <ManualCopyModal
          isOpen={Boolean(manualCopyText)}
          onClose={() => setManualCopyText(null)}
          textToCopy={manualCopyText}
        />
      )}

      {/* Header breadcrumb & Phase Title */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[var(--muted)]">
              Stage: <span className="capitalize text-[var(--ink)]">{phase.group}</span>
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--surface-raised)] border border-[var(--line)] text-[var(--ink)] font-bold">
              {done}/{total} Done ({percent}%)
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[var(--cobalt)] text-white text-xs font-mono font-bold flex items-center justify-center">
                  {phase.id}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--cobalt)]">
                  Phase {phase.id}
                </span>
                {phase.gate && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                    {phase.gate.id}: {phase.gate.title}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
                  {phase.title}
                </h1>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    activeProject.phaseBlocks?.[phase.id]?.isBlocked
                      ? 'bg-[var(--red-soft)] text-[var(--red)] border-[var(--red)]/30'
                      : percent < 100 && (calculateProjectStatus(activeProject, PHASES).status === 'behind' || calculateProjectStatus(activeProject, PHASES).status === 'at-risk')
                      ? 'bg-[var(--amber-soft)] text-[var(--amber)] border-[var(--amber)]/30'
                      : 'bg-[var(--green-soft)] text-[var(--green)] border-[var(--green)]/30'
                  }`}
                >
                  {activeProject.phaseBlocks?.[phase.id]?.isBlocked
                    ? 'Blocked'
                    : percent < 100 && (calculateProjectStatus(activeProject, PHASES).status === 'behind' || calculateProjectStatus(activeProject, PHASES).status === 'at-risk')
                    ? 'Late'
                    : 'On schedule'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(true)}
                  className={`text-xs px-2.5 py-1 rounded-md border font-semibold cursor-pointer transition-colors ${
                    activeProject.phaseBlocks?.[phase.id]?.isBlocked
                      ? 'bg-[var(--red-soft)] text-[var(--red)] border-[var(--red)]/30 hover:opacity-90'
                      : 'border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-[var(--ink)]'
                  }`}
                >
                  {activeProject.phaseBlocks?.[phase.id]?.isBlocked ? 'Blocked (manage)' : 'Mark blocked'}
                </button>
              </div>
            </div>

            {/* Phase Progress Bar */}
            <div className="w-full sm:w-48 space-y-1.5 shrink-0">
              <div className="flex justify-between text-xs font-semibold text-[var(--ink)]">
                <span>Phase Progress</span>
                <span className="tabular-nums font-mono">{percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--line)] overflow-hidden">
                <div
                  className="h-full bg-[var(--green)] transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-sm font-medium text-[var(--muted)] leading-relaxed">{phase.tagline}</p>

          <div className="pt-2 border-t border-[var(--line)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                Primary Goal
              </span>
              <p className="text-[var(--ink)] leading-relaxed">{phase.goal}</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                Key Deliverables
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[var(--muted)]">
                {phase.outputs.map((out, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {out}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Next Action Banner */}
      <section
        aria-label="Next action for this phase"
        className={`p-4 rounded-xl border flex items-start sm:items-center justify-between gap-4 text-xs ${
          firstOpenTask
            ? 'border-[var(--cobalt)]/40 bg-[var(--cobalt-soft)] text-[var(--ink)]'
            : 'border-[var(--green)]/40 bg-[var(--green-soft)] text-[var(--ink)]'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          {firstOpenTask ? (
            <div className="w-7 h-7 rounded-full bg-[var(--cobalt)] text-white flex items-center justify-center shrink-0 font-bold text-xs">
              →
            </div>
          ) : (
            <CheckCircle className="w-7 h-7 text-[var(--green)] shrink-0" />
          )}

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              {firstOpenTask ? 'Next Recommended Action' : 'Phase Milestone Status'}
            </span>
            <p className="font-semibold text-sm text-[var(--ink)]">
              {firstOpenTask
                ? `${firstOpenTask.id}: ${firstOpenTask.text}`
                : `All tasks complete for Phase ${phase.id}! Excellent execution.`}
            </p>
          </div>
        </div>

        {firstOpenTask && (
          <button
            type="button"
            onClick={() => toggleTask(firstOpenTask.id)}
            className="px-3 py-1.5 rounded-md bg-[var(--cobalt)] text-white font-semibold hover:opacity-90 shrink-0 cursor-pointer shadow-xs"
          >
            Mark Done
          </button>
        )}
      </section>

      {/* Gate Banner (if applicable) */}
      {phase.gate && (
        <section
          aria-label="Quality Gate Sign-off Banner"
          className="p-5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 text-xs space-y-2"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <h2 className="font-bold text-sm text-amber-900 dark:text-amber-200">
              Quality Gate {phase.gate.id}: {phase.gate.title}
            </h2>
          </div>
          <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
            {phase.gate.text}
          </p>
          <div className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
            Approval required by designated tech leads before starting subsequent phases.
          </div>
        </section>
      )}

      {/* Task Checklist */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">Phase Checklist</h2>
            <p className="text-xs text-[var(--muted)]">
              Every task has an explicit verifiable definition of done.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[var(--muted)]">
            {phase.tasks.filter((t) => activeProject.checkedTasks[t.id]).length}/{phase.tasks.length} standard tasks
          </span>
        </div>

        <div className="space-y-2.5">
          {phase.tasks.map((task) => {
            const isChecked = Boolean(activeProject.checkedTasks[task.id]);
            const checkboxId = `checkbox-${task.id}`;

            return (
              <div
                key={task.id}
                className={`checklist-item p-3.5 rounded-xl border transition-all ${
                  isChecked
                    ? 'border-[var(--line)] bg-[var(--surface-raised)]/60 text-[var(--muted)]'
                    : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--cobalt)] shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleTask(task.id)}
                    className="mt-1 w-4 h-4 rounded text-[var(--cobalt)] border-[var(--line)] focus:ring-[var(--focus-ring)] cursor-pointer shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={checkboxId}
                      className={`text-xs font-semibold cursor-pointer block leading-snug ${
                        isChecked ? 'line-through text-[var(--muted)]' : 'text-[var(--ink)]'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-[var(--muted)] mr-1.5 font-bold">
                        {task.id}
                      </span>
                      {task.text}
                    </label>
                    <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                      <strong className="text-[var(--ink)] font-medium">Done when:</strong> {task.doneWhen}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Phase 0 Existing Project Intake (brownfield mode only) */}
      {phase.id === 0 && activeProject.mode === 'existing' && phase.existing && (
        <section className="space-y-4 pt-4 border-t border-[var(--line)]">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--amber-soft)] text-[var(--amber)] text-[10px] font-bold uppercase tracking-wider mb-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Existing Project Mode Active</span>
              </div>
              <h2 className="text-base font-bold text-[var(--ink)]">Legacy Intake Checklist</h2>
              <p className="text-xs text-[var(--muted)]">
                Eight mandatory audit tasks required when onboarding inherited codebases.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[var(--muted)]">
              {phase.existing.filter((t) => activeProject.checkedTasks[t.id]).length}/8 intake tasks
            </span>
          </div>

          <div className="space-y-2.5">
            {phase.existing.map((task) => {
              const isChecked = Boolean(activeProject.checkedTasks[task.id]);
              const checkboxId = `checkbox-${task.id}`;

              return (
                <div
                  key={task.id}
                  className={`checklist-item p-3.5 rounded-xl border transition-all ${
                    isChecked
                      ? 'border-[var(--line)] bg-[var(--surface-raised)]/60 text-[var(--muted)]'
                      : 'border-amber-200 dark:border-amber-900 bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--amber)] shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTask(task.id)}
                      className="mt-1 w-4 h-4 rounded text-[var(--amber)] border-[var(--line)] focus:ring-[var(--focus-ring)] cursor-pointer shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={checkboxId}
                        className={`text-xs font-semibold cursor-pointer block leading-snug ${
                          isChecked ? 'line-through text-[var(--muted)]' : 'text-[var(--ink)]'
                        }`}
                      >
                        <span className="font-mono text-[10px] text-[var(--amber)] mr-1.5 font-bold">
                          {task.id}
                        </span>
                        {task.text}
                      </label>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                        <strong className="text-[var(--ink)] font-medium">Done when:</strong> {task.doneWhen}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Copyable AI Agent Prompts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">AI Agent Prompts</h2>
            <p className="text-xs text-[var(--muted)]">
              Variables like <code className="text-[11px] font-mono">{'{{PROJECT_NAME}}'}</code> are substituted live with your project fields.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[var(--muted)]">
            {phase.prompts.length} Prompts
          </span>
        </div>

        <div className="space-y-4">
          {phase.prompts.map((prompt) => {
            const substituted = substituteVariables(prompt.template, activeProject.fields);

            return (
              <div
                key={prompt.id}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--line)]">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ink)]">{prompt.title}</h3>
                    <span className="text-[10px] text-[var(--muted)]">Role Persona: </span>
                    <span className="text-[10px] font-semibold text-[var(--cobalt)]">
                      {prompt.role}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(prompt.template)}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-[var(--ink)] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5 text-[var(--cobalt)]" />
                    <span>Copy Prompt</span>
                  </button>
                </div>

                <div className="relative">
                  <pre className="text-xs font-mono p-3.5 rounded-lg bg-[var(--paper)] text-[var(--ink)] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-[var(--line)]">
                    {renderSubstitutedText(substituted)}
                  </pre>
                </div>

                <div className="text-[11px] text-[var(--muted)] flex items-center gap-1.5">
                  <span className="font-semibold text-[var(--ink)]">Expected Output:</span>
                  <span>{prompt.expectedOutput}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Phase Guidance Notes & User Scratchpad */}
      <section className="space-y-4">
        <div className="pb-2 border-b border-[var(--line)]">
          <h2 className="text-base font-bold text-[var(--ink)]">Phase Notes & Observations</h2>
          <p className="text-xs text-[var(--muted)]">
            Field advice from staff engineers plus your project-specific scratchpad (stored per project).
          </p>
        </div>

        {/* Static Best Practice Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {phase.notes.map((note, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Engineering Tip #{idx + 1}
                </span>
                <p className="text-[var(--ink)] leading-relaxed">{note}</p>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleCopyNote(note)}
                  className="text-[11px] text-[var(--muted)] hover:text-[var(--ink)] inline-flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy tip</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Project Scratchpad Textarea */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`phase-note-textarea-${phase.id}`}
              className="text-xs font-bold text-[var(--ink)]"
            >
              Project Phase Scratchpad (Phase {phase.id})
            </label>
            <span className="text-[10px] font-mono text-[var(--muted)]">
              {userNote.length}/{MAX_NOTE_LENGTH} characters
            </span>
          </div>
          <textarea
            id={`phase-note-textarea-${phase.id}`}
            rows={4}
            maxLength={MAX_NOTE_LENGTH}
            value={userNote}
            onChange={(e) => updateNote(phase.id, e.target.value)}
            placeholder="Record team decisions, blockers, edge cases, or deployment logs for this phase..."
            className="w-full text-xs font-mono p-3 rounded-lg border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--focus-ring)] leading-relaxed"
          />
          <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span>Notes auto-save continuously to local storage.</span>
            {userNote.length > 0 && (
              <button
                type="button"
                onClick={() => handleCopyNote(userNote)}
                className="text-[var(--cobalt)] hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
              >
                <Copy className="w-3 h-3" />
                <span>Copy notes</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Resources & Skills Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Authoritative Resources */}
        <section className="space-y-3">
          <div className="pb-2 border-b border-[var(--line)]">
            <h2 className="text-sm font-bold text-[var(--ink)]">Authoritative Resources</h2>
            <p className="text-[11px] text-[var(--muted)]">Stable HTTPS references and standards.</p>
          </div>

          <div className="space-y-2">
            {phase.resources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--cobalt)] transition-colors block text-decoration-none group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--ink)] group-hover:text-[var(--cobalt)]">
                    {res.title}
                  </span>
                  <ExternalLink className="w-3 h-3 text-[var(--muted)] group-hover:text-[var(--cobalt)] shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--line)] text-[var(--muted)] font-semibold">
                    {res.source}
                  </span>
                  <span className="text-[11px] text-[var(--muted)] truncate">
                    {res.description}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Required Engineering Skills */}
        <section className="space-y-3">
          <div className="pb-2 border-b border-[var(--line)]">
            <h2 className="text-sm font-bold text-[var(--ink)]">Competency Skills</h2>
            <p className="text-[11px] text-[var(--muted)]">Engineering capabilities covered.</p>
          </div>

          <div className="space-y-2">
            {phase.skills.map((skill) => (
              <div
                key={skill.id}
                className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--ink)]">{skill.name}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      skill.level === 'Advanced'
                        ? 'bg-[var(--amber-soft)] text-[var(--amber)]'
                        : 'bg-[var(--cobalt-soft)] text-[var(--cobalt)]'
                    }`}
                  >
                    {skill.level}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  {skill.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Phase Navigation Footer */}
      <div className="no-print pt-6 border-t border-[var(--line)] flex items-center justify-between">
        {phase.id > 0 ? (
          <button
            type="button"
            onClick={() => onNavigate(`phase-${phase.id - 1}`)}
            className="px-3.5 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-xs font-semibold text-[var(--ink)] inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Phase {phase.id - 1}: {PHASES[phase.id - 1].short}</span>
          </button>
        ) : (
          <div />
        )}

        {phase.id < 17 ? (
          <button
            type="button"
            onClick={() => onNavigate(`phase-${phase.id + 1}`)}
            className="px-4 py-2 rounded-lg bg-[var(--cobalt)] text-white hover:opacity-90 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-opacity shadow-xs"
          >
            <span>Phase {phase.id + 1}: {PHASES[phase.id + 1].short}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="px-4 py-2 rounded-lg bg-[var(--green)] text-white hover:opacity-90 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-opacity shadow-xs"
          >
            <span>Return to Overview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Phase Block Modal */}
      <PhaseBlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        phaseId={phase.id}
        phaseTitle={phase.title}
      />
    </div>
  );

  /**
   * Highlights [fill: KEY] amber placeholders in prompt preview.
   */
  function renderSubstitutedText(text: string) {
    const parts = text.split(/(\[fill:\s*[A-Z0-9_]+\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[fill:')) {
        return (
          <span
            key={index}
            className="bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold px-1 rounded border border-amber-400/40"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  }
};
