# Cost Rules for Coding Agents

Autonomous coding agents (Claude Code, Cursor, Codex, Gemini CLI) consume substantial token budgets and compute resources when context boundaries are unmanaged. Follow these five fundamental cost and context control rules.

---

## 1. Exactly One Task Per Session
- **Rule**: Limit every agent session to a single, well-defined user story, bug fix, or refactor.
- **Why**: As conversation context grows beyond 20,000 tokens, the cost per subsequent turn increases quadratically, model reasoning accuracy drops (the "lost in the middle" phenomenon), and hallucination rates surge.
- **Action**: When a task completes, commit the changes, log progress in `docs/PROJECT_STATUS.md`, and terminate the session. Open a fresh session for the next task.

---

## 2. Read Only the Files Needed
- **Rule**: Target specific files and line numbers surgically using line-range slice parameters.
- **Why**: Dumping entire directory trees or 1,500-line source files into the context window burns 5,000–10,000 tokens before a single line of code is written.
- **Action**:
  - Never run whole-directory cat or grep commands into agent context.
  - Read only the specific interface definition, relevant test file, and implementation function being modified.
  - Rely on exported TypeScript type definitions in `packages/` rather than reading entire service implementations.

---

## 3. Compact the Context
- **Rule**: Keep agent instructions, prompt templates, and system prompts under 400 words.
- **Why**: Static system instructions are processed on every single turn. A 2,000-word system prompt repeated across 30 turns consumes 60,000 tokens purely in prompt overhead.
- **Action**:
  - Strip redundant marketing prose, filler adjectives, and conversational preambles.
  - Use concise bulleted checklists with concrete commands.
  - Exclude large binaries, package-lock files, minified bundles, and generated coverage reports from search indices via `.gitignore` and agent ignore rules.

---

## 4. Prefer Small, Surgical Diffs
- **Rule**: Apply focused, unified diff replacements rather than rewriting entire source files from scratch.
- **Why**: Re-generating a 600-line file to change 3 lines consumes 1,200 output tokens (which cost 3x to 5x more than input tokens) and increases the risk of accidental regressions in unmodified methods.
- **Action**:
  - Use targeted search-and-replace tools that modify only the affected function block.
  - Keep pull requests under 400 lines of code.

---

## 5. Stop and Ask When a Decision Is Hard to Reverse
- **Rule**: When an architectural choice is a "Type 1" irreversible decision, the agent must immediately stop, present the trade-offs, and request human confirmation.
- **Why**: Reversing a schema change that dropped a column, migrating off an unapproved third-party SaaS dependency, or restructuring a core database model costs 100x more engineering hours than pausing for a 2-minute human review.
- **Action**:
  - Stop and request confirmation when:
    - Adding a new runtime dependency to `package.json`.
    - Executing destructive database schema changes or data backfills.
    - Altering public API route contracts or breaking backward compatibility.
    - Introducing external network calls that incur recurring SaaS fees.
