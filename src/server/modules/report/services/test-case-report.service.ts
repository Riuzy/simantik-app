import { PrismaClient, ExecutionStatus, TestPriority, TestCaseType } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';
import type { TestCaseReportData, TestCaseReportRow, TestCaseReportSummary, ReportStatus } from './test-case-report.types';
const PRIORITY_LABEL: Record<TestPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const TYPE_LABEL: Record<TestCaseType, string> = {
  MANUAL: 'Manual',
  AUTOMATION: 'Automation',
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatDateTime(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function statusFromExecution(status: ExecutionStatus | null): ReportStatus {
  switch (status) {
    case 'PASSED': return 'Passed';
    case 'FAILED':
    case 'ERROR': return 'Failed';
    case 'SKIPPED':
    case 'CANCELLED': return 'Skipped';
    case 'RUNNING':
    case 'QUEUED': return 'Running';
    default: return 'Not Yet Executed';
  }
}

function actualResultFrom(status: ExecutionStatus | null, errorMessage: string | null): string {
  switch (status) {
    case 'PASSED':
      return 'All testing steps successfully executed and results match expected result.';
    case 'FAILED':
      return errorMessage
        ? collapseWhitespace(errorMessage)
        : 'Execution failed, results don\'t match expected result.';
    case 'ERROR':
      return errorMessage
        ? collapseWhitespace(errorMessage)
        : 'Execution experienced error while running testing steps.';
    case 'SKIPPED':
      return 'Execution skipped.';
    case 'CANCELLED':
      return 'Execution cancelled.';
    case 'RUNNING':
      return 'Execution is running.';
    case 'QUEUED':
      return 'Execution in queue.';
    default:
      return 'Not yet executed';
  }
}

function buildStepLabel(action: string, target: string | null): string {
  const label = action.replace(/_/g, ' ').toLowerCase();
  return target ? `${label} on ${target}` : label;
}

function buildSummary(rows: TestCaseReportRow[]): TestCaseReportSummary {
  const passed = rows.filter((row) => row.status === 'Passed').length;
  const failed = rows.filter((row) => row.status === 'Failed').length;
  const skipped = rows.filter((row) => row.status === 'Skipped').length;
  const running = rows.filter((row) => row.status === 'Running').length;
  const notRun = rows.filter((row) => row.status === 'Not Yet Executed').length;
  const completed = passed + failed + skipped;
  return {
    totalTestCases: rows.length,
    automatedTestCases: rows.filter((row) => row.type === 'Automation').length,
    passed,
    failed,
    skipped,
    running,
    notRun,
    passRate: completed > 0 ? Math.round((passed / completed) * 100) : 0,
  };
}

export class TestCaseReportService {
  constructor(private prisma: PrismaClient) {}

  async build(projectId: string): Promise<TestCaseReportData> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      select: { id: true, code: true, name: true },
    });
    if (!project) throw new AppError(404, 'Project not found');

    const [testCases, executions] = await Promise.all([
      this.prisma.testCase.findMany({
        where: { projectId, deletedAt: null },
        orderBy: { code: 'asc' },
        select: {
          id: true,
          code: true,
          title: true,
          module: true,
          priority: true,
          type: true,
          steps: {
            orderBy: { stepNumber: 'asc' },
            select: { stepNumber: true, action: true, target: true, description: true, expectedResult: true },
          },
        },
      }),
      this.prisma.execution.findMany({
        where: { projectId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        select: { testCaseId: true, status: true, errorMessage: true, runCount: true },
      }),
    ]);

    const executionByTestCase = new Map<string, (typeof executions)[number]>();
    for (const execution of executions) {
      if (!executionByTestCase.has(execution.testCaseId)) {
        executionByTestCase.set(execution.testCaseId, execution);
      }
    }

    let totalRuns = 0;
    for (const execution of executions) {
      totalRuns += execution.runCount;
    }

    const rows: TestCaseReportRow[] = testCases.map((testCase, index) => {
      const execution = executionByTestCase.get(testCase.id) ?? null;

      const steps = testCase.steps.map((step, stepIndex) => {
        const label = step.description?.trim() || buildStepLabel(step.action, step.target);
        return `${stepIndex + 1}. ${label}`;
      });

      const expectedResults = testCase.steps
        .map((step) => step.expectedResult?.trim())
        .filter((value): value is string => Boolean(value));

      return {
        no: index + 1,
        code: testCase.code,
        title: testCase.title,
        module: testCase.module?.trim() || '\u2014',
        priority: PRIORITY_LABEL[testCase.priority],
        type: TYPE_LABEL[testCase.type],
        steps,
        expectedResults: expectedResults.length > 0 ? expectedResults : ['Not determined'],
        actualResult: actualResultFrom(execution?.status ?? null, execution?.errorMessage ?? null),
        status: statusFromExecution(execution?.status ?? null),
      };
    });

    return {
      projectName: project.name,
      projectCode: project.code,
      generatedAt: formatDateTime(new Date()),
      rows,
      totalExecutions: totalRuns,
      summary: buildSummary(rows),
    };
  }
}
