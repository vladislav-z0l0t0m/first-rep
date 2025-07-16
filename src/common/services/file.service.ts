import { Injectable } from '@nestjs/common';
import { MinioService } from './minio.service';
import { BucketType } from '../enums/file-type.enum';
import { MINIO_CONSTANTS } from '../constants/minio.constants';

@Injectable()
export class FileService {
  constructor(private readonly minioService: MinioService) {}

  async uploadPostFiles(
    files: Express.Multer.File[],
    userFolder?: string,
  ): Promise<string[]> {
    const folder = userFolder
      ? `${userFolder}/${MINIO_CONSTANTS.FOLDERS.IMAGES}`
      : MINIO_CONSTANTS.FOLDERS.IMAGES;
    return this.minioService.uploadMultipleFiles(
      BucketType.POSTS,
      files,
      folder,
    );
  }

  async uploadAvatarFiles(
    files: Express.Multer.File[],
    userFolder?: string,
  ): Promise<string[]> {
    const folder = userFolder
      ? `${userFolder}/${MINIO_CONSTANTS.FOLDERS.AVATARS}`
      : MINIO_CONSTANTS.FOLDERS.AVATARS;
    return this.minioService.uploadMultipleFiles(
      BucketType.USERS,
      files,
      folder,
    );
  }
}
