import React, { useState } from 'react';
import {
  CheckCircle,
  Copy,
  DollarSign,
  FileCheck,
  FileText,
  Lock,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { ManualCopyModal } from '../components/Modals';
import { useProject } from '../context/ProjectContext';
import {
  ADR_TEMPLATE,
  COST_RULES,
  DEFINITION_OF_DONE,
  HANDOFF_TEMPLATE,
  HUMAN_APPROVALS,
  STATUS_TEMPLATE,
} from '../data/playbook';
import { copyToClipboard, substituteVariables } from '../utils/prompts';

export const TemplatesPage: React.FC = () => {
  const { activeProject, addToast } = useProject();
  const [manualCopyText, setManualCopyText] = useState<string | null>(null);

  const handleCopy = async (rawText: string, label: string) => {
    const substituted = substituteVariables(rawText, activeProject.fields);
    const result = await copyToClipboard(substituted);
    if (result.success) {
      addToast(`${label} copied to clipboard!`, 'success');
    } else {
      setManualCopyText(result.copiedText);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      {manualCopyText && (
        <ManualCopyModal
          isOpen={Boolean(manualCopyText)}
          onClose={() => setManualCopyText(null)}
          textToCopy={manualCopyText}
        />
      )}

      <div className="space-y-2 pb-4 border-b border-[var(--line)]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--cobalt-soft)] text-[var(--cobalt)]">
          <FileText className="w-3.5 h-3.5" />
          <span>Operational Standard Documentation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
          Engineering Templates & Governance
        </h1>
        <p className="text-xs text-[var(--muted)]">
          Pre-formatted architectural documents, status reports, cost guidelines, and release sign-off matrices.
        </p>
      </div>

      {/* Human Approvals Matrix */}
      <section className="space-y-3">
        <div className="pb-2 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--amber)]" />
              <span>Human Checkpoint Approvals Matrix</span>
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Formal verification sign-offs required at key project milestones.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {HUMAN_APPROVALS.map((appr) => (
            <div
              key={appr.id}
              className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--ink)]">{appr.phase}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                  {appr.gate}
                </span>
              </div>
              <div className="text-[11px] text-[var(--muted)]">
                <strong className="text-[var(--ink)]">Sign-off Approvers:</strong> {appr.approvers}
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                <strong className="text-[var(--ink)]">Pass Criteria:</strong> {appr.criteria}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cloud Cost Rules */}
      <section className="space-y-3">
        <div className="pb-2 border-b border-[var(--line)]">
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[var(--green)]" />
            <span>Infrastructure FinOps & Cost Rules</span>
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Prevent budget surprises and ensure cost-efficient architectural choices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COST_RULES.map((rule) => (
            <div
              key={rule.id}
              className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs space-y-1.5 shadow-2xs"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                {rule.category}
              </span>
              <p className="font-semibold text-[var(--ink)] leading-snug">{rule.rule}</p>
              <p className="text-[11px] text-[var(--green)] leading-relaxed">
                <strong>Financial Impact:</strong> {rule.impact}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Definition of Done Checklist */}
      <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[var(--green)]" />
              <span>Universal Definition of Done (DoD)</span>
            </h2>
            <p className="text-[11px] text-[var(--muted)]">
              Release gates that every pull request and feature milestone must satisfy.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(DEFINITION_OF_DONE.join('\n- '), 'Definition of Done')}
            className="px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5 text-[var(--cobalt)]" />
            <span>Copy DoD List</span>
          </button>
        </div>

        <ul className="space-y-2 text-xs">
          {DEFINITION_OF_DONE.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-[var(--ink)] leading-relaxed">
              <CheckCircle className="w-4 h-4 text-[var(--green)] shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Architecture Decision Record (ADR) Template */}
      <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)]">Architecture Decision Record (ADR) Template</h2>
            <p className="text-[11px] text-[var(--muted)]">Standard Michael Nygard format for architectural governance.</p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(ADR_TEMPLATE, 'ADR Template')}
            className="px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5 text-[var(--cobalt)]" />
            <span>Copy ADR Template</span>
          </button>
        </div>

        <pre className="text-xs font-mono p-4 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {ADR_TEMPLATE}
        </pre>
      </section>

      {/* Weekly Status Report Template */}
      <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)]">Weekly Executive Status Report</h2>
            <p className="text-[11px] text-[var(--muted)]">Pre-populated with your current project variables.</p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(STATUS_TEMPLATE, 'Status Template')}
            className="px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5 text-[var(--cobalt)]" />
            <span>Copy Status Template</span>
          </button>
        </div>

        <pre className="text-xs font-mono p-4 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {substituteVariables(STATUS_TEMPLATE, activeProject.fields)}
        </pre>
      </section>

      {/* Handover Dossier Template */}
      <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)]">Production Handover Dossier</h2>
            <p className="text-[11px] text-[var(--muted)]">Operational runbook for transferring codebase ownership cleanly.</p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(HANDOFF_TEMPLATE, 'Handoff Template')}
            className="px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5 text-[var(--cobalt)]" />
            <span>Copy Handover Template</span>
          </button>
        </div>

        <pre className="text-xs font-mono p-4 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {substituteVariables(HANDOFF_TEMPLATE, activeProject.fields)}
        </pre>
      </section>
    </div>
  );
};
