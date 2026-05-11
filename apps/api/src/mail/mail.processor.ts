import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MAIL_JOB_NAMES, MAIL_QUEUE } from './mail.jobs';
import { MailService } from './mail.service';
import { MAIL_TEMPLATES } from './mail.templates';

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  private safeName(name: string) {
    return name.trim().length > 0 ? name.trim() : 'there';
  }

  async process(job: Job) {
    switch (job.name) {
      case MAIL_JOB_NAMES.SEND_VERIFICATION_EMAIL: {
        const { to, verificationLink, name } = job.data;

        await this.mailService.sendMail({
          sendTo: to,
          subject: 'Welcome',
          template: MAIL_TEMPLATES.SIGNUP_CONFIRMATION_EMAIL,
          context: {
            name: this.safeName(name),
            verificationLink: verificationLink ?? '',
          },
        });
        break;
      }

      case MAIL_JOB_NAMES.SEND_FORGOT_PASSWORD_EMAIL: {
        const { to, resetLink, name } = job.data;
        await this.mailService.sendMail({
          sendTo: to,
          subject: 'Reset password',
          template: MAIL_TEMPLATES.RESET_PASSWORD_EMAIL,
          context: {
            name: this.safeName(name),
            resetLink: resetLink ?? '',
          },
        });
      }
      default:
        break;
    }
  }
}
