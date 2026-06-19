import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpenseService, prismaProvider],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
