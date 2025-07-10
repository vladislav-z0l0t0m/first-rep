import {
  Controller,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Post,
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
import { ReactionsService } from '../reactions/reactions.service';
import { ReactionType } from '../reactions/constants/reaction-type.enum';
import { ReactionResponseDto } from '../reactions/dto/reaction-response.dto';
import { ReactableType } from '../reactions/constants/reactable-type.enum';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
  ) {}

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

  @ApiOperation({
    summary: 'Like comment',
    description:
      'Set a like on the comment. If this reaction exists - remove it.',
  })
  @ApiResponse({ status: 200, type: ReactionResponseDto })
  @ApiParam({ name: 'id', type: Number, description: 'Comment ID' })
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post(':id/like')
  async like(
    @Param() { id: commentId }: ParamsIdDto,
    @CurrentUser() { userId }: AuthUser,
  ) {
    return this.reactionsService.handleReaction(
      commentId,
      ReactableType.COMMENT,
      { type: ReactionType.LIKE },
      userId,
    );
  }

  @ApiOperation({
    summary: 'Dislike comment',
    description:
      'Set a dislike on the comment. If this reaction exists - remove it.',
  })
  @ApiResponse({ status: 200, type: ReactionResponseDto })
  @ApiParam({ name: 'id', type: Number, description: 'Comment ID' })
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post(':id/dislike')
  async dislike(
    @Param() { id: commentId }: ParamsIdDto,
    @CurrentUser() { userId }: AuthUser,
  ) {
    return this.reactionsService.handleReaction(
      commentId,
      ReactableType.COMMENT,
      { type: ReactionType.DISLIKE },
      userId,
    );
  }

  @ApiOperation({
    summary: 'Set reaction on comment',
    description:
      'Set or update a reaction on the comment. If this reaction exists - remove it.',
  })
  @ApiResponse({ status: 200, type: ReactionResponseDto })
  @ApiParam({ name: 'id', type: Number, description: 'Comment ID' })
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post(':id/reactions')
  async setReaction(
    @Param() { id: commentId }: ParamsIdDto,
    @Body() body: { type: ReactionType },
    @CurrentUser() { userId }: AuthUser,
  ) {
    return this.reactionsService.handleReaction(
      commentId,
      ReactableType.COMMENT,
      { type: body.type },
      userId,
    );
  }
}
