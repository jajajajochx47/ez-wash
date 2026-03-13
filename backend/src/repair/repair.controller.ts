import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RepairService } from './repair.service';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';

@Controller('repair')
export class RepairController {
  constructor(private readonly repairService: RepairService) {}

  @Post()
  create(@Body() dto: CreateRepairDto) {
    return this.repairService.create(dto);
  } 

  @Get()
  findAll() {
    return this.repairService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repairService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRepairDto) {
    return this.repairService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repairService.remove(id);
  }
}
