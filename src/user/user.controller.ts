import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ParamsIdDto } from 'src/common/dto/params-id.dto';
import {
  ApiTags,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import {
  CurrentUser,
  AuthUser,
} from 'src/common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'User created.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'Users returned',
    type: [UserResponseDto],
  })
  findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get('me')
  @Auth()
  @ApiOkResponse({
    description: 'Current user returned',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  getCurrentUser(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    return this.userService.findOne(user.userId);
  }

  @Patch('me')
  @Auth()
  @ApiOkResponse({
    description: 'Current user updated',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  updateCurrentUser(
    @CurrentUser() user: AuthUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(user.userId, updateUserDto);
  }

  @Patch('me/password')
  @Auth()
  @ApiOkResponse({
    description: 'Current user password updated',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiForbiddenResponse({ description: 'Invalid old password' })
  updateCurrentUserPassword(
    @CurrentUser() user: AuthUser,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    return this.userService.updatePassword(user.userId, updatePasswordDto);
  }

  @Patch('me/password/set')
  @Auth()
  @ApiOkResponse({
    description: 'Current user password setted',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiForbiddenResponse({ description: 'This account already has a password' })
  setCurrentUserPassword(
    @CurrentUser() user: AuthUser,
    @Body() setPasswordDto: SetPasswordDto,
  ): Promise<void> {
    return this.userService.setPassword(user.userId, setPasswordDto);
  }

  @Delete('me')
  @Auth()
  @ApiOkResponse({
    description: 'Current user deleted',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  removeCurrentUser(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    return this.userService.remove(user.userId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiOkResponse({
    description: 'User returned',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  findOne(@Param() { id }: ParamsIdDto): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Delete(':id')
  @Auth()
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiOkResponse({
    description: 'User deleted',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  remove(@Param() { id }: ParamsIdDto): Promise<UserResponseDto> {
    return this.userService.remove(id);
  }

  @Post('auth/authenticate')
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

  @Post('auth/oauth')
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
