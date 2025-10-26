//@ts-nocheck
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userInclude = {
    subscription: true,
    featureFlags: {
      include: {
        featureFlag: true,
      },
    },
  } as const;

  async registerUser(dto: RegisterUserDto) {
    await this.ensureEmailAvailable(dto.email);
    const hashedPassword = this.hashPassword(dto.password);
    const data: Record<string, unknown> = {
      email: dto.email,
      hashedPassword,
    };

    if (typeof dto.name !== 'undefined') {
      data.name = dto.name;
    }

    if (typeof dto.image !== 'undefined') {
      data.image = dto.image;
    }

    const user = await this.prisma.user.create({
      data,
      include: this.userInclude,
    });

    return this.sanitizeUser(user);
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: this.userInclude,
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return this.sanitizeUser(user);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: this.userInclude,
    });

    if (!existingUser) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const data: Record<string, unknown> = {};

    if (typeof dto.name !== 'undefined') {
      data.name = dto.name;
    }

    if (typeof dto.image !== 'undefined') {
      data.image = dto.image;
    }

    if (typeof dto.isDisclaimerAccpeted !== 'undefined') {
      data.isDisclaimerAccpeted = dto.isDisclaimerAccpeted;
    }

    if (typeof dto.email !== 'undefined') {
      await this.ensureEmailAvailable(dto.email, id);
      data.email = dto.email;
    }

    if (typeof dto.password !== 'undefined') {
      data.hashedPassword = this.hashPassword(dto.password);
    }

    if (Object.keys(data).length === 0) {
      return this.sanitizeUser(existingUser);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: this.userInclude,
    });

    return this.sanitizeUser(user);
  }

  private async ensureEmailAvailable(email: string, excludeUserId?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing && existing.id !== excludeUserId) {
      throw new ConflictException(`Email ${email} is already in use`);
    }
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  private sanitizeUser(user: any) {
    if (!user) {
      return user;
    }

    const { hashedPassword, ...rest } = user;
    return rest;
  }
}
