import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface AuthUser {
  userId: number;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthUser | null }>();
    return request['user'] || undefined;
  },
);
