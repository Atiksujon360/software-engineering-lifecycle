import test from 'node:test';
import assert from 'node:assert/strict';
import { substituteVariables } from './prompts';

test('substituteVariables replaces variables when provided', () => {
  const template = 'Build {{PROJECT_NAME}} for {{USERS}} using {{STACK}}.';
  const fields = {
    PROJECT_NAME: 'Atlas Billing',
    USERS: 'Fintech CFOs',
    STACK: 'PostgreSQL + TypeScript',
  };
  const result = substituteVariables(template, fields);
  assert.equal(result, 'Build Atlas Billing for Fintech CFOs using PostgreSQL + TypeScript.');
});

test('substituteVariables shows [fill: KEY] when variable is missing or whitespace', () => {
  const template = 'Project: {{PROJECT_NAME}}, Repo: {{REPO_PATH}}, Goal: {{ONE_LINE}}.';
  const fields = {
    PROJECT_NAME: 'Orion',
    REPO_PATH: '   ',
  };
  const result = substituteVariables(template, fields);
  assert.equal(result, 'Project: Orion, Repo: [fill: REPO_PATH], Goal: [fill: ONE_LINE].');
});
