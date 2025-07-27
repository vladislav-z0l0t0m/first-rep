import { UseFilters } from '@nestjs/common';
import { MulterExceptionFilter } from '../filters/multer-exception.filter';

export const UseMulterExceptionFilter = () => UseFilters(MulterExceptionFilter);
