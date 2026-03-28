import { TicketService } from './ticket.service';
import { prismaMock } from '../tests/setup';
import * as QueueService from './queue.service';

jest.mock('./queue.service', () => ({
  addTicketToQueue: jest.fn(),
}));

describe('TicketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a pending ticket and add it to the triage queue', async () => {
    const mockTicket = {
      id: 'test-uuid',
      title: 'Server is down',
      description: 'The main dashboard is returning 500 errors.',
      userId: 'user-123',
      status: 'PENDING' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: null,
      priority: null,
    };

    prismaMock.ticket.create.mockResolvedValue(mockTicket);

    const result = await TicketService.createTicket(
      {
        title: mockTicket.title,
        description: mockTicket.description,
      },
      mockTicket.userId,
    );

    expect(result.title).toBe('Server is down');
    expect(prismaMock.ticket.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'PENDING' }),
    });
    expect(QueueService.addTicketToQueue).toHaveBeenCalledWith('test-uuid');
  });
});
