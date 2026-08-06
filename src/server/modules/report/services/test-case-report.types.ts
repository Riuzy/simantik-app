export type ReportStatus = 'Passed' | 'Failed' | 'Skipped' | 'Running' | 'Not Yet Executed';

export interface TestCaseReportRow {
  no: number;
  code: string;
  title: string;
  module: string;
  priority: string;
  type: string;
  steps: string[];
  expectedResults: string[];
  actualResult: string;
  status: ReportStatus;
}

export interface TestCaseReportSummary {
  totalTestCases: number;
  automatedTestCases: number;
  passed: number;
  failed: number;
  skipped: number;
  running: number;
  notRun: number;
  passRate: number;
}

export interface TestCaseReportData {
  projectName: string;
  projectCode: string;
  generatedAt: string;
  rows: TestCaseReportRow[];
  totalExecutions: number;
  summary: TestCaseReportSummary;
}

export interface TestCaseReportOptions {
  includeSummary: boolean;
  includeTestCase: boolean;
  includeExpectedResult: boolean;
  includeActualResult: boolean;
  includeStatus: boolean;
}
