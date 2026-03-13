import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchService {
  //เชื่อมต่อกับฐานข้อมูล
  constructor(private prisma: PrismaService) {}
  //create branch
  async create(dto: CreateBranchDto) {
    const branch = await this.prisma.branch.create({
      data: {
        name: dto.name,
        location: dto.location,
      },
    });
    return branch;
  }
  //update branch
  async update(id: string, dto: UpdateBranchDto) {
    const branch = await this.prisma.branch.update({
      where: {
        id,
      },
      data: dto,
    });
    return branch;
  }
  async remove(id: string) {
    const branch = await this.prisma.branch.delete({
      where: {
        id,
      },
    });
    return branch;
  }
  //find all branch
  async findAll() {
    const branches = await this.prisma.branch.findMany();
    return branches;
  }
  //find one branch
  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: {
        id,
      },
    });
    return branch;
  }
 
}
