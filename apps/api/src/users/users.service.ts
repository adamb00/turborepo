import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import type {
  CreateUserValues,
  ResetPasswordValues,
  ForgotPasswordValues,
} from '@workspace/validation';
import * as bcrypt from 'bcryptjs';
import { Queue } from 'bullmq';
import { createHash } from 'node:crypto';
import { MAIL_JOB_NAMES, MAIL_QUEUE } from 'src/mail/mail.jobs';
import { VERIFICATION_SCENARIO } from 'src/verification/verification.scenarios';
import { VerificationService } from 'src/verification/verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private readonly verificationService: VerificationService,
    @InjectQueue(MAIL_QUEUE)
    private readonly mailQueue: Queue,
  ) {}

  private createHash(email: string, verificationLink: string) {
    return `verify-${createHash('sha256').update(`${email}:${verificationLink}`).digest('hex')}`;
  }

  private async acquireLock(email: string, key: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const createLockKey = `users:${key}-lock:${normalizedEmail}`;
    const lockAcquired = await this.redis.setNx(createLockKey, '1', 15);

    return { lockAcquired, createLockKey };
  }

  async createUser(dto: CreateUserValues) {
    const { lockAcquired, createLockKey } = await this.acquireLock(
      dto.email,
      this.createUser.name,
    );

    if (!lockAcquired) {
      throw new ConflictException(
        'User creation already in progress for this email',
      );
    }

    try {
      const existing = await this.prisma.client.user.findUnique({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Email already exists');
      }

      const passwordHash = await bcrypt.hash(dto.password, 12);

      const user = await this.prisma.client.user.create({
        data: {
          email: dto.email,
          name: dto.name ?? null,
          password: passwordHash,
          role: dto.role,
        },
      });

      const { link } = await this.verificationService.createVerificationToken(
        user.email,
        '/auth/verify-email',
        VERIFICATION_SCENARIO.EMAIL_VERIFICATION,
      );

      const jobId = this.createHash(user.email, link);

      await this.mailQueue.add(
        MAIL_JOB_NAMES.SEND_VERIFICATION_EMAIL,
        {
          to: user.email,
          verificationLink: link,
          name: user.name,
        },
        { jobId },
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } finally {
      await this.redis.del(createLockKey);
    }
  }

  async forgotPassword(dto: ForgotPasswordValues) {
    const { lockAcquired, createLockKey } = await this.acquireLock(
      dto.email,
      this.forgotPassword.name,
    );

    if (!lockAcquired) {
      throw new ConflictException(
        'Password reset already in progress for this email',
      );
    }
    try {
      const user = await this.prisma.client.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new ConflictException('Email not found');
      }

      const { link } = await this.verificationService.createVerificationToken(
        user.email,
        '/auth/reset-password',
        VERIFICATION_SCENARIO.FORGOT_PASSWORD_VERIFICATION,
      );

      const jobId = this.createHash(user.email, link);

      await this.mailQueue.add(
        MAIL_JOB_NAMES.SEND_FORGOT_PASSWORD_EMAIL,
        {
          to: user.email,
          resetLink: link,
          name: user.name,
        },
        { jobId },
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } finally {
      await this.redis.del(createLockKey);
    }
  }

  async resetPassword(dto: ResetPasswordValues) {
    const { lockAcquired, createLockKey } = await this.acquireLock(
      dto.email,
      this.resetPassword.name,
    );

    if (!lockAcquired) {
      throw new ConflictException(
        'Password reset already in progress for this email',
      );
    }

    try {
      const user = await this.prisma.client.user.findFirst({
        where: {
          email: {
            equals: dto.email,
            mode: 'insensitive',
          },
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired token');
      }

      const samePassword = await bcrypt.compare(dto.password, user.password);
      if (samePassword) {
        throw new BadRequestException(
          'New password must be different from the current password',
        );
      }

      const passwordHash = await bcrypt.hash(dto.password, 12);

      const res = await this.verificationService.verifyToken(
        user.email,
        dto.token,
        VERIFICATION_SCENARIO.FORGOT_PASSWORD_VERIFICATION,
        {
          password: passwordHash,
          passwordUpdatedAt: new Date(),
        },
      );

      return { ...res, ...user };
    } finally {
      await this.redis.del(createLockKey);
    }
  }
}
