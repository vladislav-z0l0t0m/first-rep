import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { PassportJwtAuthGuard } from '../guards/passport-jwt-auth.guard';

export function Auth() {
  return applyDecorators(
    UseGuards(PassportJwtAuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
