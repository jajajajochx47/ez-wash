import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
export class CreateExpenseDto {
  @IsString()
  branchId: string;
  @IsString()
  categoryId: string;
  @IsNumber()
  amount: number;
  @IsString()
  @IsOptional()
  description?: string;
  @IsDateString()
  expenseDate: string;
}
