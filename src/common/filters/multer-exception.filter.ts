import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception.message === 'File too large') {
      status = HttpStatus.BAD_REQUEST;
      message = 'File size exceeds the limit';
    } else if (exception.message === 'Too many files') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Too many files uploaded';
    } else if (exception.message.includes('Invalid file type')) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception.message === 'LIMIT_FILE_COUNT') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Too many files uploaded';
    } else if (exception.message === 'LIMIT_FILE_SIZE') {
      status = HttpStatus.BAD_REQUEST;
      message = 'File size exceeds the limit';
    } else if (exception.message === 'LIMIT_UNEXPECTED_FILE') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Unexpected file field';
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
