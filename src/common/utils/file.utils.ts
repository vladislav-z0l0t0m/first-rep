export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const isAllowedImageMimeType = (
  mimeType: string,
): mimeType is AllowedImageMimeType => {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as AllowedImageMimeType);
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop() || 'jpg';
};

export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};
