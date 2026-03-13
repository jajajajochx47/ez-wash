import { Injectable } from '@nestjs/common';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateIncomeDto) {
    const income = await this.prisma.income.create({
      data: dto,
    });
    return income;
  }

  async findAll() {
    const incomes = await this.prisma.income.findMany();
    return incomes;
  }

  async findOne(id: string) {
    const income = await this.prisma.income.findUnique({
      where: {
        id,
      },
    });
    return income;
  }
  async findByBranchId(branchId: string) {
    const incomes = await this.prisma.income.findMany({
      where: {
        branchId,
      },
    });
    return incomes;
  }
  async findByMachineId(machineId: string) {
    const incomes = await this.prisma.income.findMany({
      where: {
        machineId,
      },
    });
    return incomes;
  }
  async findByDate(date: string) {
    const incomes = await this.prisma.income.findMany({
      where: {
        incomeDate: date,
      },
    });
    return incomes;
  }
  async findByBranchIdAndMachineId(branchId: string, machineId: string) {
    const incomes = await this.prisma.income.findMany({
      where: {
        branchId,
        machineId,
      },
    });
    return incomes;
  }
  async update(id: string, dto: UpdateIncomeDto) {
    const income = await this.prisma.income.update({
      where: {
        id,
      },
      data: dto,
    });
    return income;
  }
  async remove(id: string) {
    const income = await this.prisma.income.delete({
      where: {
        id,
      },
    });
    return income;
  }
}
