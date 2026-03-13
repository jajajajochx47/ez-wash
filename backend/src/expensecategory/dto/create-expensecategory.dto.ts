import { IsString, IsNotEmpty } from 'class-validator';

export class CreateExpensecategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
