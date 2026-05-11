import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MailModule } from 'src/mail/mail.module';
import { VerificationModule } from 'src/verification/verification.module';

@Module({
  imports: [MailModule, VerificationModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
