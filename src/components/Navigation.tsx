import React, { useEffect } from 'react';
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  FileCode2,
  FileText,
  FolderTree,
  GraduationCap,
  Image,
  Layers,
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { PHASES } from '../data/playbook';
import { RouteType } from '../hooks/useHashRoute';
import { calculatePhaseProgress } from '../utils/metrics';

interface NavigationProps {
  currentRoute: RouteType;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  onNavigate: (hash: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRoute,
  isMobileMenuOpen,
  onCloseMobileMenu,
  onNavigate,
}) => {
  const { activeProject, setMode } = useProject();

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        onCloseMobileMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, onCloseMobileMenu]);

  const definePhases = PHASES.filter((p) => p.group === 'define');
  const buildPhases = PHASES.filter((p) => p.group === 'build');
  const shipPhases = PHASES.filter((p) => p.group === 'ship');

  const handleLinkClick = (hash: string) => {
    onNavigate(hash);
    onCloseMobileMenu();
  };

  const isPhaseActive = (phaseId: number) => {
    return currentRoute.page === 'phase' && currentRoute.phaseId === phaseId;
  };

  const navContent = (
    <div className="flex flex-col h-full overflow-y-auto py-4 px-3 space-y-6 text-xs select-none">
      {/* Mobile Project Mode Selector */}
      <div className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--line)]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Project Mode
        </span>
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`py-1.5 px-2 rounded-md font-medium text-center cursor-pointer transition-colors ${
              activeProject.mode === 'new'
                ? 'bg-[var(--cobalt)] text-white font-semibold'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            New project
          </button>
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`py-1.5 px-2 rounded-md font-medium text-center cursor-pointer transition-colors ${
              activeProject.mode === 'existing'
                ? 'bg-[var(--cobalt)] text-white font-semibold'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            Existing
          </button>
        </div>
      </div>

      {/* Main Overview */}
      <div>
        <button
          type="button"
          onClick={() => handleLinkClick('overview')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-semibold transition-colors cursor-pointer ${
            currentRoute.page === 'overview'
              ? 'bg-[var(--cobalt)] text-white shadow-xs'
              : 'text-[var(--ink)] hover:bg-[var(--surface-raised)]'
          }`}
        >
          <span className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview & Setup</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 font-mono">18 Phases</span>
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('portfolio')}
          className={`w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-left font-semibold transition-colors cursor-pointer ${
            currentRoute.page === 'portfolio'
              ? 'bg-[var(--cobalt)] text-white shadow-xs'
              : 'text-[var(--ink)] hover:bg-[var(--surface-raised)]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[var(--amber)]" />
            <span>Portfolio Tracker</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-raised)] text-[var(--muted)] border border-[var(--line)]">
            Compare
          </span>
        </button>
      </div>

      {/* DEFINE GROUP */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            1. Define (0–6)
          </span>
          <span className="text-[10px] text-[var(--muted)]">Scope & Arch</span>
        </div>
        {definePhases.map((phase) => {
          const { done, total, percent } = calculatePhaseProgress(
            phase,
            activeProject.checkedTasks,
            activeProject.mode
          );
          const active = isPhaseActive(phase.id);
          const isComplete = total > 0 && done === total;

          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => handleLinkClick(`phase-${phase.id}`)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                active
                  ? 'bg-[var(--cobalt)] text-white font-semibold shadow-xs'
                  : 'text-[var(--ink)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              <span className="flex items-center gap-2 truncate pr-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                    active
                      ? 'bg-white/20 text-white'
                      : isComplete
                      ? 'bg-[var(--green-soft)] text-[var(--green)] border border-[var(--green)]/30'
                      : 'bg-[var(--surface-raised)] text-[var(--muted)] border border-[var(--line)]'
                  }`}
                >
                  {isComplete ? '✓' : phase.id}
                </span>
                <span className="truncate">{phase.short}</span>
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                {phase.gate && (
                  <span
                    className={`text-[9px] font-bold px-1 rounded uppercase tracking-tighter ${
                      active
                        ? 'bg-amber-300 text-amber-950'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40'
                    }`}
                    title={phase.gate.title}
                  >
                    {phase.gate.id}
                  </span>
                )}
                <span
                  className={`text-[10px] tabular-nums font-mono ${
                    active ? 'text-white/90' : isComplete ? 'text-[var(--green)] font-semibold' : 'text-[var(--muted)]'
                  }`}
                >
                  {percent}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* BUILD GROUP */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            2. Build (7–12)
          </span>
          <span className="text-[10px] text-[var(--muted)]">Code & Hardening</span>
        </div>
        {buildPhases.map((phase) => {
          const { done, total, percent } = calculatePhaseProgress(
            phase,
            activeProject.checkedTasks,
            activeProject.mode
          );
          const active = isPhaseActive(phase.id);
          const isComplete = total > 0 && done === total;

          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => handleLinkClick(`phase-${phase.id}`)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                active
                  ? 'bg-[var(--cobalt)] text-white font-semibold shadow-xs'
                  : 'text-[var(--ink)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              <span className="flex items-center gap-2 truncate pr-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                    active
                      ? 'bg-white/20 text-white'
                      : isComplete
                      ? 'bg-[var(--green-soft)] text-[var(--green)] border border-[var(--green)]/30'
                      : 'bg-[var(--surface-raised)] text-[var(--muted)] border border-[var(--line)]'
                  }`}
                >
                  {isComplete ? '✓' : phase.id}
                </span>
                <span className="truncate">{phase.short}</span>
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                {phase.gate && (
                  <span
                    className={`text-[9px] font-bold px-1 rounded uppercase tracking-tighter ${
                      active
                        ? 'bg-amber-300 text-amber-950'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40'
                    }`}
                    title={phase.gate.title}
                  >
                    {phase.gate.id}
                  </span>
                )}
                <span
                  className={`text-[10px] tabular-nums font-mono ${
                    active ? 'text-white/90' : isComplete ? 'text-[var(--green)] font-semibold' : 'text-[var(--muted)]'
                  }`}
                >
                  {percent}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* SHIP GROUP */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            3. Ship (13–17)
          </span>
          <span className="text-[10px] text-[var(--muted)]">Release & Ops</span>
        </div>
        {shipPhases.map((phase) => {
          const { done, total, percent } = calculatePhaseProgress(
            phase,
            activeProject.checkedTasks,
            activeProject.mode
          );
          const active = isPhaseActive(phase.id);
          const isComplete = total > 0 && done === total;

          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => handleLinkClick(`phase-${phase.id}`)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                active
                  ? 'bg-[var(--cobalt)] text-white font-semibold shadow-xs'
                  : 'text-[var(--ink)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              <span className="flex items-center gap-2 truncate pr-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                    active
                      ? 'bg-white/20 text-white'
                      : isComplete
                      ? 'bg-[var(--green-soft)] text-[var(--green)] border border-[var(--green)]/30'
                      : 'bg-[var(--surface-raised)] text-[var(--muted)] border border-[var(--line)]'
                  }`}
                >
                  {isComplete ? '✓' : phase.id}
                </span>
                <span className="truncate">{phase.short}</span>
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                {phase.gate && (
                  <span
                    className={`text-[9px] font-bold px-1 rounded uppercase tracking-tighter ${
                      active
                        ? 'bg-amber-300 text-amber-950'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40'
                    }`}
                    title={phase.gate.title}
                  >
                    {phase.gate.id}
                  </span>
                )}
                <span
                  className={`text-[10px] tabular-nums font-mono ${
                    active ? 'text-white/90' : isComplete ? 'text-[var(--green)] font-semibold' : 'text-[var(--muted)]'
                  }`}
                >
                  {percent}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* REFERENCE SECTION */}
      <div className="pt-2 border-t border-[var(--line)] space-y-1">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Knowledge Base
        </div>
        <button
          type="button"
          onClick={() => handleLinkClick('agents')}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
            currentRoute.page === 'agents'
              ? 'bg-[var(--cobalt)] text-white font-semibold shadow-xs'
              : 'text-[var(--ink)] hover:bg-[var(--surface-raised)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--cobalt)] shrink-0" />
          <span>AI Agents Guide</span>
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('structure')}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
            currentRoute.page === 'structure'
              ? 'bg-[var(--cobalt)] text-white font-semibold shadow-xs'
              : 'text-[var(--ink)] hover:bg-[var(--surface-raised)]'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
          <span>Repository Structure</span>
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('templates')}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
            currentRoute.page === 'templates'
              ? 'bg-[var(--cobalt)] text-white font-semibold shadow-xs'
              : 'text-[var(--ink)] hover:bg-[var(--surface-raised)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
          <span>Engineering Templates</span>
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('gallery')}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
            currentRoute.page === 'gallery'
              ? 'bg-[var(--cobalt)] text-white font-semibold shadow-xs'
              : 'text-[var(--ink)] hover:bg-[var(--surface-raised)]'
          }`}
        >
          <Image className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
          <span>Visual Architecture</span>
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('resources')}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
            currentRoute.page === 'resources'
              ? 'bg-[var(--cobalt)] text-white font-semibold shadow-xs'
              : 'text-[var(--ink)] hover:bg-[var(--surface-raised)]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
          <span>Resource Directory</span>
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('skills')}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
            currentRoute.page === 'skills'
              ? 'bg-[var(--cobalt)] text-white font-semibold shadow-xs'
              : 'text-[var(--ink)] hover:bg-[var(--surface-raised)]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
          <span>Skills Matrix</span>
        </button>
      </div>

      {/* Privacy Notice in Sidebar */}
      <div className="pt-2 border-t border-[var(--line)] px-3 text-[10px] text-[var(--muted)] leading-relaxed">
        <span className="font-semibold text-[var(--ink)] block mb-0.5">Privacy & Secrets</span>
        Never store passwords, keys, tokens, or customer personal data in this dashboard.
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="no-print hidden md:block w-64 border-r border-[var(--line)] bg-[var(--surface)] shrink-0 h-[calc(100vh-4rem)] sticky top-16"
        aria-label="Playbook Navigation"
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop & Panel */}
      {isMobileMenuOpen && (
        <div
          className="no-print md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobileMenu}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative w-80 max-w-[85vw] h-full bg-[var(--surface)] text-[var(--ink)] shadow-2xl flex flex-col z-10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
              <span className="font-bold text-sm text-[var(--ink)]">Playbook Navigation</span>
              <button
                type="button"
                onClick={onCloseMobileMenu}
                aria-label="Close navigation menu"
                className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{navContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
