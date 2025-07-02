import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';
import { IdentifierType } from 'src/common/constants/identifier-type.enum';

export class AuthenticateUserDto {
  @ApiProperty({
    description: 'User identifier (email, username, or phone)',
    example: 'user@example.com',
  })
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'Type of identifier',
    enum: IdentifierType,
    example: IdentifierType.EMAIL,
  })
  @IsEnum(IdentifierType)
  identifierType: IdentifierType;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
