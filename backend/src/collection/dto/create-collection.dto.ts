import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  machineId: string;

  @IsString()
  @IsOptional()
  collectedById?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
