import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { VerificationModule } from './verification/verification.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    MailModule,
    VerificationModule,
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
