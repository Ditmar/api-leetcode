import { config } from '@config';
import pino from 'pino';

const logger = pino({
  level: config.app.logLevel ?? 'info',
  transport:
    config.app.nodeEnv === 'prod'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
  base: {
    services: 'api-leetcode',
  },
});
export default logger;
