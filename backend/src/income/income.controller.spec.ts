import { Test, TestingModule } from '@nestjs/testing';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('IncomeController', () => {
  let controller: IncomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomeController],
      providers: [IncomeService, prismaProvider],
    }).compile();

    controller = module.get<IncomeController>(IncomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
