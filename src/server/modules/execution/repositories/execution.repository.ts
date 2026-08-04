import { PrismaClient, Prisma, ExecutionStatus } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { generatePlaywrightScript, ScriptLocator } from '../../automation/services/playwright-script.service';
import { AuthEngine } from '../../automation/services/auth-engine.service';
import { decryptSecret } from '../../../utils/encryption';

export class ExecutionRepository {
  constructor(private prisma: PrismaClient) {}

  async list(page: number, limit: number, filters: {
    projectId?: string;
    testCaseId?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.testCaseId) where.testCaseId = filters.testCaseId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { number: { contains: filters.search } },
        { testCase: { title: { contains: filters.search } } },
      ];
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[filters.sortBy || 'updatedAt'] = filters.sortOrder || 'desc';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.execution.findMany({
        where: where as Prisma.ExecutionWhereInput,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          number: true,
          status: true,
          testCaseId: true,
          runCount: true,
          durationMs: true,
          lastDurationMs: true,
          lastRunAt: true,
          lastResult: true,
          browser: true,
          environment: true,
          startedAt: true,
          finishedAt: true,
          createdAt: true,
          updatedAt: true,
          testCase: { select: { id: true, code: true, title: true } },
          project: { select: { id: true, code: true, name: true, slug: true } },
        },
      }),
      this.prisma.execution.count({ where: where as Prisma.ExecutionWhereInput }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    return this.prisma.execution.findFirst({
      where: { id, deletedAt: null },
      include: {
        testCase: {
          select: {
            id: true,
            code: true,
            title: true,
            description: true,
            module: true,
            priority: true,
            status: true,
            tags: true,
            createdAt: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        project: {
          select: {
            id: true,
            code: true,
            name: true,
            slug: true,
            baseUrl: true,
            framework: true,
            environment: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        logs: { orderBy: { timestamp: 'asc' } },
      },
    });
  }

  async delete(id: string) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new AppError(404, 'Execution not found');
    }
    return this.prisma.execution.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async retry(id: string, body: { headless?: boolean; browser?: string; viewportWidth?: number; viewportHeight?: number }) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new AppError(404, 'Execution not found');
    }
    if (existing.status !== 'FAILED' && existing.status !== 'ERROR' && existing.status !== 'PASSED') {
      throw new AppError(400, 'Only failed, error, or passed executions can be retried');
    }
    if (!existing.testCaseId) {
      throw new AppError(400, 'Cannot retry execution without test case');
    }

    const testCase = await this.prisma.testCase.findFirst({
      where: { id: existing.testCaseId, deletedAt: null },
      include: {
        project: true,
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    if (!testCase || !testCase.project) {
      throw new AppError(404, 'Test case or project not found');
    }

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.execution.update({
        where: { id },
        data: {
          status: 'RUNNING',
          startedAt: now,
          finishedAt: null,
          durationMs: null,
          lastDurationMs: null,
          screenshotPath: null,
          videoPath: null,
          tracePath: null,
          errorMessage: null,
          generatedScript: null,
          lastRunAt: now,
          lastResult: 'RUNNING',
          runCount: { increment: 1 },
        },
      }),
      this.prisma.testCase.update({
        where: { id: testCase.id },
        data: {
          lastExecutionStatus: 'RUNNING',
          lastExecutedAt: now,
          lastExecutionId: id,
        },
      }),
    ]);

    // Run Playwright asynchronously in the background so the request returns
    // immediately with a RUNNING status; the detail page polls for the result.
    void this.executeRetryInBackground(id, existing.testCaseId, body);

    return { executionId: id, status: 'RUNNING', message: 'Execution restarted' };
  }

  private async executeRetryInBackground(
    id: string,
    testCaseId: string,
    body: { headless?: boolean; browser?: string; viewportWidth?: number; viewportHeight?: number },
  ) {
    const artifactsDir = path.resolve(process.cwd(), '.artifacts', 'executions', id);

    try {
      const testCase = await this.prisma.testCase.findFirst({
        where: { id: testCaseId, deletedAt: null },
        include: {
          project: true,
          steps: { orderBy: { stepNumber: 'asc' } },
        },
      });
      if (!testCase || !testCase.project) return;

      const project = testCase.project;
      const execution = await this.prisma.execution.findFirst({
        where: { id, deletedAt: null },
        include: {
          testCase: { select: { id: true, code: true, title: true } },
          project: { select: { id: true, code: true, name: true, slug: true } },
        },
      });
      if (!execution) return;

      const browser = body.browser ?? project.browser ?? 'CHROMIUM';
      const headless = body.headless ?? project.headless ?? true;
      const viewportWidth = body.viewportWidth ?? project.viewportWidth ?? 1600;
      const viewportHeight = body.viewportHeight ?? project.viewportHeight ?? 900;
      const timeout = project.timeout ?? 30000;
      const baseUrl = project.baseUrl;

      const authEngine = new AuthEngine({
        enabled: project.authenticationEnabled,
        baseUrl: project.baseUrl,
        loginUrl: project.loginUrl,
        email: project.loginEmail,
        password: decryptSecret(project.loginPassword),
        loginMethod: project.loginMethod,
        sessionStrategy: project.sessionStrategy,
        timeout,
      });

      fs.mkdirSync(artifactsDir, { recursive: true });

      const storageDir = path.resolve(process.cwd(), 'storage', 'executions');
      fs.mkdirSync(storageDir, { recursive: true });

      const script = path.join(artifactsDir, 'script.cjs');
      const executionNumber = execution.number;

      // Storage path for public access: storage/executions/EX-0001.png
      const storageScreenshotPath = path.join(storageDir, `${executionNumber}.png`);
      const storageScreenshotPathForScript = path.join(storageDir, `${executionNumber}.png`).replace(/\\/g, '/');

      const playwrightScript = generatePlaywrightScript(
        testCase.title,
        testCase.steps.map((step) => ({
          stepNumber: step.stepNumber,
          action: step.action,
          description: step.description,
          locatorStrategy: step.locatorStrategy,
          locatorValue: step.locatorValue,
          locators: (step.locators as ScriptLocator[] | null) ?? null,
          inputValue: step.inputValue,
          expectedResult: step.expectedResult,
          target: step.target,
        })),
        {
          browser,
          headless,
          viewportWidth,
          viewportHeight,
          deviceScaleFactor: 2,
          timeout,
          slowMotion: project.slowMo ?? 0,
          baseUrl,
          screenshotPath: storageScreenshotPathForScript,
          screenshotTiming: project.screenshotTiming ?? 'FINAL_STATE',
        },
        project.framework,
        authEngine,
      );

      fs.writeFileSync(script, playwrightScript);

      await this.prisma.execution.update({
        where: { id },
        data: { generatedScript: this.redactSecrets(playwrightScript, decryptSecret(project.loginPassword)) },
      });

      const runTimeout = 120000;
      const { result, logs } = await this.runScript(script, runTimeout);

      const status = this.mapStatus(result.status);
      const now = new Date();

      // Verify screenshot exists on disk after Playwright execution
      const screenshotExists = fs.existsSync(storageScreenshotPath);
      const relativeScreenshotPath = `storage/executions/${executionNumber}.png`;
      const screenshotForDb = screenshotExists ? relativeScreenshotPath : null;

      await this.prisma.execution.update({
        where: { id },
        data: {
          status,
          durationMs: result.durationMs ?? 0,
          lastDurationMs: result.durationMs ?? 0,
          finishedAt: now,
          lastRunAt: now,
          lastResult: status,
          screenshotPath: screenshotForDb,
          errorMessage: result.error,
        },
      });

      await this.prisma.testCase.update({
        where: { id: testCase.id },
        data: {
          lastExecutionStatus: status === 'PASSED' ? 'PASSED' : 'FAILED',
          lastExecutedAt: now,
          lastExecutionId: id,
        },
      });

      if (logs.length > 0) {
        await this.prisma.executionLog.deleteMany({ where: { executionId: id } });
        await this.prisma.executionLog.createMany({
          data: logs.map((log) => ({
            executionId: id,
            stepNumber: log.stepNumber,
            action: log.action,
            level: log.level,
            message: log.message,
          })),
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Retry failed unexpectedly';
      await this.prisma.execution
        .update({
          where: { id },
          data: {
            status: 'ERROR',
            finishedAt: new Date(),
            errorMessage: message,
          },
        })
        .catch(() => undefined);
    } finally {
      // Never leave temp artifacts behind after a retry; only the final
      // screenshot in storage/executions is kept as permanent storage.
      fs.rmSync(artifactsDir, { recursive: true, force: true });
    }
  }

  private async runScript(scriptPath: string, timeoutMs: number) {

    return new Promise<{ result: { status: 'PASSED' | 'FAILED' | 'ERROR'; error?: string; durationMs?: number }; logs: { stepNumber: number | null; action: string | null; level: string; message: string }[] }>(async (resolve) => {
      const child = spawn(process.execPath, [scriptPath], { stdio: ['ignore', 'pipe', 'pipe'] });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, timeoutMs);

      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on('error', (err: Error) => {
        clearTimeout(timer);
        resolve({
          result: { status: 'ERROR', error: `Failed to spawn runner: ${err.message}` },
          logs: [{ stepNumber: null, action: null, level: 'ERROR', message: `Failed to spawn runner: ${err.message}` }],
        });
      });

      child.on('close', () => {
        clearTimeout(timer);
        if (timedOut) {
          resolve({
            result: { status: 'ERROR', error: `Execution timed out after ${Math.round(timeoutMs / 1000)}s` },
            logs: [{ stepNumber: null, action: null, level: 'ERROR', message: `Execution timed out after ${Math.round(timeoutMs / 1000)}s` }],
          });
          return;
        }

        const logs: { stepNumber: number | null; action: string | null; level: string; message: string }[] = [];
        for (const line of stdout.split('\n')) {
          if (line.startsWith('LOG:') && !line.startsWith('RESULT:')) {
            const rest = line.slice('LOG:'.length);
            const sepIndex = rest.indexOf(':');
            if (sepIndex > 0) {
              logs.push({ stepNumber: null, action: null, level: rest.slice(0, sepIndex), message: rest.slice(sepIndex + 1) });
            }
          }
        }

        const resultLine = stdout.split('\n').find((line) => line.startsWith('RESULT:'));
        if (resultLine) {
          try {
            const parsed = JSON.parse(resultLine.slice('RESULT:'.length)) as { status: 'PASSED' | 'FAILED' | 'ERROR'; error?: string; durationMs?: number };
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
          logs: logs.length > 0 ? logs : [{ stepNumber: null, action: null, level: 'ERROR', message: stderr || 'Runner exited without a result' }],
        });
      });
    });
  }

  private mapStatus(status: string): ExecutionStatus {
    switch (status) {
      case 'PASSED': return 'PASSED';
      case 'FAILED': return 'FAILED';
      default: return 'ERROR';
    }
  }

  private redactSecrets(script: string, secret: string | null): string {
    if (!secret) return script;
    return script.split(secret).join('*****');
  }

  async getLogs(executionId: string) {
    return this.prisma.executionLog.findMany({
      where: { executionId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getReport(executionId: string) {
    const execution = await this.getById(executionId);
    if (!execution) {
      throw new AppError(404, 'Execution not found');
    }

    const logs = await this.getLogs(executionId);
    
    // Fetch test case with steps to get total step count
    const testCaseWithSteps = await this.prisma.testCase.findUnique({
      where: { id: execution.testCaseId },
      select: { steps: { select: { id: true } } }
    });
    
    const passedSteps = logs.filter((log) => log.level === 'STEP').length;
    const totalSteps = testCaseWithSteps?.steps?.length || 0;

    return {
      execution: {
        id: execution.id,
        number: execution.number,
        status: execution.status,
        runCount: execution.runCount,
        durationMs: execution.durationMs,
        lastDurationMs: execution.lastDurationMs,
        lastRunAt: execution.lastRunAt,
        lastResult: execution.lastResult,
        startedAt: execution.startedAt,
        finishedAt: execution.finishedAt,
        browser: execution.browser,
        environment: execution.environment,
        testCase: execution.testCase,
        project: execution.project,
      },
      logs,
      summary: {
        totalSteps,
        passedSteps,
        failedSteps: totalSteps - passedSteps,
        successRate: totalSteps > 0 ? (passedSteps / totalSteps) * 100 : 0,
      },
      artifacts: {
        screenshot: execution.screenshotPath,
        video: execution.videoPath,
        trace: execution.tracePath,
      },
    };
  }
}
