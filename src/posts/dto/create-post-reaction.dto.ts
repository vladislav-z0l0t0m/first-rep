import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PostReactionType } from '../constants/post-reaction-type.enum';

export class CreatePostReactionDto {
  @ApiProperty({ description: 'Reaction type', enum: PostReactionType })
  @IsEnum(PostReactionType)
  reactionType: PostReactionType;
}
