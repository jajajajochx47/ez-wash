import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from './collection.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('CollectionService', () => {
  let service: CollectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectionService, prismaProvider],
    }).compile();

    service = module.get<CollectionService>(CollectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
