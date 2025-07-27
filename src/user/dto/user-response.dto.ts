import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ProviderType } from 'src/common/constants/provider-type.enum';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Username of the user',
    example: 'Mikle_Jordan',
  })
  @Expose()
  username: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'jordan@mail.ru',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
    nullable: true,
    required: true,
  })
  @Expose()
  phone: string | null;

  @ApiProperty({
    enum: ProviderType,
    description: 'Provider type of the user',
    example: ProviderType.GOOGLE,
    nullable: true,
    required: true,
  })
  @Expose()
  provider: ProviderType | null;

  @ApiProperty({
    description: 'User creation date',
    example: '2024-05-19T12:34:56.789Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2024-05-19T13:45:00.123Z',
  })
  @Expose()
  updatedAt: Date;
}
