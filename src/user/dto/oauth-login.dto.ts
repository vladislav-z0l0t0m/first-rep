import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProviderType } from 'src/common/constants/provider-type.enum';

export class OAuthLoginDto {
  @ApiProperty({
    description: 'User email from OAuth provider',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'OAuth provider',
    enum: ProviderType,
    example: ProviderType.GOOGLE,
  })
  @IsEnum(ProviderType)
  provider: ProviderType;

  @ApiProperty({
    description: 'User name from OAuth provider (optional)',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
