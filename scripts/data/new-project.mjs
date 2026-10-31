import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProjectSchema, ProjectTemplateSchema, SLUG_REGEX } from './schema.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const TEMPLATES_DIR = path.join(DATA_DIR, 'templates');

// Parse command line args
const args = process.argv.slice(2);
const slugIndex = args.indexOf('--slug');
const nameIndex = args.indexOf('--name');
const modeIndex = args.indexOf('--mode');

if (slugIndex === -1 || nameIndex === -1 || modeIndex === -1) {
  console.error('Usage: node scripts/data/new-project.mjs --slug <slug> --name "<name>" --mode <new|existing>');
  process.exit(1);
}

const slug = args[slugIndex + 1];
const name = args[nameIndex + 1];
const mode = args[modeIndex + 1];

// Validate slug
if (!SLUG_REGEX.test(slug)) {
  console.error(`Invalid slug: ${slug}. Must match ${SLUG_REGEX}`);
  process.exit(1);
}

// Validate mode
if (!['new', 'existing'].includes(mode)) {
  console.error(`Invalid mode: ${mode}. Must be 'new' or 'existing'`);
  process.exit(1);
}

// Check if project already exists
const projectDir = path.join(PROJECTS_DIR, slug);
if (fs.existsSync(projectDir)) {
  console.error(`Project ${slug} already exists`);
  process.exit(1);
}

// Create directories
fs.mkdirSync(projectDir, { recursive: true });
fs.mkdirSync(TEMPLATES_DIR, { recursive: true });

// Create project.json
const now = new Date().toISOString();
const projectData = {
  schemaVersion: 1,
  slug,
  name,
  mode,
  oneLine: '',
  users: '',
  stack: '',
  timeframe: '',
  repoPath: '',
  createdAt: now,
  updatedAt: now,
};

ProjectSchema.parse(projectData);
fs.writeFileSync(path.join(projectDir, 'project.json'), JSON.stringify(projectData, null, 2));

// Create empty progress.json
const progressData = {
  schemaVersion: 1,
  slug,
  tasks: {},
  phaseNotes: {},
};

fs.writeFileSync(path.join(projectDir, 'progress.json'), JSON.stringify(progressData, null, 2));

// Create empty history.jsonl
fs.writeFileSync(path.join(projectDir, 'history.jsonl'), '');

// Append create action to history
const historyLine = JSON.stringify({
  at: now,
  action: 'create',
  by: 'owner',
});
fs.appendFileSync(path.join(projectDir, 'history.jsonl'), historyLine + '\n');

// Create template
const templateData = {
  schemaVersion: 1,
  slug: 'project-slug',
  name: 'Project Name',
  mode: 'new',
  oneLine: '',
  users: '',
  stack: '',
  timeframe: '',
  repoPath: '',
  createdAt: '',
  updatedAt: '',
};

fs.writeFileSync(path.join(TEMPLATES_DIR, 'project.template.json'), JSON.stringify(templateData, null, 2));

console.log(`Created project ${slug} at ${projectDir}`);
