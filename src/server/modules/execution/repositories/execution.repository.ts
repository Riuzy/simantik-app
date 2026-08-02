import { PrismaClient, Prisma, ExecutionStatus } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { generatePlaywrightScript } from '../../automation/services/playwright-script.service';

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
    orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';

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
          durationMs: true,
          browser: true,
          environment: true,
          startedAt: true,
          finishedAt: true,
          createdAt: true,
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
    return this.prisma.$transaction(async (tx) => {
      const [testCase, executionConfig] = await Promise.all([
        tx.testCase.findFirst({
          where: { id: existing.testCaseId, deletedAt: null },
          include: {
            project: { include: { automationConfig: true } },
            steps: { orderBy: { stepNumber: 'asc' } },
          },
        }),
        tx.automationConfig.findUnique({
          where: { projectId: existing.projectId },
        }),
      ]);

      if (!testCase || !testCase.project) {
        throw new AppError(404, 'Test case or project not found');
      }

      const project = testCase.project;
      const config = executionConfig;

      const browser = body.browser ?? config?.browser ?? 'CHROMIUM';
      const headless = body.headless ?? config?.headless ?? true;
      const viewportWidth = body.viewportWidth ?? config?.viewportWidth ?? 1280;
      const viewportHeight = body.viewportHeight ?? config?.viewportHeight ?? 720;

      const execution = await tx.execution.update({
        where: { id },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
          finishedAt: null,
          durationMs: null,
          screenshotPath: null,
          errorMessage: null,
        },
        include: {
          testCase: { select: { id: true, code: true, title: true } },
          project: { select: { id: true, code: true, name: true, slug: true } },
        },
      });

      const artifactsDir = path.resolve(process.cwd(), '.artifacts', 'executions', id);
      fs.mkdirSync(artifactsDir, { recursive: true });

      const storageDir = path.resolve(process.cwd(), 'storage', 'executions');
      fs.mkdirSync(storageDir, { recursive: true });

      const screenshotPath = path.join(artifactsDir, 'screenshot.png');
      const script = path.join(artifactsDir, 'script.cjs');
      const executionNumber = execution.number;

      // Storage path for public access: storage/executions/EX-0001.png
      const storageScreenshotPath = path.join(storageDir, `${executionNumber}.png`);
      const storageScreenshotPathForScript = path.join(storageDir, `${executionNumber}.png`).replace(/\\/g, '/');

      const baseUrl = config?.baseUrl ?? project.baseUrl;

      const playwrightScript = generatePlaywrightScript(
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
          timeout: config?.timeout ?? 30000,
          slowMotion: config?.slowMotion ?? 0,
          baseUrl,
          screenshotPath: storageScreenshotPathForScript,
        },
        project.framework,
      );

      fs.writeFileSync(script, playwrightScript);

      const executionWithScript = await tx.execution.update({
        where: { id },
        data: { generatedScript: playwrightScript },
      });

      const runTimeout = 120000;
      const { result, logs } = await this.runScript(script, runTimeout, tx);

      const status = this.mapStatus(result.status);

      // Verify screenshot exists on disk after Playwright execution
      const screenshotExists = fs.existsSync(storageScreenshotPath);
      const relativeScreenshotPath = `storage/executions/${executionNumber}.png`;
      const screenshotForDb = screenshotExists ? relativeScreenshotPath : null;

      const executionResult = await tx.execution.update({
        where: { id },
        data: {
          status,
          durationMs: result.durationMs ?? 0,
          finishedAt: new Date(),
          screenshotPath: screenshotForDb,
          errorMessage: result.error,
        },
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
          logs: true,
        },
      });

      if (logs.length > 0) {
        await tx.executionLog.createMany({
          data: logs.map((log) => ({
            executionId: id,
            stepNumber: log.stepNumber,
            action: log.action,
            level: log.level,
            message: log.message,
          })),
        });
      }

      return executionResult;
    });
  }

  private async runScript(scriptPath: string, timeoutMs: number, tx: Prisma.TransactionClient) {

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
        durationMs: execution.durationMs,
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
