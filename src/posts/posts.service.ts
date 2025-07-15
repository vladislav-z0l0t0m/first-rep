import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';
import { PostResponseDto } from './dto/post-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, LessThan, Repository } from 'typeorm';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { ReactionsService } from '../reactions/reactions.service';
import { ReactableType } from '../reactions/constants/reactable-type.enum';
import { CursorPaginationDto } from '../common/dto/cursor-pagination.dto';
import { CursorPaginatedPostsResponseDto } from './dto/cursor-paginated-post-response.dto';
import { CommentsService } from 'src/comments/comments.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
    private reactionsService: ReactionsService,
    @Inject(forwardRef(() => CommentsService))
    private commentsService: CommentsService,
  ) {}

  async create(post: CreatePostDto, user: AuthUser): Promise<PostResponseDto> {
    const newPost: PostEntity = this.postsRepository.create({
      ...post,
      author: { id: user.userId },
    });
    const savedPost = await this.postsRepository.save(newPost);

    return this.findOne(savedPost.id, user.userId);
  }

  async findAll(
    paginationDto: CursorPaginationDto,
    currentUserId?: number,
  ): Promise<CursorPaginatedPostsResponseDto> {
    const { cursor, limit = 5 } = paginationDto;

    const queryOptions: FindManyOptions<PostEntity> = {
      relations: ['author'],
      order: { createdAt: 'DESC' },
      take: limit + 1,
    };

    if (cursor) {
      queryOptions.where = {
        createdAt: LessThan(new Date(cursor)),
      };
    }

    const posts = await this.postsRepository.find(queryOptions);

    const hasMore = posts.length > limit;
    if (hasMore) {
      posts.pop();
    }

    const postResponseDtos = await this.assemblePostResponseDtos(
      posts,
      currentUserId,
    );

    const nextCursor = hasMore
      ? posts[posts.length - 1].createdAt.toISOString()
      : null;

    return {
      posts: postResponseDtos,
      nextCursor,
    };
  }

  async findOne(id: number, currentUserId?: number): Promise<PostResponseDto> {
    const post = await this.findPostById(id);

    const postReactions = await this.reactionsService.findByReactable(
      id,
      ReactableType.POST,
    );

    const commentsCount = await this.commentsService.countByPostId(id);

    return PostResponseDto.fromEntity(
      post,
      postReactions,
      commentsCount,
      currentUserId,
    );
  }

  async update(
    id: number,
    dto: UpdatePostDto,
    currentUserId?: number,
  ): Promise<PostResponseDto> {
    const post = await this.findPostById(id);

    if (post.author.id !== currentUserId) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    this.postsRepository.merge(post, dto);
    await this.postsRepository.save(post);

    return this.findOne(id, currentUserId);
  }

  async remove(id: number, currentUserId?: number): Promise<void> {
    const post = await this.findPostById(id);

    if (post.author.id !== currentUserId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    await this.postsRepository.remove(post);
  }

  async ensurePostExists(postId: number): Promise<void> {
    const exists = await this.postsRepository.exists({
      where: { id: postId },
    });

    if (!exists) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
  }

  private async findPostById(id: number): Promise<PostEntity> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(`Post with id: ${id} not found`);
    }

    return post;
  }

  private async assemblePostResponseDtos(
    posts: PostEntity[],
    currentUserId?: number,
  ): Promise<PostResponseDto[]> {
    if (posts.length === 0) {
      return [];
    }

    const postIds = posts.map((post) => post.id);

    const reactions = await this.reactionsService.findForMany(
      postIds,
      ReactableType.POST,
    );

    const commentsMap = await this.commentsService.countByPostIds(postIds);

    const reactionsMap = this.reactionsService.groupReactionsById(reactions);

    return posts.map((post) =>
      PostResponseDto.fromEntity(
        post,
        reactionsMap.get(post.id) || [],
        commentsMap.get(post.id) || 0,
        currentUserId,
      ),
    );
  }
}
