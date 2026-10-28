import React, { useState } from 'react';
import { Bot, CheckCircle, Copy, Sparkles, Terminal } from 'lucide-react';
import { ManualCopyModal } from '../components/Modals';
import { useProject } from '../context/ProjectContext';
import {
  AGENT_PROMPT_TEMPLATE,
  AGENTS_TEMPLATE,
  PROJECT_CONTEXT_TEMPLATE,
} from '../data/playbook';
import { copyToClipboard, substituteVariables } from '../utils/prompts';

export const AgentsPage: React.FC = () => {
  const { activeProject, addToast } = useProject();
  const [manualCopyText, setManualCopyText] = useState<string | null>(null);

  const handleCopy = async (templateText: string, label: string) => {
    const substituted = substituteVariables(templateText, activeProject.fields);
    const result = await copyToClipboard(substituted);
    if (result.success) {
      addToast(`${label} copied to clipboard!`, 'success');
    } else {
      setManualCopyText(result.copiedText);
    }
  };

  const projectContextSubstituted = substituteVariables(
    PROJECT_CONTEXT_TEMPLATE,
    activeProject.fields
  );
  const agentPromptSubstituted = substituteVariables(
    AGENT_PROMPT_TEMPLATE,
    activeProject.fields
  );
  const agentsGuideSubstituted = substituteVariables(AGENTS_TEMPLATE, activeProject.fields);

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
          <Bot className="w-3.5 h-3.5" />
          <span>Autonomous AI Engineering</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
          AI Agent Workflows & Prompt Library
        </h1>
        <p className="text-xs text-[var(--muted)]">
          Calibrate coding models and autonomous agents with exact repository constraints, strict typing, and zero placeholder stubs.
        </p>
      </div>

      {/* Five Golden Rules for AI Coding */}
      <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--amber)]" />
          <span>Core Invariants for Human-in-the-Loop AI Engineering</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--line)] space-y-1">
            <span className="font-bold text-[var(--ink)]">1. Complete Code Only</span>
            <p className="text-[var(--muted)] leading-relaxed">
              Require the model to produce pristine, working code in full. Prohibit lazy comments like <code className="font-mono text-[10px]">// TODO: implement later</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--line)] space-y-1">
            <span className="font-bold text-[var(--ink)]">2. Fast Logic Decoupling</span>
            <p className="text-[var(--muted)] leading-relaxed">
              Separate pure calculation math and validation parsers from React components so they can be verified in milliseconds with Node's native test runner.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--line)] space-y-1">
            <span className="font-bold text-[var(--ink)]">3. Zero Secret Storage</span>
            <p className="text-[var(--muted)] leading-relaxed">
              Never expose private keys, authorization tokens, or passwords in system prompts or commit logs. Use environment variables and secrets vaults.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--line)] space-y-1">
            <span className="font-bold text-[var(--ink)]">4. Semantic Accessibility</span>
            <p className="text-[var(--muted)] leading-relaxed">
              Always instruct agents to use semantic HTML (<code className="font-mono text-[10px]">&lt;button&gt;</code>, <code className="font-mono text-[10px]">&lt;label&gt;</code>, <code className="font-mono text-[10px]">&lt;main&gt;</code>) so headless accessibility inspection trees can target elements.
            </p>
          </div>
        </div>
      </section>

      {/* Copyable Context Template */}
      <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)]">Master Project Context Prompt</h2>
            <p className="text-[11px] text-[var(--muted)]">
              Paste this at the start of any new LLM chat session to ground the model in your stack.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(PROJECT_CONTEXT_TEMPLATE, 'Project Context Prompt')}
            className="px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5 text-[var(--cobalt)]" />
            <span>Copy Grounding Context</span>
          </button>
        </div>

        <pre className="text-xs font-mono p-4 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {projectContextSubstituted}
        </pre>
      </section>

      {/* Copyable Task Prompt Template */}
      <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)]">Single-Task Agent Execution Template</h2>
            <p className="text-[11px] text-[var(--muted)]">
              Use this structure when asking an AI assistant to implement a specific user story or component.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(AGENT_PROMPT_TEMPLATE, 'Single-Task Template')}
            className="px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--paper)] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5 text-[var(--cobalt)]" />
            <span>Copy Task Template</span>
          </button>
        </div>

        <pre className="text-xs font-mono p-4 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {agentPromptSubstituted}
        </pre>
      </section>
    </div>
  );
};
