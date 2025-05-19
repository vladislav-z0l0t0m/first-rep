import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Username of the user (min 3 characters, max - 30)',
    example: 'Mikle_Jordan',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(30)
  @MinLength(3)
  username?: string;

  @ApiProperty({
    description: 'Email address of the user (min 5 characters, max - 255)',
    example: 'jordan@mail.ru',
  })
  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(5)
  email?: string;

  @ApiProperty({
    description: 'Phone number of the user (min 10 characters, max - 15)',
    example: '+1234567890',
  })
  @Matches(/^\+\d{10,15}$/, {
    message: 'Number must be in correct format',
  })
  @IsOptional()
  @IsNotEmpty()
  phone?: string;
}
