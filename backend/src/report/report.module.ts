import { Module, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
@Module({
  controllers: [ReportController],
  providers: [ReportService, PrismaService, JwtAuthGuard, RolesGuard],
})
export class ReportModule {}
