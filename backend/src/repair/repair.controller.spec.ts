import { Test, TestingModule } from '@nestjs/testing';
import { RepairController } from './repair.controller';
import { RepairService } from './repair.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('RepairController', () => {
  let controller: RepairController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepairController],
      providers: [RepairService, prismaProvider],
    }).compile();

    controller = module.get<RepairController>(RepairController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
