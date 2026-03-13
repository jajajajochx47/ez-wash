import { PartialType } from '@nestjs/swagger';
import { CreateExpensecategoryDto } from './create-expensecategory.dto';

export class UpdateExpensecategoryDto extends PartialType(CreateExpensecategoryDto) {}
