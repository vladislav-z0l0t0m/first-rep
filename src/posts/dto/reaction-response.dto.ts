import { ApiProperty } from '@nestjs/swagger';
import { ReactionStatus } from '../constants/reaction-status.enum';
import { PostReactionType } from '../constants/post-reaction-type.enum';
import { PostReactionEntity } from '../entities/post-reaction.entity';

export class ReactionResponseDto {
  @ApiProperty({
    enum: ReactionStatus,
    description: 'Reaction status: created, updated, removed',
  })
  status: ReactionStatus;

  @ApiProperty()
  id: number;

  @ApiProperty({ enum: PostReactionType })
  reactionType: PostReactionType;

  @ApiProperty()
  postId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static fromEntity(
    status: ReactionStatus,
    entity: PostReactionEntity,
  ): ReactionResponseDto {
    const dto = new ReactionResponseDto();
    dto.status = status;
    dto.id = entity.id;
    dto.reactionType = entity.reactionType;
    dto.postId = entity.post.id;
    dto.userId = entity.user.id;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
