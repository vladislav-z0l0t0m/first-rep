import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { GoogleUserPayload } from '../dto/google-user.payload';

export const GoogleUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): GoogleUserPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        'No user found in request after Google authentication',
      );
    }
    return user;
  },
);
