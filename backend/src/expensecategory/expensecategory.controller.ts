import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpensecategoryService } from './expensecategory.service';
import { CreateExpensecategoryDto } from './dto/create-expensecategory.dto';
import { UpdateExpensecategoryDto } from './dto/update-expensecategory.dto';

@Controller('expensecategory')
export class ExpensecategoryController {
  constructor(private readonly expensecategoryService: ExpensecategoryService) {}

  @Post()
  create(@Body() dto: CreateExpensecategoryDto) {
    return this.expensecategoryService.create(dto);
  } 

  @Get()
  findAll() {
    return this.expensecategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensecategoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpensecategoryDto) {
    return this.expensecategoryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensecategoryService.remove(id);
  }
}
