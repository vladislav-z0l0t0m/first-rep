import { ApiProperty } from '@nestjs/swagger';
import { ReactionsSummaryDto } from 'src/reactions/dto/reactions-summary.dto';
import { AuthorDto } from 'src/user/dto/author.dto';
import { CommentEntity } from '../entities/comment.entity';
import { ReactionEntity } from 'src/reactions/reaction.entity';

export class CommentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  text: string;

  @ApiProperty()
  author: AuthorDto;

  @ApiProperty()
  reactions: ReactionsSummaryDto;

  @ApiProperty()
  replyToUser: AuthorDto | null;

  @ApiProperty()
  repliesCount: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static fromEntity(
    comment: CommentEntity,
    reactions: ReactionEntity[],
    currentUserId?: number,
    repliesCount?: number,
  ): CommentResponseDto {
    const dto = new CommentResponseDto();

    dto.id = comment.id;
    dto.text = comment.text;
    dto.createdAt = comment.createdAt.toISOString();
    dto.updatedAt = comment.updatedAt.toISOString();

    dto.repliesCount = repliesCount || 0;

    dto.author = AuthorDto.fromEntity(comment.author);

    dto.reactions = ReactionsSummaryDto.fromReactions(reactions, currentUserId);

    dto.replyToUser = comment.replyToUser
      ? AuthorDto.fromEntity(comment.replyToUser)
      : null;

    return dto;
  }
}
