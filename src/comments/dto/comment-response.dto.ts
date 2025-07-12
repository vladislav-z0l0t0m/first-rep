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
  children: CommentResponseDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static fromEntity(
    comment: CommentEntity,
    allReactionsMap: Map<number, ReactionEntity[]>,
    currentUserId?: number,
  ): CommentResponseDto {
    const dto = new CommentResponseDto();

    dto.id = comment.id;
    dto.text = comment.text;
    dto.author = AuthorDto.fromEntity(comment.author);
    dto.createdAt = comment.createdAt.toISOString();
    dto.updatedAt = comment.updatedAt.toISOString();

    const reactionsForThisComment = allReactionsMap.get(comment.id) || [];
    dto.reactions = ReactionsSummaryDto.fromReactions(
      reactionsForThisComment,
      currentUserId,
    );

    dto.replyToUser = comment.replyToUser
      ? AuthorDto.fromEntity(comment.replyToUser)
      : null;

    dto.children = comment.children.map((child) =>
      CommentResponseDto.fromEntity(child, allReactionsMap, currentUserId),
    );

    return dto;
  }
}
