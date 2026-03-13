import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TransactionsModule } from './transactions/transactions.module';
import { BranchModule } from './branch/branch.module';
import { MachineModule } from './machine/machine.module';
import { IncomeModule } from './income/income.module';
import { ExpenseModule } from './expense/expense.module';
import { ExpensecategoryModule } from './expensecategory/expensecategory.module';
import { RepairModule } from './repair/repair.module';
import { CollectionModule } from './collection/collection.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 5,
        },
      ],
    }),
    AuthModule, UserModule, TransactionsModule, BranchModule, MachineModule, IncomeModule, ExpenseModule, ExpensecategoryModule, RepairModule, CollectionModule, ReportModule],
})
export class AppModule { }