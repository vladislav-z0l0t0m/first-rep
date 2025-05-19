import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'auntificate',
    description: 'login with credentails',
  })
  @ApiOkResponse({ description: 'Authorized', type: LoginResponseDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization failed',
  })
  @HttpCode(200)
  @Post('login')
  login(@Body() body: LoginDto): LoginResponseDto {
    const user = this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    return this.authService.login(user);
  }
}
