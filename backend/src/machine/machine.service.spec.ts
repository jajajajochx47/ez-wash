import { Test, TestingModule } from '@nestjs/testing';
import { MachineService } from './machine.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('MachineService', () => {
  let service: MachineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MachineService, prismaProvider],
    }).compile();

    service = module.get<MachineService>(MachineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
