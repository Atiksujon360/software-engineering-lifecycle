import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUpDown,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { PHASES } from '../data/playbook';
import { PortfolioProjectSummary, ProjectStatus } from '../types';
import {
  calculateOverallProgress,
  generatePortfolioCSV,
  generateProjectCSV,
  getCurrentPhaseInfo,
} from '../utils/metrics';
import {
  createProjectExport,
  parsePortfolioFile,
  triggerFileDownload,
} from '../utils/storage';
import { calculateProjectStatus } from '../utils/tracking';

const STATUS_SORT_ORDER: Record<ProjectStatus, number> = {
  'at-risk': 1,
  behind: 2,
  'on-track': 3,
  ahead: 4,
  'no-dates': 5,
};

export const PortfolioPage: React.FC = () => {
  const { storage, addToast } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [skippedErrors, setSkippedErrors] = useState<string[]>([]);
  const [isSortedByStatus, setIsSortedByStatus] = useState(false);

  // Initialize portfolio list with the currently active local project(s)
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProjectSummary[]>(() => {
    return storage.projects.map((p) => {
      const { done, total, percent } = calculateOverallProgress(
        PHASES,
        p.checkedTasks,
        p.mode
      );
      const { currentPhase, nextTask, isAllCompleted } = getCurrentPhaseInfo(
        PHASES,
        p.checkedTasks,
        p.mode
      );
      const tracking = calculateProjectStatus(p, PHASES);

      const currentPhaseTitle = `Phase ${currentPhase.id}: ${currentPhase.short}`;
      const nextAction = isAllCompleted
        ? 'All applicable tasks completed'
        : nextTask
        ? `${nextTask.id}: ${nextTask.text}`
        : 'None';

      return {
        name: p.name,
        mode: p.mode,
        status: tracking.status,
        statusLabel: tracking.statusLabel,
        percent,
        doneCount: done,
        totalCount: total,
        currentPhase: currentPhaseTitle,
        nextAction,
        lastExported: p.updatedAt.slice(0, 10),
        raw: createProjectExport(p),
      };
    });
  });

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newSummaries: PortfolioProjectSummary[] = [];
    const errors: string[] = [];

    let processedCount = 0;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const result = parsePortfolioFile(file.name, text);

        if (result.error) {
          errors.push(result.error);
        } else if (result.summary) {
          // If raw json had dates, calculate status; default to no-dates
          const summary = result.summary;
          summary.status = summary.status || 'no-dates';
          summary.statusLabel = summary.statusLabel || 'No dates set';
          newSummaries.push(summary);
        }

        processedCount++;
        if (processedCount === files.length) {
          if (errors.length > 0) {
            setSkippedErrors((prev) => [...prev, ...errors]);
            addToast(`Skipped ${errors.length} invalid file(s).`, 'warning');
          }
          if (newSummaries.length > 0) {
            setPortfolioProjects((prev) => [...prev, ...newSummaries]);
            addToast(`Loaded ${newSummaries.length} project(s) into portfolio.`, 'success');
          }
        }
      };
      reader.onerror = () => {
        errors.push(`File "${file.name}" could not be read.`);
        processedCount++;
      };
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveProject = (index: number) => {
    const removed = portfolioProjects[index];
    setPortfolioProjects((prev) => prev.filter((_, i) => i !== index));
    addToast(`Removed "${removed.name}" from comparison view.`, 'info');
  };

  const handleSortByStatus = () => {
    const sorted = [...portfolioProjects].sort((a, b) => {
      const orderA = STATUS_SORT_ORDER[a.status || 'no-dates'] ?? 99;
      const orderB = STATUS_SORT_ORDER[b.status || 'no-dates'] ?? 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.name.localeCompare(b.name);
    });
    setPortfolioProjects(sorted);
    setIsSortedByStatus(true);
    addToast('Sorted by status (At risk first, Behind, On track, Ahead, No dates set last)', 'info');
  };

  const handleDownloadProjectCSV = (project: PortfolioProjectSummary) => {
    const csvContent = generateProjectCSV(project);
    const filename = `${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-summary.csv`;
    triggerFileDownload(csvContent, filename);
    addToast(`Downloaded CSV for "${project.name}" (includes status)`, 'success');
  };

  const handleDownloadAllCSV = () => {
    if (portfolioProjects.length === 0) {
      addToast('No projects available to export.', 'warning');
      return;
    }
    const csvContent = generatePortfolioCSV(portfolioProjects);
    triggerFileDownload(csvContent, 'all-portfolio-projects.csv');
    addToast('Downloaded complete portfolio CSV (includes status column)', 'success');
  };

  // Metrics summary
  const totalCount = portfolioProjects.length;
  const avgProgress =
    totalCount > 0
      ? Math.round(
          portfolioProjects.reduce((acc, curr) => acc + curr.percent, 0) / totalCount
        )
      : 0;
  const completedCount = portfolioProjects.filter((p) => p.percent === 100).length;

  const renderStatusBadge = (status?: ProjectStatus, label?: string) => {
    const text = label || 'No dates set';
    switch (status) {
      case 'ahead':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--green-soft)] text-[var(--green)] border border-[var(--green)]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
            <span>{text}</span>
          </span>
        );
      case 'on-track':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--cobalt-soft)] text-[var(--cobalt)] border border-[var(--cobalt)]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--cobalt)]" />
            <span>{text}</span>
          </span>
        );
      case 'behind':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--amber-soft)] text-[var(--amber)] border border-[var(--amber)]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />
            <span>{text}</span>
          </span>
        );
      case 'at-risk':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--red-soft)] text-[var(--red)] border border-[var(--red)]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)]" />
            <span>{text}</span>
          </span>
        );
      case 'no-dates':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--muted)] border border-[var(--line)]">
            <span>No dates set</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--cobalt-soft)] text-[var(--cobalt)] mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Multi-Project Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            Engineering Portfolio Tracker
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Compare delivery progress across multiple project progress JSON files, sort by delivery risk, and export consolidated CSV audit reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSortByStatus}
            disabled={portfolioProjects.length === 0}
            className={`px-3.5 py-2 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors ${
              isSortedByStatus
                ? 'border-[var(--cobalt)] bg-[var(--cobalt-soft)] text-[var(--cobalt)]'
                : 'border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-[var(--ink)]'
            }`}
            title="Sort At risk first, then Behind, On track, Ahead, and No dates set last"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort by status</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAllCSV}
            disabled={portfolioProjects.length === 0}
            className="px-3.5 py-2 rounded-lg bg-[var(--cobalt)] text-white hover:opacity-90 disabled:opacity-40 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV (all projects)</span>
          </button>
        </div>
      </div>

      {/* Skipped files error notices */}
      {skippedErrors.length > 0 && (
        <div className="space-y-2">
          {skippedErrors.map((err, i) => (
            <div
              key={i}
              role="alert"
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--amber-soft)] border border-[var(--amber)]/30 text-xs text-[var(--amber)]"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{err}</span>
              </div>
              <button
                type="button"
                onClick={() => setSkippedErrors((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-[10px] font-bold uppercase underline hover:opacity-80 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Tracked Projects
          </span>
          <div className="text-2xl font-extrabold text-[var(--ink)] tabular-nums">
            {totalCount}
          </div>
          <p className="text-[11px] text-[var(--muted)]">Loaded in portfolio comparison</p>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Average Lifecycle Progress
          </span>
          <div className="text-2xl font-extrabold text-[var(--cobalt)] tabular-nums">
            {avgProgress}%
          </div>
          <p className="text-[11px] text-[var(--muted)]">Across all active projects</p>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Completed Projects
          </span>
          <div className="text-2xl font-extrabold text-[var(--green)] tabular-nums">
            {completedCount}
          </div>
          <p className="text-[11px] text-[var(--muted)]">100% of applicable tasks done</p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? 'border-[var(--cobalt)] bg-[var(--cobalt-soft)]'
            : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--muted)]'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-raised)] border border-[var(--line)] flex items-center justify-center mx-auto text-[var(--cobalt)]">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ink)]">
              Drag & Drop Progress JSON Files Here
            </p>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Load multiple export files to evaluate team velocities side-by-side.
            </p>
          </div>

          <div>
            <label htmlFor="portfolio-file-picker" className="sr-only">
              Upload Progress Files
            </label>
            <input
              id="portfolio-file-picker"
              ref={fileInputRef}
              type="file"
              multiple
              accept=".json,application/json"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-xs font-semibold text-[var(--ink)] cursor-pointer transition-colors shadow-2xs"
            >
              Browse Files...
            </button>
          </div>
        </div>
      </div>

      {/* Projects Comparison Table */}
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)]">Portfolio Comparison</h2>
            <p className="text-xs text-[var(--muted)]">
              Includes status column based on timeline dates and blockers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-[var(--muted)]">
              {portfolioProjects.length} rows
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-raised)] text-[var(--muted)] uppercase tracking-wider text-[10px] border-b border-[var(--line)] select-none">
              <tr>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Project
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Mode
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Status
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Progress
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Tasks Done
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Current Phase
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Next Action
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Last Exported
                </th>
                <th scope="col" className="py-3 px-4 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {portfolioProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[var(--muted)]">
                    No projects in portfolio. Upload exported progress JSON files to compare.
                  </td>
                </tr>
              ) : (
                portfolioProjects.map((proj, idx) => (
                  <tr key={idx} className="hover:bg-[var(--surface-raised)]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[var(--ink)]">{proj.name}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                          proj.mode === 'existing'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        {proj.mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStatusBadge(proj.status, proj.statusLabel)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-[var(--line)] overflow-hidden">
                          <div
                            className="h-full bg-[var(--green)]"
                            style={{ width: `${proj.percent}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[var(--ink)] tabular-nums">
                          {proj.percent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[var(--muted)] tabular-nums">
                      {proj.doneCount}/{proj.totalCount}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[var(--ink)] whitespace-nowrap">
                      {proj.currentPhase}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--muted)] max-w-xs truncate" title={proj.nextAction}>
                      {proj.nextAction}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[var(--muted)] text-[11px]">
                      {proj.lastExported}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleDownloadProjectCSV(proj)}
                          title={`Download CSV for ${proj.name}`}
                          className="p-1.5 rounded-md hover:bg-[var(--surface-raised)] text-[var(--cobalt)] cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(idx)}
                          title={`Remove ${proj.name}`}
                          className="p-1.5 rounded-md hover:bg-[var(--surface-raised)] text-[var(--red)] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
