import pino from 'pino';
import type { ILogger } from '../core/interfaces';

export function createLogger(config: { logLevel: string }): ILogger {
  const instance = pino({
    level: config.logLevel,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
    redact: {
      paths: ['token', 'password', 'authorization', 'secret'],
      censor: '[REDACTED]',
    },
  });

  function createPinoLogger(base: pino.Logger): ILogger {
    return {
      info: (obj: unknown, msg?: string) => base.info(obj, msg || ''),
      error: (obj: unknown, msg?: string) => base.error(obj, msg || ''),
      warn: (obj: unknown, msg?: string) => base.warn(obj, msg || ''),
      debug: (obj: unknown, msg?: string) => base.debug(obj, msg || ''),
      child: (bindings: Record<string, unknown>) => createPinoLogger(base.child(bindings)),
    };
  }

  return createPinoLogger(instance);
}

export type { ILogger };
