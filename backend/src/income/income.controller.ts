import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}
  @Post()
  create(@Body() createIncomeDto: CreateIncomeDto) {
    return this.incomeService.create(createIncomeDto);
  }
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('branchId') branchId?: string,
    @Query('machineId') machineId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('date') date?: string,
  ) {
    return this.incomeService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      branchId,
      machineId,
      startDate,
      endDate,
      date,
    });
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
