import { z } from 'zod';
import { Category, Priority } from '@prisma/client';

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100),
    description: z.string().min(10, "Description must be at least 10 characters"),
    userId: z.string().uuid("Invalid User ID format"),
  }),
});

export const getTicketsQuerySchema = z.object({
  query: z.object({
    category: z.enum(Category).optional(),
    priority: z.enum(Priority).optional(),
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>['body'];
export type TicketFilterQuery = z.infer<typeof getTicketsQuerySchema>['query'];