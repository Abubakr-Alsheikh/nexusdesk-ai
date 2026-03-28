import { ConnectionOptions } from 'bullmq';

export const redisConfig: ConnectionOptions = {
  host: 'localhost',
  port: 6379,
};

export const TRIAGE_QUEUE = 'triage-queue';
