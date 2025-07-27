import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { AuthenticateUserDto } from '../user/dto/authenticate-user.dto';
import { OAuthLoginDto } from '../user/dto/oauth-login.dto';
import { UserService } from '../user/user.service';
import { InternalAuthGuard } from './internal-auth.guard';

@ApiTags('Internal Auth')
@Controller('internal/auth')
@UseGuards(InternalAuthGuard)
export class InternalAuthController {
  constructor(private readonly userService: UserService) {}

  @Post('authenticate')
  @ApiOkResponse({
    description: 'User authenticated',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @HttpCode(HttpStatus.OK)
  async authenticateUser(
    @Body() authenticateUserDto: AuthenticateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.authenticateUser(authenticateUserDto);
  }

  @Post('oauth')
  @ApiOkResponse({
    description: 'User found or created via OAuth',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid OAuth data' })
  @HttpCode(HttpStatus.OK)
  async handleOAuthLogin(
    @Body() oauthLoginDto: OAuthLoginDto,
  ): Promise<UserResponseDto> {
    return this.userService.findOrCreateUserByOauth(oauthLoginDto);
  }
}
