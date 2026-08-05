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
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => BORDER,
  vLineColor: () => BORDER,
  paddingLeft: () => 4,
  paddingRight: () => 4,
  paddingTop: () => 4,
  paddingBottom: () => 4,
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

function tableHeaderCell(text: string): PdfCell {
  return { text, bold: true, color: 'white', fillColor: DARK_BLUE, fontSize: 10, alignment: 'center' };
}

interface ColumnConfig {
  label: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}

function buildColumns(options: TestCaseReportOptions): ColumnConfig[] {
  const columns: ColumnConfig[] = [
    { label: 'No', width: 16, align: 'center' },
    { label: 'Test Case ID', width: 50 },
    { label: 'Judul Test Case', width: 75 },
    { label: 'Modul', width: 52 },
    { label: 'Prioritas', width: 36 },
    { label: 'Jenis', width: 40 },
    { label: 'Langkah Pengujian', width: 70 },
  ];

  if (options.includeExpectedResult) columns.push({ label: 'Expected Result', width: 64 });
  if (options.includeActualResult) columns.push({ label: 'Actual Result', width: 64 });
  if (options.includeStatus) columns.push({ label: 'Status', width: 28, align: 'center' });

  return columns;
}

function buildRowCells(row: TestCaseReportRow, options: TestCaseReportOptions): PdfCell[] {
  const body = (text: string): PdfCell => ({ text, fontSize: 8.5 });
  const centered = (text: string): PdfCell => ({ text, fontSize: 8.5, alignment: 'center' });

  const cells: PdfCell[] = [
    centered(String(row.no)),
    body(row.code),
    body(row.title),
    body(row.module),
    body(row.priority),
    body(row.type),
    { text: row.steps, fontSize: 8.5 },
  ];

  if (options.includeExpectedResult) {
    cells.push({ text: row.expectedResults.map((item) => `\u2022 ${item}`), fontSize: 8.5 });
  }

  if (options.includeActualResult) {
    cells.push({ text: row.actualResult, fontSize: 8.5 });
  }

  if (options.includeStatus) {
    cells.push({ text: row.status, bold: true, color: statusColor(row.status), fontSize: 8.5, alignment: 'center' });
  }

  return cells;
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

function buildBigTable(data: TestCaseReportData, options: TestCaseReportOptions): PdfCell {
  const columns = buildColumns(options);

  const headerRow: PdfCell[] = columns.map((column) => tableHeaderCell(column.label));
  const bodyRows: PdfCell[][] = data.rows.map((row) => buildRowCells(row, options));

  if (data.rows.length === 0) {
    bodyRows.push([
      {
        text: 'Belum ada test case untuk project ini.',
        fontSize: 9,
        alignment: 'center',
        colSpan: columns.length,
      },
      ...Array.from({ length: columns.length - 1 }, (): PdfCell => ({})),
    ]);
  }

  return {
    table: {
      headerRows: 1,
      widths: columns.map((column) => column.width),
      body: [headerRow, ...bodyRows],
    },
    layout: tableLayout,
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
    ['Belum Dieksekusi', String(data.summary.notRun)],
    ['Pass Rate', `${data.summary.passRate}%`],
  ];

  const body: PdfCell[][] = [
    [tableHeaderCell('Metrik'), tableHeaderCell('Nilai')],
    ...summaryPairs.map(([label, value]): PdfCell[] => [
      { text: label, bold: true, fontSize: 10 },
      { text: value, fontSize: 10 },
    ]),
  ];

  return {
    stack: [
      { text: 'RINGKASAN', fontSize: 13, bold: true, color: BLUE, margin: [0, 0, 0, 10] },
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

    if (options.includeTestCase) {
      content.push(buildBigTable(data, options));
    }

    if (options.includeSummary) {
      content.push(buildSummary(data));
    }

    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [MARGIN, MARGIN, MARGIN, MARGIN],
      defaultStyle: { font: 'Helvetica', fontSize: 9, color: TEXT_COLOR },
      content,
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
