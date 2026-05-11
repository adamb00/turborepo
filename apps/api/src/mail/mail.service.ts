import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

type SendMailParams = {
  subject: string;
  template: string;
  sendTo: string;
  context: ISendMailOptions['context'];
};

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(params: SendMailParams) {
    const { sendTo: to, subject, template, context } = params;

    try {
      const sendMailParams = {
        to,
        from: String(process.env.EMAIL_FROM),
        subject,
        template,
        context,
      };

      await this.mailerService.sendMail(sendMailParams);
    } catch (error) {
      console.error(
        `Error while sending mail with the following parameters : ${JSON.stringify(
          params,
        )}`,
        error,
      );
      throw error;
    }
  }
}
