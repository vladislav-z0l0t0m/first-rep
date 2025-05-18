import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty({ example: { id: 1, email: 'user@example.com' } })
  user: {
    id: number;
    email: string;
  };
}
