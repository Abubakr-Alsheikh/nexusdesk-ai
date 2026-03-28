import { prisma } from './db.service';
import { addTicketToQueue } from './queue.service';
import {
  CreateTicketInput,
  TicketFilterQuery,
} from '../validators/ticket.schema';
import { AppError } from '../utils/AppError';

export class TicketService {
  public static async createTicket(data: CreateTicketInput, userId: string) {
    try {
      const ticket = await prisma.ticket.create({
        data: {
          title: data.title,
          description: data.description,
          userId: userId,
          status: 'PENDING',
        },
      });

      await addTicketToQueue(ticket.id);

      return ticket;
    } catch (error) {
      console.error('Database Error:', error);
      throw new AppError('Failed to save ticket to database', 500);
    }
  }

  public static async getAllTickets(
    filters: TicketFilterQuery,
    userId: string,
  ) {
    try {
      return await prisma.ticket.findMany({
        where: {
          userId: userId,
          category: filters.category,
          priority: filters.priority,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch {
      throw new AppError('Failed to fetch tickets', 500);
    }
  }

  public static async getTicketById(id: string, userId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id, userId },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    return ticket;
  }
}
