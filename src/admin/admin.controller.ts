import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { ParamsIdDto } from 'src/common/dto/params-id.dto';

@ApiTags('Admin')
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Delete('users/all')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'All users deleted',
  })
  async removeAllUsers(): Promise<void> {
    await this.adminService.removeAllUsers();
  }

  @Delete('users/:id')
  @Auth()
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiOkResponse({
    description: 'User deleted',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async remove(@Param() { id }: ParamsIdDto): Promise<void> {
    await this.adminService.removeUser(id);
  }
}
