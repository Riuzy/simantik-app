import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().default('3001').transform(Number),
  HOST: z.string().default('0.0.0.0'),
  API_BASE_URL: z.string().default('http://localhost:3000/api'),
  API_TOKEN: z.string().optional(),
  API_KEY: z.string().optional(),
  API_REQUEST_TIMEOUT: z.string().default('15000').transform(Number),
  API_RETRY_COUNT: z.string().default('3').transform(Number),
  API_RETRY_DELAY: z.string().default('1000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  PLAYWRIGHT_HEADLESS: z.string().default('true').transform(v => v === 'true'),
  PLAYWRIGHT_TIMEOUT: z.string().default('30000').transform(Number),
  PLAYWRIGHT_RETRIES: z.string().default('0').transform(Number),
  ARTIFACT_DIR: z.string().default('./artifacts'),
  REPORT_DIR: z.string().default('./reports'),
  WORKER_COUNT: z.string().default('2').transform(Number),
  WORKER_POLL_INTERVAL: z.string().default('1000').transform(Number),
  POLL_INTERVAL: z.string().default('5000').transform(Number),
  POLL_MAX_BACKOFF: z.string().default('30000').transform(Number),
  HEARTBEAT_INTERVAL: z.string().default('15000').transform(Number),
  RETRY_MAX_ATTEMPTS: z.string().default('3').transform(Number),
  RETRY_BASE_DELAY: z.string().default('1000').transform(Number),
  EXECUTION_TIMEOUT: z.string().default('300000').transform(Number),
  WORKER_TIMEOUT: z.string().default('30000').transform(Number),
  BROWSER_TIMEOUT: z.string().default('30000').transform(Number),
  QUEUE_TIMEOUT: z.string().default('5000').transform(Number),
  ARTIFACT_RETENTION_DAYS: z.string().default('7').transform(Number),
  MAX_ARTIFACT_SIZE: z.string().default('104857600').transform(Number),
  VIDEO_ENABLED: z.string().default('true').transform(v => v === 'true'),
  TRACE_ENABLED: z.string().default('true').transform(v => v === 'true'),
  SCREENSHOT_ON_FAILURE: z.string().default('true').transform(v => v === 'true'),
  UPLOAD_RETRY_COUNT: z.string().default('3').transform(Number),
  UPLOAD_RETRY_DELAY: z.string().default('1000').transform(Number),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorMessages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }
  return result.data;
}