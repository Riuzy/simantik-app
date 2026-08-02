export const appConfig = {
  name: 'SIMANTIK',
  version: '1.0.0',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
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
