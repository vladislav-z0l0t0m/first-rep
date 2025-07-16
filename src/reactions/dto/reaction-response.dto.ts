import { ApiProperty } from '@nestjs/swagger';
import { ReactionStatus } from '../constants/reaction-status.enum';
import { ReactionType } from '../constants/reaction-type.enum';
import { ReactionEntity } from '../reaction.entity';
import { ReactableType } from '../constants/reactable-type.enum';

export class ReactionResponseDto {
  @ApiProperty({
    enum: ReactionStatus,
    description: 'Reaction status: created, updated, removed',
  })
  status: ReactionStatus;

  @ApiProperty()
  id: number;

  @ApiProperty()
  authorId: number;

  @ApiProperty({ enum: ReactionType })
  type: ReactionType;

  @ApiProperty()
  reactableId: number;

  @ApiProperty()
  reactableType: ReactableType;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static fromEntity(
    status: ReactionStatus,
    entity: ReactionEntity,
  ): ReactionResponseDto {
    const dto = new ReactionResponseDto();
    dto.status = status;
    dto.id = entity.id;
    dto.authorId = entity.author.id;
    dto.type = entity.type;
    dto.reactableId = entity.reactableId;
    dto.reactableType = entity.reactableType;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
