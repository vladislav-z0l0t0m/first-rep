import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
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
}
