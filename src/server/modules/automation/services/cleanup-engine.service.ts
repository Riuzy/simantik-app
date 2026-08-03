import { rmSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'fs';
import path from 'path';

export class CleanupEngine {
  private readonly artifactsDir: string;
  private readonly storageDir: string;
  private readonly debugMode: boolean;

  constructor(projectRoot: string, debugMode: boolean) {
    this.artifactsDir = path.resolve(projectRoot, '.artifacts');
    this.storageDir = path.resolve(projectRoot, 'storage', 'executions');
    this.debugMode = debugMode;
  }

  /**
   * Creates a clean temp directory for a single execution run.
   */
  createExecutionTempDir(executionNumber: string): string {
    const tempDir = path.join(this.artifactsDir, 'executions', executionNumber);
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(tempDir, { recursive: true });
    return tempDir;
  }

  /**
   * Ensures storage directory exists.
   */
  ensureStorageDir(): string {
    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true });
    }
    return this.storageDir;
  }

  /**
   * Copies the final screenshot to storage/executions/ and returns the relative DB path.
   */
  saveScreenshot(executionNumber: string, tempScreenshotPath: string): string | null {
    if (!existsSync(tempScreenshotPath)) {
      return null;
    }

    this.ensureStorageDir();
    const finalName = `${executionNumber}.png`;
    const finalPath = path.join(this.storageDir, finalName);
    
    copyFileSync(tempScreenshotPath, finalPath);
    
    return `storage/executions/${finalName}`;
  }

  /**
   * Full cleanup after execution completes (success or failure).
   * Removes .artifacts/ execution folder, Playwright traces, videos, reports.
   */
  cleanupExecution(executionNumber: string): void {
    const tempDir = path.join(this.artifactsDir, 'executions', executionNumber);
    
    if (existsSync(tempDir)) {
      if (!this.debugMode) {
        // Non-debug: remove everything
        rmSync(tempDir, { recursive: true, force: true });
      } else {
        // Debug mode: keep traces/videos but remove script.cjs if desired
        const items = readdirSync(tempDir);
        for (const item of items) {
          const itemPath = path.join(tempDir, item);
          const stat = statSync(itemPath);
          // Keep trace directories and video files in debug mode
          if (stat.isDirectory() && item.startsWith('trace')) {
            continue;
          }
          if (item.endsWith('.webm') || item.endsWith('.mp4')) {
            continue;
          }
          rmSync(itemPath, { recursive: true, force: true });
        }
      }
    }
  }

  /**
   * Cleanup old artifacts older than maxAgeDays (optional periodic cleanup).
   */
  cleanupOldArtifacts(maxAgeDays = 7): number {
    if (!existsSync(this.artifactsDir)) return 0;
    
    let deleted = 0;
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
    
    const executionsDir = path.join(this.artifactsDir, 'executions');
    if (!existsSync(executionsDir)) return 0;
    
    for (const dir of readdirSync(executionsDir)) {
      const dirPath = path.join(executionsDir, dir);
      const stat = statSync(dirPath);
      if (stat.isDirectory() && stat.mtimeMs < cutoff) {
        rmSync(dirPath, { recursive: true, force: true });
        deleted++;
      }
    }
    return deleted;
  }
}