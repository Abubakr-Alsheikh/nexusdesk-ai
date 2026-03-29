import { Worker, Job } from 'bullmq';
import { redisConfig, TRIAGE_QUEUE } from '../config/redis';
import { prisma } from './db.service';
import { AIService } from './ai.service';
import { logger } from '../utils/logger';

export const initWorker = () => {
  const worker = new Worker(
    TRIAGE_QUEUE,
    async (job: Job) => {
      const { ticketId, correlationId } = job.data;
      const childLogger = logger.child({ correlationId, ticketId });

      childLogger.info('Starting AI triage for ticket');

      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });
      if (!ticket) return;

      try {
        const analysis = await AIService.analyzeTicket(
          ticket.title,
          ticket.description,
        );

        await prisma.ticket.update({
          where: { id: ticketId },
          data: {
            category: analysis.category,
            priority: analysis.priority,
            status: 'COMPLETED',
          },
        });

        childLogger.info('Successfully updated ticket');
      } catch (error) {
        childLogger.error({ err: error }, 'Triage job failed');

        if (job.attemptsMade >= (job.opts.attempts || 1)) {
          await prisma.ticket.update({
            where: { id: ticketId },
            data: { status: 'FAILED' },
          });
        }
        throw error;
      }
    },
    { connection: redisConfig },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Job failed');
  });
};
