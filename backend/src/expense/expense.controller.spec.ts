import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('ExpenseController', () => {
  let controller: ExpenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [ExpenseService, prismaProvider],
    }).compile();

    controller = module.get<ExpenseController>(ExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
