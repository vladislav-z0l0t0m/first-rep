export const ERROR_MESSAGES = {
  NOT_AUTHOR_FORBIDDEN: 'You are not allowed to modify this object',

  COMMENT_NOT_FOUND: (id: number) => `Comment with ID ${id} not found`,
  PARENT_COMMENT_NOT_FOUND: (id: number) =>
    `Parent comment with ID ${id} not found`,

  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: (field: string, value: string) =>
    `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' is already in use`,
  USER_WITH_ID_NOT_FOUND: (id: number) => `User with id ${id} not found`,
  USER_WITH_FIELD_NOT_FOUND: (field: string, value: string) =>
    `User with ${field}: ${value} not found`,
  USER_NO_PASSWORD: 'This account does not have a password',
  USER_INVALID_PASSWORD: 'Invalid password',
  USER_ALREADY_HAS_PASSWORD: 'This account already has a password',
  USER_NEW_PASSWORD_SAME:
    'New password cannot be the same as the old password.',
  USER_INVALID_OLD_PASSWORD: 'Invalid old password.',

  POST_NOT_FOUND: (id: number) => `Post with ID ${id} not found`,

  REACTABLE_TYPE_NOT_SUPPORTED: (type: string) =>
    `Reactable type "${type}" is not supported.`,
  REACTABLE_NOT_FOUND: (type: string, id: number) =>
    `${type} with ID ${id} not found`,

  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NO_TOKEN: 'No token provided',
  INVALID_TOKEN: 'Invalid token',
  MISSING_INTERNAL_API_KEY: 'Missing internal API key header',
  INTERNAL_API_KEY_NOT_CONFIGURED: 'Internal API key not configured',
  INVALID_INTERNAL_API_KEY: 'Invalid internal API key value',
  INTERNAL_API_KEY_FORMAT_ERROR: 'Internal API key format error',
  INVALID_CURSOR: 'Invalid cursor',
  INVALID_CURSOR_FORMAT: 'Invalid cursor format',
  INVALID_CURSOR_DATA: 'Invalid cursor data',

  INTERNAL_SERVER_ERROR: 'Internal server error',
  FILE_SIZE_EXCEEDS: 'File size exceeds the limit',
  TOO_MANY_FILES: 'Too many files uploaded',
  INVALID_FILE_TYPE: 'Invalid file type. Only images are allowed.',
  UNEXPECTED_FILE_FIELD: 'Unexpected file field',
  UPLOAD_PARTIAL_SUCCESS: (success: number, total: number) =>
    `${success} of ${total} files uploaded successfully.`,
};
