import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostEntity } from './entities/post.entity';
import { ParamsIdDto } from '../common/dto/params-id.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Posts')
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error',
})
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({
    summary: 'Create a post',
    description: 'Create post and return it'
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'post created'})
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @HttpCode(201)
  create(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.postsService.create(createPostDto);
  }

  @ApiOperation({
    summary: 'Add like to the post',
    description: 'Set like and return post'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'like setted'})
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'post with the specified ID was not found'})
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/like')
  like(@Param() { id }: ParamsIdDto): Promise<PostEntity> {
    return this.postsService.like(id);
  }

  @ApiOperation({
    summary: 'Add dislike to the post',
    description: 'Set dislike and return post'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'dislike setted'})
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'post with the specified ID was not found'})
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/dislike')
  dislike(@Param() { id }: ParamsIdDto): Promise<PostEntity> {
    return this.postsService.dislike(id);
  }

  @ApiOperation({
    summary: 'Get all posts',
    description: 'Return posts array'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'posts returned '})
  @Get()
  findAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  @ApiOperation({
    summary: 'Get the post',
    description: 'Return post'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'post returned '})
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'post with the specified ID was not found'})
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @Get(':id')
  findOne(@Param() { id }: ParamsIdDto): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update the post',
    description: 'Update and return post'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'post returned '})
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'post with the specified ID was not found'})
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param() { id }: ParamsIdDto, @Body() updatePostDto: UpdatePostDto): Promise<PostEntity> {
    return this.postsService.update(id, updatePostDto);
  }

  @ApiOperation({
    summary: 'Delete the post',
    description: 'Delete the post, do not return anything'
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'post deleted'})
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'post with the specified ID was not found'})
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(204)
  remove(@Param() { id }: ParamsIdDto): Promise<void> {
    return this.postsService.remove(id);
  }
}
