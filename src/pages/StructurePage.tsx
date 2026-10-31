import React, { useState } from 'react';
import { Copy, FileCode, FolderTree, Lock, Terminal } from 'lucide-react';
import { ManualCopyModal } from '../components/Modals';
import { useProject } from '../context/ProjectContext';
import { REPO_FILES, REPO_TREE } from '../data/playbook';
import { copyToClipboard, substituteVariables } from '../utils/prompts';

export const StructurePage: React.FC = () => {
  const { activeProject, addToast, user } = useProject();
  const [manualCopyText, setManualCopyText] = useState<string | null>(null);

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        <div className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <Lock className="w-16 h-16 mx-auto text-(--muted)" />
            <h2 className="text-2xl font-bold">Sign In Required</h2>
            <p className="text-(--muted) max-w-md">
              Please sign in to view repository structure templates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const treeSubstituted = substituteVariables(REPO_TREE, activeProject.fields);

  const handleCopyTree = async () => {
    const result = await copyToClipboard(treeSubstituted);
    if (result.success) {
      addToast('Repository tree copied to clipboard!', 'success');
    } else {
      setManualCopyText(result.copiedText);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {manualCopyText && (
        <ManualCopyModal
          isOpen={Boolean(manualCopyText)}
          onClose={() => setManualCopyText(null)}
          textToCopy={manualCopyText}
        />
      )}

      <div className="space-y-2 pb-4 border-b border-[var(--line)]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--cobalt-soft)] text-[var(--cobalt)]">
          <FolderTree className="w-3.5 h-3.5" />
          <span>Repository Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
          Standard Repository File Tree
        </h1>
        <p className="text-xs text-[var(--muted)]">
          An organized, modular file structure following clean architecture, decoupled logic, and automated CI/CD.
        </p>
      </div>

      {/* Interactive Tree Preview */}
      <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)]">Recommended Directory Hierarchy</h2>
            <p className="text-[11px] text-[var(--muted)]">
              Consistent folder conventions across frontend, backend, documentation, and tests.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyTree}
            className="px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5 text-[var(--cobalt)]" />
            <span>Copy File Tree</span>
          </button>
        </div>

        <pre className="text-xs font-mono p-4 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] overflow-x-auto whitespace-pre leading-relaxed">
          {treeSubstituted}
        </pre>
      </section>

      {/* Canonical Repository File Catalog */}
      <section className="space-y-3">
        <div className="pb-2 border-b border-[var(--line)]">
          <h2 className="text-sm font-bold text-[var(--ink)]">Canonical Repository Files</h2>
          <p className="text-[11px] text-[var(--muted)]">
            Purpose and operational responsibility for each standard root and src file.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REPO_FILES.map((file, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs space-y-1 shadow-2xs hover:border-[var(--cobalt)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[var(--cobalt)] shrink-0" />
                <span className="font-mono font-bold text-[var(--ink)]">{file.path}</span>
              </div>
              <p className="text-[var(--muted)] leading-relaxed pl-6">{file.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
