import { ApiProperty } from '@nestjs/swagger';
import { CommentResponseDto } from './comment-response.dto';

export class CursorPaginatedCommentsResponseDto {
  @ApiProperty({
    description: 'Массив данных для текущей страницы',
    type: [CommentResponseDto],
  })
  comments: CommentResponseDto[];

  @ApiProperty({
    description:
      'Курсор для запроса следующей страницы. null, если данных больше нет.',
    type: String,
    nullable: true,
  })
  nextCursor: string | null;
}
