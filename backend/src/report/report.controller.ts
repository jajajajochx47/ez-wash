import { Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  dashboard() {
    return this.reportService.dashboard();
  }

  @Get('income-per-branch')
  incomePerBranch(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportService.incomePerBranch({ startDate, endDate });
  }

  @Get('income-per-machine')
  incomePerMachine(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.reportService.incomePerMachine({ startDate, endDate, branchId });
  }

  @Get('daily-income')
  dailyIncome(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
    @Query('machineId') machineId?: string,
  ) {
    return this.reportService.dailyIncome({ startDate, endDate, branchId, machineId });
  }

  @Get('expense-summary')
  expenseSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.reportService.expenseSummary({ startDate, endDate, branchId });
  }

  @Get('profit-summary')
  profitSummary(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportService.profitSummary({ startDate, endDate });
  }

  @Get('machine-usage')
  machineUsage(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.reportService.machineUsage({ startDate, endDate, branchId });
  }

  @Get('repair-report')
  repairReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.reportService.repairReport({ startDate, endDate, status, branchId });
  }

  @Get('top-machine')
  topMachine(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportService.topMachine({
      startDate,
      endDate,
      branchId,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('top-branch')
  topBranch(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string, @Query('limit') limit?: string) {
    return this.reportService.topBranch({
      startDate,
      endDate,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('monthly-income')
  monthlyIncome(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
    @Query('machineId') machineId?: string,
  ) {
    return this.reportService.monthlyIncome({ startDate, endDate, branchId, machineId });
  }

  @Get('machine-utilization')
  machineUtilization(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.reportService.machineUtilization({ startDate, endDate, branchId });
  }

  @Get('collection-history')
  collectionHistory(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
    @Query('machineId') machineId?: string,
  ) {
    return this.reportService.collectionHistory({ startDate, endDate, branchId, machineId });
  }

  @Get('repair-cost')
  repairCost(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.reportService.repairCost({ startDate, endDate, status, branchId });
  }

  @Get('profit-per-branch')
  profitPerBranch(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportService.profitPerBranch({ startDate, endDate });
  }
}
