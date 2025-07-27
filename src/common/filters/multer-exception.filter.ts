import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { MulterError } from 'multer';

const MULTER_ERROR_MAP: Record<string, { status: number; message: string }> = {
  LIMIT_FILE_SIZE: {
    status: HttpStatus.BAD_REQUEST,
    message: ERROR_MESSAGES.FILE_SIZE_EXCEEDS,
  },
  LIMIT_FILE_COUNT: {
    status: HttpStatus.BAD_REQUEST,
    message: ERROR_MESSAGES.TOO_MANY_FILES,
  },
  LIMIT_UNEXPECTED_FILE: {
    status: HttpStatus.BAD_REQUEST,
    message: ERROR_MESSAGES.UNEXPECTED_FILE_FIELD,
  },
  'File too large': {
    status: HttpStatus.BAD_REQUEST,
    message: ERROR_MESSAGES.FILE_SIZE_EXCEEDS,
  },
  'Too many files': {
    status: HttpStatus.BAD_REQUEST,
    message: ERROR_MESSAGES.TOO_MANY_FILES,
  },
};

@Catch()
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorDetails = MULTER_ERROR_MAP[exception.code];

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

    if (errorDetails) {
      status = errorDetails.status;
      message = errorDetails.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
      timestamp: new Date().toISOString(),
    });
  }
}
