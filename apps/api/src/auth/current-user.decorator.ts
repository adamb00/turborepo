import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from "@workspace/auth/types"

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const req = context.switchToHttp().getRequest();

    return req.user;
  },
);
