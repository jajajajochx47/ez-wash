import * as bcrypt from 'bcrypt';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';


@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService) { }

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

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new BadRequestException('Invalid password');
        }

        const payload = { id: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: expiresAt,
            },
        });

        return { accessToken, refreshToken };
    }
    async logout(refreshToken: string) {

        await this.prisma.refreshToken.deleteMany({
            where: {
                token: refreshToken,
            },
        });

        return { message: 'Logged out successfully' };
    }
    async refresh(refreshToken: string) {

        const token = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!token || token.revoked) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (token.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token expired');
        }

        const payload = {
            id: token.user.id,
            email: token.user.email,
        };

        const accessToken = this.jwtService.sign(payload);

        return { accessToken };
    }
}