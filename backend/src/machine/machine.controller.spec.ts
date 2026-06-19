import { Test, TestingModule } from '@nestjs/testing';
import { MachineController } from './machine.controller';
import { MachineService } from './machine.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('MachineController', () => {
  let controller: MachineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MachineController],
      providers: [MachineService, prismaProvider],
    }).compile();

    controller = module.get<MachineController>(MachineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
