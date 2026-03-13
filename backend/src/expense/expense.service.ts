import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: dto,
    });
    return expense;
  }

  async findAll() {
    const expenses = await this.prisma.expense.findMany();
    return expenses;
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
