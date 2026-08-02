import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

function createLogger(): pino.Logger {
  const baseConfig: pino.LoggerOptions = {
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    redact: {
      paths: ['password', 'token', 'authorization', 'req.headers.authorization', 'req.body.password'],
      censor: '[REDACTED]',
    },
    serializers: {
      req: (req) => ({ method: req.method, url: req.url, id: req.id }),
      res: (res) => ({ statusCode: res.statusCode }),
      err: pino.stdSerializers.err,
    },
  };

  if (!isProduction) {
    try {
      return pino({
        ...baseConfig,
        transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' } },
      });
    } catch {
      return pino(baseConfig);
    }
  }

  return pino(baseConfig);
}

export const logger = createLogger();
