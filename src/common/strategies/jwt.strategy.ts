import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';

interface JwtPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  validate(payload: JwtPayload): { userId: number } {
    if (!payload.userId) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN);
    }

    return { userId: payload.userId };
  }
}
