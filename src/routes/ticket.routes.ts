import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { validate } from '../middlewares/validate';
import {
  createTicketSchema,
  getTicketsQuerySchema,
} from '../validators/ticket.schema';

const router = Router();

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new ticket with AI triage
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - userId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Ticket subject
 *               description:
 *                 type: string
 *                 description: Detailed description of the issue
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user creating the ticket
 *     responses:
 *       201:
 *         description: Ticket created successfully with AI-assigned category and priority
 *       400:
 *         description: Validation error
 */
router
  .route('/')
  .post(validate(createTicketSchema), TicketController.createTicket)
  .get(validate(getTicketsQuerySchema), TicketController.getAllTickets);

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get all tickets with pagination
 *     tags: [Tickets]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of tickets
 */
router.route('/:id').get(TicketController.getTicketById);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get a ticket by ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ticket details
 *       404:
 *         description: Ticket not found
 */
export default router;
