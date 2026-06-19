import { Test, TestingModule } from '@nestjs/testing';
import { BranchService } from './branch.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('BranchService', () => {
  let service: BranchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BranchService, prismaProvider],
    }).compile();

    service = module.get<BranchService>(BranchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
