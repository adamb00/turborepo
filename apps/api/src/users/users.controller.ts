import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import type { AuthUser } from '@workspace/auth/types';
import {
  CreateUserSchema,
  CreateUserValues,
  ResetPasswordSchema,
  ResetPasswordValues,
  ForgotPasswordSchema,
  ForgotPasswordValues,
} from '@workspace/validation';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(AuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  adminOnly(@CurrentUser() user: AuthUser) {
    return {
      message: 'Admin route',
      user,
    };
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateUserSchema)) dto: CreateUserValues,
  ) {
    return this.usersService.createUser(dto);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordSchema))
    dto: ForgotPasswordValues,
  ) {
    return this.usersService.forgotPassword(dto);
  }

  @Patch('reset-password')
  async resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordSchema)) dto: ResetPasswordValues,
  ) {
    return this.usersService.resetPassword(dto);
  }
}
