import pinoHttp from 'pino-http';
import { logger } from '../utils/logger';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => (req.headers['x-request-id'] as string) || generateId(),
  customLogLevel: (res, err) => {
    const statusCode = res.statusCode ?? 0;
    if (err) return 'error';
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400 && statusCode < 500) return 'warn';
    if (statusCode >= 300 && statusCode < 400) return 'debug';
    return 'info';
  },
  customProps: (req) => ({
    requestId: req.id,
  }),
});
