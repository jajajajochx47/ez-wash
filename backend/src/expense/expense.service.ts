import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from '../prisma/prisma.service';

type ExpenseListQuery = {
  page?: number;
  limit?: number;
  branchId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
};

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  private readonly standardInclude = {
    branch: true,
    category: true,
  };

  async create(dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        ...dto,
        expenseDate: new Date(dto.expenseDate),
      },
      include: this.standardInclude,
    });
    return expense;
  }

  async findAll(query: ExpenseListQuery = {}) {
    const page = Number.isFinite(query.page) ? Number(query.page) : 1;
    const limit = Number.isFinite(query.limit) ? Number(query.limit) : 20;
    const safePage = page > 0 ? page : 1;
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.ExpenseWhereInput = {};
    if (query.branchId) where.branchId = query.branchId;
    if (query.categoryId) where.categoryId = query.categoryId;

    if (query.date) {
      const dayStart = new Date(query.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(query.date);
      dayEnd.setHours(23, 59, 59, 999);
      where.expenseDate = { gte: dayStart, lte: dayEnd };
    } else if (query.startDate || query.endDate) {
      where.expenseDate = {};
      if (query.startDate) {
        const start = new Date(query.startDate);
        start.setHours(0, 0, 0, 0);
        where.expenseDate.gte = start;
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.expenseDate.lte = end;
      }
    }

    const [total, expenses] = await this.prisma.$transaction([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { expenseDate: 'desc' },
        include: this.standardInclude,
      }),
    ]);

    return {
      data: expenses,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: {
        id,
      },
      include: this.standardInclude,
    });
    return expense;
  }

  async findByBranchId(branchId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        branchId,
      },
      include: this.standardInclude,
    });
    return expenses;
  }

  async findByCategoryId(categoryId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        categoryId,
      },
      include: this.standardInclude,
    });
    return expenses;
  }

  async findByDate(date: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        expenseDate: new Date(date),
      },
      include: this.standardInclude,
    });
    return expenses;
  }

  async findByBranchIdAndCategoryId(branchId: string, categoryId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        branchId,
        categoryId,
      },
      include: this.standardInclude,
    });
    return expenses;
  }

  async update(id: string, dto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.update({
      where: {
        id,
      },
      data: {
        ...dto,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
      },
      include: this.standardInclude,
    });
    return expense;
  }

  async remove(id: string) {
    const expense = await this.prisma.expense.delete({
      where: {
        id,
      },
    });
    return expense;
  }
}
