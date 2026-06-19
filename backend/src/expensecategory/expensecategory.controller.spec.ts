import { Test, TestingModule } from '@nestjs/testing';
import { ExpensecategoryController } from './expensecategory.controller';
import { ExpensecategoryService } from './expensecategory.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('ExpensecategoryController', () => {
  let controller: ExpensecategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensecategoryController],
      providers: [ExpensecategoryService, prismaProvider],
    }).compile();

    controller = module.get<ExpensecategoryController>(ExpensecategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
