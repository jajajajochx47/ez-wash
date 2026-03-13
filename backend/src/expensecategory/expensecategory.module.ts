import { Module } from '@nestjs/common';
import { ExpensecategoryService } from './expensecategory.service';
import { ExpensecategoryController } from './expensecategory.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ExpensecategoryController],
  providers: [ExpensecategoryService,PrismaService],
})
export class ExpensecategoryModule {}
