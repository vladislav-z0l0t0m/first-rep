import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
