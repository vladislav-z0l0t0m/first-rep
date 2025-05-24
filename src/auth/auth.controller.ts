import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { IdentifierValidatorService } from './identifier-validator.service';
import { AuthGuard } from '@nestjs/passport';
import { GoogleUser } from './decorators/google-user.decorator';
import { GoogleUserPayload } from './dto/google-user.payload';

@ApiTags('Auth')
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private identifierValidator: IdentifierValidatorService,
  ) {}

  @ApiOperation({
    summary: 'auntificate',
    description: 'login with credentails',
  })
  @ApiOkResponse({ description: 'Authorized', type: LoginResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Authorization failed: invalid password',
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiNotFoundResponse({ description: 'User with this identifier not found' })
  @ApiForbiddenResponse({
    description:
      'This account does not have a password, so use Google or another service to login',
  })
  @HttpCode(200)
  @Post('login')
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    this.identifierValidator.validate(body.type, body.identifier);

    const user = await this.authService.validateUser(
      body.identifier,
      body.type,
      body.password,
    );

    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@GoogleUser() user: GoogleUserPayload) {
    return this.authService.googleLogin(user);
  }
}
