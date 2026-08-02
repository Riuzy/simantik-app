import { config as envConfig } from './index';

export interface AppConfig {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  cors: { origin: string; credentials: boolean };
  env: string;
  logLevel: string;
}

export function loadConfig(): AppConfig {
  return {
    port: envConfig.port,
    jwtSecret: envConfig.jwtSecret,
    jwtExpiresIn: envConfig.jwtExpiresIn,
    cors: envConfig.cors,
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}
