import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/adapters/pug.adapter';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { BullModule } from '@nestjs/bullmq';
import { MAIL_QUEUE } from './mail.jobs';
import { MailProcessor } from './mail.processor';

const distTemplatesDir = join(__dirname, '../../templates');
const sourceTemplatesDir = join(process.cwd(), 'templates');
const templatesDir = existsSync(distTemplatesDir)
  ? distTemplatesDir
  : sourceTemplatesDir;

@Module({
  imports: [
    BullModule.registerQueue({
      name: MAIL_QUEUE,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: false,
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: process.env.EMAIL_FROM,
        },
        template: {
          dir: templatesDir,
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService, BullModule],
  controllers: [MailController],
})
export class MailModule {}
