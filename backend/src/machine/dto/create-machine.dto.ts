import { MachineType } from "@prisma/client";
import { IsString, IsNumber } from "class-validator";

export class CreateMachineDto {
    @IsString()
    machineCode: string;
    @IsString()
    machineType: MachineType;
    @IsNumber()
    pricePerUse: number;
    @IsString()
    branchId: string;
}
