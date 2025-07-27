import { ALLOWED_IMAGE_MIME_TYPES } from '../utils/file.utils';

export const MINIO_CONSTANTS = {
  BUCKETS: {
    POSTS: 'posts',
    USERS: 'users',
  },
  FOLDERS: {
    IMAGES: 'images',
    AVATARS: 'avatars',
    TEMP: 'temp',
  },
  FILE_LIMITS: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_FILES: 10,
  },
  ALLOWED_MIME_TYPES: ALLOWED_IMAGE_MIME_TYPES,
} as const;
