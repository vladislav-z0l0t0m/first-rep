import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class AuthorDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  static fromEntity(user: User): AuthorDto {
    const dto = new AuthorDto();

    dto.id = user.id;
    dto.username = user.username;

    return dto;
  }
}
