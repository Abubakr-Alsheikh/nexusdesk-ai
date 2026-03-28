import { Worker, Job } from 'bullmq';
import { redisConfig, TRIAGE_QUEUE } from '../config/redis';
import { prisma } from './db.service';
import { AIService } from './ai.service';

export const initWorker = () => {
  const worker = new Worker(
    TRIAGE_QUEUE,
    async (job: Job) => {
      const { ticketId } = job.data;
      console.info(`Processing Job ${job.id} for Ticket ${ticketId}`);

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

        console.info(`Ticket ${ticketId} triaged successfully.`);
      } catch (error) {
        console.error(`Job failed for Ticket ${ticketId}:`, error);

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
    console.error(`${job?.id} has failed with ${err.message}`);
  });
};
