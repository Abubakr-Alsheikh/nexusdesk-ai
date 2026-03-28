import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { prismaMock } from '../tests/setup';

jest.mock('../services/queue.service', () => ({
  addTicketToQueue: jest.fn().mockResolvedValue(undefined),
}));

const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
const mockToken = jwt.sign(
  { id: mockUserId },
  'super-secret-enterprise-key-change-this-in-prod',
);

const mockUser = {
  id: mockUserId,
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedpassword',
  createdAt: new Date(),
};

describe('Ticket API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
  });

  describe('POST /api/v1/tickets', () => {
    it('should return 400 if title is too short', async () => {
      const response = await request(app)
        .post('/api/v1/tickets')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: 'Bad',
          description: 'Too short description',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should return 201 and the ticket data on success', async () => {
      const mockTicket = {
        id: 'new-ticket-id',
        title: 'Valid Ticket Title',
        description: 'This is a valid ticket description for testing.',
        userId: mockUserId,
        status: 'PENDING' as const,
        category: null,
        priority: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.ticket.create.mockResolvedValue(mockTicket);

      const response = await request(app)
        .post('/api/v1/tickets')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: 'Valid Ticket Title',
          description: 'This is a valid ticket description for testing.',
        });

      expect(response.status).toBe(201);
      expect(prismaMock.ticket.create).toHaveBeenCalled();
    });
  });
});
