import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { VERIFICATION_SCENARIO } from './verification.scenarios';
import { VerificationService } from './verification.service';

type VerifyEmailBody = {
  email: string;
  token: string;
};

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('verify-email')
  async verifyEmail(@Body() body: VerifyEmailBody, @Req() req: Request) {
    const { email, token } = body;
    const ip =
      req.ip ??
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0]?.trim()
        : undefined);
    try {
      await this.verificationService.verifyToken(
        email,
        token,
        VERIFICATION_SCENARIO.EMAIL_VERIFICATION,
        { emailVerified: new Date() },
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        await this.verificationService.checkVerifyRateLimit(email, ip);
      }
      throw error;
    }
  }
}
