import React from 'react';
import { ArrowRight, Image as ImageIcon, Layers, Milestone, Shield, Workflow } from 'lucide-react';
import { GATES, PHASES } from '../data/playbook';

interface GalleryPageProps {
  onNavigate: (hash: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="space-y-2 pb-4 border-b border-[var(--line)]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--cobalt-soft)] text-[var(--cobalt)]">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Visual Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
          Visual Architecture & Lifecycle Flowcards
        </h1>
        <p className="text-xs text-[var(--muted)]">
          Architectural diagrams and phase progression cards illustrating software delivery flow.
        </p>
      </div>

      {/* 3-Tier Architecture Diagram */}
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--cobalt)]" />
              <span>Full-Stack Application Tiering</span>
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Decoupled client, perimeter security, domain logic, and transactional persistence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Tier 1: Client */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--cobalt)]">
              Client & Presentation
            </span>
            <h3 className="font-bold text-[var(--ink)]">Phase 7: Frontend</h3>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Accessible React SPA, design tokens, optimistic state, responsive viewport down to 390px, offline recovery.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[var(--muted)] border-t border-[var(--line)]">
              WCAG 2.2 AA • Web Vitals
            </div>
          </div>

          {/* Tier 2: Edge & Security */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--amber)]">
              Perimeter & Gateway
            </span>
            <h3 className="font-bold text-[var(--ink)]">Phase 6 & 9: API & Sec</h3>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              OpenAPI contracts, RFC 9457 errors, CSP headers, rate limiting, and JWT authentication tokens.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[var(--muted)] border-t border-[var(--line)]">
              RFC 9457 • OWASP Top 10
            </div>
          </div>

          {/* Tier 3: Domain Services */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--cobalt)]">
              Domain & Services
            </span>
            <h3 className="font-bold text-[var(--ink)]">Phase 8: Backend</h3>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Request validation schemas, pure business logic services, transaction isolation, and graceful shutdown.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[var(--muted)] border-t border-[var(--line)]">
              Gate G2 • 12-Factor
            </div>
          </div>

          {/* Tier 4: Storage */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--green)]">
              Data & Operations
            </span>
            <h3 className="font-bold text-[var(--ink)]">Phase 5 & 14–15</h3>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Relational schemas, forward migrations, CI/CD automated deployments, and Golden Signals monitoring.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[var(--muted)] border-t border-[var(--line)]">
              Gate G4 • Golden Signals
            </div>
          </div>
        </div>
      </section>

      {/* Human Quality Gate Checkpoints Diagram */}
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--amber)]" />
              <span>Human Quality Gates Pipeline</span>
            </h2>
            <p className="text-xs text-[var(--muted)]">
              The four contractual quality gates that protect software stability across stages.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GATES.map((g) => (
            <div
              key={g.id}
              className="p-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                    {g.id}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">After Phase {g.after}</span>
                </div>
                <h3 className="text-sm font-bold text-[var(--ink)]">{g.title}</h3>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">{g.text}</p>
              </div>

              <div className="pt-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => onNavigate(`phase-${g.after}`)}
                  className="text-[11px] font-semibold text-[var(--cobalt)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Review Phase {g.after}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
