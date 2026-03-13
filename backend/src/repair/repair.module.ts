import { Module } from '@nestjs/common';
import { RepairService } from './repair.service';
import { RepairController } from './repair.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RepairController],
  providers: [RepairService,PrismaService],
})
export class RepairModule {}
