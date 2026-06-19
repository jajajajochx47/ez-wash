import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  create(@Body() dto: CreateCollectionDto) {
    return this.collectionService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('branchId') branchId?: string,
    @Query('machineId') machineId?: string,
    @Query('collectedById') collectedById?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.collectionService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      branchId,
      machineId,
      collectedById,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    return this.collectionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionService.remove(id);
  }
}
