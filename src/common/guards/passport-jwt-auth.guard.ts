import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class PassportJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = AuthUser>(err: any, user: TUser): TUser | null {
    return user || null;
  }
}
