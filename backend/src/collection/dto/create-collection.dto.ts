import { IsString, IsNotEmpty, IsDecimal } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  machineId: string;

  @IsString()
  @IsNotEmpty()
  collectedById: string;

  @IsDecimal()
  @IsNotEmpty()
  amount: number;
}
