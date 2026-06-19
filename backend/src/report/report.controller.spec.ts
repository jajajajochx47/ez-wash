import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('ReportController', () => {
  let controller: ReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [ReportService, prismaProvider],
    }).compile();

    controller = module.get<ReportController>(ReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
