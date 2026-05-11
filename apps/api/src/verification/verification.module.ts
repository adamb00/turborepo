import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';

@Module({
  imports: [RedisModule],
  providers: [VerificationService],
  exports: [VerificationService],
  controllers: [VerificationController],
})
export class VerificationModule {}
