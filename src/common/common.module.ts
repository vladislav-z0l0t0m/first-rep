import { Module } from '@nestjs/common';
import { HashingService } from './services/hashing.service';
import { AuthApiService } from './services/auth-api.service';

@Module({
  providers: [HashingService, AuthApiService],
  exports: [HashingService, AuthApiService],
})
export class CommonModule {}
