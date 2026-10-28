import React, { useState } from 'react';
import { BookOpen, ExternalLink, Filter, Search } from 'lucide-react';
import { PHASES } from '../data/playbook';

export const ResourcesPage: React.FC = () => {
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterQuery, setFilterQuery] = useState<string>('');

  // Collect all resources with phase references
  const allResources = PHASES.flatMap((phase) =>
    phase.resources.map((res) => ({
      ...res,
      phaseId: phase.id,
      phaseTitle: phase.short,
    }))
  );

  const sources = Array.from(new Set(allResources.map((r) => r.source))).sort();

  const filtered = allResources.filter((res) => {
    const matchesSource = filterSource === 'all' || res.source === filterSource;
    const matchesQuery =
      !filterQuery.trim() ||
      res.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      res.source.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesSource && matchesQuery;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="space-y-2 pb-4 border-b border-[var(--line)]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--cobalt-soft)] text-[var(--cobalt)]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curated Standards & Specs</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
          Authoritative Engineering Resources
        </h1>
        <p className="text-xs text-[var(--muted)]">
          Authoritative, stable HTTPS specifications and industry standards across the 18 lifecycle phases.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 text-[var(--muted)] pointer-events-none" />
          <input
            type="search"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter resources by title, topic, or protocol..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <label htmlFor="source-filter" className="text-xs font-semibold text-[var(--muted)]">
            Source:
          </label>
          <select
            id="source-filter"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] cursor-pointer focus:ring-1 focus:ring-[var(--focus-ring)]"
          >
            <option value="all">All Sources ({allResources.length})</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((res, idx) => (
          <a
            key={idx}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--cobalt)] shadow-xs transition-all block text-decoration-none group space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--ink)] group-hover:text-[var(--cobalt)] transition-colors">
                {res.title}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--cobalt)] shrink-0" />
            </div>

            <p className="text-[11px] text-[var(--muted)] leading-relaxed line-clamp-2">
              {res.description}
            </p>

            <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[10px]">
              <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--line)] text-[var(--muted)]">
                {res.source}
              </span>
              <span className="text-[var(--muted)]">
                Phase {res.phaseId}: {res.phaseTitle}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
