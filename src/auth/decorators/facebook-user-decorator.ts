import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { FacebookUserPayload } from '../dto/facebook-user.payload';

export const FacebookUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): FacebookUserPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as FacebookUserPayload;

    if (!user) {
      throw new UnauthorizedException(
        'No user found in request after Facebook authentication',
      );
    }
    return user;
  },
);
