import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { mockPrismaService, prismaProvider } from '../test-utils/mock-prisma.service';

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportService, prismaProvider],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filters dashboard income and expense by date range', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-19T12:00:00.000Z'));

    mockPrismaService.income.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 100 } } as never)
      .mockResolvedValueOnce({ _sum: { amount: 700 } } as never);
    mockPrismaService.expense.aggregate.mockResolvedValueOnce({ _sum: { amount: 300 } } as never);
    mockPrismaService.machine.aggregate.mockResolvedValueOnce({ _count: { id: 5 } } as never);
    mockPrismaService.repair.count.mockResolvedValueOnce(1 as never);
    mockPrismaService.machine.count
      .mockResolvedValueOnce(2 as never)
      .mockResolvedValueOnce(4 as never);

    const result = await service.dashboard({
      startDate: '2026-06-13',
      endDate: '2026-06-19',
    });

    expect(mockPrismaService.income.aggregate).toHaveBeenNthCalledWith(2, {
      _sum: { amount: true },
      where: {
        incomeDate: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
      },
    });
    expect(mockPrismaService.expense.aggregate).toHaveBeenCalledWith({
      _sum: { amount: true },
      where: {
        expenseDate: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
      },
    });
    expect(result).toMatchObject({
      totalIncome: 700,
      totalExpense: 300,
      netProfit: 400,
    });

    jest.useRealTimers();
  });
});
