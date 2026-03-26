import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { validate } from '../middlewares/validate';
import { createTicketSchema, getTicketsQuerySchema } from '../validators/ticket.schema';

const router = Router();

router
  .route('/')
  .post(validate(createTicketSchema), TicketController.createTicket)
  .get(validate(getTicketsQuerySchema), TicketController.getAllTickets);

router
  .route('/:id')
  .get(TicketController.getTicketById);

export default router;