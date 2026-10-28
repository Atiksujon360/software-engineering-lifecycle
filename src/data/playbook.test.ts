import test from 'node:test';
import assert from 'node:assert/strict';
import { GATES, PHASES, VARIABLES } from './playbook';
import { getAllValidTaskIds, getApplicableTasks } from '../utils/metrics';

test('VARIABLES contains the 6 required project fields', () => {
  const expectedKeys = ['PROJECT_NAME', 'ONE_LINE', 'USERS', 'STACK', 'REPO_PATH', 'TIMEFRAME'];
  assert.equal(VARIABLES.length, 6);
  for (const key of expectedKeys) {
    const found = VARIABLES.find((v) => v.key === key);
    assert.ok(found, `Missing variable: ${key}`);
    assert.ok(found.label.length > 0, `Variable ${key} has empty label`);
    assert.ok(found.hint.length > 0, `Variable ${key} has empty hint`);
  }
});

test('GATES contains the 4 required gates after phases 3, 8, 12, 14', () => {
  assert.equal(GATES.length, 4);
  assert.equal(GATES[0].id, 'G1');
  assert.equal(GATES[0].after, 3);
  assert.equal(GATES[0].title, 'Scope locked');

  assert.equal(GATES[1].id, 'G2');
  assert.equal(GATES[1].after, 8);
  assert.equal(GATES[1].title, 'Build complete');

  assert.equal(GATES[2].id, 'G3');
  assert.equal(GATES[2].after, 12);

  assert.equal(GATES[3].id, 'G4');
  assert.equal(GATES[3].after, 14);
});

test('PHASES has exactly 18 phases (0 to 17) in proper groups', () => {
  assert.equal(PHASES.length, 18);
  for (let i = 0; i < 18; i++) {
    assert.equal(PHASES[i].id, i);
  }

  // Define group: 0 through 6
  for (let i = 0; i <= 6; i++) {
    assert.equal(PHASES[i].group, 'define', `Phase ${i} should be define group`);
  }
  // Build group: 7 through 12
  for (let i = 7; i <= 12; i++) {
    assert.equal(PHASES[i].group, 'build', `Phase ${i} should be build group`);
  }
  // Ship group: 13 through 17
  for (let i = 13; i <= 17; i++) {
    assert.equal(PHASES[i].group, 'ship', `Phase ${i} should be ship group`);
  }
});

test('Task counts: about 97 tasks in New mode and 105 in Existing mode with unique IDs', () => {
  const seenIds = new Set<string>();
  let newTaskCount = 0;
  let existingTaskCount = 0;

  for (const phase of PHASES) {
    assert.ok(
      phase.tasks.length >= 4 && phase.tasks.length <= 6,
      `Phase ${phase.id} tasks count ${phase.tasks.length} out of expected 4-6 range`
    );

    for (const t of phase.tasks) {
      assert.ok(!seenIds.has(t.id), `Duplicate task ID: ${t.id}`);
      seenIds.add(t.id);
      assert.ok(t.text.length > 5, `Task ${t.id} text too short`);
      assert.ok(
        t.doneWhen.length >= 15,
        `Task ${t.id} doneWhen "${t.doneWhen}" must be >= 15 chars, got ${t.doneWhen.length}`
      );
    }

    newTaskCount += phase.tasks.length;
  }

  // Phase 0 existing tasks
  const p0 = PHASES[0];
  assert.ok(p0.existing && p0.existing.length === 8, 'Phase 0 must have 8 existing intake tasks');
  for (let i = 1; i <= 8; i++) {
    const expectedId = `p0-x${i}`;
    const found = p0.existing.find((t) => t.id === expectedId);
    assert.ok(found, `Missing existing task ${expectedId}`);
    assert.ok(!seenIds.has(found.id), `Duplicate task ID: ${found.id}`);
    seenIds.add(found.id);
    assert.ok(
      found.doneWhen.length >= 15,
      `Existing task ${found.id} doneWhen must be >= 15 chars, got ${found.doneWhen.length}`
    );
  }

  existingTaskCount = newTaskCount + p0.existing.length;

  assert.equal(newTaskCount, 97, `Expected 97 tasks in New mode, got ${newTaskCount}`);
  assert.equal(existingTaskCount, 105, `Expected 105 tasks in Existing mode, got ${existingTaskCount}`);
});

test('Every phase has >=2 prompts, >=2 notes, >=2 resources, >=1 skill', () => {
  for (const phase of PHASES) {
    assert.ok(phase.prompts.length >= 2, `Phase ${phase.id} must have >= 2 prompts`);
    for (const pr of phase.prompts) {
      assert.ok(pr.template.length > 20, `Prompt ${pr.id} in phase ${phase.id} is too short`);
      assert.ok(pr.expectedOutput.length > 10, `Prompt ${pr.id} expectedOutput too short`);
    }

    assert.ok(phase.notes.length >= 2, `Phase ${phase.id} must have >= 2 notes`);
    for (const note of phase.notes) {
      assert.ok(note.length > 15, `Note in phase ${phase.id} is too short`);
    }

    assert.ok(phase.resources.length >= 2, `Phase ${phase.id} must have >= 2 resources`);
    for (const res of phase.resources) {
      assert.ok(res.url.startsWith('https://'), `Resource ${res.title} url must start with https://, got ${res.url}`);
      assert.ok(res.description.length > 10, `Resource ${res.title} description too short`);
    }

    assert.ok(phase.skills.length >= 1, `Phase ${phase.id} must have >= 1 skill`);
  }
});
