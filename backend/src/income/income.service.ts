import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { PrismaService } from '../prisma/prisma.service';

type IncomeListQuery = {
  page?: number;
  limit?: number;
  branchId?: string;
  machineId?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
};

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) {}

  private readonly standardInclude = {
    machine: {
      include: {
        branch: true,
      },
    },
    branch: true,
  };

  async create(dto: CreateIncomeDto) {
    const income = await this.prisma.income.create({
      data: {
        ...dto,
        incomeDate: new Date(dto.incomeDate),
      },
      include: this.standardInclude,
    });
    return income;
  }

  async findAll(query: IncomeListQuery = {}) {
    const page = Number.isFinite(query.page) ? Number(query.page) : 1;
    const limit = Number.isFinite(query.limit) ? Number(query.limit) : 20;
    const safePage = page > 0 ? page : 1;
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.IncomeWhereInput = {};
    if (query.branchId) where.branchId = query.branchId;
    if (query.machineId) where.machineId = query.machineId;

    if (query.date) {
      where.incomeDate = new Date(query.date);
    } else if (query.startDate || query.endDate) {
      where.incomeDate = {};
      if (query.startDate) where.incomeDate.gte = new Date(query.startDate);
      if (query.endDate) where.incomeDate.lte = new Date(query.endDate);
    }

    const [total, incomes] = await this.prisma.$transaction([
      this.prisma.income.count({ where }),
      this.prisma.income.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { incomeDate: 'desc' },
        include: this.standardInclude,
      }),
    ]);

    return {
      data: incomes,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  }

  async findOne(id: string) {
    const income = await this.prisma.income.findUnique({
      where: {
        id,
      },
      include: this.standardInclude,
    });
    return income;
  }

  async findByBranchId(branchId: string) {
    const incomes = await this.prisma.income.findMany({
      where: {
        branchId,
      },
      include: this.standardInclude,
    });
    return incomes;
  }

  async findByMachineId(machineId: string) {
    const incomes = await this.prisma.income.findMany({
      where: {
        machineId,
      },
      include: this.standardInclude,
    });
    return incomes;
  }

  async findByDate(date: string) {
    const incomes = await this.prisma.income.findMany({
      where: {
        incomeDate: new Date(date),
      },
      include: this.standardInclude,
    });
    return incomes;
  }

  async findByBranchIdAndMachineId(branchId: string, machineId: string) {
    const incomes = await this.prisma.income.findMany({
      where: {
        branchId,
        machineId,
      },
      include: this.standardInclude,
    });
    return incomes;
  }

  async update(id: string, dto: UpdateIncomeDto) {
    const income = await this.prisma.income.update({
      where: {
        id,
      },
      data: {
        ...dto,
        incomeDate: dto.incomeDate ? new Date(dto.incomeDate) : undefined,
      },
      include: this.standardInclude,
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
