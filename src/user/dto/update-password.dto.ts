import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'User new password (min 6 characters, max - 255)',
    example: 'password5',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(6)
  newPassword: string;

  @ApiProperty({
    description: 'User old password (min 6 characters, max - 255)',
    example: 'password4444',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(6)
  oldPassword: string;
}
