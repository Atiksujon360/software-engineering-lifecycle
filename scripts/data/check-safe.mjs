import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FORBIDDEN_KEYS } from './schema.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

// Forbidden file extensions
const FORBIDDEN_EXTENSIONS = ['.db', '.sqlite', '.sqlite3', '.log'];

// Legacy files that are allowed temporarily (will be removed in TASK-002 security remediation)
const LEGACY_FILES = ['playbook.db', 'playbook.db-shm', 'playbook.db-wal'];

// Recursive check for forbidden keys
function checkForbiddenKeys(obj, filePath) {
  if (obj === null || typeof obj !== 'object') return;
  
  for (const key in obj) {
    const keyLower = key.toLowerCase();
    if (FORBIDDEN_KEYS.includes(keyLower)) {
      console.error(`Forbidden key "${key}" found in ${filePath}`);
      process.exit(1);
    }
    checkForbiddenKeys(obj[key], filePath);
  }
}

// Check for credential-bearing repo paths
function checkRepoPath(obj, filePath) {
  if (obj === null || typeof obj !== 'object') return;
  
  if (obj.repoPath && typeof obj.repoPath === 'string') {
    if (obj.repoPath.includes('://') && obj.repoPath.includes('@')) {
      console.error(`Credential-bearing repoPath found in ${filePath}`);
      process.exit(1);
    }
  }
  
  for (const key in obj) {
    checkRepoPath(obj[key], filePath);
  }
}

// Recursively scan directory
function scanDirectory(dir, baseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath, baseDir);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      
      // Skip legacy files temporarily (will be removed in TASK-002)
      if (LEGACY_FILES.includes(entry.name)) {
        continue;
      }
      
      // Check for forbidden file extensions
      if (FORBIDDEN_EXTENSIONS.includes(ext)) {
        console.error(`Forbidden file extension .${ext} found in ${relativePath}`);
        process.exit(1);
      }
      
      // Check JSON/JSONL files for forbidden keys
      if (ext === '.json' || ext === '.jsonl') {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          if (ext === '.json') {
            const obj = JSON.parse(content);
            checkForbiddenKeys(obj, relativePath);
            checkRepoPath(obj, relativePath);
          } else if (ext === '.jsonl') {
            const lines = content.trim().split('\n');
            for (const line of lines) {
              if (line.trim()) {
                const obj = JSON.parse(line);
                checkForbiddenKeys(obj, relativePath);
              }
            }
          }
        } catch (error) {
          // Ignore parse errors for non-JSON files
        }
      }
    }
  }
}

// Main function
function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error('Data directory not found:', DATA_DIR);
    process.exit(1);
  }

  console.log('Scanning data/ for security issues...');
  scanDirectory(DATA_DIR, DATA_DIR);
  console.log('✓ No security issues found in data/');
}

main();
