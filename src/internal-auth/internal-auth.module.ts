import { Module } from '@nestjs/common';
import { InternalAuthController } from './internal-auth.controller';
import { InternalAuthGuard } from './internal-auth.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [InternalAuthController],
  providers: [InternalAuthGuard],
  exports: [InternalAuthGuard],
})
export class InternalAuthModule {}
