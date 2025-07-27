import {
  ForbiddenException,
  Injectable,
  NotFoundException,
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
import { MinioService } from '../common/services/minio.service';
import { BucketType } from '../common/enums/file-type.enum';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constants';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
    private reactionsService: ReactionsService,
    private commentsService: CommentsService,
    private minioService: MinioService,
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
      throw new ForbiddenException(ERROR_MESSAGES.NOT_AUTHOR_FORBIDDEN);
    }

    this.postsRepository.merge(post, dto);
    await this.postsRepository.save(post);

    return this.findOne(id, currentUserId);
  }

  async remove(id: number, currentUserId?: number): Promise<void> {
    const post = await this.findPostById(id);

    if (post.author.id !== currentUserId) {
      throw new ForbiddenException(ERROR_MESSAGES.NOT_AUTHOR_FORBIDDEN);
    }

    if (post.imageUrls && post.imageUrls.length > 0) {
      await this.minioService.deleteMultipleFiles(
        BucketType.POSTS,
        post.imageUrls,
      );
    }

    await this.postsRepository.remove(post);
  }

  async ensurePostExists(postId: number): Promise<void> {
    const exists = await this.postsRepository.exists({
      where: { id: postId },
    });

    if (!exists) {
      throw new NotFoundException(ERROR_MESSAGES.POST_NOT_FOUND(postId));
    }
  }

  private async findPostById(id: number): Promise<PostEntity> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(ERROR_MESSAGES.POST_NOT_FOUND(id));
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
