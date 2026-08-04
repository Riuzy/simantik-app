import { spawn } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import path from 'path';
import { ExecutionStatus, Framework } from '@prisma/client';
import { AutomationRepository } from '../repositories/automation.repository';
import { AppError } from '../../../middlewares/error-handler';
import { generatePlaywrightScript, ScriptLocator } from './playwright-script.service';
import { AuthEngine, AuthConfig } from './auth-engine.service';
import { CleanupEngine } from './cleanup-engine.service';
import { RunTestDTO } from '../types/automation.dto';
import { decryptSecret } from '../../../utils/encryption';

interface ExecutionResult {
  status: 'PASSED' | 'FAILED' | 'ERROR';
  durationMs?: number;
  error?: string;
}

interface ExecutionLogEntry {
  level: string;
  message: string;
}

interface RunOutcome {
  result: ExecutionResult;
  logs: ExecutionLogEntry[];
}

interface ProjectRunConfig {
  browser: string;
  headless: boolean;
  viewportWidth: number;
  viewportHeight: number;
  deviceScaleFactor: number;
  timeout: number;
  slowMo: number;
  baseUrl: string | null;
  environment: string | null;
  debugMode: boolean;
  framework: Framework;
  screenshotTiming: 'BEFORE_ACTION' | 'AFTER_ACTION' | 'FINAL_STATE';
  auth: AuthConfig;
}

export class AutomationService {
  constructor(private repository: AutomationRepository) {}

  /**
   * Loads the test case with its project and resolves every piece of
   * configuration from the Project itself (single source of truth).
   */
  private async loadRunConfig(testCaseId: string, override?: { headless?: boolean }): Promise<{
    testCase: Awaited<ReturnType<AutomationRepository['getTestCaseForRun']>>;
    config: ProjectRunConfig;
  }> {
    const testCase = await this.repository.getTestCaseForRun(testCaseId);
    if (testCase.type === 'MANUAL') {
      throw new AppError(400, 'Manual test cases cannot be executed by the automation engine');
    }
    const project = testCase.project;

    const auth: AuthConfig = {
      enabled: project.authenticationEnabled,
      baseUrl: project.baseUrl,
      loginUrl: project.loginUrl,
      email: project.loginEmail,
      password: decryptSecret(project.loginPassword),
      loginMethod: project.loginMethod,
      sessionStrategy: project.sessionStrategy,
      timeout: project.timeout ?? 30000,
    };

    const config: ProjectRunConfig = {
      browser: project.browser ?? 'CHROMIUM',
      headless: override?.headless ?? project.headless ?? true,
      viewportWidth: project.viewportWidth ?? 1600,
      viewportHeight: project.viewportHeight ?? 900,
      deviceScaleFactor: 2,
      timeout: project.timeout ?? 30000,
      slowMo: project.slowMo ?? 0,
      baseUrl: project.baseUrl,
      environment: project.environment,
      debugMode: project.debugMode ?? false,
      framework: project.framework,
      screenshotTiming: project.screenshotTiming ?? 'FINAL_STATE',
      auth,
    };

    return { testCase, config };
  }

  async generateScript(testCaseId: string) {
    const { testCase, config } = await this.loadRunConfig(testCaseId);
    const authEngine = new AuthEngine(config.auth);

    const script = generatePlaywrightScript(
      testCase.title,
      this.mapSteps(testCase.steps),
      {
        browser: config.browser,
        headless: config.headless,
        viewportWidth: config.viewportWidth,
        viewportHeight: config.viewportHeight,
        deviceScaleFactor: config.deviceScaleFactor,
        timeout: config.timeout,
        slowMotion: config.slowMo,
        baseUrl: config.baseUrl,
        screenshotPath: '',
        screenshotTiming: config.screenshotTiming,
      },
      config.framework,
      authEngine,
    );

    return {
      testCaseId,
      code: testCase.code,
      title: testCase.title,
      framework: config.framework,
      script,
    };
  }

  async run(testCaseId: string, dto: RunTestDTO) {
    const { testCase, config } = await this.loadRunConfig(testCaseId, dto);
    const project = testCase.project;

    // Reuse the existing execution number when re-running a test case, so the
    // same execution row is updated instead of creating a new one.
    const existing = await this.repository.findExecutionByTestCase(testCaseId);
    const number = existing?.number ?? await this.generateNextExecutionNumber();

    const execution = await this.repository.upsertExecutionByTestCase({
      number,
      projectId: project.id,
      testCaseId,
      browser: config.browser,
      environment: config.environment ?? undefined,
    });

    await this.repository.markTestCaseRunning(testCaseId, execution.id);

    // Run Playwright asynchronously in the background. The request responds
    // immediately so the client can redirect to the execution detail page
    // and poll while the script runs.
    void this.executeInBackground(execution.id, testCaseId, testCase, config);

    return {
      executionId: execution.id,
      status: 'RUNNING',
      message: 'Execution started',
    };
  }

  async resetExecutionHistory(testCaseId: string) {
    await this.repository.resetExecutionHistory(testCaseId);
    return { message: 'Execution history reset successfully' };
  }

  private async executeInBackground(
    executionId: string,
    testCaseId: string,
    testCase: Awaited<ReturnType<AutomationRepository['getTestCaseForRun']>>,
    config: ProjectRunConfig,
  ) {
    const cleanupEngine = new CleanupEngine(process.cwd(), config.debugMode);
    const authEngine = new AuthEngine(config.auth);
    let executionNumber: string | null = null;

    try {
      const execution = await this.repository.getExecutionById(executionId);
      if (!execution) throw new Error('Execution record not found');
      executionNumber = execution.number;

      const tempDir = cleanupEngine.createExecutionTempDir(execution.number);
      cleanupEngine.ensureStorageDir();

      const scriptOptions = {
        browser: config.browser,
        headless: config.headless,
        viewportWidth: config.viewportWidth,
        viewportHeight: config.viewportHeight,
        deviceScaleFactor: config.deviceScaleFactor,
        timeout: config.timeout,
        slowMotion: config.slowMo,
        baseUrl: config.baseUrl,
        screenshotPath: path.join(cleanupEngine.ensureStorageDir(), `${execution.number}.png`),
        screenshotTiming: config.screenshotTiming,
      };

      const script = generatePlaywrightScript(
        testCase.title,
        this.mapSteps(testCase.steps),
        scriptOptions,
        config.framework,
        authEngine,
      );

      const scriptPath = path.join(tempDir, 'script.cjs');
      writeFileSync(scriptPath, script);

      // Persist a redacted copy of the script so the plain-text password never
      // appears in the database while the executed script keeps the secret.
      const storedScript = this.redactSecrets(script, config.auth.password);
      await this.repository.updateExecutionGeneratedScript(executionId, storedScript);

      const runTimeout = Math.max(config.timeout * (testCase.steps.length + 2) + 60000, 120000);
      const { result, logs } = await this.runScript(scriptPath, runTimeout);

      const status = this.mapStatus(result.status);

      const screenshotPath = scriptOptions.screenshotPath;
      const screenshotExists = existsSync(screenshotPath);
      const screenshotForDb = screenshotExists ? `storage/executions/${execution.number}.png` : null;

      await this.repository.finishExecution(
        executionId,
        testCaseId,
        status,
        result.durationMs ?? 0,
        screenshotForDb,
        result.error,
      );

      await this.repository.clearExecutionLogs(executionId);
      await this.repository.createExecutionLogs(executionId, logs);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Execution failed unexpectedly';
      await this.repository.finishExecution(executionId, testCaseId, 'ERROR', 0, null, message);
    } finally {
      // Always remove the temp execution folder, even if a DB write fails.
      if (executionNumber) {
        cleanupEngine.cleanupExecution(executionNumber);
      }
    }
  }

  private runScript(scriptPath: string, timeoutMs: number): Promise<RunOutcome> {
    return new Promise((resolve) => {
      const child = spawn(process.execPath, [scriptPath], { stdio: ['ignore', 'pipe', 'pipe'] });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, timeoutMs);

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          result: { status: 'ERROR', error: `Failed to spawn runner: ${err.message}` },
          logs: [{ level: 'ERROR', message: `Failed to spawn runner: ${err.message}` }],
        });
      });

      child.on('close', () => {
        clearTimeout(timer);
        if (timedOut) {
          resolve({
            result: { status: 'ERROR', error: `Execution timed out after ${Math.round(timeoutMs / 1000)}s` },
            logs: [{ level: 'ERROR', message: `Execution timed out after ${Math.round(timeoutMs / 1000)}s` }],
          });
          return;
        }

        const logs: ExecutionLogEntry[] = [];
        for (const line of stdout.split('\n')) {
          if (line.startsWith('LOG:') && !line.startsWith('RESULT:')) {
            const rest = line.slice('LOG:'.length);
            const sepIndex = rest.indexOf(':');
            if (sepIndex > 0) {
              logs.push({ level: rest.slice(0, sepIndex), message: rest.slice(sepIndex + 1) });
            }
          }
        }

        const resultLine = stdout.split('\n').find((line) => line.startsWith('RESULT:'));
        if (resultLine) {
          try {
            const parsed = JSON.parse(resultLine.slice('RESULT:'.length)) as ExecutionResult;
            resolve({ result: parsed, logs });
            return;
          } catch {
            // fall through to generic error
          }
        }

        resolve({
          result: {
            status: 'ERROR',
            error: stderr || 'Runner exited without a result',
          },
          logs: logs.length > 0 ? logs : [{ level: 'ERROR', message: stderr || 'Runner exited without a result' }],
        });
      });
    });
  }

  private mapStatus(status: ExecutionResult['status']): ExecutionStatus {
    switch (status) {
      case 'PASSED': return 'PASSED';
      case 'FAILED': return 'FAILED';
      default: return 'ERROR';
    }
  }

  private async generateNextExecutionNumber(): Promise<string> {
    const latest = await this.repository.findLatestExecutionNumber();
    const nextNumber = latest ? parseInt(latest.number.replace('EX-', ''), 10) + 1 : 1;
    return `EX-${String(nextNumber).padStart(4, '0')}`;
  }

  private mapSteps(steps: Array<{
    stepNumber: number;
    action: string;
    description: string | null;
    locatorStrategy: string | null;
    locatorValue: string | null;
    locators?: unknown;
    inputValue: string | null;
    expectedResult: string | null;
    target: string | null;
  }>): Array<{
    stepNumber: number;
    action: string;
    description: string | null;
    locatorStrategy: string | null;
    locatorValue: string | null;
    locators?: ScriptLocator[] | null;
    inputValue: string | null;
    expectedResult: string | null;
    target: string | null;
  }> {
    return steps.map((step) => ({
      stepNumber: step.stepNumber,
      action: step.action,
      description: step.description,
      locatorStrategy: step.locatorStrategy,
      locatorValue: step.locatorValue,
      locators: (step.locators as ScriptLocator[] | null) ?? null,
      inputValue: step.inputValue,
      expectedResult: step.expectedResult,
      target: step.target,
    }));
  }

  private redactSecrets(script: string, secret: string | null): string {
    if (!secret) return script;
    return script.split(secret).join('*****');
  }
}