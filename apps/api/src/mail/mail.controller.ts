import { Controller } from '@nestjs/common';
import { MAIL_QUEUE } from './mail.jobs';
import { MailService } from './mail.service';

@Controller(MAIL_QUEUE)
export class MailController {
  constructor(private readonly mailService: MailService) {}
}
