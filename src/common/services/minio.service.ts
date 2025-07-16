import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { MINIO_CONSTANTS } from '../constants/minio.constants';
import { BucketType } from '../enums/file-type.enum';
import { getFileExtension } from '../utils/file.utils';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly minioClient: Client;
  private readonly logger = new Logger(MinioService.name);

  constructor(private configService: ConfigService) {
    this.minioClient = new Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT')!,
      port: this.configService.get<number>('MINIO_PORT'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit(): Promise<void> {
    for (const bucket of Object.values(MINIO_CONSTANTS.BUCKETS)) {
      const exists = await this.minioClient.bucketExists(bucket);
      if (!exists) {
        await this.minioClient.makeBucket(bucket);
        this.logger.log(`Bucket created: ${bucket}`);
      }
    }
  }

  async uploadFile(
    bucketName: BucketType | string,
    file: Express.Multer.File,
    folder?: string,
  ): Promise<string> {
    const fileExtension = this.getFileExtension(file.originalname);
    const fileName = `${folder || MINIO_CONSTANTS.FOLDERS.IMAGES}/${uuidv4()}.${fileExtension}`;
    await this.minioClient.putObject(
      bucketName,
      fileName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );
    const fileUrl = this.getFileUrl(bucketName, fileName);
    this.logger.log(`File uploaded successfully: ${fileUrl}`);
    return fileUrl;
  }

  async uploadMultipleFiles(
    bucketName: BucketType | string,
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(bucketName, file, folder),
    );
    return Promise.all(uploadPromises);
  }

  async uploadPostFiles(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<string[]> {
    return this.uploadMultipleFiles(BucketType.POSTS, files, folder);
  }

  async deleteFile(
    bucketName: BucketType | string,
    fileUrl: string,
  ): Promise<void> {
    const objectName = this.getObjectNameFromUrl(fileUrl);
    await this.minioClient.removeObject(bucketName, objectName);
    this.logger.log(`File deleted successfully: ${fileUrl}`);
  }

  async deleteMultipleFiles(
    bucketName: BucketType | string,
    fileUrls: string[],
  ): Promise<void> {
    const deletePromises = fileUrls.map((url) =>
      this.deleteFile(bucketName, url),
    );
    await Promise.all(deletePromises);
  }

  getFileUrl(bucketName: BucketType | string, objectName: string): string {
    const protocol =
      this.configService.get<string>('MINIO_USE_SSL') === 'true'
        ? 'https'
        : 'http';
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = this.configService.get<number>('MINIO_PORT');
    return `${protocol}://${endpoint}:${port}/${bucketName}/${objectName}`;
  }

  private getFileExtension(filename: string): string {
    return getFileExtension(filename);
  }

  private getObjectNameFromUrl(fileUrl: string): string {
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    return pathParts.slice(2).join('/');
  }
}
