import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

const prismaMock = mockDeep<PrismaClient>();

jest.mock('../services/db.service', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

jest.mock('../services/queue.service', () => ({
  addTicketToQueue: jest.fn().mockResolvedValue(undefined),
}));

export { prismaMock };
