import test from 'node:test';
import assert from 'node:assert/strict';
import { PHASES } from '../data/playbook';
import {
  createDefaultProject,
  createProjectExport,
  sanitizeProject,
  validateImportJSON,
} from './storage';
import { getAllValidTaskIds } from './metrics';

test('createProjectExport omits project fields', () => {
  const project = createDefaultProject('test-1', 'Secret Project');
  project.fields.PROJECT_NAME = 'Secret Project';
  project.fields.ONE_LINE = 'Proprietary enterprise billing';
  project.checkedTasks['p0-1'] = true;
  project.notes[0] = 'Confidential roadmap note';

  const exported = createProjectExport(project);
  assert.equal(exported.version, 2);
  assert.equal(exported.name, 'Secret Project');
  assert.equal(exported.checkedTasks['p0-1'], true);
  assert.equal(exported.notes[0], 'Confidential roadmap note');
  // Check that fields property is strictly NOT exported!
  assert.equal((exported as unknown as Record<string, unknown>).fields, undefined);
});

test('sanitizeProject drops unknown task IDs and truncates long strings', () => {
  const validIds = getAllValidTaskIds(PHASES);
  const oversizedNote = 'A'.repeat(6000);
  const oversizedField = 'B'.repeat(400);

  const sanitized = sanitizeProject(
    {
      id: 'proj-1',
      name: 'Test Project',
      checkedTasks: {
        'p0-1': true,
        'invalid-unknown-task-id': true,
      },
      notes: {
        0: oversizedNote,
      },
      fields: {
        PROJECT_NAME: oversizedField,
      },
    },
    validIds
  );

  assert.equal(sanitized.checkedTasks['p0-1'], true);
  assert.equal(sanitized.checkedTasks['invalid-unknown-task-id'], undefined);
  assert.equal(sanitized.notes[0].length, 5000);
  assert.equal(sanitized.fields.PROJECT_NAME.length, 300);
});

test('validateImportJSON accepts valid v2 and v1 files, rejects garbage', () => {
  const validV2 = JSON.stringify({
    version: 2,
    appName: 'Engineering Lifecycle Playbook',
    name: 'Imported App',
    mode: 'new',
    checkedTasks: { 'p0-1': true },
    notes: { 0: 'First note' },
  });

  const resV2 = validateImportJSON(validV2);
  assert.equal(resV2.valid, true);
  assert.equal(resV2.data?.name, 'Imported App');
  assert.equal(resV2.data?.checkedTasks['p0-1'], true);

  const validV1 = JSON.stringify({
    version: 1,
    name: 'V1 App',
    checkedTasks: { 'p0-2': true },
  });
  const resV1 = validateImportJSON(validV1);
  assert.equal(resV1.valid, true);
  assert.equal(resV1.data?.name, 'V1 App');

  const invalidJson = 'not valid json at all';
  const resInvalid = validateImportJSON(invalidJson);
  assert.equal(resInvalid.valid, false);

  const foreignApp = JSON.stringify({
    version: 2,
    appName: 'Some Foreign App',
    name: 'Hack',
  });
  const resForeign = validateImportJSON(foreignApp);
  assert.equal(resForeign.valid, false);
});
