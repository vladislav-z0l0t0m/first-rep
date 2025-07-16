import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../entities/post.entity';
import { ReactionEntity } from 'src/reactions/reaction.entity';
import { AuthorDto } from 'src/user/dto/author.dto';
import { ReactionsSummaryDto } from 'src/reactions/dto/reactions-summary.dto';

export class PostResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  author: AuthorDto;

  @ApiProperty()
  imageUrls: string[];

  @ApiProperty()
  hashtags: string[];

  @ApiProperty({ nullable: true })
  text: string | null;

  @ApiProperty({ nullable: true })
  location: string | null;

  @ApiProperty()
  isHidden: boolean;

  @ApiProperty()
  reactions: ReactionsSummaryDto;

  @ApiProperty()
  commentsCount: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static fromEntity(
    post: PostEntity,
    allReactions: ReactionEntity[],
    commentsCount: number,
    currentUserId?: number,
  ): PostResponseDto {
    const dto = new PostResponseDto();

    dto.id = post.id;
    dto.imageUrls = post.imageUrls;
    dto.hashtags = post.hashtags;
    dto.text = post.text;
    dto.location = post.location;
    dto.isHidden = post.isHidden;
    dto.commentsCount = commentsCount;
    dto.createdAt = post.createdAt.toISOString();
    dto.updatedAt = post.updatedAt.toISOString();

    dto.author = AuthorDto.fromEntity(post.author);

    dto.reactions = ReactionsSummaryDto.fromReactions(
      allReactions,
      currentUserId,
    );

    return dto;
  }
}
