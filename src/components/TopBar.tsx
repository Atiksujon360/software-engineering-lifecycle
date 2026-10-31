import React, { useEffect, useRef, useState } from 'react';
import {
  Cloud,
  CloudOff,
  Database,
  Download,
  FolderPlus,
  HelpCircle,
  LogIn,
  Menu,
  Moon,
  Pencil,
  Printer,
  RefreshCw,
  Search,
  Shield,
  Sliders,
  Sun,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { PHASES } from '../data/playbook';
import { calculateOverallProgress } from '../utils/metrics';
import { createProjectExport, triggerFileDownload } from '../utils/storage';
import { AuthModal, UserAccountModal } from './Modals';

interface TopBarProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  onOpenNewProjectModal: () => void;
  onOpenRenameModal: () => void;
  onOpenDeleteModal: () => void;
  onOpenResetModal: () => void;
  onOpenImportModal: () => void;
  onOpenMigrationModal: () => void;
  onNavigate: (hash: string) => void;
  currentSearchQuery?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
  onOpenNewProjectModal,
  onOpenRenameModal,
  onOpenDeleteModal,
  onOpenResetModal,
  onOpenImportModal,
  onOpenMigrationModal,
  onNavigate,
  currentSearchQuery = '',
}) => {
  const {
    storage,
    activeProject,
    setActiveProject,
    setMode,
    cycleTheme,
    addToast,
    user,
    syncStatus,
    syncNow,
  } = useProject();

  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserAccountModalOpen, setIsUserAccountModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(currentSearchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  const { done, total, percent } = calculateOverallProgress(
    PHASES,
    activeProject.checkedTasks,
    activeProject.mode
  );

  // Sync search input with route query
  useEffect(() => {
    setSearchInput(currentSearchQuery);
  }, [currentSearchQuery]);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close tools dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate(`results?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      onNavigate('overview');
    }
  };

  const handleExport = () => {
    const exportData = createProjectExport(activeProject);
    const filename = `${activeProject.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-progress.json`;
    triggerFileDownload(JSON.stringify(exportData, null, 2), filename);
    addToast(`Exported progress to ${filename} (project fields omitted)`, 'success');
    setIsToolsOpen(false);
  };

  const handlePrintPage = () => {
    setIsToolsOpen(false);
    window.print();
  };

  const handlePrintFullPlaybook = () => {
    setIsToolsOpen(false);
    addToast('Opening full playbook for printing...', 'info');
    onNavigate('templates');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Compute status pill text and color
  const renderSyncIndicator = () => {
    const hasLocalData = typeof localStorage !== 'undefined' && localStorage.getItem('swlp.v2');

    if (!user && hasLocalData) {
      return (
        <button
          type="button"
          onClick={onOpenMigrationModal}
          title="Local data available - migrate to server (requires login)"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-(--amber)/30 bg-(--amber-soft) text-(--amber) cursor-pointer"
        >
          <Database className="w-3 h-3" />
          <span>Migrate Local Data</span>
        </button>
      );
    }

    if (!user) {
      return (
        <div
          title="Progress is stored locally on this machine."
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-[var(--line)] bg-[var(--surface-raised)] text-[var(--muted)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />
          <span>Saved on this device</span>
        </div>
      );
    }

    if (hasLocalData) {
      return (
        <button
          type="button"
          onClick={onOpenMigrationModal}
          title="Local data available - migrate to server"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-(--amber)/30 bg-(--amber-soft) text-(--amber) cursor-pointer"
        >
          <Database className="w-3 h-3" />
          <span>Migrate Local Data</span>
        </button>
      );
    }

    if (syncStatus === 'syncing') {
      return (
        <div
          title="Synchronizing changes with database..."
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-(--cobalt)/30 bg-(--cobalt-soft) text-(--cobalt)"
        >
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Syncing</span>
        </div>
      );
    }

    if (syncStatus === 'offline') {
      return (
        <button
          type="button"
          onClick={() => syncNow()}
          title="Server unreachable or browser offline. Click to retry sync."
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-(--amber)/30 bg-(--amber-soft) text-(--amber) cursor-pointer"
        >
          <CloudOff className="w-3 h-3" />
          <span className="hidden md:inline">Offline: changes will sync when you reconnect</span>
          <span className="md:hidden">Offline</span>
        </button>
      );
    }

    // Default when logged in and synced
    return (
      <button
        type="button"
        onClick={() => setIsUserAccountModalOpen(true)}
        title={`All changes synced to ${user.email}. Click to view account.`}
        className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-(--green)/30 bg-(--green-soft) text-(--green) cursor-pointer"
      >
        <Cloud className="w-3 h-3" />
        <span>Saved to your account</span>
      </button>
    );
  };

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4">
        {/* Left: Mobile menu button & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-[var(--surface-raised)] border border-[var(--line)] text-[var(--ink)] cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a
            href="#overview"
            className="flex items-center gap-2.5 text-decoration-none group select-none"
            title="Go to Playbook Overview"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--cobalt)] text-white font-bold text-sm shadow-xs">
              EL
            </div>
            <div className="hidden xl:block">
              <span className="font-bold text-sm tracking-tight text-[var(--ink)] block leading-none">
                Lifecycle Playbook
              </span>
              <span className="text-[10px] text-[var(--muted)] tracking-wider uppercase font-semibold">
                Idea to Handover
              </span>
            </div>
          </a>
        </div>

        {/* Center: Search Bar & Project Dropdown */}
        <div className="flex-1 max-w-xl flex items-center gap-2">
          {/* Project Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <label htmlFor="project-select" className="sr-only">
              Select Active Project
            </label>
            <select
              id="project-select"
              value={activeProject.id}
              onChange={(e) => setActiveProject(e.target.value)}
              className="text-xs font-semibold py-1.5 px-2.5 rounded-md border border-[var(--line)] bg-[var(--surface-raised)] text-[var(--ink)] cursor-pointer hover:border-[var(--muted)] transition-colors focus:ring-1 focus:ring-[var(--focus-ring)] max-w-[140px] truncate"
            >
              {storage.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative min-w-[100px]">
            <label htmlFor="global-search" className="sr-only">
              Search playbook
            </label>
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-[var(--muted)] pointer-events-none" />
              <input
                id="global-search"
                ref={searchInputRef}
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search checklist, prompts, RFCs..."
                className="w-full text-xs pl-8 pr-7 py-1.5 rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] placeholder-[var(--muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--focus-ring)] transition-all"
              />
              <kbd className="hidden sm:inline-flex items-center justify-center absolute right-2 text-[10px] font-mono px-1 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--line)] text-[var(--muted)] pointer-events-none">
                /
              </kbd>
            </div>
          </form>

          {/* New / Existing Project Mode Toggle */}
          <div className="hidden md:inline-flex items-center p-0.5 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] shrink-0">
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeProject.mode === 'new'
                  ? 'bg-[var(--cobalt)] text-white shadow-xs font-semibold'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
              title="Greenfield: standard 97-task path"
            >
              New project
            </button>
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeProject.mode === 'existing'
                  ? 'bg-[var(--cobalt)] text-white shadow-xs font-semibold'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
              title="Brownfield: includes 8 intake tasks in Phase 0"
            >
              Existing project
            </button>
          </div>
        </div>

        {/* Right: Sync Status, User Account, Theme, Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sync status indicator */}
          {renderSyncIndicator()}

          {/* User Sign In / Account Button */}
          {user ? (
            <button
              type="button"
              onClick={() => setIsUserAccountModalOpen(true)}
              className="p-1.5 rounded-md border border-[var(--line)] hover:bg-[var(--surface-raised)] text-[var(--ink)] cursor-pointer text-xs flex items-center gap-1.5"
              title={`Signed in as ${user.email}. Click for account options.`}
            >
              <User className="w-3.5 h-3.5 text-[var(--cobalt)]" />
              <span className="hidden xl:inline max-w-[90px] truncate">{user.email}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-xs font-semibold text-[var(--ink)] cursor-pointer inline-flex items-center gap-1"
              title="Sign in to sync your projects across devices"
            >
              <LogIn className="w-3.5 h-3.5 text-[var(--cobalt)]" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Overall Progress Indicator */}
          <a
            href="#overview"
            className="flex items-center gap-2 px-2 sm:px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] transition-colors text-decoration-none"
            title={`${done} of ${total} tasks completed (${percent}%)`}
          >
            <div className="w-10 sm:w-14 h-2 rounded-full bg-[var(--line)] overflow-hidden">
              <div
                className="h-full bg-[var(--green)] transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[var(--ink)] tabular-nums">{percent}%</span>
          </a>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`Current theme: ${storage.theme}. Click to change theme.`}
            title={`Theme: ${storage.theme} (click to cycle)`}
            className="p-1.5 rounded-md border border-[var(--line)] hover:bg-[var(--surface-raised)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer transition-colors"
          >
            {storage.theme === 'light' ? (
              <Sun className="w-4 h-4 text-[var(--amber)]" />
            ) : storage.theme === 'dark' ? (
              <Moon className="w-4 h-4 text-[var(--cobalt)]" />
            ) : (
              <Sliders className="w-4 h-4" />
            )}
          </button>

          {/* Tools Menu Dropdown */}
          <div className="relative" ref={toolsRef}>
            <button
              type="button"
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              aria-label="Project and application tools menu"
              aria-expanded={isToolsOpen}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-[var(--ink)] cursor-pointer transition-colors"
            >
              <span>Tools</span>
              <span className="text-[10px]">▼</span>
            </button>

            {isToolsOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] border-b border-[var(--line)]">
                  Project Actions
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onOpenNewProjectModal();
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--surface-raised)] cursor-pointer text-[var(--ink)]"
                >
                  <FolderPlus className="w-4 h-4 text-[var(--cobalt)]" />
                  <span>Create new project</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onOpenRenameModal();
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--surface-raised)] cursor-pointer text-[var(--ink)]"
                >
                  <Pencil className="w-4 h-4 text-[var(--muted)]" />
                  <span>Rename project</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onOpenDeleteModal();
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--surface-raised)] text-[var(--red)] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete project</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onOpenResetModal();
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--surface-raised)] text-[var(--amber)] cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset progress & notes</span>
                </button>

                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] border-t border-b border-[var(--line)] mt-1">
                  Import / Export
                </div>
                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--surface-raised)] cursor-pointer text-[var(--ink)]"
                >
                  <Download className="w-4 h-4 text-[var(--green)]" />
                  <span>Export progress JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onOpenImportModal();
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--surface-raised)] cursor-pointer text-[var(--ink)]"
                >
                  <Upload className="w-4 h-4 text-[var(--cobalt)]" />
                  <span>Import progress JSON</span>
                </button>

                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] border-t border-b border-[var(--line)] mt-1">
                  Printing & Output
                </div>
                <button
                  type="button"
                  onClick={handlePrintPage}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--surface-raised)] cursor-pointer text-[var(--ink)]"
                >
                  <Printer className="w-4 h-4 text-[var(--muted)]" />
                  <span>Print this page</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintFullPlaybook}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--surface-raised)] cursor-pointer text-[var(--cobalt)]"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print the full playbook</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal & User Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <UserAccountModal
        isOpen={isUserAccountModalOpen}
        onClose={() => setIsUserAccountModalOpen(false)}
      />
    </header>
  );
};
