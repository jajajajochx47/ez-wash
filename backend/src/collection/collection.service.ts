import { Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCollectionDto) {
    const collection = await this.prisma.machineCollection.create({
      data: dto,
    });
    return collection;
  }

  async findAll() {
    const collections = await this.prisma.machineCollection.findMany();
    return collections;
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
