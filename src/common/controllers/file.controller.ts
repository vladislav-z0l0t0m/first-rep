import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileService } from '../services/file.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../decorators/current-user.decorator';
import { UseMulterExceptionFilter } from '../decorators/use-multer-exception-filter.decorator';
import { MINIO_CONSTANTS } from '../constants/minio.constants';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

@ApiTags('Files')
@ApiBearerAuth()
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', MINIO_CONSTANTS.FILE_LIMITS.MAX_FILES),
  )
  @UseMulterExceptionFilter()
  @ApiOperation({
    summary: 'Upload files',
    description: 'Upload one or multiple files and return their URLs',
  })
  @ApiCreatedResponse({
    description: 'Files uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        urls: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'http://minio:9000/posts/user-123/images/uuid1.jpg',
            'http://minio:9000/posts/user-123/images/uuid2.jpg',
          ],
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid file type or file size exceeds limit',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token required',
  })
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: AuthUser,
  ): Promise<{ urls: string[] }> {
    const urls = await this.fileService.uploadPostFiles(
      files,
      `user-${user.userId}`,
    );
    return { urls };
  }
}
