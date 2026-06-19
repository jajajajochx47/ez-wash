import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}
  //create branch
  @Post()
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }
  //update branch
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(id, updateBranchDto);
  }
  //delete branch
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchService.remove(id);
  }
  //find all branch
  @Get()
  findAll() {
    return this.branchService.findAll();
  }
  //find one branch
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(id);
  }
  
}
