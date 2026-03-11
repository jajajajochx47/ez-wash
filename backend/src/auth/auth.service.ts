import * as bcrypt from 'bcrypt';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService) { }

    async register(dto: RegisterDto) {

        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                passwordHash: hashedPassword,
                role: {
                    connect: { name: 'USER' }
                }
            },
            select: {
                id: true,
                email: true,
                name: true
            }
        });

        return user;
    }

}