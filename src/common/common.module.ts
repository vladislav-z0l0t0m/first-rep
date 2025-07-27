import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HashingService } from './services/hashing.service';
import { AuthApiService } from './services/auth-api.service';
import { MinioService } from './services/minio.service';
import { FileService } from './services/file.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule],
  providers: [
    HashingService,
    AuthApiService,
    MinioService,
    FileService,
    JwtStrategy,
  ],
  exports: [HashingService, AuthApiService, MinioService, FileService],
  controllers: [],
})
export class CommonModule {}
