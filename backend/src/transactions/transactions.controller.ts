import { Controller,Get, Param, Post, Body, Put, Delete,UseGuards  } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {

    constructor(private transactionsService: TransactionsService){}

  
}
