import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MINIO_CONSTANTS } from '../constants/minio.constants';
import { isAllowedImageMimeType } from '../utils/file.utils';

export const multerConfig = MulterModule.register({
  storage: diskStorage({
    destination: './uploads/temp',
    filename: (req, file, cb) => {
      const fileExtension = extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (isAllowedImageMimeType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  },
  limits: {
    fileSize: MINIO_CONSTANTS.FILE_LIMITS.MAX_FILE_SIZE,
    files: MINIO_CONSTANTS.FILE_LIMITS.MAX_FILES,
  },
});
