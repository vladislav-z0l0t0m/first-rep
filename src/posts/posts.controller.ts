import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
  @Post()
  @HttpCode(201)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @ApiOperation({
    summary: 'Add like to the post',
    description: 'Set like and return post'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'like setted'})
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'post with the specified ID was not found'})
  @Post(':id/like')
  like(@Param('id') id: string) {
    return this.postsService.like(+id);
  }

  @ApiOperation({
    summary: 'Add dislike to the post',
    description: 'Set dislike and return post'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'dislike setted'})
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'post with the specified ID was not found'})
  @Post(':id/dislike')
  dislike(@Param('id') id: string) {
    return this.postsService.dislike(+id);
  }

  @ApiOperation({
    summary: 'Get all posts',
    description: 'Return posts array'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'posts returned '})
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @ApiOperation({
    summary: 'Get the post',
    description: 'Return post'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'post returned '})
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'post with the specified ID was not found'})
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @ApiOperation({
    summary: 'Update the post',
    description: 'Update and return post'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'post returned '})
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'post with the specified ID was not found'})
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @ApiOperation({
    summary: 'Delete the post',
    description: 'Delete the post, do not return anything'
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'post deleted'})
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'post with the specified ID was not found'})
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
