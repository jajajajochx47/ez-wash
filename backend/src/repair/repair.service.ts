import { Injectable } from '@nestjs/common';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RepairService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRepairDto) {
    const repair = await this.prisma.repair.create({
      data: dto,
    });
    return repair;
  }

  async findAll() {
    const repairs = await this.prisma.repair.findMany();
    return repairs;
  }

  async findOne(id: string) {
    const repair = await this.prisma.repair.findUnique({
      where: {
        id,
      },
    });
    return repair;
  }

  async update(id: string, dto: UpdateRepairDto) {
    const repair = await this.prisma.repair.update({
      where: {
        id,
      },
      data: dto,
    });
    return repair;
  }

  async remove(id: string) {
    const repair = await this.prisma.repair.delete({
      where: {
        id,
      },
    });
    return repair;
  }
}
