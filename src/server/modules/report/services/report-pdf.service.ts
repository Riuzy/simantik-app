import pdfmake from 'pdfmake';
import type { TestCaseReportData, TestCaseReportRow, ReportStatus } from './test-case-report.types';

export interface TestCaseReportOptions {
  includeSummary: boolean;
  includeTestCase: boolean;
  includeExpectedResult: boolean;
  includeActualResult: boolean;
  includeStatus: boolean;
}

export const DEFAULT_REPORT_OPTIONS: TestCaseReportOptions = {
  includeSummary: true,
  includeTestCase: true,
  includeExpectedResult: true,
  includeActualResult: true,
  includeStatus: true,
};

pdfmake.setFonts({
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
});

pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy(() => true);

const BLUE = '#1E4F8A';
const DARK_BLUE = '#123B66';
const GRAY = '#6B7280';
const BORDER = '#9DB6CE';
const TEXT_COLOR = '#1F2933';
const GREEN = '#1E7B34';
const RED = '#C0392B';
const BLUE_STATUS = '#0B6BCB';
const NOT_RUN = '#808080';

const MARGIN = 42.52;
const CONTENT_WIDTH = 595.28 - MARGIN * 2;

interface PdfLayoutNode {
  table: { body: unknown[][] };
}

interface PdfLayout {
  hLineWidth?: (index: number, node: PdfLayoutNode) => number;
  vLineWidth?: () => number;
  hLineColor?: () => string;
  vLineColor?: () => string;
  paddingLeft?: () => number;
  paddingRight?: () => number;
  paddingTop?: () => number;
  paddingBottom?: () => number;
  fillColor?: (rowIndex: number) => string | null;
}

interface PdfCell {
  text?: string | string[] | PdfSpan[];
  style?: string;
  fontSize?: number;
  bold?: boolean;
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  margin?: number[];
  fillColor?: string;
  pageBreak?: 'before' | 'after';
  colSpan?: number;
  rowSpan?: number;
  stack?: PdfCell[];
  columns?: PdfCell[];
  table?: object;
  layout?: string | PdfLayout;
  width?: string | number;
  columnGap?: number;
  canvas?: Array<Record<string, unknown>>;
  unbreakable?: boolean;
}

interface PdfSpan {
  text: string;
  bold?: boolean;
  color?: string;
  fontSize?: number;
}

type PdfContent = PdfCell | PdfCell[];

const tableLayout: PdfLayout = {
  hLineWidth: (index) => index === 0 || index === 1 ? 1 : 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => BORDER,
  vLineColor: () => BORDER,
  paddingLeft: () => 6,
  paddingRight: () => 6,
  paddingTop: () => 5,
  paddingBottom: () => 5,
};

function statusColor(status: ReportStatus): string {
  switch (status) {
    case 'Passed': return GREEN;
    case 'Failed': return RED;
    case 'Skipped': return NOT_RUN;
    case 'Running': return BLUE_STATUS;
    default: return NOT_RUN;
  }
}

function labelCell(text: string): PdfCell {
  return {
    text,
    bold: true,
    fontSize: 11,
    color: DARK_BLUE,
    fillColor: '#E8F1F7',
    width: '35%',
  };
}

function buildVerticalTestCaseBlock(row: TestCaseReportRow, options: TestCaseReportOptions, index: number): PdfCell {
  const rows: PdfCell[][] = [];

  rows.push([
    labelCell('No'),
    { text: String(index), fontSize: 9, alignment: 'left' },
  ]);

  rows.push([
    labelCell('Test Case ID'),
    { text: row.code, fontSize: 9 },
  ]);

  rows.push([
    labelCell('Judul Test Case'),
    { text: row.title, fontSize: 9 },
  ]);

  rows.push([
    labelCell('Modul'),
    { text: row.module, fontSize: 9 },
  ]);

  rows.push([
    labelCell('Prioritas'),
    { text: row.priority, fontSize: 9 },
  ]);

  rows.push([
    labelCell('Jenis'),
    { text: row.type, fontSize: 9 },
  ]);

  rows.push([
    labelCell('Langkah Pengujian'),
    { text: row.steps, fontSize: 9 },
  ]);

  if (options.includeExpectedResult) {
    rows.push([
      labelCell('Expected Result'),
      { text: row.expectedResults.map((item) => `\u2022 ${item}`), fontSize: 9 },
    ]);
  }

  if (options.includeActualResult) {
    rows.push([
      labelCell('Actual Result'),
      { text: row.actualResult, fontSize: 9 },
    ]);
  }

  if (options.includeStatus) {
    rows.push([
      labelCell('Status'),
      {
        text: row.status,
        fontSize: 9,
        bold: true,
        color: statusColor(row.status),
        alignment: 'left',
      },
    ]);
  }

  return {
    table: {
      widths: ['35%', '65%'],
      body: rows,
    },
    layout: tableLayout,
    margin: [0, 0, 0, 12],
  };
}

function buildTestCasesSection(data: TestCaseReportData, options: TestCaseReportOptions): PdfCell[] {
  if (!options.includeTestCase || data.rows.length === 0) {
    return [];
  }

  const content: PdfCell[] = [
    {
      text: 'DETAIL TEST CASE',
      fontSize: 13,
      bold: true,
      color: BLUE,
      margin: [0, 0, 0, 12],
    },
  ];

  data.rows.forEach((row, index) => {
    content.push(buildVerticalTestCaseBlock(row, options, index + 1));
  });

  return content;
}

function buildTitleBlock(data: TestCaseReportData): PdfCell {
  const meta = (label: string, value: string): PdfCell => ({
    stack: [
      { text: label, fontSize: 8, color: GRAY, margin: [0, 0, 0, 2] },
      { text: value, bold: true, fontSize: 10, color: BLUE },
    ],
    margin: [8, 8, 8, 8],
  });

  return {
    stack: [
      { text: 'LAPORAN PENGUJIAN BLACK BOX', fontSize: 18, bold: true, color: BLUE, alignment: 'center', margin: [0, 0, 0, 4] },
      { text: 'SIMANTIK', bold: true, fontSize: 12, alignment: 'center' },
      { text: 'Software Testing Management System', fontSize: 9, color: GRAY, alignment: 'center', margin: [0, 0, 0, 12] },
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [meta('Nama Project', `${data.projectName} (${data.projectCode})`), meta('Tanggal Generate', data.generatedAt)],
            [meta('Jumlah Test Case', String(data.summary.totalTestCases)), meta('Jumlah Execution', String(data.totalExecutions))],
            [meta('Pass Rate', `${data.summary.passRate}%`), { text: '', margin: [8, 8, 8, 8] }],
          ],
        },
        layout: tableLayout,
        margin: [0, 0, 0, 14],
      },
    ],
  };
}

function buildSummary(data: TestCaseReportData): PdfCell {
  const summaryPairs: Array<[string, string]> = [
    ['Total Test Case', String(data.summary.totalTestCases)],
    ['Automated Test Case', String(data.summary.automatedTestCases)],
    ['Total Execution', String(data.totalExecutions)],
    ['Passed', String(data.summary.passed)],
    ['Failed', String(data.summary.failed)],
    ['Skipped', String(data.summary.skipped)],
    ['Running', String(data.summary.running)],
    ['Not Yet Executed', String(data.summary.notRun)],
    ['Pass Rate', `${data.summary.passRate}%`],
  ];

  const headerRow: PdfCell[] = [
    { text: 'Metrik', bold: true, color: 'white', fillColor: DARK_BLUE, fontSize: 11 },
    { text: 'Nilai', bold: true, color: 'white', fillColor: DARK_BLUE, fontSize: 11 },
  ];

  const body: PdfCell[][] = [
    headerRow,
    ...summaryPairs.map(([label, value]): PdfCell[] => [
      { text: label, bold: true, fontSize: 9 },
      { text: value, fontSize: 9 },
    ]),
  ];

  return {
    stack: [
      { text: 'RINGKASAN', fontSize: 13, bold: true, color: BLUE, margin: [0, 0, 0, 10], pageBreak: 'before' },
      {
        table: { headerRows: 1, widths: ['50%', '50%'], body },
        layout: tableLayout,
      },
    ],
    margin: [0, 0, 0, 14],
  };
}

export class ReportPdfService {
  async generate(data: TestCaseReportData, options: TestCaseReportOptions = DEFAULT_REPORT_OPTIONS): Promise<Buffer> {
    const document = this.buildDocument(data, options);
    const output = pdfmake.createPdf(document);
    return output.getBuffer();
  }

  private buildDocument(data: TestCaseReportData, options: TestCaseReportOptions): Record<string, unknown> {
    const content: PdfContent[] = [buildTitleBlock(data)];

    const testCasesContent = buildTestCasesSection(data, options);
    content.push(...testCasesContent);

    if (options.includeSummary) {
      content.push(buildSummary(data));
    }

    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [MARGIN, MARGIN, MARGIN, MARGIN],
      defaultStyle: { font: 'Helvetica', fontSize: 9, color: TEXT_COLOR },
      content,
      header: (currentPage: number) => {
        if (currentPage === 1) return {};
        return {
          margin: [MARGIN, 14, MARGIN, 0],
          columns: [
            { text: 'SIMANTIK', bold: true, fontSize: 8, color: BLUE },
            { text: 'Software Testing Management System', alignment: 'right', fontSize: 8, color: GRAY },
          ],
        };
      },
      footer: (currentPage: number, pageCount: number) => ({
        margin: [MARGIN, 0, MARGIN, 0],
        stack: [
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: CONTENT_WIDTH, y2: 0, lineWidth: 0.5, lineColor: BORDER }],
            margin: [0, 0, 0, 6],
          },
          {
            columns: [
              { text: 'SIMANTIK QA Automation Report', alignment: 'left', color: GRAY, fontSize: 8 },
              { text: `Tanggal Generate: ${data.generatedAt}`, alignment: 'center', color: GRAY, fontSize: 8 },
              { text: `Halaman ${currentPage} dari ${pageCount}`, alignment: 'right', color: GRAY, fontSize: 8 },
            ],
          },
        ],
      }),
    };
  }
}
