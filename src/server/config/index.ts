function resolveStorageBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_STORAGE_URL) {
    return process.env.NEXT_PUBLIC_STORAGE_URL;
  }
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || '3001'}/api`;
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return `http://localhost:${process.env.PORT || '3001'}`;
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  encryptionSecret: process.env.ENCRYPTION_KEY || '',
  storageBaseUrl: resolveStorageBaseUrl(),
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
};

export type Config = typeof config;