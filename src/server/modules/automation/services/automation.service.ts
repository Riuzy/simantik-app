import { spawn } from 'child_process';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { ExecutionStatus } from '@prisma/client';
import { AutomationRepository } from '../repositories/automation.repository';
import { generatePlaywrightScript } from './playwright-script.service';
import { UpsertAutomationConfigDTO, RunTestDTO } from '../types/automation.dto';

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

export class AutomationService {
  constructor(private repository: AutomationRepository) {}

  async getConfig(projectId: string) {
    await this.repository.getProjectWithDetails(projectId);
    const config = await this.repository.getConfig(projectId);
    if (!config) return null;
    return config;
  }

  async upsertConfig(projectId: string, dto: UpsertAutomationConfigDTO) {
    await this.repository.getProjectWithDetails(projectId);
    const updateData: Record<string, unknown> = {};
    if (dto.framework !== undefined) updateData.framework = dto.framework;
    if (dto.browser !== undefined) updateData.browser = dto.browser;
    if (dto.baseUrl !== undefined) updateData.baseUrl = dto.baseUrl;
    if (dto.headless !== undefined) updateData.headless = dto.headless;
    if (dto.viewportWidth !== undefined) updateData.viewportWidth = dto.viewportWidth;
    if (dto.viewportHeight !== undefined) updateData.viewportHeight = dto.viewportHeight;
    if (dto.timeout !== undefined) updateData.timeout = dto.timeout;
    if (dto.retry !== undefined) updateData.retry = dto.retry;
    if (dto.parallel !== undefined) updateData.parallel = dto.parallel;
    if (dto.slowMotion !== undefined) updateData.slowMotion = dto.slowMotion;

    return this.repository.upsertConfig(projectId, updateData);
  }

  async generateScript(testCaseId: string) {
    const testCase = await this.repository.getTestCaseForRun(testCaseId);
    const config = testCase.project.automationConfig;
    const project = testCase.project;

    const script = generatePlaywrightScript(
      testCase.title,
      testCase.steps.map((step) => ({
        stepNumber: step.stepNumber,
        action: step.action,
        description: step.description,
        locatorStrategy: step.locatorStrategy,
        locatorValue: step.locatorValue,
        inputValue: step.inputValue,
        expectedResult: step.expectedResult,
        target: step.target,
      })),
      {
        browser: config?.browser ?? 'CHROMIUM',
        headless: config?.headless ?? true,
        viewportWidth: config?.viewportWidth ?? 1280,
        viewportHeight: config?.viewportHeight ?? 720,
        timeout: config?.timeout ?? 30000,
        slowMotion: config?.slowMotion ?? 0,
        baseUrl: config?.baseUrl ?? project.baseUrl,
        screenshotPath: '',
      },
      project.framework,
    );

    return {
      testCaseId,
      code: testCase.code,
      title: testCase.title,
      framework: project.framework,
      script,
    };
  }

  async run(testCaseId: string, dto: RunTestDTO) {
    const testCase = await this.repository.getTestCaseForRun(testCaseId);
    const config = testCase.project.automationConfig;
    const project = testCase.project;

    const browser = config?.browser ?? 'CHROMIUM';
    const headless = dto.headless ?? config?.headless ?? true;
    const viewportWidth = config?.viewportWidth ?? 1280;
    const viewportHeight = config?.viewportHeight ?? 720;
    const timeout = config?.timeout ?? 30000;
    const slowMotion = config?.slowMotion ?? 0;
    const baseUrl = config?.baseUrl ?? project.baseUrl;

    const execution = await this.repository.createExecution({
      number: await this.generateNextExecutionNumber(),
      projectId: project.id,
      testCaseId,
      browser,
      environment: project.environment ?? undefined,
    });

    const artifactsDir = path.resolve(process.cwd(), '.artifacts', 'executions', execution.id);
    mkdirSync(artifactsDir, { recursive: true });

    const storageDir = path.resolve(process.cwd(), 'storage', 'executions');
    mkdirSync(storageDir, { recursive: true });

    const executionNumber = execution.number;
    const screenshotPath = path.join(storageDir, `${executionNumber}.png`);
    const script = generatePlaywrightScript(
      testCase.title,
      testCase.steps.map((step) => ({
        stepNumber: step.stepNumber,
        action: step.action,
        description: step.description,
        locatorStrategy: step.locatorStrategy,
        locatorValue: step.locatorValue,
        inputValue: step.inputValue,
        expectedResult: step.expectedResult,
        target: step.target,
      })),
      {
        browser,
        headless,
        viewportWidth,
        viewportHeight,
        timeout,
        slowMotion,
        baseUrl,
        screenshotPath: screenshotPath.replace(/\\/g, '/'),
      },
      project.framework,
    );

    const scriptPath = path.join(artifactsDir, 'script.cjs');
    writeFileSync(scriptPath, script);

    await this.repository.updateExecutionGeneratedScript(execution.id, script);

    const runTimeout = Math.max(timeout * (testCase.steps.length + 2) + 60000, 120000);
    const { result, logs } = await this.runScript(scriptPath, runTimeout);

    const status = this.mapStatus(result.status);

    // Verify screenshot exists on disk after Playwright execution
    const screenshotExists = existsSync(screenshotPath);
    const screenshotForDb = screenshotExists ? `storage/executions/${executionNumber}.png` : null;

    await this.repository.finishExecution(
      execution.id,
      status,
      result.durationMs ?? 0,
      screenshotForDb,
      result.error,
    );

    await this.repository.createExecutionLogs(execution.id, logs);

    return this.repository.getExecutionById(execution.id);
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
}
