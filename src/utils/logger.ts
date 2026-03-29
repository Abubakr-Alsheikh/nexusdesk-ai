import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  redact: [
    'req.headers.authorization',
    'password',
    'token',
    'body.password',
    'body.token',
  ],
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
