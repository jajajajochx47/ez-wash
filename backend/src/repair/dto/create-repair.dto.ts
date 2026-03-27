import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateRepairDto {
  @IsString()
  @IsNotEmpty()
  machineId: string;

  @IsString()
  @IsNotEmpty()
  problem: string;

  @IsNumber()
  @IsOptional()
  repairCost?: number;

  @IsString()
  @IsOptional()
  repairDate?: string;
}
