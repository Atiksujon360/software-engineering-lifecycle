import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Cloud,
  Copy,
  Download,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { GATES } from '../data/playbook';
import { ProjectDates } from '../types';
import { validateImportJSON } from '../utils/storage';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ModalShell: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-md rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <h2 id="modal-title" className="text-base font-bold text-[var(--ink)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};

export const NewProjectModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { createProject } = useProject();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createProject(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-project-name" className="block text-xs font-semibold text-[var(--ink)] mb-1">
            Project Name
          </label>
          <input
            id="new-project-name"
            type="text"
            required
            autoFocus
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Atlas Core API, Sentinel"
            className="w-full text-xs px-3 py-2 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--line)] hover:bg-[var(--surface-raised)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--cobalt)] text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            Create Project
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export const RenameProjectModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { activeProject, renameProject } = useProject();
  const [name, setName] = useState(activeProject.name);

  React.useEffect(() => {
    setName(activeProject.name);
  }, [activeProject.name, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      renameProject(activeProject.id, name.trim());
      onClose();
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Rename Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rename-project-input" className="block text-xs font-semibold text-[var(--ink)] mb-1">
            New Project Name
          </label>
          <input
            id="rename-project-input"
            type="text"
            required
            autoFocus
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--line)] hover:bg-[var(--surface-raised)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--cobalt)] text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export const DeleteProjectModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { storage, activeProject, deleteProject } = useProject();
  const canDelete = storage.projects.length > 1;

  const handleConfirm = () => {
    if (canDelete) {
      deleteProject(activeProject.id);
      onClose();
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Delete Project">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--red-soft)] border border-[var(--red)]/20 text-[var(--red)]">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold">Are you sure you want to delete this project?</p>
            <p className="text-[var(--ink)]">
              This will permanently remove <strong>"{activeProject.name}"</strong> and all its task progress and phase notes. This action cannot be undone.
            </p>
          </div>
        </div>

        {!canDelete && (
          <p className="text-xs text-[var(--muted)] italic">
            You cannot delete this project because at least one project must always exist.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--line)] hover:bg-[var(--surface-raised)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canDelete}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--red)] text-white hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            Delete Project
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export const ResetProgressModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { activeProject, resetProgress } = useProject();

  const handleConfirm = () => {
    resetProgress();
    onClose();
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Reset Progress Confirmation">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--amber-soft)] border border-[var(--amber)]/20 text-[var(--amber)]">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold">Reset progress for "{activeProject.name}"?</p>
            <p className="text-[var(--ink)]">
              All checked tasks and phase notes will be cleared. Your six project fields (name, stack, etc.) and project mode will be kept.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--line)] hover:bg-[var(--surface-raised)] cursor-pointer"
          >
            Keep Progress (Cancel)
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--amber)] text-white hover:opacity-90 cursor-pointer font-bold"
          >
            Confirm Reset
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export const ImportProgressModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { activeProject, importProgress } = useProject();
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    name: string;
    mode: 'new' | 'existing';
    taskCount: number;
    noteCount: number;
    raw: {
      name: string;
      mode: 'new' | 'existing';
      checkedTasks: Record<string, boolean>;
      notes: Record<number, string>;
    };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
      validate(text);
    };
    reader.readAsText(file);
  };

  const validate = (text: string) => {
    setErrorMsg(null);
    setPreviewData(null);
    if (!text.trim()) return;

    const result = validateImportJSON(text);
    if (!result.valid || !result.data) {
      setErrorMsg(result.error || 'Invalid file format.');
      return;
    }

    const { name, mode, checkedTasks, notes } = result.data;
    setPreviewData({
      name,
      mode,
      taskCount: Object.keys(checkedTasks).length,
      noteCount: Object.keys(notes).length,
      raw: { name, mode, checkedTasks, notes },
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    validate(val);
  };

  const handleConfirmImport = () => {
    if (previewData) {
      importProgress(previewData.raw);
      setJsonText('');
      setPreviewData(null);
      setErrorMsg(null);
      onClose();
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Import Project Progress">
      <div className="space-y-4">
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Select or paste a progress JSON file (v1 or v2). This will replace the checklist and notes of{' '}
          <strong>"{activeProject.name}"</strong>.
        </p>

        <div>
          <label htmlFor="import-file-picker" className="sr-only">
            Choose progress JSON file
          </label>
          <input
            id="import-file-picker"
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--cobalt)] file:text-white hover:file:opacity-90 file:cursor-pointer cursor-pointer text-[var(--muted)]"
          />
        </div>

        <div>
          <label htmlFor="import-json-paste" className="block text-xs font-semibold text-[var(--ink)] mb-1">
            Or paste raw JSON content:
          </label>
          <textarea
            id="import-json-paste"
            rows={4}
            value={jsonText}
            onChange={handleTextChange}
            placeholder='{"version": 2, "name": "App", "checkedTasks": {...}}'
            className="w-full text-[11px] font-mono p-2 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-md bg-[var(--red-soft)] border border-[var(--red)]/20 text-[var(--red)] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {previewData && (
          <div className="p-3 rounded-lg bg-[var(--green-soft)] border border-[var(--green)]/20 text-xs text-[var(--ink)] space-y-1">
            <p className="font-semibold text-[var(--green)] flex items-center gap-1.5">
              <span>✓ Valid Progress File</span>
            </p>
            <p>
              Project Name: <strong>{previewData.name}</strong> ({previewData.mode} mode)
            </p>
            <p className="text-[var(--muted)]">
              Tasks Completed: {previewData.taskCount} | Phase Notes: {previewData.noteCount}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--line)] hover:bg-[var(--surface-raised)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!previewData}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--cobalt)] text-white hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            Replace Current Progress
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export const ManualCopyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  textToCopy: string;
}> = ({ isOpen, onClose, textToCopy }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isOpen]);

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Manual Text Copy">
      <div className="space-y-4">
        <p className="text-xs text-[var(--muted)]">
          Your browser prevented automatic clipboard copying. Please press{' '}
          <kbd className="px-1 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--line)] font-mono">
            Ctrl+C
          </kbd>{' '}
          or{' '}
          <kbd className="px-1 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--line)] font-mono">
            ⌘+C
          </kbd>{' '}
          to copy the selected text below:
        </p>

        <textarea
          ref={textareaRef}
          readOnly
          rows={7}
          value={textToCopy}
          className="w-full text-xs font-mono p-2.5 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--focus-ring)] select-all"
        />

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--cobalt)] text-white cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

/**
 * DatesModal: Configure start date, target launch date, and gate dates.
 */
export const DatesModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { activeProject, updateDates } = useProject();
  const currentDates = activeProject.dates || {};

  const [startDate, setStartDate] = useState(currentDates.startDate || '');
  const [targetDate, setTargetDate] = useState(currentDates.targetDate || '');
  const [g1Date, setG1Date] = useState(currentDates.gateDates?.G1 || '');
  const [g2Date, setG2Date] = useState(currentDates.gateDates?.G2 || '');
  const [g3Date, setG3Date] = useState(currentDates.gateDates?.G3 || '');
  const [g4Date, setG4Date] = useState(currentDates.gateDates?.G4 || '');

  React.useEffect(() => {
    if (isOpen) {
      setStartDate(activeProject.dates?.startDate || '');
      setTargetDate(activeProject.dates?.targetDate || '');
      setG1Date(activeProject.dates?.gateDates?.G1 || '');
      setG2Date(activeProject.dates?.gateDates?.G2 || '');
      setG3Date(activeProject.dates?.gateDates?.G3 || '');
      setG4Date(activeProject.dates?.gateDates?.G4 || '');
    }
  }, [isOpen, activeProject.dates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedDates: ProjectDates = {
      startDate: startDate || undefined,
      targetDate: targetDate || undefined,
      gateDates: {
        G1: g1Date || undefined,
        G2: g2Date || undefined,
        G3: g3Date || undefined,
        G4: g4Date || undefined,
      },
    };
    updateDates(activeProject.id, updatedDates);
    onClose();
  };

  const handleClear = () => {
    updateDates(activeProject.id, {});
    onClose();
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Configure Project Timeline Dates">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Dates are used exclusively to calculate on-track status, expected velocity, and overdue gates. Leave blank for "No dates set".
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="input-start-date" className="block text-xs font-semibold text-[var(--ink)] mb-1">
              Start Date
            </label>
            <input
              id="input-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div>
            <label htmlFor="input-target-date" className="block text-xs font-semibold text-[var(--ink)] mb-1">
              Target Launch Date
            </label>
            <input
              id="input-target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--line)] space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block">
            Optional Gate Target Dates
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-gate-g1" className="block text-[11px] font-semibold text-[var(--ink)] mb-1">
                Gate G1 (Scope Locked)
              </label>
              <input
                id="input-gate-g1"
                type="date"
                value={g1Date}
                onChange={(e) => setG1Date(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]"
              />
            </div>

            <div>
              <label htmlFor="input-gate-g2" className="block text-[11px] font-semibold text-[var(--ink)] mb-1">
                Gate G2 (Build Complete)
              </label>
              <input
                id="input-gate-g2"
                type="date"
                value={g2Date}
                onChange={(e) => setG2Date(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]"
              />
            </div>

            <div>
              <label htmlFor="input-gate-g3" className="block text-[11px] font-semibold text-[var(--ink)] mb-1">
                Gate G3 (Pre-Deploy Verified)
              </label>
              <input
                id="input-gate-g3"
                type="date"
                value={g3Date}
                onChange={(e) => setG3Date(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]"
              />
            </div>

            <div>
              <label htmlFor="input-gate-g4" className="block text-[11px] font-semibold text-[var(--ink)] mb-1">
                Gate G4 (Deployed & Verified)
              </label>
              <input
                id="input-gate-g4"
                type="date"
                value={g4Date}
                onChange={(e) => setG4Date(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-[var(--muted)] hover:text-[var(--red)] cursor-pointer"
          >
            Clear All Dates
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--line)] hover:bg-[var(--surface-raised)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--cobalt)] text-white hover:opacity-90 cursor-pointer shadow-xs"
            >
              Save Timeline
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
};

/**
 * PhaseBlockModal: Mark phase blocked or unblocked.
 */
export const PhaseBlockModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  phaseId: number;
  phaseTitle: string;
}> = ({ isOpen, onClose, phaseId, phaseTitle }) => {
  const { activeProject, setPhaseBlock } = useProject();
  const currentBlock = activeProject.phaseBlocks?.[phaseId];
  const [reason, setReason] = useState(currentBlock?.reason || '');

  React.useEffect(() => {
    if (isOpen) {
      setReason(activeProject.phaseBlocks?.[phaseId]?.reason || '');
    }
  }, [isOpen, phaseId, activeProject.phaseBlocks]);

  const handleMarkBlocked = (e: React.FormEvent) => {
    e.preventDefault();
    setPhaseBlock(activeProject.id, phaseId, true, reason.trim());
    onClose();
  };

  const handleUnblock = () => {
    setPhaseBlock(activeProject.id, phaseId, false, '');
    onClose();
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={`Phase ${phaseId}: Block Status`}>
      <form onSubmit={handleMarkBlocked} className="space-y-4">
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Marking a phase blocked highlights issues in the overview and flags the project <strong>At risk</strong> if blocked for over 7 days.
        </p>

        <div>
          <label htmlFor="block-reason-input" className="block text-xs font-semibold text-[var(--ink)] mb-1">
            Reason for Blocker (up to 200 characters)
          </label>
          <textarea
            id="block-reason-input"
            rows={3}
            maxLength={200}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Waiting on third-party API keys, legal compliance review, or database credentials..."
            className="w-full text-xs p-2.5 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
          <div className="text-[10px] text-right font-mono text-[var(--muted)]">
            {reason.length}/200
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
          {currentBlock?.isBlocked ? (
            <button
              type="button"
              onClick={handleUnblock}
              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-[var(--green)]/30 bg-[var(--green-soft)] text-[var(--green)] hover:opacity-90 cursor-pointer"
            >
              Clear Blocker (Unblock)
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--line)] hover:bg-[var(--surface-raised)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--amber)] text-white hover:opacity-90 cursor-pointer"
            >
              {currentBlock?.isBlocked ? 'Update Reason' : 'Mark Blocked'}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
};

/**
 * AuthModal: Sign In / Create Account with email & password.
 */
export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { login, register } = useProject();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (tab === 'signin') {
        const result = await login(email.trim(), password);
        if (result.success) {
          onClose();
        } else {
          setErrorMsg(result.error || 'Failed to sign in.');
        }
      } else {
        const result = await register(email.trim(), password);
        if (result.success) {
          onClose();
        } else {
          setErrorMsg(result.error || 'Failed to register.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={tab === 'signin' ? 'Sign In' : 'Create Account'}>
      <div className="space-y-4">
        {/* Tab switch */}
        <div className="flex rounded-lg border border-[var(--line)] p-0.5 bg-[var(--surface-raised)]">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              tab === 'signin' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs' : 'text-[var(--muted)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              tab === 'register' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs' : 'text-[var(--muted)]'
            }`}
          >
            Create Account
          </button>
        </div>

        <p className="text-xs text-[var(--muted)] leading-relaxed">
          {tab === 'signin'
            ? 'Sign in to sync your playbook checklists, phase notes, and project timelines across all your devices.'
            : 'Create an account to persist your projects in a secure database and sync across devices.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="auth-email-input" className="block text-xs font-semibold text-[var(--ink)] mb-1">
              Email Address
            </label>
            <input
              id="auth-email-input"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@company.com"
              className="w-full text-xs px-3 py-2 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div>
            <label htmlFor="auth-password-input" className="block text-xs font-semibold text-[var(--ink)] mb-1">
              Password {tab === 'register' && <span className="text-[10px] text-[var(--muted)] font-normal">(min 8 characters)</span>}
            </label>
            <input
              id="auth-password-input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs px-3 py-2 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-md bg-[var(--red-soft)] border border-[var(--red)]/20 text-[var(--red)] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--line)] hover:bg-[var(--surface-raised)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim() || password.length < 8}
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--cobalt)] text-white hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-[var(--line)] flex items-center gap-2 text-[11px] text-[var(--muted)]">
          <ShieldCheck className="w-4 h-4 text-[var(--green)] shrink-0" />
          <span>Sessions use secure httpOnly cookies. Passwords are never stored in localStorage.</span>
        </div>
      </div>
    </ModalShell>
  );
};

/**
 * UserAccountModal: Account details, manual sync, logout, and delete account.
 */
export const UserAccountModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user, syncStatus, syncNow, logout, deleteAccount } = useProject();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleDelete = async () => {
    await deleteAccount();
    onClose();
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Account & Database Sync">
      <div className="space-y-4">
        <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Signed in as
          </span>
          <div className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--cobalt)]" />
            <span>{user.email}</span>
          </div>
          <div className="text-[11px] text-[var(--muted)] flex items-center gap-1.5 pt-1">
            <Cloud className="w-3.5 h-3.5 text-[var(--green)]" />
            <span>Status: <strong className="text-[var(--ink)]">{syncStatus}</strong></span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={async () => {
              await syncNow();
            }}
            className="w-full py-2 px-3 rounded-md border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-xs font-semibold text-[var(--ink)] flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[var(--cobalt)]" />
            <span>Sync Now with Database</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-md border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-xs font-semibold text-[var(--ink)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Delete account */}
        <div className="pt-3 border-t border-[var(--line)] space-y-2">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-[var(--red)] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete account and cloud data</span>
            </button>
          ) : (
            <div className="p-3 rounded-lg bg-[var(--red-soft)] border border-[var(--red)]/20 space-y-2 text-xs">
              <p className="font-semibold text-[var(--red)]">
                Permanently delete account and all cloud copies?
              </p>
              <p className="text-[var(--muted)]">
                Your local projects on this device will remain, but cloud syncing will be revoked.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 rounded border border-[var(--line)] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 rounded bg-[var(--red)] text-white text-xs font-semibold cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};
