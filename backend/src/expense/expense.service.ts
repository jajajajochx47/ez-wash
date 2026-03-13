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

  async create(dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: dto,
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
      where.expenseDate = new Date(query.date);
    } else if (query.startDate || query.endDate) {
      where.expenseDate = {};
      if (query.startDate) where.expenseDate.gte = new Date(query.startDate);
      if (query.endDate) where.expenseDate.lte = new Date(query.endDate);
    }

    const [total, expenses] = await this.prisma.$transaction([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { expenseDate: 'desc' },
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
    });
    return expense;
  }
  async findByBranchId(branchId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        branchId,
      },
    });
    return expenses;
  }
  async findByCategoryId(categoryId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        categoryId,
      },
    });
    return expenses;
  }
  async findByDate(date: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        expenseDate: date,
      },
    });
    return expenses;
  }
  async findByBranchIdAndCategoryId(branchId: string, categoryId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        branchId,
        categoryId,
      },
    });
    return expenses;
  }
  async update(id: string, dto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.update({
      where: {
        id,
      },
      data: dto,
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
