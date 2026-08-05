'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as reportService from '../services';
import type { ReportFormat, ReportDownloadOptions } from '../types';

export function useOverviewReport() {
  return useQuery({
    queryKey: ['report-overview'],
    queryFn: () => reportService.getOverview(),
  });
}

export function useProjectReport(projectId: string) {
  return useQuery({
    queryKey: ['report-project', projectId],
    queryFn: () => reportService.getProjectReport(projectId),
    enabled: !!projectId,
  });
}

export function useTestCaseReportDownload() {
  const [isPending, setIsPending] = useState(false);

  const download = useCallback(async (
    projectId: string,
    format: ReportFormat,
    options: ReportDownloadOptions,
    filename: string,
  ) => {
    setIsPending(true);
    try {
      await reportService.downloadTestCaseReport(projectId, format, options, filename);
      notifications.show({
        title: 'Success',
        message: 'Laporan berhasil diunduh.',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: format === 'pdf' ? 'Gagal membuat laporan PDF.' : 'Gagal membuat laporan Excel.',
        color: 'red',
      });
    } finally {
      setIsPending(false);
    }
  }, []);

  return { download, isPending };
}
