import { Test, TestingModule } from '@nestjs/testing';
import { RepairService } from './repair.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('RepairService', () => {
  let service: RepairService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepairService, prismaProvider],
    }).compile();

    service = module.get<RepairService>(RepairService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
