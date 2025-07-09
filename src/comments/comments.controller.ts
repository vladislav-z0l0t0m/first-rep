import {
  Controller,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiTags,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { CommentEntity } from './entities/comment.entity';
import { ParamsIdDto } from 'src/common/dto/params-id.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsService } from './comments.service';
import { Auth } from '../common/decorators/auth.decorator';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({
    summary: 'Update comment',
    description: 'Update the text of a comment by id.',
  })
  @ApiResponse({
    status: 200,
    type: CommentEntity,
    description: 'Updated comment',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Comment ID' })
  @Auth()
  @Patch(':id')
  async updateComment(
    @Param() { id: commentId }: ParamsIdDto,
    @Body() body: UpdateCommentDto,
    @CurrentUser() { userId: authorId }: AuthUser,
  ): Promise<CommentEntity> {
    return this.commentsService.update(commentId, authorId, body);
  }

  @ApiOperation({
    summary: 'Delete comment',
    description: 'Delete a comment by id.',
  })
  @ApiNoContentResponse({ description: 'Comment deleted' })
  @ApiParam({ name: 'id', type: Number, description: 'Comment ID' })
  @Auth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param() { id: commentId }: ParamsIdDto,
    @CurrentUser() { userId: authorId }: AuthUser,
  ): Promise<void> {
    return this.commentsService.remove(commentId, authorId);
  }
}
