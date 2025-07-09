import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PostEntity } from './entities/post.entity';
import { ParamsIdDto } from '../common/dto/params-id.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { PostsReactionsService } from './posts-reactions.service';
import { PostReactionType } from './constants/post-reaction-type.enum';
import { ReactionResponseDto } from './dto/reaction-response.dto';
import { CommentEntity } from '../comments/entities/comment.entity';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { CommentsService } from '../comments/comments.service';

@ApiTags('Posts')
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error',
})
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsReactionsService: PostsReactionsService,
    private readonly commentsService: CommentsService,
  ) {}

  @ApiOperation({
    summary: 'Create post',
    description: 'Create a new post and return it',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Post created' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @Auth()
  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: AuthUser,
  ): Promise<PostEntity> {
    return this.postsService.create(createPostDto, user);
  }

  @ApiOperation({
    summary: 'Like post',
    description: 'Set a like on the post. If this reaction exists - remove it.',
  })
  @ApiOkResponse({
    description: 'Reaction status and entity',
    type: ReactionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post(':id/like')
  async like(
    @Param() { id: postId }: ParamsIdDto,
    @CurrentUser() { userId }: AuthUser,
  ) {
    return this.postsReactionsService.handleReaction(
      postId,
      { reactionType: PostReactionType.LIKE },
      userId,
    );
  }

  @ApiOperation({
    summary: 'Dislike post',
    description:
      'Set a dislike on the post. If this reaction exists - remove it.',
  })
  @ApiOkResponse({
    description: 'Reaction status and entity',
    type: ReactionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post(':id/dislike')
  async dislike(
    @Param() { id: postId }: ParamsIdDto,
    @CurrentUser() { userId }: AuthUser,
  ) {
    return this.postsReactionsService.handleReaction(
      postId,
      { reactionType: PostReactionType.DISLIKE },
      userId,
    );
  }

  @ApiOperation({
    summary: 'Set reaction',
    description:
      'Set or update a reaction on the post. If this reaction exists - remove it.',
  })
  @ApiOkResponse({
    description: 'Reaction status and entity',
    type: ReactionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post(':id/reactions')
  async setReaction(
    @Param() { id: postId }: ParamsIdDto,
    @Body() body: { reactionType: PostReactionType },
    @CurrentUser() { userId }: AuthUser,
  ) {
    return this.postsReactionsService.handleReaction(
      postId,
      { reactionType: body.reactionType },
      userId,
    );
  }

  @ApiOperation({
    summary: 'Get all posts',
    description: 'Return array of all posts',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Posts returned' })
  @Get()
  findAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  @ApiOperation({
    summary: 'Get single post',
    description: 'Return one post by its ID',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Post returned' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @Get(':id')
  findOne(@Param() { id }: ParamsIdDto): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update post',
    description: 'Update the post with given ID and return it',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Post updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @Auth()
  @Patch(':id')
  update(
    @Param() { id }: ParamsIdDto,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updatePostDto);
  }

  @ApiOperation({
    summary: 'Delete post',
    description: 'Delete the post with the given ID',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Post deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param() { id }: ParamsIdDto): Promise<void> {
    return this.postsService.remove(id);
  }

  @ApiOperation({
    summary: 'Create comment',
    description: 'Create a new comment for the post.',
  })
  @ApiResponse({
    status: 201,
    type: CommentEntity,
    description: 'Created comment',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @Auth()
  @Post(':id/comments')
  async createComment(
    @Param() { id: postId }: ParamsIdDto,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() { userId: authorId }: AuthUser,
  ): Promise<CommentEntity> {
    return this.commentsService.create(postId, authorId, createCommentDto);
  }

  @ApiOperation({
    summary: 'Get post comments',
    description: 'Get all comments for the post.',
  })
  @ApiResponse({
    status: 200,
    type: [CommentEntity],
    description: 'List of comments',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @Get(':id/comments')
  async getPostComments(
    @Param() { id: postId }: ParamsIdDto,
  ): Promise<CommentEntity[]> {
    return this.commentsService.findByPost(postId);
  }
}
