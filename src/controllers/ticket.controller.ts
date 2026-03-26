import { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { catchAsync } from '../utils/catchAsync';

export class TicketController {
  public static createTicket = catchAsync(async (req: Request, res: Response) => {
    const ticket = await TicketService.createTicket(req.body);
    
    res.status(201).json({
      status: 'success',
      data: { ticket },
    });
  });

  public static getAllTickets = catchAsync(async (req: Request, res: Response) => {
    const tickets = await TicketService.getAllTickets(req.query as any);
    
    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: { tickets },
    });
  });

  public static getTicketById = catchAsync(async (req: Request, res: Response) => {
    const ticket = await TicketService.getTicketById(req.params.id as string);
    
    res.status(200).json({
      status: 'success',
      data: { ticket },
    });
  });
}