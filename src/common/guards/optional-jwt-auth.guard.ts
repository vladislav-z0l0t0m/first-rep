import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    try {
      const result = super.canActivate(context);
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        const request = context
          .switchToHttp()
          .getRequest<Request & { user: AuthUser | null }>();
        request['user'] = null;
        return true;
      }
      throw error;
    }
  }
}
