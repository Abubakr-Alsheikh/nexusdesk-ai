import { Queue } from 'bullmq';
import { redisConfig, TRIAGE_QUEUE } from '../config/redis';

export const triageQueue = new Queue(TRIAGE_QUEUE, {
  connection: redisConfig,
});

export const addTicketToQueue = async (
  ticketId: string,
  requestId?: string,
) => {
  await triageQueue.add(
    'analyze-ticket',
    { ticketId, correlationId: requestId },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    },
  );
};
