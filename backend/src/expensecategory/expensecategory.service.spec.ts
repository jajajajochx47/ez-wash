import { Test, TestingModule } from '@nestjs/testing';
import { ExpensecategoryService } from './expensecategory.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('ExpensecategoryService', () => {
  let service: ExpensecategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpensecategoryService, prismaProvider],
    }).compile();

    service = module.get<ExpensecategoryService>(ExpensecategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
