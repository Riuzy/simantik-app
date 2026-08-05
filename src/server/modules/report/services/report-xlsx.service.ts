import ExcelJS from 'exceljs';
import type { TestCaseReportData, ReportStatus, TestCaseReportOptions } from './test-case-report.types';
import { DEFAULT_REPORT_OPTIONS } from './report-pdf.service';

const BLUE = 'FF1F4E79';
const LIGHT_BLUE = 'FFD6E4F0';

const STATUS_STYLE: Record<ReportStatus, { fill: string; font: string }> = {
  Passed: { fill: 'FFC6EFCE', font: 'FF006100' },
  Failed: { fill: 'FFFFC7CE', font: 'FF9C0006' },
  Skipped: { fill: 'FFE2E2E2', font: 'FF404040' },
  Running: { fill: 'FFDDEBF7', font: 'FF1F4E79' },
  'Belum Dieksekusi': { fill: 'FFF2F2F2', font: 'FF808080' },
};

const BASE_COLUMNS: Array<{ label: string; width: number }> = [
  { label: 'No', width: 8 },
  { label: 'Test Case ID', width: 22 },
  { label: 'Judul Test Case', width: 36 },
  { label: 'Modul', width: 20 },
  { label: 'Prioritas', width: 12 },
  { label: 'Jenis', width: 12 },
  { label: 'Langkah Pengujian', width: 50 },
  { label: 'Expected Result', width: 44 },
  { label: 'Actual Result', width: 44 },
  { label: 'Status', width: 18 },
];

const SUMMARY_PAIRS: Array<[string, keyof TestCaseReportData['summary']]> = [
  ['Total Test Case', 'totalTestCases'],
  ['Automated Test Case', 'automatedTestCases'],
  ['Passed', 'passed'],
  ['Failed', 'failed'],
  ['Skipped', 'skipped'],
  ['Running', 'running'],
  ['Pass Rate', 'passRate'],
];

function solidFill(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } } as ExcelJS.Fill;
}

function longestLine(value: string): number {
  let longest = 0;
  for (const line of value.split('\n')) {
    longest = Math.max(longest, line.length);
  }
  return longest;
}

function computeWidth(headerLength: number, values: string[]): number {
  let longest = headerLength;
  for (const value of values) {
    longest = Math.max(longest, longestLine(value));
  }
  return Math.min(Math.max(longest + 3, 8), 60);
}

function borderBox(): ExcelJS.Borders {
  return {
    top: { style: 'thin', color: { argb: 'FF9DB6CE' } },
    left: { style: 'thin', color: { argb: 'FF9DB6CE' } },
    bottom: { style: 'thin', color: { argb: 'FF9DB6CE' } },
    right: { style: 'thin', color: { argb: 'FF9DB6CE' } },
    diagonal: { up: false, down: false },
  };
}

export class ReportXlsxService {
  async generate(data: TestCaseReportData, options: TestCaseReportOptions = DEFAULT_REPORT_OPTIONS): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SIMANTIK';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet('Laporan Test Case');

    const columnCount = options.includeTestCase ? BASE_COLUMNS.length : 2;

    worksheet.mergeCells(1, 1, 1, columnCount);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = 'LAPORAN PENGUJIAN BLACK BOX';
    titleCell.font = { bold: true, size: 16, color: { argb: BLUE } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = solidFill(LIGHT_BLUE);
    worksheet.getRow(1).height = 28;

    worksheet.mergeCells(2, 1, 2, columnCount);
    const projectCell = worksheet.getCell(2, 1);
    projectCell.value = `Project: ${data.projectName} (${data.projectCode})`;
    projectCell.font = { bold: true, size: 11 };

    worksheet.mergeCells(3, 1, 3, columnCount);
    worksheet.getCell(3, 1).value = `Tanggal Generate: ${data.generatedAt}`;

    let nextRow = 4;

    if (options.includeSummary) {
      worksheet.mergeCells(4, 1, 4, columnCount);
      worksheet.getCell(4, 1).value =
        `Total Test Case: ${data.summary.totalTestCases}   |   ` +
        `Total Execution: ${data.totalExecutions}   |   ` +
        `Pass Rate: ${data.summary.passRate}%`;
      worksheet.getCell(4, 1).font = { size: 10 };
      nextRow += 1;
    }

    const headerRowNumber = nextRow + 1;
    const columns = options.includeTestCase
      ? BASE_COLUMNS.filter((column) => {
          if (column.label === 'Expected Result') return options.includeExpectedResult;
          if (column.label === 'Actual Result') return options.includeActualResult;
          if (column.label === 'Status') return options.includeStatus;
          return true;
        })
      : [];

    if (options.includeTestCase) {
      const headerRow = worksheet.getRow(headerRowNumber);
      columns.forEach((column, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = column.label;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = solidFill(BLUE);
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
      headerRow.height = 22;

      const columnValues: string[][] = Array.from({ length: columns.length }, () => []);

      data.rows.forEach((row, index) => {
        const excelRow = worksheet.getRow(headerRowNumber + 1 + index);
        const values: string[] = [];
        values.push(String(row.no));
        values.push(row.code, row.title, row.module, row.priority, row.type);
        values.push(row.steps.join('\n'));
        if (options.includeExpectedResult) values.push(row.expectedResults.join('\n'));
        if (options.includeActualResult) values.push(row.actualResult);
        if (options.includeStatus) values.push(row.status);

        values.forEach((value, colIndex) => {
          const cell = excelRow.getCell(colIndex + 1);
          cell.value = value;
          columnValues[colIndex].push(value);

          if (colIndex >= 6) {
            cell.alignment = { wrapText: true, vertical: 'top' };
          } else if (colIndex === 0 || colIndex === values.length - 1) {
            cell.alignment = { horizontal: 'center', vertical: 'top' };
          } else {
            cell.alignment = { vertical: 'top' };
          }
        });

        if (options.includeStatus) {
          const statusIndex = values.length - 1;
          const statusCell = excelRow.getCell(statusIndex + 1);
          const statusStyle = STATUS_STYLE[row.status];
          statusCell.fill = solidFill(statusStyle.fill);
          statusCell.font = { bold: true, color: { argb: statusStyle.font } };
          statusCell.alignment = { horizontal: 'center', vertical: 'top' };
        }
      });

      if (data.rows.length === 0) {
        worksheet.mergeCells(headerRowNumber + 1, 1, headerRowNumber + 1, columns.length);
        worksheet.getCell(headerRowNumber + 1, 1).value = 'Belum ada test case untuk project ini.';
        worksheet.getCell(headerRowNumber + 1, 1).alignment = { horizontal: 'center' };
      }

      columns.forEach((column, colIndex) => {
        const width = computeWidth(column.label.length, columnValues[colIndex]);
        worksheet.getColumn(colIndex + 1).width = Math.max(width, column.width * 0.6);
      });

      worksheet.views = [{ state: 'frozen', ySplit: headerRowNumber }];
      worksheet.autoFilter = {
        from: { row: headerRowNumber, column: 1 },
        to: { row: headerRowNumber + Math.max(data.rows.length, 1), column: columns.length },
      };

      nextRow = headerRowNumber + Math.max(data.rows.length, 1);
    }

    if (options.includeSummary) {
      const summaryRowStart = nextRow + 2;
      worksheet.mergeCells(summaryRowStart, 1, summaryRowStart, columnCount);
      const summaryTitle = worksheet.getCell(summaryRowStart, 1);
      summaryTitle.value = 'RINGKASAN';
      summaryTitle.font = { bold: true, size: 13, color: { argb: BLUE } };

      SUMMARY_PAIRS.forEach(([label, key], index) => {
        const row = summaryRowStart + 1 + index;
        const labelCell = worksheet.getCell(row, 1);
        labelCell.value = label;
        labelCell.font = { bold: true };
        labelCell.fill = solidFill(LIGHT_BLUE);
        labelCell.border = borderBox();
        worksheet.mergeCells(row, 2, row, 5);
        const valueCell = worksheet.getCell(row, 2);
        valueCell.value = String(data.summary[key]);
        valueCell.border = borderBox();
      });
    }

    if (!options.includeTestCase) {
      worksheet.getColumn(1).width = 30;
      worksheet.getColumn(2).width = 30;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
