import { IsString, IsNotEmpty, IsOptional, IsDecimal } from 'class-validator';

export class CreateRepairDto {
  @IsString()
  @IsNotEmpty()
  machineId: string;

  @IsString()
  @IsNotEmpty()
  problem: string;

  @IsDecimal()
  @IsOptional()
  repairCost?: number;

  @IsString()
  @IsOptional()
  repairDate?: string;
}
