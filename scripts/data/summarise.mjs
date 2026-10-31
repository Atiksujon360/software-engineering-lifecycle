import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProjectSchema, ProgressSchema, checkForbiddenKeys } from './schema.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');

// Load phases from JSON
const PHASES = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'phases.json'), 'utf-8'));

// Get all valid task IDs
function getAllValidTaskIds(mode) {
  const ids = new Set();
  for (const phase of PHASES) {
    for (const t of phase.tasks) {
      ids.add(t.id);
    }
    if (phase.existing && mode === 'existing') {
      for (const t of phase.existing) {
        ids.add(t.id);
      }
    }
  }
  return ids;
}

// Applicable tasks for a phase
function getApplicableTasks(phase, mode) {
  if (phase.id === 0 && mode === 'existing' && phase.existing?.length > 0) {
    return [...phase.tasks, ...phase.existing];
  }
  return phase.tasks;
}

// Calculate phase progress
function calculatePhaseProgress(phase, checkedTasks, mode) {
  const tasks = getApplicableTasks(phase, mode);
  const total = tasks.length;
  if (total === 0) return { total: 0, done: 0, percent: 0 };
  
  let done = 0;
  for (const t of tasks) {
    if (checkedTasks[t.id]) done++;
  }
  
  return { total, done, percent: Math.round((done / total) * 100) };
}

// Calculate overall progress
function calculateOverallProgress(checkedTasks, mode) {
  let total = 0;
  let done = 0;
  
  for (const phase of PHASES) {
    const tasks = getApplicableTasks(phase, mode);
    total += tasks.length;
    for (const t of tasks) {
      if (checkedTasks[t.id]) done++;
    }
  }
  
  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

// Get current phase and next task
function getCurrentPhaseInfo(checkedTasks, mode) {
  for (const phase of PHASES) {
    const tasks = getApplicableTasks(phase, mode);
    for (const task of tasks) {
      if (!checkedTasks[task.id]) {
        return { currentPhase: phase.id, nextTask: task };
      }
    }
  }
  const lastPhase = PHASES[PHASES.length - 1];
  return { currentPhase: lastPhase.id, nextTask: null };
}

// Main function
function main() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error('No projects directory found:', PROJECTS_DIR);
    process.exit(1);
  }

  const projects = [];
  const projectSlugs = fs.readdirSync(PROJECTS_DIR).filter(slug => {
    const projectDir = path.join(PROJECTS_DIR, slug);
    return fs.statSync(projectDir).isDirectory();
  });

  for (const slug of projectSlugs) {
    const projectDir = path.join(PROJECTS_DIR, slug);
    const projectFile = path.join(projectDir, 'project.json');
    const progressFile = path.join(projectDir, 'progress.json');

    if (!fs.existsSync(projectFile) || !fs.existsSync(progressFile)) {
      console.error(`Missing files for project ${slug}`);
      process.exit(1);
    }

    try {
      const projectData = JSON.parse(fs.readFileSync(projectFile, 'utf-8'));
      const progressData = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));

      // Validate schemas
      ProjectSchema.parse(projectData);
      ProgressSchema.parse(progressData);

      // Check for forbidden keys
      checkForbiddenKeys(projectData);
      checkForbiddenKeys(progressData);

      // Validate task IDs
      const validIds = getAllValidTaskIds(projectData.mode);
      for (const taskId in progressData.tasks) {
        if (!validIds.has(taskId)) {
          console.error(`Unknown task ID ${taskId} in project ${slug}`);
          process.exit(1);
        }
      }

      // Calculate progress
      const overall = calculateOverallProgress(progressData.tasks, projectData.mode);
      const phases = PHASES.map(phase => {
        const progress = calculatePhaseProgress(phase, progressData.tasks, projectData.mode);
        return {
          id: phase.id,
          title: phase.title,
          done: progress.done,
          total: progress.total,
          percent: progress.percent,
        };
      });

      const { currentPhase, nextTask } = getCurrentPhaseInfo(progressData.tasks, projectData.mode);

      // Get last change time from history if available
      let lastChangeAt = projectData.updatedAt;
      const historyFile = path.join(projectDir, 'history.jsonl');
      if (fs.existsSync(historyFile)) {
        const lines = fs.readFileSync(historyFile, 'utf-8').trim().split('\n');
        if (lines.length > 0) {
          const lastLine = JSON.parse(lines[lines.length - 1]);
          lastChangeAt = lastLine.at;
        }
      }

      projects.push({
        slug: projectData.slug,
        name: projectData.name,
        mode: projectData.mode,
        overall,
        phases,
        currentPhase,
        nextTask: nextTask ? { id: nextTask.id, text: nextTask.text, doneWhen: nextTask.doneWhen } : null,
        lastChangeAt,
      });
    } catch (error) {
      console.error(`Error processing project ${slug}:`, error.message);
      process.exit(1);
    }
  }

  // Sort projects by name
  projects.sort((a, b) => a.name.localeCompare(b.name));

  // Generate index.json
  const index = {
    generatedAt: projects.length > 0 ? projects.reduce((latest, p) => 
      p.lastChangeAt > latest ? p.lastChangeAt : latest, projects[0].lastChangeAt) : new Date().toISOString(),
    contentVersion: '1',
    projects,
  };

  const indexPath = path.join(DATA_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`Generated ${indexPath} with ${projects.length} project(s)`);
}

main();
