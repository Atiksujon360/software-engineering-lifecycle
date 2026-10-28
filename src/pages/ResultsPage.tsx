import React, { useMemo } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  FileCode,
  GraduationCap,
  MessageSquare,
  Search,
} from 'lucide-react';
import { PHASES, REPO_FILES } from '../data/playbook';

interface ResultsPageProps {
  query: string;
  onNavigate: (hash: string) => void;
}

interface SearchMatch {
  type: 'task' | 'prompt' | 'note' | 'resource' | 'skill' | 'structure';
  phaseId?: number;
  title: string;
  snippet: string;
  linkHash: string;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ query, onNavigate }) => {
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const list: SearchMatch[] = [];

    // 1. Search Tasks across all phases
    for (const phase of PHASES) {
      for (const t of phase.tasks) {
        if (t.text.toLowerCase().includes(q) || t.doneWhen.toLowerCase().includes(q)) {
          list.push({
            type: 'task',
            phaseId: phase.id,
            title: `Phase ${phase.id}: ${phase.short} — Task ${t.id}`,
            snippet: `${t.text} (Done when: ${t.doneWhen})`,
            linkHash: `phase-${phase.id}`,
          });
        }
      }

      // Existing tasks
      if (phase.existing) {
        for (const t of phase.existing) {
          if (t.text.toLowerCase().includes(q) || t.doneWhen.toLowerCase().includes(q)) {
            list.push({
              type: 'task',
              phaseId: phase.id,
              title: `Phase ${phase.id}: ${phase.short} — Legacy Intake Task ${t.id}`,
              snippet: `${t.text} (Done when: ${t.doneWhen})`,
              linkHash: `phase-${phase.id}`,
            });
          }
        }
      }

      // 2. Search Prompts
      for (const p of phase.prompts) {
        if (
          p.title.toLowerCase().includes(q) ||
          p.template.toLowerCase().includes(q) ||
          p.expectedOutput.toLowerCase().includes(q)
        ) {
          list.push({
            type: 'prompt',
            phaseId: phase.id,
            title: `Phase ${phase.id}: ${phase.short} — Prompt "${p.title}"`,
            snippet: p.template.slice(0, 300),
            linkHash: `phase-${phase.id}`,
          });
        }
      }

      // 3. Search Notes
      for (const note of phase.notes) {
        if (note.toLowerCase().includes(q)) {
          list.push({
            type: 'note',
            phaseId: phase.id,
            title: `Phase ${phase.id}: ${phase.short} — Engineering Note`,
            snippet: note,
            linkHash: `phase-${phase.id}`,
          });
        }
      }

      // 4. Search Resources
      for (const res of phase.resources) {
        if (
          res.title.toLowerCase().includes(q) ||
          res.description.toLowerCase().includes(q) ||
          res.source.toLowerCase().includes(q)
        ) {
          list.push({
            type: 'resource',
            phaseId: phase.id,
            title: `Phase ${phase.id}: ${phase.short} — Resource: ${res.title}`,
            snippet: `${res.source}: ${res.description} (${res.url})`,
            linkHash: `phase-${phase.id}`,
          });
        }
      }

      // 5. Search Skills
      for (const sk of phase.skills) {
        if (sk.name.toLowerCase().includes(q) || sk.description.toLowerCase().includes(q)) {
          list.push({
            type: 'skill',
            phaseId: phase.id,
            title: `Phase ${phase.id}: ${phase.short} — Skill: ${sk.name}`,
            snippet: `${sk.level}: ${sk.description}`,
            linkHash: `phase-${phase.id}`,
          });
        }
      }
    }

    // 6. Search Structure / Repo Files
    for (const f of REPO_FILES) {
      if (f.path.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)) {
        list.push({
          type: 'structure',
          title: `Repository Structure — ${f.path}`,
          snippet: f.description,
          linkHash: 'structure',
        });
      }
    }

    return list;
  }, [query]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="pb-4 border-b border-[var(--line)]">
        <h1 className="text-2xl font-extrabold text-[var(--ink)]">Search Playbook</h1>
        <p className="text-xs text-[var(--muted)] mt-1">
          Showing {matches.length} result(s) for query: <strong className="text-[var(--ink)]">"{query}"</strong>
        </p>
      </div>

      {!query.trim() ? (
        <div className="text-center py-12 text-xs text-[var(--muted)] space-y-2">
          <Search className="w-8 h-8 mx-auto text-[var(--muted)] opacity-60" />
          <p>Please enter a keyword in the search bar above or press <kbd className="font-mono px-1 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--line)]">/</kbd>.</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12 text-xs text-[var(--muted)] space-y-2">
          <p>No results found for "{query}".</p>
          <p className="text-[11px]">Try searching for terms like "RFC 9457", "OWASP", "Docker", "SRE", or "Acceptance".</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((item, idx) => {
            let icon = <CheckSquare className="w-4 h-4 text-[var(--cobalt)] shrink-0" />;
            if (item.type === 'prompt') icon = <MessageSquare className="w-4 h-4 text-[var(--cobalt)] shrink-0" />;
            if (item.type === 'note') icon = <BookOpen className="w-4 h-4 text-[var(--amber)] shrink-0" />;
            if (item.type === 'resource') icon = <BookOpen className="w-4 h-4 text-[var(--green)] shrink-0" />;
            if (item.type === 'skill') icon = <GraduationCap className="w-4 h-4 text-[var(--muted)] shrink-0" />;
            if (item.type === 'structure') icon = <FileCode className="w-4 h-4 text-[var(--muted)] shrink-0" />;

            return (
              <div
                key={idx}
                onClick={() => onNavigate(item.linkHash)}
                className="group p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--cobalt)] shadow-xs transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-xs font-bold text-[var(--ink)] group-hover:text-[var(--cobalt)] transition-colors">
                      {highlightMatches(item.title, query)}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--line)] text-[var(--muted)]">
                    {item.type}
                  </span>
                </div>

                <p className="text-xs text-[var(--muted)] leading-relaxed pl-6 line-clamp-3">
                  {highlightMatches(item.snippet, query)}
                </p>

                <div className="pl-6 pt-1 flex items-center gap-1 text-[11px] font-semibold text-[var(--cobalt)]">
                  <span>Open in {item.linkHash}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /**
   * Helper that splits text by query and highlights matches.
   */
  function highlightMatches(text: string, q: string) {
    if (!q.trim()) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-bold px-0.5 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  }
};
