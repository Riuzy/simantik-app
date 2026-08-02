'use client';

import { useQuery } from '@tanstack/react-query';
import * as reportService from '../services';

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
