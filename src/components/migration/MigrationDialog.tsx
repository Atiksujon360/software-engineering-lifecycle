import React, { useState, useEffect } from 'react';
import { exportLocalStorage, createMigrationPayload } from '../../lib/migration';
import { apiClient } from '../../lib/api-client';
import { AuthUser } from '../../types';

interface ProjectPreview {
  name: string;
  mode: 'new' | 'existing';
  taskCount: number;
  noteCount: number;
  hasDates: boolean;
  hasPhaseBlocks: boolean;
  hasWeeklySnapshots: boolean;
  valid: boolean;
  error?: string;
}

interface MigrationResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  importedProjects: string[];
  skippedProjects: string[];
}

export function MigrationDialog({ user, onClose }: { user: AuthUser | null; onClose: () => void }) {
  const [stage, setStage] = useState<'detect' | 'preview' | 'execute' | 'complete'>('detect');
  const [projects, setProjects] = useState<ProjectPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (stage === 'detect') {
      detectLocalStorage();
    }
  }, [stage]);

  const detectLocalStorage = () => {
    setLoading(true);
    try {
      const storage = exportLocalStorage();
      if (!storage || !storage.projects || storage.projects.length === 0) {
        setProjects([]);
        return;
      }

      const previews: ProjectPreview[] = storage.projects.map((p: any) => {
        const taskCount = Object.keys(p.checkedTasks || {}).filter((k: string) => p.checkedTasks[k]).length;
        const noteCount = Object.keys(p.notes || {}).length;
        
        return {
          name: p.name,
          mode: p.mode,
          taskCount,
          noteCount,
          hasDates: !!p.dates,
          hasPhaseBlocks: !!p.phaseBlocks,
          hasWeeklySnapshots: !!p.weeklySnapshots,
          valid: true,
        };
      });

      setProjects(previews);
    } catch (error) {
      console.error('Failed to detect localStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setStage('preview');
  };

  const handleConfirm = async () => {
    setStage('execute');
    setImporting(true);

    try {
      const storage = exportLocalStorage();
      if (!storage) {
        setResult({
          success: false,
          importedCount: 0,
          errors: ['No localStorage data found'],
          importedProjects: [],
          skippedProjects: [],
        });
        return;
      }

      const payloads = createMigrationPayload(storage);
      const errors: string[] = [];
      const importedProjects: string[] = [];
      const skippedProjects: string[] = [];

      for (const payload of payloads) {
        try {
          await apiClient.importProject(payload);
          importedProjects.push(payload.name);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          if (message.includes('already exists')) {
            skippedProjects.push(payload.name);
          } else {
            errors.push(`Failed to import "${payload.name}": ${message}`);
          }
        }
      }

      setResult({
        success: errors.length === 0,
        importedCount: importedProjects.length,
        errors,
        importedProjects,
        skippedProjects,
      });

      // Reload projects from backend
      const backendProjects = await apiClient.getProjects();
      // Trigger app reload by reloading page
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setResult({
        success: false,
        importedCount: 0,
        errors: ['Migration failed: ' + (error instanceof Error ? error.message : 'Unknown error')],
        importedProjects: [],
        skippedProjects: [],
      });
    } finally {
      setImporting(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to migrate your data to the server.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'detect') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Data Migration</h2>
          
          {loading ? (
            <p className="text-gray-600">Detecting local data...</p>
          ) : projects.length === 0 ? (
            <div>
              <p className="text-gray-600 mb-4">No local data found to migrate.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Found {projects.length} project{projects.length !== 1 ? 's' : ''} in local storage.
              </p>
              <div className="space-y-2 mb-4">
                {projects.map((p, i) => (
                  <div key={i} className="p-3 border rounded">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-600">
                      Mode: {p.mode} • Tasks: {p.taskCount} • Notes: {p.noteCount}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePreview}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Review & Migrate
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'preview') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Migration Preview</h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> This will import your local data into the server. 
              The original local data will be preserved. Duplicate projects will be skipped.
            </p>
          </div>

          <div className="space-y-2 mb-4">
            {projects.map((p, i) => (
              <div key={i} className="p-3 border rounded">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">
                  Mode: {p.mode} • Tasks: {p.taskCount} • Notes: {p.noteCount}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {p.hasDates && '• Dates '}
                  {p.hasPhaseBlocks && '• Phase blocks '}
                  {p.hasWeeklySnapshots && '• Weekly snapshots'}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Confirm Migration
            </button>
            <button
              onClick={() => setStage('detect')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Back
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'execute') {
    let message = '';
    if (importing) {
      message = 'Please wait while your data is imported.';
    } else if (result) {
      if (result.success) {
        message = 'Migration complete! Reloading application...';
      } else {
        message = 'Migration failed';
      }
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Migrating Data...</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          {result && (
            <div className="space-y-2 mb-4">
              <div>Imported: {result.importedCount} projects</div>
              {result.skippedProjects.length > 0 && (
                <div>Skipped (duplicates): {result.skippedProjects.join(', ')}</div>
              )}
              {result.errors.length > 0 && (
                <div className="text-red-600">
                  Errors:
                  <ul className="list-disc list-inside mt-1">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
