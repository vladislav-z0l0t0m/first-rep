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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostEntity } from './entities/post.entity';
import { ParamsIdDto } from '../common/dto/params-id.dto';
import { Auth } from 'src/auth/auth.decorator';

@ApiTags('Posts')
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error',
})
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
  create(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.postsService.create(createPostDto);
  }

  @ApiOperation({
    summary: 'Like post',
    description: 'Set a like on the post and return the updated post',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Like added' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post(':id/like')
  like(@Param() { id }: ParamsIdDto): Promise<PostEntity> {
    return this.postsService.like(id);
  }

  @ApiOperation({
    summary: 'Dislike post',
    description: 'Set a dislike on the post and return the updated post',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dislike added' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post(':id/dislike')
  dislike(@Param() { id }: ParamsIdDto): Promise<PostEntity> {
    return this.postsService.dislike(id);
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
}
