import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { timingSafeEqual } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constants';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-internal-api-key'];

    if (typeof apiKey !== 'string') {
      throw new UnauthorizedException(ERROR_MESSAGES.MISSING_INTERNAL_API_KEY);
    }

    const internalApiKey = this.configService.get<string>('INTERNAL_API_KEY');

    if (!internalApiKey) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.INTERNAL_API_KEY_NOT_CONFIGURED,
      );
    }

    try {
      const isValid = timingSafeEqual(
        Buffer.from(apiKey, 'utf8'),
        Buffer.from(internalApiKey, 'utf8'),
      );

      if (!isValid) {
        throw new UnauthorizedException(
          ERROR_MESSAGES.INVALID_INTERNAL_API_KEY,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.INTERNAL_API_KEY_FORMAT_ERROR,
      );
    }

    return true;
  }
}
