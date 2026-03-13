import { Test, TestingModule } from '@nestjs/testing';
import { RepairController } from './repair.controller';
import { RepairService } from './repair.service';

describe('RepairController', () => {
  let controller: RepairController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepairController],
      providers: [RepairService],
    }).compile();

    controller = module.get<RepairController>(RepairController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
