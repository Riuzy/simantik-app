export const API = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    UPDATE_PROFILE: '/auth/me',
  },
  PROJECTS: {
    BASE: '/projects',
    DETAIL: (id: string) => `/projects/${id}`,
    SLUG: (slug: string) => `/projects/slug/${slug}`,
  },
  TEST_CASES: {
    BASE: '/test-cases',
    DETAIL: (id: string) => `/test-cases/${id}`,
    BY_CODE: (code: string) => `/test-cases/code/${code}`,
    MODULES: '/test-cases/modules',
    DUPLICATE: (id: string) => `/test-cases/${id}/duplicate`,
    CLONE: (id: string) => `/test-cases/${id}/clone`,
    STEPS: (id: string) => `/test-cases/${id}/steps`,
    STEPS_REORDER: (id: string) => `/test-cases/${id}/steps/reorder`,
    STEP_DETAIL: (testCaseId: string, stepNumber: number) => `/test-cases/${testCaseId}/steps/${stepNumber}`,
  },
  AUTOMATION: {
    GENERATE_SCRIPT: (testCaseId: string) => `/test-cases/${testCaseId}/generate-script`,
    RUN: (testCaseId: string) => `/test-cases/${testCaseId}/run`,
    RESET_EXECUTION: (testCaseId: string) => `/test-cases/${testCaseId}/reset-execution`,
    SCRIPT: (testCaseId: string) => `/test-cases/${testCaseId}/script`,
  },
  AI: {
    SETTINGS: '/ai/settings',
    TEST_CONNECTION: '/ai/test-connection',
    PROMPT_TEMPLATES: '/ai/prompt-templates',
  },
  EXECUTIONS: {
    BASE: '/executions',
    DETAIL: (id: string) => `/executions/${id}`,
    LOGS: (id: string) => `/executions/${id}/logs`,
    ARTIFACT: (id: string, name: string) => `/executions/${id}/artifact/${name}`,
  },
  REPORTS: {
    OVERVIEW: '/reports/overview',
    PROJECT: (projectId: string) => `/reports/projects/${projectId}`,
    TEST_CASE_REPORT_PDF: (projectId: string) => `/reports/projects/${projectId}/test-cases/pdf`,
    TEST_CASE_REPORT_XLSX: (projectId: string) => `/reports/projects/${projectId}/test-cases/excel`,
  },
  SETTINGS: {
    BASE: '/settings',
    DETAIL: (key: string) => `/settings/${key}`,
  },
};
