import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('content/prompts.json is valid and meets all constraints', () => {
  const raw = fs.readFileSync(path.resolve('./content/prompts.json'), 'utf8');
  const prompts = JSON.parse(raw);

  assert.ok(Array.isArray(prompts), 'prompts must be an array');
  assert.ok(prompts.length >= 40, `Expected at least 40 prompts, got ${prompts.length}`);

  const requiredTitles = [
    'Read-only intake of an existing repository',
    'Map the repo and risks without changing it',
    'Interview me before any build',
    'Separate facts from assumptions',
    'Harden the requirements',
    'Cut the scope to the core',
    'Skeptical architecture review',
    'Write an ADR for one decision',
    'Schema review',
    'Contract first',
    'Build one slice, test first',
    'Accessibility audit of one page',
    'Implement one business rule',
    'STRIDE threat model',
    'Attacker-minded diff review',
    'Behaviour tests from acceptance criteria',
    'Skeptical diff review',
    'Find the bottleneck',
    'Pipeline review',
    'Release plan',
    'Alert audit',
    'Monthly health report',
    'Handover pack',
    'Agent task template',
  ];

  for (const title of requiredTitles) {
    const found = prompts.find((p: any) => p.title === title);
    assert.ok(found, `Missing mandatory prompt title: "${title}"`);
  }

  // Allowed placeholders: {{PROJECT_NAME}}, {{ONE_LINE}}, {{USERS}}, {{STACK}}, {{REPO_PATH}}, {{TIMEFRAME}}
  const allowedPlaceholders = new Set([
    'PROJECT_NAME',
    'ONE_LINE',
    'USERS',
    'STACK',
    'REPO_PATH',
    'TIMEFRAME',
  ]);

  for (const p of prompts) {
    assert.ok(p.title && p.title.length > 0, 'Prompt must have title');
    assert.ok(p.where && p.where.length > 0, 'Prompt must have where');
    assert.ok(p.text && p.text.length > 0, 'Prompt must have text');
    assert.ok(p.stop_when && p.stop_when.length > 0, 'Prompt must have stop_when');

    // Word count under 400 words
    const wordCount = p.text.split(/\s+/).filter(Boolean).length;
    assert.ok(
      wordCount < 400,
      `Prompt "${p.title}" exceeds 400 words (got ${wordCount} words)`
    );

    // Verify placeholders
    const matches = p.text.match(/\{\{([^}]+)\}\}/g) || [];
    for (const m of matches) {
      const key = m.replace(/[{}]/g, '').trim();
      assert.ok(
        allowedPlaceholders.has(key),
        `Illegal placeholder {{${key}}} in prompt "${p.title}"`
      );
    }

    // Verify acceptance check and report format
    assert.ok(
      p.text.includes('Acceptance check:') || p.text.includes('acceptance check:'),
      `Prompt "${p.title}" missing acceptance check section`
    );
    assert.ok(
      p.text.toLowerCase().includes('files to read first') || p.text.toLowerCase().includes('read first'),
      `Prompt "${p.title}" missing files to read first`
    );
    assert.ok(
      p.text.toLowerCase().includes('constraints'),
      `Prompt "${p.title}" missing constraints`
    );
  }
});

test('content/skills.json is valid and covers all required skills', () => {
  const raw = fs.readFileSync(path.resolve('./content/skills.json'), 'utf8');
  const skills = JSON.parse(raw);

  assert.ok(Array.isArray(skills), 'skills must be an array');
  assert.ok(skills.length >= 20, `Expected at least 20 skills, got ${skills.length}`);

  const requiredSkillNames = [
    'frontend-design',
    'accessibility-review',
    'design-handoff',
    'design-critique',
    'ux-copy',
    'deep-research',
    'user-research',
    'research-synthesis',
    'humanizer',
    'token-efficiency-audit',
    'skill-creator',
    'docx',
    'xlsx',
    'pptx',
    'pdf',
    'file-reading',
    'artifact-diagramming',
    'Claude Code (CLAUDE.md, AGENTS.md)',
    'GitHub Actions',
    'Testcontainers',
  ];

  for (const name of requiredSkillNames) {
    const found = skills.find((s: any) => s.name === name);
    assert.ok(found, `Missing mandatory skill: "${name}"`);
    assert.ok(['Claude skill', 'tool', 'practice'].includes(found.kind), `Invalid kind: ${found.kind}`);
    assert.ok(Array.isArray(found.phases) && found.phases.length > 0, 'Phases must be non-empty array');
    assert.ok(found.when_to_use.length > 10, 'when_to_use too short');
    assert.ok(found.when_not_to_use.length > 10, 'when_not_to_use too short');
    assert.ok(found.example.length > 10, 'example prompt too short');
  }
});

test('All content architecture markdown documents and diagrams exist', () => {
  const expectedArchitectureFiles = [
    'ARCHITECTURE_TEMPLATE.md',
    'STACK_RECOMMENDATION.md',
    'REPO_LAYOUT.md',
    'AGENTS.md',
    'ADR_GUIDE.md',
    'DEFINITION_OF_DONE.md',
    'COST_RULES.md',
  ];

  for (const file of expectedArchitectureFiles) {
    const fullPath = path.resolve('./content/architecture', file);
    assert.ok(fs.existsSync(fullPath), `Missing architecture file: ${file}`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.ok(content.length > 200, `File ${file} is unexpectedly short`);
  }

  // AGENTS.md must be under 150 lines
  const agentsMdContent = fs.readFileSync(path.resolve('./content/architecture/AGENTS.md'), 'utf8');
  const agentsLines = agentsMdContent.split('\n').length;
  assert.ok(agentsLines < 150, `AGENTS.md must be under 150 lines, got ${agentsLines}`);

  const expectedDiagrams = [
    'lifecycle-route.mmd',
    'agent-loop.mmd',
    'context-budget.mmd',
    'reference-architecture.mmd',
    'cicd-pipeline.mmd',
    'security-layers.mmd',
    'migration-expand-contract.mmd',
    'test-pyramid.mmd',
    'existing-project-intake.mmd',
  ];

  for (const file of expectedDiagrams) {
    const fullPath = path.resolve('./content/diagrams', file);
    assert.ok(fs.existsSync(fullPath), `Missing diagram file: ${file}`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.ok(content.includes('Description:'), `Diagram ${file} missing plain-text description`);
  }

  assert.ok(fs.existsSync(path.resolve('./content/README.md')), 'content/README.md must exist');
});
