import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

const VERIFY_TTL_MINUTES = 30;
const VERIFY_WINDOW_SECONDS = 15 * 60;
const VERIFY_LIMIT_PER_EMAIL = 10;
const VERIFY_LIMIT_PER_IP = 30;

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private async hashToken(rawToken: string) {
    return hash(rawToken, 12);
  }

  async createVerificationToken(email: string, path: string, scenario: string) {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = await this.hashToken(rawToken);
    const expires = new Date(Date.now() + VERIFY_TTL_MINUTES * 60_000);

    const identifier = `${scenario}:${email}`;

    await this.prisma.client.verificationToken.deleteMany({
      where: { identifier },
    });

    await this.prisma.client.verificationToken.create({
      data: {
        identifier,
        token: tokenHash,
        expires,
      },
    });

    return {
      rawToken,
      expires,
      link: new URL(
        `${path}?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`,
        process.env.ADMIN_URL,
      ).toString(),
    };
  }

  async verifyToken(
    email: string,
    rawToken: string,
    scenario: string,
    data: Prisma.UserUpdateInput,
  ) {
    const identifier = `${scenario}:${email}`;
    const record = await this.prisma.client.verificationToken.findFirst({
      where: { identifier },
      orderBy: { expires: 'desc' },
    });

    if (!record) throw new BadRequestException('Invalid or expired token');

    if (record.expires.getTime() < Date.now()) {
      await this.prisma.client.verificationToken.delete({
        where: { token: record.token },
      });
      throw new BadRequestException('Invalid or expired token');
    }
    const valid = await compare(rawToken, record.token);

    if (!valid) throw new BadRequestException('Invalid or expired token');

    await this.prisma.client.$transaction([
      this.prisma.client.verificationToken.delete({
        where: { token: record.token },
      }),
      this.prisma.client.user.update({
        where: { email },
        data,
      }),
    ]);

    return { ok: true };
  }

  async checkVerifyRateLimit(email: string, ip?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const emailCount = await this.redis.incrWithTtl(
      `verification:attempts:email:${normalizedEmail}`,
      VERIFY_WINDOW_SECONDS,
    );

    if (emailCount !== null && emailCount > VERIFY_LIMIT_PER_EMAIL) {
      throw new HttpException(
        'Too many verification attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!ip) return;

    const ipCount = await this.redis.incrWithTtl(
      `verification:attempts:ip:${ip}`,
      VERIFY_WINDOW_SECONDS,
    );

    if (ipCount !== null && ipCount > VERIFY_LIMIT_PER_IP) {
      throw new HttpException(
        'Too many verification attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
