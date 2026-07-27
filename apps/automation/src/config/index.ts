import { loadEnv, envSchema, type Env } from './env';

export interface AutomationConfig {
  port: number;
  host: string;
  api: {
    baseUrl: string;
    token?: string;
    apiKey?: string;
    requestTimeout: number;
    retryCount: number;
    retryDelay: number;
  };
  nodeEnv: string;
  logLevel: string;
  playwright: {
    headless: boolean;
    timeout: number;
    retries: number;
  };
  storage: {
    artifactDir: string;
    reportDir: string;
  };
  worker: {
    count: number;
    pollInterval: number;
  };
  polling: {
    interval: number;
    maxBackoff: number;
  };
  heartbeat: {
    interval: number;
  };
  retry: {
    maxAttempts: number;
    baseDelayMs: number;
  };
  timeout: {
    execution: number;
    worker: number;
    browser: number;
    queue: number;
  };
  artifacts: {
    retentionDays: number;
    maxSize: number;
    videoEnabled: boolean;
    traceEnabled: boolean;
    screenshotOnFailure: boolean;
  };
  upload: {
    retryCount: number;
    retryDelay: number;
  };
}

export function createConfig(env: Env): AutomationConfig {
  return {
    port: env.PORT,
    host: env.HOST,
    api: {
      baseUrl: env.API_BASE_URL,
      token: env.API_TOKEN,
      apiKey: env.API_KEY,
      requestTimeout: env.API_REQUEST_TIMEOUT,
      retryCount: env.API_RETRY_COUNT,
      retryDelay: env.API_RETRY_DELAY,
    },
    nodeEnv: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
    playwright: {
      headless: env.PLAYWRIGHT_HEADLESS,
      timeout: env.PLAYWRIGHT_TIMEOUT,
      retries: env.PLAYWRIGHT_RETRIES,
    },
    storage: {
      artifactDir: env.ARTIFACT_DIR,
      reportDir: env.REPORT_DIR,
    },
    worker: {
      count: env.WORKER_COUNT,
      pollInterval: env.WORKER_POLL_INTERVAL,
    },
    polling: {
      interval: env.POLL_INTERVAL,
      maxBackoff: env.POLL_MAX_BACKOFF,
    },
    heartbeat: {
      interval: env.HEARTBEAT_INTERVAL,
    },
    retry: {
      maxAttempts: env.RETRY_MAX_ATTEMPTS,
      baseDelayMs: env.RETRY_BASE_DELAY,
    },
    timeout: {
      execution: env.EXECUTION_TIMEOUT,
      worker: env.WORKER_TIMEOUT,
      browser: env.BROWSER_TIMEOUT,
      queue: env.QUEUE_TIMEOUT,
    },
    artifacts: {
      retentionDays: env.ARTIFACT_RETENTION_DAYS,
      maxSize: env.MAX_ARTIFACT_SIZE,
      videoEnabled: env.VIDEO_ENABLED,
      traceEnabled: env.TRACE_ENABLED,
      screenshotOnFailure: env.SCREENSHOT_ON_FAILURE,
    },
    upload: {
      retryCount: env.UPLOAD_RETRY_COUNT,
      retryDelay: env.UPLOAD_RETRY_DELAY,
    },
  };
}

export function getConfig(): AutomationConfig {
  const env = loadEnv();
  return createConfig(env);
}

export { loadEnv, envSchema };
export type { Env };
