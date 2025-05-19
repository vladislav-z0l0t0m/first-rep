import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ParamsIdDto } from 'src/common/dto/params-id.dto';
import { Auth } from 'src/auth/auth.decorator';
import { ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error',
})
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'Users returned' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User returned' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User with the specified ID was not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  findOne(@Param() { id }: ParamsIdDto): Promise<User> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User with the specified ID was not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  update(
    @Param() { id }: ParamsIdDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  @Auth()
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password updated' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User with the specified ID was not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  updatePassword(
    @Param() { id }: ParamsIdDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User deleted' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User with the specified ID was not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  remove(@Param() { id }: ParamsIdDto): Promise<User> {
    return this.userService.remove(id);
  }
}
