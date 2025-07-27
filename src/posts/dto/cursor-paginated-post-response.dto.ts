import { ApiProperty } from '@nestjs/swagger';
import { PostResponseDto } from './post-response.dto';

export class CursorPaginatedPostsResponseDto {
  @ApiProperty({
    description: 'Array of data for the current page',
    type: [PostResponseDto],
  })
  posts: PostResponseDto[];

  @ApiProperty({
    description: 'Cursor for the next page',
    type: String,
    nullable: true,
  })
  nextCursor: string | null;
}
