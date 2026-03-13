import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  machineId: string;

  @IsString()
  branchId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsDateString()
  incomeDate: string;
}
