import { Module } from '@nestjs/common';
import { HashingService } from './services/hashing.service';
import { AuthApiService } from './services/auth-api.service';
import { MinioService } from './services/minio.service';
import { FileService } from './services/file.service';
import { FileController } from './controllers/file.controller';

@Module({
  providers: [HashingService, AuthApiService, MinioService, FileService],
  exports: [HashingService, AuthApiService, MinioService, FileService],
  controllers: [FileController],
})
export class CommonModule {}
