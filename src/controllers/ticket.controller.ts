import { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { catchAsync } from '../utils/catchAsync';
import { TicketFilterQuery } from '../validators/ticket.schema';

export class TicketController {
  public static createTicket = catchAsync(
    async (req: Request, res: Response) => {
      const ticket = await TicketService.createTicket(req.body, req.user!.id);

      res.status(201).json({
        status: 'success',
        data: { ticket },
      });
    },
  );

  public static getAllTickets = catchAsync(
    async (req: Request, res: Response) => {
      const tickets = await TicketService.getAllTickets(
        req.query as unknown as TicketFilterQuery,
        req.user!.id,
      );

      res.status(200).json({
        status: 'success',
        results: tickets.length,
        data: { tickets },
      });
    },
  );

  public static getTicketById = catchAsync(
    async (req: Request, res: Response) => {
      const ticket = await TicketService.getTicketById(
        req.params.id as string,
        req.user!.id,
      );

      res.status(200).json({
        status: 'success',
        data: { ticket },
      });
    },
  );
}
