import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { IdentifierType } from '../../common/constants/identifier-type.enum';

export class LoginDto {
  @ApiProperty({
    example: 'jordan@mail.ru',
    description: 'Email, phone or username',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    enum: IdentifierType,
    example: IdentifierType.EMAIL,
    description: 'Type of identifier used for login (email, phone, username)',
  })
  @IsEnum(IdentifierType)
  @IsNotEmpty()
  type: IdentifierType;

  @ApiProperty({ example: 'password4444' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
