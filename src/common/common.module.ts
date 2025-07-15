import { Module } from '@nestjs/common';
import { HashingService } from './services/hashing.service';
import { AuthApiService } from './services/auth-api.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Module({
  providers: [
    HashingService,
    AuthApiService,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
  ],
  exports: [HashingService, AuthApiService, JwtAuthGuard, OptionalJwtAuthGuard],
})
export class CommonModule {}
