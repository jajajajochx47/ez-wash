import { Injectable } from '@nestjs/common';
import { CreateExpensecategoryDto } from './dto/create-expensecategory.dto';
import { UpdateExpensecategoryDto } from './dto/update-expensecategory.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensecategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExpensecategoryDto) {
    const category = await this.prisma.expenseCategory.create({
      data: dto,
    });
    return category;
  }

  async findAll() {
    const categories = await this.prisma.expenseCategory.findMany();
    return categories;
  }

  async findOne(id: string) {
    const category = await this.prisma.expenseCategory.findUnique({
      where: {
        id,
      },
    });
    return category;
  }

  async update(id: string, dto: UpdateExpensecategoryDto) {
    const category = await this.prisma.expenseCategory.update({
      where: {
        id,
      },
      data: dto,
    });
    return category;
  }

  async remove(id: string) {
    const category = await this.prisma.expenseCategory.delete({
      where: {
        id,
      },
    });
    return category;
  }
}
