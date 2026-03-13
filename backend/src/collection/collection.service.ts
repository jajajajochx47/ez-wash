import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { PrismaService } from '../prisma/prisma.service';

type CollectionListQuery = {
  page?: number;
  limit?: number;
  branchId?: string;
  machineId?: string;
  collectedById?: string;
  startDate?: string;
  endDate?: string;
};

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCollectionDto) {
    const collection = await this.prisma.machineCollection.create({
      data: dto,
    });
    return collection;
  }

  async findAll(query: CollectionListQuery = {}) {
    const page = Number.isFinite(query.page) ? Number(query.page) : 1;
    const limit = Number.isFinite(query.limit) ? Number(query.limit) : 20;
    const safePage = page > 0 ? page : 1;
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.MachineCollectionWhereInput = {};
    if (query.machineId) where.machineId = query.machineId;
    if (query.collectedById) where.collectedById = query.collectedById;
    if (query.branchId) {
      where.machine = { branchId: query.branchId };
    }

    if (query.startDate || query.endDate) {
      where.collectedAt = {};
      if (query.startDate) where.collectedAt.gte = new Date(query.startDate);
      if (query.endDate) where.collectedAt.lte = new Date(query.endDate);
    }

    const [total, collections] = await this.prisma.$transaction([
      this.prisma.machineCollection.count({ where }),
      this.prisma.machineCollection.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { collectedAt: 'desc' },
      }),
    ]);

    return {
      data: collections,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  }

  async findOne(id: string) {
    const collection = await this.prisma.machineCollection.findUnique({
      where: {
        id,
      },
    });
    return collection;
  }

  async update(id: string, dto: UpdateCollectionDto) {
    const collection = await this.prisma.machineCollection.update({
      where: {
        id,
      },
      data: dto,
    });
    return collection;
  }

  async remove(id: string) {
    const collection = await this.prisma.machineCollection.delete({
      where: {
        id,
      },
    });
    return collection;
  }
}
