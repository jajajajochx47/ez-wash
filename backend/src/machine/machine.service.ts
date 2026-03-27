import { Injectable } from '@nestjs/common';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MachineService {
  
  constructor(private prisma: PrismaService) {}

  private readonly standardInclude = {
    branch: true,
  };

  //create machine
  async create(dto: CreateMachineDto) {
    const machine = await this.prisma.machine.create({
      data: {
        machineCode: dto.machineCode,
        machineType: dto.machineType,
        pricePerUse: dto.pricePerUse,
        branchId: dto.branchId,
      },
      include: this.standardInclude,
    });
    return machine;
  }
  //update machine
  async update(id: string, dto: UpdateMachineDto) {
    const machine = await this.prisma.machine.update({
      where: {
        id,
      },
      data: dto,
      include: this.standardInclude,
    });
    return machine;
  }
  async remove(id: string) {
    const machine = await this.prisma.machine.delete({
      where: {
        id,
      },
    });
    return machine;
  }
  //find all machine
  async findAll() {
    const machines = await this.prisma.machine.findMany({
      include: this.standardInclude,
    });
    return machines;
  }
  //find one machine
  async findOne(id: string) {
    const machine = await this.prisma.machine.findUnique({
      where: {
        id,
      },
      include: this.standardInclude,
    });
    return machine;
  }
}
