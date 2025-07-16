import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment text', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  text: string;

  @ApiPropertyOptional({ description: 'Parent comment ID' })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({
    description: 'User ID to whom the reply is addressed',
  })
  @IsOptional()
  @IsInt()
  replyToUserId?: number;
}
