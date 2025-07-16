import { ApiProperty } from '@nestjs/swagger';
import { PostResponseDto } from './post-response.dto';

export class CursorPaginatedPostsResponseDto {
  @ApiProperty({
    description: 'Массив данных для текущей страницы',
    type: [PostResponseDto],
  })
  posts: PostResponseDto[];

  @ApiProperty({
    description:
      'Курсор для запроса следующей страницы. null, если данных больше нет.',
    type: String,
    nullable: true,
  })
  nextCursor: string | null;
}
