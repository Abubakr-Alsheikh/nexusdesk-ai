import request from 'supertest';
import app from '../app';
import { prismaMock } from '../tests/setup';

jest.mock('../services/queue.service', () => ({
  addTicketToQueue: jest.fn().mockResolvedValue(undefined),
}));

describe('Ticket API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/tickets', () => {
    it('should return 400 if title is too short', async () => {
      const response = await request(app).post('/api/v1/tickets').send({
        title: 'Bad',
        description: 'Too short description',
        userId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should return 201 and the ticket data on success', async () => {
      const mockTicket = {
        id: 'new-ticket-id',
        title: 'Valid Ticket Title',
        description: 'This is a valid ticket description for testing.',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'PENDING' as const,
        category: null,
        priority: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.ticket.create.mockResolvedValue(mockTicket);

      const response = await request(app).post('/api/v1/tickets').send({
        title: 'Valid Ticket Title',
        description: 'This is a valid ticket description for testing.',
        userId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(response.status).toBe(201);
      expect(prismaMock.ticket.create).toHaveBeenCalled();
    });
  });
});
