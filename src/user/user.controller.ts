import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ParamsIdDto } from 'src/common/dto/params-id.dto';
import { Auth } from 'src/auth/auth.decorator';
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

  @Patch(':id')
  @Auth()
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiOkResponse({
    description: 'User updated',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  update(
    @Param() { id }: ParamsIdDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  @Auth()
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiOkResponse({
    description: 'Password updated',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiForbiddenResponse({ description: 'Invalid old password' })
  @ApiNotFoundResponse({ description: 'User not found' })
  updatePassword(
    @Param() { id }: ParamsIdDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Patch(':id/password/set')
  @Auth()
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiOkResponse({
    description: 'Password setted',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiForbiddenResponse({ description: 'This account already has a password' })
  @ApiNotFoundResponse({ description: 'User not found' })
  setPassword(
    @Param() { id }: ParamsIdDto,
    @Body() setPasswordDto: SetPasswordDto,
  ): Promise<void> {
    return this.userService.setPassword(id, setPasswordDto);
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
}
