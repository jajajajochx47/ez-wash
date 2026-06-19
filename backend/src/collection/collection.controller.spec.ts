import { Test, TestingModule } from '@nestjs/testing';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { prismaProvider } from '../test-utils/mock-prisma.service';

describe('CollectionController', () => {
  let controller: CollectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [CollectionService, prismaProvider],
    }).compile();

    controller = module.get<CollectionController>(CollectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
