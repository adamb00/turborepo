import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { getToken } from '@auth/core/jwt';
import type { AuthUser } from "@workspace/auth/types"
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET!,
      salt: 'authjs.session-token',
      secureCookie: process.env.NODE_ENV === 'production',
    });

    if (!token?.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    const isRevoked = await this.redis.get(`auth:revoked-user:${token.id}`);
    if (isRevoked === '1') {
      throw new UnauthorizedException('Session revoked');
    }

    const role =
      typeof token.role === 'string' || token.role === null
        ? token.role
        : undefined;

    req.user = {
      id: token.id as string,
      email: token.email,
      name: token.name,
      role,
    } satisfies AuthUser;

    return true;
  }
}
