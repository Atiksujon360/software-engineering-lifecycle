import React, { useState } from 'react';
import { ArrowRight, GraduationCap, Search } from 'lucide-react';
import { PHASES } from '../data/playbook';

interface SkillsPageProps {
  onNavigate: (hash: string) => void;
}

export const SkillsPage: React.FC<SkillsPageProps> = ({ onNavigate }) => {
  const [filterQuery, setFilterQuery] = useState('');

  const allSkills = PHASES.flatMap((p) =>
    p.skills.map((s) => ({
      ...s,
      phaseId: p.id,
      phaseTitle: p.title,
      group: p.group,
    }))
  );

  const filtered = allSkills.filter((s) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.level.toLowerCase().includes(q) ||
      s.phaseTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="space-y-2 pb-4 border-b border-[var(--line)]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--cobalt-soft)] text-[var(--cobalt)]">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Competency Framework</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
          Engineering Skills Matrix
        </h1>
        <p className="text-xs text-[var(--muted)]">
          Core, advanced, and specialist capabilities demonstrated across all 18 lifecycle phases.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
        <input
          type="search"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter skills by name or capability..."
          className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((skill, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-xs space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--ink)]">{skill.name}</span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded ${
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

            <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px]">
              <span className="text-[var(--muted)]">
                Phase {skill.phaseId}: {skill.phaseTitle}
              </span>
              <button
                type="button"
                onClick={() => onNavigate(`phase-${skill.phaseId}`)}
                className="text-[var(--cobalt)] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Phase</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
