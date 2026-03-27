import { Injectable } from '@nestjs/common';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RepairService {
  constructor(private prisma: PrismaService) {}

  private readonly standardInclude = {
    machine: {
      include: {
        branch: true,
      },
    },
  };

  async create(dto: CreateRepairDto) {
    const repair = await this.prisma.repair.create({
      data: {
        ...dto,
        repairDate: dto.repairDate ? new Date(dto.repairDate) : undefined,
      },
      include: this.standardInclude,
    });
    return repair;
  }

  async findAll() {
    const repairs = await this.prisma.repair.findMany({
      include: this.standardInclude,
      orderBy: { createdAt: 'desc' },
    });
    return repairs;
  }

  async findOne(id: string) {
    const repair = await this.prisma.repair.findUnique({
      where: {
        id,
      },
      include: this.standardInclude,
    });
    return repair;
  }

  async update(id: string, dto: UpdateRepairDto) {
    const repair = await this.prisma.repair.update({
      where: {
        id,
      },
      data: {
        ...dto,
        repairDate: dto.repairDate ? new Date(dto.repairDate) : undefined,
      },
      include: this.standardInclude,
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
