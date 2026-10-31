import { apiClient } from './api-client';
import { exportLocalStorage, createMigrationPayload } from './migration';

export interface MigrationResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}

export async function migrateLocalStorageToBackend(): Promise<MigrationResult> {
  const storage = exportLocalStorage();
  if (!storage) {
    return { success: false, importedCount: 0, errors: ['No localStorage data found'] };
  }

  const payloads = createMigrationPayload(storage);
  const errors: string[] = [];
  let importedCount = 0;

  for (const payload of payloads) {
    try {
      await apiClient.importProject(payload);
      importedCount++;
    } catch (error) {
      errors.push(`Failed to import "${payload.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    importedCount,
    errors,
  };
}

export function previewMigration() {
  const storage = exportLocalStorage();
  if (!storage) {
    return null;
  }
  return createMigrationPayload(storage);
}
