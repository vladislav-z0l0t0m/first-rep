import { ApiProperty } from '@nestjs/swagger';
import { CommentResponseDto } from './comment-response.dto';

export class CursorPaginatedCommentsResponseDto {
  @ApiProperty({
    description: 'Array of data for the current page',
    type: [CommentResponseDto],
  })
  comments: CommentResponseDto[];

  @ApiProperty({
    description: 'Cursor for the next page. Null if there is no more data.',
    type: String,
    nullable: true,
  })
  nextCursor: string | null;
}
