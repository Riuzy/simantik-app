function resolveStorageBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_STORAGE_URL) {
    return process.env.NEXT_PUBLIC_STORAGE_URL;
  }
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return 'http://localhost:3001';
  }
}

export const appConfig = {
  name: 'SIMANTIK',
  version: '1.0.0',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  storageBaseUrl: resolveStorageBaseUrl(),
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
  },
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  date: {
    format: 'DD/MM/YYYY',
    formatWithTime: 'DD/MM/YYYY HH:mm:ss',
    timezone: 'Asia/Jakarta',
  },
};
