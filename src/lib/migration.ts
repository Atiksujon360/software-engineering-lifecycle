/**
 * Migration tool for localStorage to backend
 */

export function exportLocalStorage() {
  if (typeof localStorage === 'undefined') {
    console.error('localStorage not available');
    return null;
  }
  const storageKey = 'swlp.v2';
  const data = localStorage.getItem(storageKey);
  if (!data) {
    console.error('No localStorage data found');
    return null;
  }
  return JSON.parse(data);
}

export function createMigrationPayload(storage: any) {
  const projects = storage.projects || [];
  return projects.map((project: any) => ({
    name: project.name,
    mode: project.mode,
    checkedTasks: project.checkedTasks || {},
    notes: project.notes || {},
    dates: project.dates ? JSON.stringify(project.dates) : undefined,
    phaseBlocks: project.phaseBlocks ? JSON.stringify(project.phaseBlocks) : undefined,
    weeklySnapshots: project.weeklySnapshots ? JSON.stringify(project.weeklySnapshots) : undefined,
    fields: project.fields || {},
  }));
}
