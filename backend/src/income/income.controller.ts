import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}
  @Post()
  create(@Body() createIncomeDto: CreateIncomeDto) {
    return this.incomeService.create(createIncomeDto);
  }
  @Get()
  findAll() {
    return this.incomeService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incomeService.findOne(id);
  }
  @Get('branch/:branchId')
  findByBranchId(@Param('branchId') branchId: string) {
    return this.incomeService.findByBranchId(branchId);
  }
  @Get('machine/:machineId')
  findByMachineId(@Param('machineId') machineId: string) {
    return this.incomeService.findByMachineId(machineId);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incomeService.remove(id);
  }
  @Get('date/:date')
  findByDate(@Param('date') date: string) {
    return this.incomeService.findByDate(date);
  }
  @Get('branch/:branchId/machine/:machineId')
  findByBranchIdAndMachineId(@Param('branchId') branchId: string, @Param('machineId') machineId: string) {
    return this.incomeService.findByBranchIdAndMachineId(branchId, machineId);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncomeDto: UpdateIncomeDto) {
    return this.incomeService.update(id, updateIncomeDto);
  }
}
