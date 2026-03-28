import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type DateRange = {
  startDate?: string;
  endDate?: string;
};

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  private buildDateFilter(
    field: 'incomeDate' | 'expenseDate' | 'repairDate' | 'createdAt' | 'collectedAt',
    range?: DateRange,
  ) {
    if (!range?.startDate && !range?.endDate) {
      return undefined;
    }

    let gteDate: Date | undefined;
    if (range?.startDate) {
      gteDate = new Date(range.startDate);
      gteDate.setHours(0, 0, 0, 0);
    }

    let lteDate: Date | undefined;
    if (range?.endDate) {
      lteDate = new Date(range.endDate);
      lteDate.setHours(23, 59, 59, 999);
    }

    return {
      [field]: {
        ...(gteDate ? { gte: gteDate } : {}),
        ...(lteDate ? { lte: lteDate } : {}),
      },
    };
  }

  async dashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      incomeToday, 
      incomeAllTime, 
      expenseAllTime, 
      machines, 
      pendingRepairs, 
      alerts
    ] = await Promise.all([
      this.prisma.income.aggregate({ 
        _sum: { amount: true },
        where: { incomeDate: { gte: today } }
      }),
      this.prisma.income.aggregate({ _sum: { amount: true } }),
      this.prisma.expense.aggregate({ _sum: { amount: true } }),
      this.prisma.machine.aggregate({
        _count: { id: true },
      }),
      this.prisma.repair.count({
        where: { status: 'PENDING' }
      }),
      this.prisma.machine.count({
        where: { status: 'MAINTENANCE' }
      }),
    ]);

    const activeMachinesCount = await this.prisma.machine.count({
      where: { status: 'ACTIVE' }
    });

    const totalIncome = Number(incomeAllTime._sum.amount ?? 0);
    const totalExpense = Number(expenseAllTime._sum.amount ?? 0);

    return {
      incomeToday: Number(incomeToday._sum.amount ?? 0),
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      activeMachines: activeMachinesCount,
      totalMachines: machines._count.id,
      pendingJobs: pendingRepairs,
      alerts: alerts,
    };
  }

  async recentActivities() {
    const incomes = await this.prisma.income.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        machine: {
          include: { branch: true }
        },
        branch: true
      }
    });

    return incomes;
  }

  async incomePerBranch(range?: DateRange) {
    const rows = await this.prisma.income.groupBy({
      by: ['branchId'],
      _sum: { amount: true },
      _count: true,
      where: {
        ...this.buildDateFilter('incomeDate', range),
      },
    });

    const branchIds = rows.map((row) => row.branchId);
    const branches = await this.prisma.branch.findMany({
      where: { id: { in: branchIds } },
      select: { id: true, name: true, location: true },
    });

    const branchMap = new Map(branches.map((branch) => [branch.id, branch]));

    return rows.map((row) => ({
      branchId: row.branchId,
      branchName: branchMap.get(row.branchId)?.name ?? 'Unknown',
      totalIncome: Number(row._sum.amount ?? 0),
      count: row._count,
    }));
  }

  async incomePerMachine(range?: DateRange & { branchId?: string }) {
    const rows = await this.prisma.income.groupBy({
      by: ['machineId'],
      _sum: { amount: true },
      _count: true,
      where: {
        ...(range?.branchId ? { branchId: range.branchId } : {}),
        ...this.buildDateFilter('incomeDate', range),
      },
    });

    const machineIds = rows.map((row) => row.machineId);
    const machines = await this.prisma.machine.findMany({
      where: { id: { in: machineIds } },
      select: {
        id: true,
        machineCode: true,
        machineType: true,
        branchId: true,
      },
    });

    const machineMap = new Map(machines.map((machine) => [machine.id, machine]));

    return rows.map((row) => ({
      machineId: row.machineId,
      machineCode: machineMap.get(row.machineId)?.machineCode ?? 'Unknown',
      totalIncome: Number(row._sum.amount ?? 0),
      count: row._count,
    }));
  }

  async dailyIncome(range?: DateRange & { branchId?: string; machineId?: string }) {
    // Default to last 7 days if no range provided
    const endDate = range?.endDate ? new Date(range.endDate) : new Date();
    const startDate = range?.startDate ? new Date(range.startDate) : new Date();
    if (!range?.startDate) {
      startDate.setDate(endDate.getDate() - 6);
    }
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const incomes = await this.prisma.income.findMany({
      where: {
        ...(range?.branchId ? { branchId: range.branchId } : {}),
        ...(range?.machineId ? { machineId: range.machineId } : {}),
        incomeDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { incomeDate: true, amount: true },
    });

    const bucket = new Map<string, { date: string; totalIncome: number; count: number }>();
    
    // Initialize all dates in range with 0
    const curr = new Date(startDate);
    while (curr <= endDate) {
      const dateKey = curr.toISOString().slice(0, 10);
      bucket.set(dateKey, { date: dateKey, totalIncome: 0, count: 0 });
      curr.setDate(curr.getDate() + 1);
    }

    // Fill with actual data
    for (const income of incomes) {
      const dateKey = income.incomeDate.toISOString().slice(0, 10);
      const entry = bucket.get(dateKey);
      if (entry) {
        entry.totalIncome += Number(income.amount);
        entry.count += 1;
      }
    }

    return Array.from(bucket.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  }

  async expenseSummary(range?: DateRange & { branchId?: string }) {
    const rows = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      _count: true,
      where: {
        ...(range?.branchId ? { branchId: range.branchId } : {}),
        ...this.buildDateFilter('expenseDate', range),
      },
    });

    const categoryIds = rows.map((row) => row.categoryId);
    const categories = await this.prisma.expenseCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map((category) => [category.id, category]));

    return rows.map((row) => ({
      categoryId: row.categoryId,
      categoryName: categoryMap.get(row.categoryId)?.name ?? 'Unknown',
      totalExpense: Number(row._sum.amount ?? 0),
      count: row._count,
    }));
  }

  async profitSummary(range?: DateRange) {
    const incomeWhere = this.buildDateFilter('incomeDate', range);
    const expenseWhere = this.buildDateFilter('expenseDate', range);

    const [incomeAgg, expenseAgg] = await Promise.all([
      this.prisma.income.aggregate({
        _sum: { amount: true },
        where: incomeWhere,
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: expenseWhere,
      }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount ?? 0);
    const totalExpense = Number(expenseAgg._sum.amount ?? 0);

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
    };
  }

  async machineUsage(range?: DateRange & { branchId?: string }) {
    const machines = await this.prisma.machine.findMany({
      where: {
        ...(range?.branchId ? { branchId: range.branchId } : {}),
      },
      include: {
        branch: true
      }
    });

    return machines;
  }

  async repairReport(range?: DateRange & { status?: string; branchId?: string }) {
    const repairs = await this.prisma.repair.findMany({
      where: {
        ...(range?.status ? { status: range.status as any } : {}),
        ...(range?.branchId
          ? {
              machine: {
                branchId: range.branchId,
              },
            }
          : {}),
        ...this.buildDateFilter('createdAt', range),
      },
      include: {
        machine: {
          select: {
            id: true,
            machineCode: true,
            machineType: true,
            branchId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = repairs.reduce(
      (acc, repair) => {
        const cost = repair.repairCost ? Number(repair.repairCost) : 0;
        acc.totalCost += cost;
        acc.totalCount += 1;
        acc.byStatus[repair.status] = (acc.byStatus[repair.status] ?? 0) + 1;
        return acc;
      },
      { totalCost: 0, totalCount: 0, byStatus: {} as Record<string, number> },
    );

    return {
      summary,
      repairs,
    };
  }

  async topMachine(range?: DateRange & { branchId?: string; limit?: number }) {
    const rows = await this.prisma.income.groupBy({
      by: ['machineId'],
      _sum: { amount: true },
      _count: true,
      where: {
        ...(range?.branchId ? { branchId: range.branchId } : {}),
        ...this.buildDateFilter('incomeDate', range),
      },
      orderBy: { _sum: { amount: 'desc' } },
      take: range?.limit ?? 5,
    });

    const machineIds = rows.map((row) => row.machineId);
    const machines = await this.prisma.machine.findMany({
      where: { id: { in: machineIds } },
      select: { id: true, machineCode: true, machineType: true, branchId: true },
    });
    const machineMap = new Map(machines.map((machine) => [machine.id, machine]));

    return rows.map((row) => ({
      machineId: row.machineId,
      machineCode: machineMap.get(row.machineId)?.machineCode ?? 'Unknown',
      totalIncome: Number(row._sum.amount ?? 0),
      count: row._count,
    }));
  }

  async topBranch(range?: DateRange & { limit?: number }) {
    const rows = await this.prisma.income.groupBy({
      by: ['branchId'],
      _sum: { amount: true },
      _count: true,
      where: {
        ...this.buildDateFilter('incomeDate', range),
      },
      orderBy: { _sum: { amount: 'desc' } },
      take: range?.limit ?? 5,
    });

    const branchIds = rows.map((row) => row.branchId);
    const branches = await this.prisma.branch.findMany({
      where: { id: { in: branchIds } },
      select: { id: true, name: true, location: true },
    });
    const branchMap = new Map(branches.map((branch) => [branch.id, branch]));

    return rows.map((row) => ({
      branchId: row.branchId,
      branchName: branchMap.get(row.branchId)?.name ?? 'Unknown',
      totalIncome: Number(row._sum.amount ?? 0),
      count: row._count,
    }));
  }

  async monthlyIncome(range?: DateRange & { branchId?: string; machineId?: string }) {
    const incomes = await this.prisma.income.findMany({
      where: {
        ...(range?.branchId ? { branchId: range.branchId } : {}),
        ...(range?.machineId ? { machineId: range.machineId } : {}),
        ...this.buildDateFilter('incomeDate', range),
      },
      select: { incomeDate: true, amount: true },
    });

    const bucket = new Map<string, { month: string; totalIncome: number; count: number }>();
    for (const income of incomes) {
      const monthKey = income.incomeDate.toISOString().slice(0, 7);
      const entry = bucket.get(monthKey) ?? { month: monthKey, totalIncome: 0, count: 0 };
      entry.totalIncome += Number(income.amount);
      entry.count += 1;
      bucket.set(monthKey, entry);
    }

    return Array.from(bucket.values()).sort((a, b) => (a.month < b.month ? -1 : 1));
  }

  async machineUtilization(range?: DateRange & { branchId?: string }) {
    const [usageRows, machines] = await Promise.all([
      this.prisma.income.groupBy({
        by: ['machineId'],
        _count: true,
        where: {
          ...(range?.branchId ? { branchId: range.branchId } : {}),
          ...this.buildDateFilter('incomeDate', range),
        },
      }),
      this.prisma.machine.findMany({
        where: {
          ...(range?.branchId ? { branchId: range.branchId } : {}),
        },
        select: { id: true, machineCode: true, machineType: true, status: true, branchId: true },
      }),
    ]);

    const usageMap = new Map(usageRows.map((row) => [row.machineId, row._count]));
    const totalUses = usageRows.reduce((sum, row) => sum + row._count, 0);

    return machines.map((machine) => {
      const uses = usageMap.get(machine.id) ?? 0;
      return {
        machine,
        uses,
        utilizationPercent: totalUses > 0 ? Number(((uses / totalUses) * 100).toFixed(2)) : 0,
      };
    });
  }

  async collectionHistory(range?: DateRange & { branchId?: string; machineId?: string }) {
    const collections = await this.prisma.machineCollection.findMany({
      where: {
        ...(range?.machineId ? { machineId: range.machineId } : {}),
        ...(range?.branchId
          ? {
              machine: {
                branchId: range.branchId,
              },
            }
          : {}),
        ...this.buildDateFilter('collectedAt', range),
      },
      include: {
        machine: { select: { id: true, machineCode: true, machineType: true, branchId: true } },
        collectedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { collectedAt: 'desc' },
    });

    const summary = collections.reduce(
      (acc, row) => {
        acc.totalAmount += Number(row.amount);
        acc.totalCount += 1;
        return acc;
      },
      { totalAmount: 0, totalCount: 0 },
    );

    return { summary, collections };
  }

  async repairCost(range?: DateRange & { branchId?: string; status?: string }) {
    const repairs = await this.prisma.repair.findMany({
      where: {
        ...(range?.status ? { status: range.status as any } : {}),
        ...(range?.branchId
          ? {
              machine: {
                branchId: range.branchId,
              },
            }
          : {}),
        ...this.buildDateFilter('createdAt', range),
      },
      include: {
        machine: { select: { id: true, machineCode: true, machineType: true, branchId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = repairs.reduce(
      (acc, repair) => {
        const cost = repair.repairCost ? Number(repair.repairCost) : 0;
        acc.totalCost += cost;
        acc.totalCount += 1;
        return acc;
      },
      { totalCost: 0, totalCount: 0 },
    );

    return { summary, repairs };
  }

  async profitPerBranch(range?: DateRange) {
    const incomeWhere = this.buildDateFilter('incomeDate', range);
    const expenseWhere = this.buildDateFilter('expenseDate', range);

    const [incomeByBranch, expenseByBranch, branches] = await Promise.all([
      this.prisma.income.groupBy({
        by: ['branchId'],
        _sum: { amount: true },
        where: {
          ...incomeWhere,
        },
      }),
      this.prisma.expense.groupBy({
        by: ['branchId'],
        _sum: { amount: true },
        where: {
          ...expenseWhere,
        },
      }),
      this.prisma.branch.findMany({ select: { id: true, name: true, location: true } }),
    ]);

    const incomeMap = new Map(
      incomeByBranch.map((row) => [row.branchId, Number(row._sum.amount ?? 0)]),
    );
    const expenseMap = new Map(
      expenseByBranch.map((row) => [row.branchId, Number(row._sum.amount ?? 0)]),
    );

    return branches.map((branch) => {
      const income = incomeMap.get(branch.id) ?? 0;
      const expense = expenseMap.get(branch.id) ?? 0;
      return {
        branch,
        income,
        expense,
        profit: income - expense,
      };
    });
  }
}
