import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('branchId') branchId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('date') date?: string,
  ) {
    return this.expenseService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      branchId,
      categoryId,
      startDate,
      endDate,
      date,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id);
  }

  @Get('branch/:branchId')
  findByBranchId(@Param('branchId') branchId: string) {
    return this.expenseService.findByBranchId(branchId);
  }

  @Get('category/:categoryId')
  findByCategoryId(@Param('categoryId') categoryId: string) {
    return this.expenseService.findByCategoryId(categoryId);
  }

  @Get('date/:date')
  findByDate(@Param('date') date: string) {
    return this.expenseService.findByDate(date);
  }

  @Get('branch/:branchId/category/:categoryId')
  findByBranchIdAndCategoryId(@Param('branchId') branchId: string, @Param('categoryId') categoryId: string) {
    return this.expenseService.findByBranchIdAndCategoryId(branchId, categoryId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expenseService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseService.remove(id);
  }
}
